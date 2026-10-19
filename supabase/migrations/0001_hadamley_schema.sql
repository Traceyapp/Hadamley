-- Hadamley Stage 1 schema for Supabase (Postgres + Auth + Storage + pgvector).
-- Mirrors src/lib/types.ts. The app's local store implements the same rules,
-- so moving to Supabase means swapping src/lib/db.ts + src/lib/repo.ts only.

create extension if not exists vector;
create extension if not exists pg_net;

-- ------------------------------------------------------------------ admins
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('owner', 'developer')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ------------------------------------------------------------- taxonomy
create table public.taxa (
  id text primary key,
  name text not null,
  slug text not null unique,
  type text not null check (type in ('topic', 'area')),
  parent_id text references public.taxa(id) on delete set null,
  sort_order int not null default 0
);

-- ----------------------------------------------------------------- pages
create table public.pages (
  id text primary key,
  slug text not null unique,
  title text not null,
  nav_label text,
  template text not null check (template in ('home', 'section', 'information', 'directory', 'resources')),
  section text not null,
  parent_id text references public.pages(id) on delete restrict,
  nav_order int not null default 0,
  show_in_nav boolean not null default false,
  summary text not null default '',
  body text not null default '',
  listing_topics text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now(),
  updated_by text
);

-- -------------------------------------------------------------- listings
create table public.listings (
  id text primary key,
  name text not null,
  provider_type text not null check (provider_type in ('nhs', 'council', 'charity', 'private')),
  summary text not null default '',
  description text not null default '',
  ages_served text not null default '',
  eligibility text not null default '',
  referral_route text not null default '',
  self_referral text not null default 'unconfirmed' check (self_referral in ('yes', 'no', 'unconfirmed')),
  address text not null default '',
  delivery text[] not null default '{}',
  phone text not null default '',
  email text not null default '',
  contact_url text not null default '',
  website text not null default '',
  fees text not null default '',
  fee_confirmed boolean not null default false,
  contact_confirmed boolean not null default false,
  accessibility text not null default '',
  source_urls text[] not null default '{}',
  date_checked date,
  next_review_date date,
  owner text,
  status text not null default 'to_research'
    check (status in ('to_research', 'online_checked', 'clarification_needed', 'approved')),
  -- Mobility and transport extras
  delivery_collection text,
  booking_requirements text,
  hire_loan_terms text,
  wheelchair_accessible text not null default 'unconfirmed' check (wheelchair_accessible in ('yes', 'no', 'unconfirmed')),
  passenger_stays_in_wheelchair text not null default 'unconfirmed' check (passenger_stays_in_wheelchair in ('yes', 'no', 'unconfirmed')),
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint approved_needs_date check (status <> 'approved' or date_checked is not null)
);

create table public.listing_taxa (
  listing_id text references public.listings(id) on delete cascade,
  taxon_id text references public.taxa(id) on delete cascade,
  primary key (listing_id, taxon_id)
);

-- Public view: never exposes internal notes, and hides unconfirmed fees/contacts.
create view public.public_listings with (security_invoker = true) as
select
  id, name, provider_type, summary, description, ages_served, eligibility, referral_route, self_referral,
  address, delivery,
  case when contact_confirmed then phone else '' end as phone,
  case when contact_confirmed then email else '' end as email,
  case when contact_confirmed then website else '' end as website,
  case when contact_confirmed then contact_url else '' end as contact_url,
  case when fee_confirmed then fees else '' end as fees,
  fee_confirmed, accessibility, source_urls, date_checked,
  delivery_collection, booking_requirements, hire_loan_terms, wheelchair_accessible, passenger_stays_in_wheelchair
from public.listings
where status = 'approved';

