-- COPY AND PASTE THIS ENTIRE FILE INTO THE SUPABASE SQL EDITOR --

-- 1. Create Applications Table (The 'Join Us' Portal)
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  mobile_number text not null,
  password text,
  college text not null,
  department text not null,
  year_of_study text not null,
  achievements text not null,
  skills text[] not null,
  team_id uuid,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Teams Table (Admin Team Assignments)
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Tasks Table (Admin Task Assignments) - Team-specific
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  title text not null,
  status text default 'pending' check (status in ('pending', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key constraint to applications for team_id (must happen after teams table exists)
alter table applications add constraint if not exists fk_team foreign key (team_id) references teams(id) on delete set null;

-- 4. Create Posts Table (Admin Post Management)
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  caption text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Resources Table (Internal Library)
create table if not exists resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  file_url text not null,
  type text default 'snippet' check (type in ('snippet', '3d_model', 'datasheet')),
  size text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Vault Projects Table ('The Vault' Portfolio)
create table if not exists vault_projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  gallery_urls text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Events Table (Announcements & Events)
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  event_date date not null,
  category text default 'announcement' check (category in ('announcement', 'competition', 'deadline', 'event')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================================
-- NEW TABLES (Feature Update)
-- ================================================================

-- 8. Electronic Components Catalogue
create table if not exists components (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  image_url text,
  buy_link text not null,
  price text,
  category text default 'other' check (category in ('sensor', 'microcontroller', 'motor', 'display', 'power', 'communication', 'mechanical', 'other')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Payment Configuration (Admin sets QR & UPI - single row)
create table if not exists payment_config (
  id uuid default gen_random_uuid() primary key,
  qr_url text,
  upi_id text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Payment Records (Member payment submissions)
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references applications(id) on delete cascade not null,
  amount numeric(10,2) not null,
  utr text,
  note text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================================
-- STORAGE BUCKETS
-- Run these in Supabase Storage settings or via the dashboard:
-- 1. Create bucket "components" (public)
-- 2. Create bucket "payment-qr" (public)
-- ================================================================

-- Disable RLS for prototype phase
alter table applications disable row level security;
alter table teams disable row level security;
alter table tasks disable row level security;
alter table posts disable row level security;
alter table resources disable row level security;
alter table vault_projects disable row level security;
alter table events disable row level security;
alter table components disable row level security;
alter table payment_config disable row level security;
alter table payments disable row level security;

-- 11. Admins Table (Admin profiles for identifying who does what)
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Messages Table (Live Team Chat)
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  sender_id text not null,
  sender_name text not null,
  content text not null,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Features: Track who authorized or created items
alter table tasks add column if not exists admin_name text;
alter table events add column if not exists admin_name text;
alter table posts add column if not exists admin_name text;
alter table teams add column if not exists admin_name text;

alter table admins disable row level security;
alter table messages disable row level security;

-- --------------------------------------------------------
-- QUICK ALTER SCRIPT (if database already exists):
-- Run only these if you already have the old tables:
-- --------------------------------------------------------
-- create table if not exists events (id uuid default gen_random_uuid() primary key, title text not null, description text not null, event_date date not null, category text default 'announcement' check (category in ('announcement', 'competition', 'deadline', 'event')), created_at timestamp with time zone default timezone('utc'::text, now()) not null);
-- create table if not exists components (id uuid default gen_random_uuid() primary key, name text not null, description text, image_url text, buy_link text not null, price text, category text default 'other', created_at timestamp with time zone default timezone('utc'::text, now()) not null);
-- create table if not exists payment_config (id uuid default gen_random_uuid() primary key, qr_url text, upi_id text not null, updated_at timestamp with time zone default timezone('utc'::text, now()) not null);
-- create table if not exists payments (id uuid default gen_random_uuid() primary key, member_id uuid references applications(id) on delete cascade not null, amount numeric(10,2) not null, utr text, note text, status text default 'pending', created_at timestamp with time zone default timezone('utc'::text, now()) not null);
-- create table if not exists admins (id uuid primary key default gen_random_uuid(), full_name text not null, email text not null unique, role text default 'admin', created_at timestamp with time zone default timezone('utc'::text, now()) not null);
-- create table if not exists messages (id uuid default gen_random_uuid() primary key, team_id uuid references teams(id) on delete cascade not null, sender_id text not null, sender_name text not null, content text not null, is_admin boolean default false, created_at timestamp with time zone default timezone('utc'::text, now()) not null);
-- alter table tasks add column if not exists admin_name text;
-- alter table events add column if not exists admin_name text;
-- alter table posts add column if not exists admin_name text;
-- alter table teams add column if not exists admin_name text;
-- alter table admins disable row level security;
-- alter table messages disable row level security;
-- --------------------------------------------------------
