-- User-owned app data. Apply this script in Supabase SQL Editor before enabling auth.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text not null,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_sets integer not null default 0 check (completed_sets >= 0),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  legacy_snapshot jsonb not null default '{}'::jsonb,
  migrated_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_type text not null,
  score integer not null default 0 check (score >= 0),
  total_questions integer not null default 0 check (total_questions >= 0),
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity text not null,
  state jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  correct_count integer not null default 0 check (correct_count >= 0),
  incorrect_count integer not null default 0 check (incorrect_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  quantity integer not null default 1 check (quantity >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, item_key)
);

create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coins bigint not null default 0 check (coins >= 0),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;
alter table public.exam_history enable row level security;
alter table public.training_sessions enable row level security;
alter table public.skill_mastery enable row level security;
alter table public.inventory enable row level security;
alter table public.wallets enable row level security;

-- Re-runnable policy setup. User identity comes from the verified JWT, never a caller-supplied owner ID.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "progress_own" on public.student_progress;
create policy "progress_own" on public.student_progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "exam_history_own" on public.exam_history;
create policy "exam_history_own" on public.exam_history for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "training_sessions_own" on public.training_sessions;
create policy "training_sessions_own" on public.training_sessions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "skill_mastery_own" on public.skill_mastery;
create policy "skill_mastery_own" on public.skill_mastery for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "inventory_own" on public.inventory;
create policy "inventory_own" on public.inventory for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Coins are private but cannot be edited directly by browser clients. Use a trusted server-side
-- operation for awards/purchases; never expose the Supabase service-role key in the browser.
drop policy if exists "wallets_select_own" on public.wallets;
create policy "wallets_select_own" on public.wallets for select to authenticated using ((select auth.uid()) = user_id);