-- ------------------------------------------------------------- resources
create table public.resources (
  id text primary key,
  title text not null,
  description text not null default '',
  kind text not null check (kind in ('guide', 'checklist', 'worksheet', 'leaflet')),
  topic_ids text[] not null default '{}',
  storage_path text not null,           -- Supabase Storage: bucket "downloads"
  file_name text not null,
  mime text not null,
  size_bytes int not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------- visitor submissions
create table public.outdated_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.listings(id) on delete cascade,
  message text not null check (char_length(message) between 5 and 2000),
  contact text check (char_length(contact) <= 200),
  created_at timestamptz not null default now(),
  handled boolean not null default false,
  handled_at timestamptz
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text not null check (char_length(message) between 5 and 4000),
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

-- -------------------------------------------------------------- AI index
create table public.ai_chunks (
  id text primary key,
  source_type text not null check (source_type in ('page', 'listing')),
  source_id text not null,
  title text not null,
  url text not null,
  chunk_text text not null,
  embedding vector(384),                -- Supabase gte-small, generated in the edge function
  updated_at timestamptz not null default now()
);
create index ai_chunks_source on public.ai_chunks (source_type, source_id);
create index ai_chunks_embedding on public.ai_chunks using hnsw (embedding vector_cosine_ops);

create or replace function public.match_chunks(query_embedding vector(384), match_count int default 6, min_similarity float default 0.75)
returns table (id text, source_type text, title text, url text, chunk_text text, similarity float)
language sql stable as $$
  select c.id, c.source_type, c.title, c.url, c.chunk_text, 1 - (c.embedding <=> query_embedding) as similarity
  from public.ai_chunks c
  where 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  funeral_companion_url text not null,
  keep_anonymised_questions boolean not null default false,
  ai_last_indexed_at timestamptz
);

-- ---------------------------------------------------- re-index triggers
-- Removing from public: delete chunks straight away, in the same transaction.
-- Publishing or editing: ask the edge function to re-embed that record only.
create or replace function public.sync_ai_chunks() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  kind text := case when tg_table_name = 'pages' then 'page' else 'listing' end;
  is_public boolean;
begin
  if tg_op = 'DELETE' then
    delete from ai_chunks where source_type = kind and source_id = old.id;
    return old;
  end if;
  is_public := case when kind = 'page' then new.status = 'published' else new.status = 'approved' end;
  if not is_public then
    delete from ai_chunks where source_type = kind and source_id = new.id;
  else
    perform net.http_post(
      url := current_setting('app.reindex_function_url', true),
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.reindex_secret', true)),
      body := jsonb_build_object('type', kind, 'id', new.id)
    );
  end if;
  return new;
end;
$$;

create trigger pages_ai_sync after insert or update or delete on public.pages
  for each row execute function public.sync_ai_chunks();
create trigger listings_ai_sync after insert or update or delete on public.listings
  for each row execute function public.sync_ai_chunks();

-- ------------------------------------------------------ row level security
alter table public.admins enable row level security;
alter table public.taxa enable row level security;
alter table public.pages enable row level security;
alter table public.listings enable row level security;
alter table public.listing_taxa enable row level security;
alter table public.resources enable row level security;
alter table public.outdated_reports enable row level security;
alter table public.contact_messages enable row level security;
alter table public.ai_chunks enable row level security;
alter table public.site_settings enable row level security;

-- Public reads: published pages and approved listings only.
create policy "public read taxa" on public.taxa for select using (true);
create policy "public read published pages" on public.pages for select using (status = 'published' or public.is_admin());
create policy "public read approved listings" on public.listings for select using (status = 'approved' or public.is_admin());
create policy "public read listing taxa" on public.listing_taxa for select using (true);
create policy "public read published resources" on public.resources for select using (status = 'published' or public.is_admin());
create policy "public read settings" on public.site_settings for select using (true);

-- Visitors can submit, never read.
create policy "visitors submit reports" on public.outdated_reports for insert with check (handled = false);
create policy "visitors send messages" on public.contact_messages for insert with check (handled = false);

-- Admins manage everything.
create policy "admins manage admins" on public.admins for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage taxa" on public.taxa for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage pages" on public.pages for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage listings" on public.listings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage listing taxa" on public.listing_taxa for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage resources" on public.resources for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read reports" on public.outdated_reports for select using (public.is_admin());
create policy "admins update reports" on public.outdated_reports for update using (public.is_admin());
create policy "admins read messages" on public.contact_messages for select using (public.is_admin());
create policy "admins update messages" on public.contact_messages for update using (public.is_admin());
create policy "admins delete messages" on public.contact_messages for delete using (public.is_admin());
create policy "admins manage settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
-- ai_chunks: no public policy. Only the service role (edge function, server) reads and writes it.
