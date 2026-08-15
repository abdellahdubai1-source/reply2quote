-- ──────────────────────────────────────────────────────────────
-- Reply2Quote — Initial schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`)
-- for a fresh project. Safe to re-run: guarded with IF NOT EXISTS
-- / OR REPLACE wherever possible.
-- ──────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- profiles — one row per business owner, 1:1 with auth.users
-- ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  business_name   text,
  logo_url        text,
  phone           text,
  whatsapp        text,
  email           text,
  address         text,
  trn             text,
  vat_registered  boolean not null default false,
  plan            text not null default 'free' check (plan in ('free', 'pro')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.profiles is 'Business profile shown on quotation PDFs. One row per authenticated user.';

-- ──────────────────────────────────────────────────────────────
-- quotes — one row per generated quotation
-- ──────────────────────────────────────────────────────────────
create table if not exists public.quotes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  quote_number      text not null,
  customer_name     text,
  original_message  text,
  ai_reply          text,
  service           text not null default '',
  description       text,
  location          text,
  quantity          numeric not null default 1,
  unit_price        numeric not null default 0,
  vat_rate          numeric not null default 0,
  subtotal          numeric not null default 0,
  vat_amount        numeric not null default 0,
  total             numeric not null default 0,
  notes             text,
  status            text not null default 'draft' check (status in ('draft', 'sent')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, quote_number)
);

comment on table public.quotes is 'One row per customer message -> reply -> quotation. Core object of the product.';

create index if not exists quotes_user_id_created_at_idx on public.quotes (user_id, created_at desc);
create index if not exists quotes_user_id_status_idx on public.quotes (user_id, status);

-- Monthly usage is separate from quote rows so deleting a quotation does not
-- restore Free-plan allowance. The insert trigger below owns writes to this
-- table; clients only need read access to show remaining usage.
create table if not exists public.quote_usage (
  user_id       uuid not null references auth.users (id) on delete cascade,
  month_start   date not null,
  quote_count   integer not null default 0 check (quote_count >= 0),
  updated_at    timestamptz not null default now(),
  primary key (user_id, month_start)
);

-- ──────────────────────────────────────────────────────────────
-- quote_counters — per-user sequence backing RQ-1001 style numbers
-- ──────────────────────────────────────────────────────────────
create table if not exists public.quote_counters (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  last_number  integer not null default 1000
);

-- Atomically reserves and returns the next quote number for a user,
-- e.g. 'RQ-1001'. Runs as SECURITY DEFINER so a normal authenticated
-- user (who only has INSERT/UPDATE on their own quotes) can still bump
-- their own counter row safely and without race conditions.
create or replace function public.generate_quote_number(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'not authorized';
  end if;

  insert into public.quote_counters (user_id, last_number)
  values (p_user_id, 1000)
  on conflict (user_id) do nothing;

  update public.quote_counters
  set last_number = last_number + 1
  where user_id = p_user_id
  returning last_number into v_next;

  return 'RQ-' || v_next::text;
end;
$$;

revoke all on function public.generate_quote_number(uuid) from public;
grant execute on function public.generate_quote_number(uuid) to authenticated;

-- ──────────────────────────────────────────────────────────────
-- updated_at maintenance
-- ──────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Auto-create an empty profile row when a new auth user signs up
-- ──────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- Row Level Security — every business only ever sees its own data
-- ──────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_counters enable row level security;
alter table public.quote_usage enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep subscription state server-controlled. Authenticated users can edit
-- their business identity/contact fields, but cannot promote themselves by
-- writing profiles.plan directly through PostgREST.
revoke insert, update on public.profiles from authenticated;
grant insert (user_id, business_name, logo_url, phone, whatsapp, email, address, trn, vat_registered)
  on public.profiles to authenticated;
grant update (business_name, logo_url, phone, whatsapp, email, address, trn, vat_registered)
  on public.profiles to authenticated;

-- If a profile ever needs to be inserted client-side (normally the auth
-- trigger creates it first), only a Free profile is allowed.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id and plan = 'free');

drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own" on public.quotes
  for select using (auth.uid() = user_id);

drop policy if exists "quotes_insert_own" on public.quotes;
create policy "quotes_insert_own" on public.quotes
  for insert with check (auth.uid() = user_id);

drop policy if exists "quotes_update_own" on public.quotes;
create policy "quotes_update_own" on public.quotes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "quotes_delete_own" on public.quotes;
create policy "quotes_delete_own" on public.quotes
  for delete using (auth.uid() = user_id);

-- Enforce the advertised Free plan allowance in the database as well as in
-- the UI. This prevents a client from bypassing the 3-quotes/month limit by
-- calling the Supabase API directly. Billing/webhook code may set plan='pro'
-- using a trusted server/service-role client.
create or replace function public.enforce_monthly_quote_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_month_start date := date_trunc('month', now())::date;
  v_month_count integer;
begin
  select plan into v_plan
  from public.profiles
  where user_id = new.user_id;

  if coalesce(v_plan, 'free') = 'free' then
    insert into public.quote_usage (user_id, month_start, quote_count)
    values (new.user_id, v_month_start, 0)
    on conflict (user_id, month_start) do nothing;

    select quote_count into v_month_count
    from public.quote_usage
    where user_id = new.user_id and month_start = v_month_start
    for update;

    if coalesce(v_month_count, 0) >= 3 then
      raise exception 'free_plan_quote_limit_reached' using errcode = 'P0001';
    end if;

    update public.quote_usage
    set quote_count = quote_count + 1, updated_at = now()
    where user_id = new.user_id and month_start = v_month_start;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_monthly_quote_limit_before_insert on public.quotes;
create trigger enforce_monthly_quote_limit_before_insert
  before insert on public.quotes
  for each row execute function public.enforce_monthly_quote_limit();

drop policy if exists "quote_counters_select_own" on public.quote_counters;
create policy "quote_counters_select_own" on public.quote_counters
  for select using (auth.uid() = user_id);

drop policy if exists "quote_usage_select_own" on public.quote_usage;
create policy "quote_usage_select_own" on public.quote_usage
  for select using (auth.uid() = user_id);

grant select on public.quote_usage to authenticated;
revoke insert, update, delete on public.quote_usage from authenticated;

-- No direct insert/update/delete policies for quote_counters or quote_usage:
-- both are written only by SECURITY DEFINER functions/triggers.

-- ──────────────────────────────────────────────────────────────
-- Storage — business logos
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "logo_public_read" on storage.objects;
create policy "logo_public_read" on storage.objects
  for select using (bucket_id = 'logos');

drop policy if exists "logo_owner_insert" on storage.objects;
create policy "logo_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logo_owner_update" on storage.objects;
create policy "logo_owner_update" on storage.objects
  for update using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logo_owner_delete" on storage.objects;
create policy "logo_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
