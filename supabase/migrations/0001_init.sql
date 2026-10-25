-- Hadamley Information Services: initial database
--
-- Mirrors the site's data model (src/lib/types.ts). Run once in the Supabase
-- SQL Editor, or with `supabase db push`. Safe to re-run: every statement
-- checks whether the object already exists.
--
-- Access model: the website reads and writes only from the server, using the
-- secret key, which bypasses row level security. RLS is switched on for every
-- table with no policies, so the public (anon/publishable) key can read or
-- write nothing.

-- ---------------------------------------------------------------------------
-- Pages, news and events
-- ---------------------------------------------------------------------------

create table if not exists public.pages (
  id              text primary key,
  slug            text not null unique,              -- "" is the homepage
  title           text not null,
  nav_label       text,
  template        text not null check (template in ('home', 'section', 'information', 'directory', 'resources')),
  section         text not null,
  parent_id       text references public.pages (id) on delete set null,
  nav_order       integer not null default 0,
  show_in_nav     boolean not null default false,
  summary         text not null default '',
  body            text not null default '',          -- sanitised HTML
  listing_topics  text[] not null default '{}',      -- topic slugs
  sections        jsonb not null default '[]',       -- accordion sections: heading, body, resourceIds, health, urgent, sources, reviewedAt
  status          text not null default 'draft' check (status in ('draft', 'published')),
  updated_at      timestamptz not null default now(),
  updated_by      text not null default ''
);
create index if not exists pages_parent_idx on public.pages (parent_id);
create index if not exists pages_section_idx on public.pages (section);

