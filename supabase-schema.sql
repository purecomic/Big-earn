-- =============================================
-- BIG EARN — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  balance numeric(12,2) default 0,
  total_invested numeric(12,2) default 0,
  total_withdrawn numeric(12,2) default 0,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- 2. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('deposit','withdrawal','investment','return')) not null,
  amount numeric(12,2) not null,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  description text,
  proof_url text,
  created_at timestamptz default now()
);

-- 3. INVESTMENTS TABLE
create table if not exists public.investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_name text not null,
  amount numeric(12,2) not null,
  roi_percent numeric(5,2) not null,
  duration_days integer not null,
  status text check (status in ('active','completed','cancelled')) default 'active',
  start_date timestamptz not null,
  end_date timestamptz not null,
  returns_earned numeric(12,2) default 0,
  created_at timestamptz default now()
);

-- 4. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text check (type in ('info','success','warning','alert')) default 'info',
  is_broadcast boolean default false,
  read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.investments enable row level security;
alter table public.notifications enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Admin can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admin can update all profiles"
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- TRANSACTIONS policies
create policy "Users can view own transactions"
  on public.transactions for select using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert with check (auth.uid() = user_id);

create policy "Admin can view all transactions"
  on public.transactions for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admin can update all transactions"
  on public.transactions for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- INVESTMENTS policies
create policy "Users can view own investments"
  on public.investments for select using (auth.uid() = user_id);

create policy "Users can insert own investments"
  on public.investments for insert with check (auth.uid() = user_id);

create policy "Admin can view all investments"
  on public.investments for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- NOTIFICATIONS policies
create policy "Users can view own or broadcast notifications"
  on public.notifications for select using (
    auth.uid() = user_id or is_broadcast = true
  );

create policy "Users can update own notifications (mark read)"
  on public.notifications for update using (
    auth.uid() = user_id or is_broadcast = true
  );

create policy "Admin can insert notifications"
  on public.notifications for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
    or auth.uid() is not null
  );

-- =============================================
-- STORAGE: Create bucket for payment proofs
-- =============================================
-- Run this in Supabase Dashboard > Storage > New bucket
-- Name: proofs
-- Public: true

-- =============================================
-- REALTIME: Enable realtime on notifications
-- =============================================
-- In Supabase Dashboard > Database > Replication
-- Enable realtime for the "notifications" table

-- =============================================
-- CREATE ADMIN ACCOUNT
-- =============================================
-- 1. Go to Supabase > Authentication > Users > Add User
-- 2. Email: admin@bigearn.com  Password: masa234
-- 3. Then run this to give admin privileges (replace USER_ID with actual UUID):
--
-- update public.profiles set is_admin = true where email = 'admin@bigearn.com';
