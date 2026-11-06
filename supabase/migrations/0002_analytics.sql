-- Hadamley visitor analytics
--
-- First-party, cookieless analytics (see src/lib/analytics). One row per page
-- view, key action or time-on-page record. No IP addresses: "visitor" is a
-- hash that changes every day. The site deletes rows older than 400 days.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

create table if not exists public.analytics_events (
  id           bigint generated always as identity primary key,
  at           timestamptz not null default now(),
  kind         text not null check (kind in ('pageview', 'event', 'engage')),
  path         text not null,
  name         text,
  target       text,
  ms           integer,
  visitor      text not null,
  ref_host     text not null default '',
  channel      text not null default '',
  utm_source   text not null default '',
  utm_medium   text not null default '',
  utm_campaign text not null default '',
  device       text not null default '',
  browser      text not null default '',
  os           text not null default '',
  country      text not null default '',
  region       text not null default '',
  city         text not null default ''
);

create index if not exists analytics_events_at_idx on public.analytics_events (at);

-- Only the site's server (secret key) reads or writes this table.
alter table public.analytics_events enable row level security;