create table if not exists public.posts (
  id            text primary key,
  slug          text not null unique,
  title         text not null,
  summary       text not null default '',
  body          text not null default '',
  status        text not null default 'draft' check (status in ('draft', 'published')),
  published_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.events (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  summary      text not null default '',
  body         text not null default '',
  starts_at    text not null,                         -- local "YYYY-MM-DDTHH:mm", Europe/London
  ends_at      text not null default '',
  location     text not null default '',
  online       boolean not null default false,
  cost         text not null default '',
  booking_url  text not null default '',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  updated_at   timestamptz not null default now()
);
create index if not exists events_starts_idx on public.events (starts_at);

-- ---------------------------------------------------------------------------
-- Directory
-- ---------------------------------------------------------------------------

create table if not exists public.taxa (
  id         text primary key,
  name       text not null,
  slug       text not null,
  type       text not null check (type in ('topic', 'area')),
  parent_id  text references public.taxa (id) on delete set null,
  "order"    integer not null default 0,
  unique (type, slug)
);

create table if not exists public.listings (
  id                 text primary key,
  name               text not null,
  provider_type      text not null check (provider_type in ('nhs', 'council', 'charity', 'private')),
  summary            text not null default '',
  description        text not null default '',
  ages_served        text not null default '',
  eligibility        text not null default '',
  referral_route     text not null default '',      -- exactly as the provider says it
  self_referral      text not null default 'unconfirmed' check (self_referral in ('yes', 'no', 'unconfirmed')),
  address            text not null default '',
  delivery           text[] not null default '{}',   -- clinic | home | online | phone
  phone              text not null default '',
  email              text not null default '',
  contact_url        text not null default '',
  website            text not null default '',
  fees               text not null default '',
  fee_confirmed      boolean not null default false,
  contact_confirmed  boolean not null default false,
  accessibility      text not null default '',
  source_urls        text[] not null default '{}',
  date_checked       date,
  next_review_date   date,
  owner              text not null default '',
  status             text not null default 'to_research' check (status in ('to_research', 'online_checked', 'clarification_needed', 'approved')),
  topic_ids          text[] not null default '{}',
  area_ids           text[] not null default '{}',
  extras             jsonb not null default '{}',
  internal_notes     text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_topics_idx on public.listings using gin (topic_ids);
create index if not exists listings_areas_idx on public.listings using gin (area_ids);

create table if not exists public.reports (
  id          text primary key,
  listing_id  text not null references public.listings (id) on delete cascade,
  message     text not null,
  contact     text not null default '',
  created_at  timestamptz not null default now(),
  handled     boolean not null default false,
  handled_at  timestamptz
);
create index if not exists reports_listing_idx on public.reports (listing_id);

-- ---------------------------------------------------------------------------
-- Downloads and uploaded images
-- ---------------------------------------------------------------------------

create table if not exists public.resources (
  id           text primary key,
  title        text not null,
  description  text not null default '',
  kind         text not null check (kind in ('guide', 'checklist', 'worksheet', 'journal', 'tracker', 'colouring', 'puzzle', 'activity', 'leaflet')),
  topic_ids    text[] not null default '{}',
  file_name    text not null,                       -- name visitors download it as
  stored_name  text not null unique,                -- object name in the "uploads" bucket
  mime         text not null,
  size         bigint not null default 0,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  updated_at   timestamptz not null default now()
);

create table if not exists public.uploads (
  id           text primary key,
  file_name    text not null,
  stored_name  text not null unique,
  mime         text not null,
  size         bigint not null default 0,
  alt          text not null default '',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inbox
-- ---------------------------------------------------------------------------

create table if not exists public.messages (
  id          text primary key,
  topic       text check (topic in ('general', 'resource', 'link')),
  name        text not null default '',
  email       text not null default '',
  message     text not null,
  created_at  timestamptz not null default now(),
  handled     boolean not null default false
);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- ---------------------------------------------------------------------------
-- AI helper
-- ---------------------------------------------------------------------------

create table if not exists public.ai_chunks (
  id           text primary key,
  source_type  text not null check (source_type in ('page', 'listing', 'post', 'event')),
  source_id    text not null,
  title        text not null,
  url          text not null,
  text         text not null,
  updated_at   timestamptz not null default now()
);
create index if not exists ai_chunks_source_idx on public.ai_chunks (source_type, source_id);

-- Anonymised question log: question text only, no visitor details. Only kept
-- when the owner turns it on in Settings.
create table if not exists public.questions (
  id    bigint generated always as identity primary key,
  q     text not null,
  at    timestamptz not null default now(),
  kind  text not null
);

-- ---------------------------------------------------------------------------
-- Admin accounts and site settings
-- ---------------------------------------------------------------------------

create table if not exists public.admins (
  email          text primary key,                  -- stored lower-case
  name           text not null,
  role           text not null check (role in ('owner', 'developer')),
  password_hash  text not null,                     -- scrypt hash, never the password
  created_at     timestamptz not null default now()
);

-- One row only.
create table if not exists public.settings (
  id                          integer primary key default 1 check (id = 1),
  funeral_companion_url       text not null default '',
  contact_email               text,
  keep_anonymised_questions   boolean not null default false,
  ai_last_indexed_at          timestamptz,
  ai_last_index_ms            integer,
  ai_spend                    jsonb not null default '{"month": "", "usd": 0, "requests": 0}',
  data_version                integer not null default 1   -- matches DB_VERSION in src/lib/migrate.ts
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row level security: on everywhere, no policies (server-only access)
-- ---------------------------------------------------------------------------

alter table public.pages      enable row level security;
alter table public.posts      enable row level security;
alter table public.events     enable row level security;
alter table public.taxa       enable row level security;
alter table public.listings   enable row level security;
alter table public.reports    enable row level security;
alter table public.resources  enable row level security;
alter table public.uploads    enable row level security;
alter table public.messages   enable row level security;
alter table public.ai_chunks  enable row level security;
alter table public.questions  enable row level security;
alter table public.admins     enable row level security;
alter table public.settings   enable row level security;

-- ---------------------------------------------------------------------------
-- File storage: one private bucket. Files are served through the site's own
-- /files route, so the bucket never needs to be public.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', false, 10485760)   -- 10 MB per file, matching the admin's upload limit
on conflict (id) do nothing;
