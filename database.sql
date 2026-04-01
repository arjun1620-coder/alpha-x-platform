-- COPY AND PASTE THIS ENTIRE FILE INTO THE SUPABASE SQL EDITOR --

-- 1. Create Applications Table (The 'Join Us' Portal)
create table applications (
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
create table teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Tasks Table (Admin Task Assignments)
create table tasks (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  title text not null,
  status text default 'pending' check (status in ('pending', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key constraint to applications for team_id (must happen after teams table exists)
alter table applications add constraint fk_team foreign key (team_id) references teams(id) on delete set null;

-- 4. Create Posts Table (Admin Post Management)
create table posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  caption text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Resources Table (Internal Library)
create table resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  file_url text not null,
  type text default 'snippet' check (type in ('snippet', '3d_model', 'datasheet')),
  size text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Vault Projects Table ('The Vault' Portfolio)
create table vault_projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  gallery_urls text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WARNING: For this local prototype phase, we are turning OFF row-level security.
-- Keep in mind: before deploying fully to the public, you should turn this back on!
alter table applications disable row level security;
alter table teams disable row level security;
alter table tasks disable row level security;
alter table posts disable row level security;
alter table resources disable row level security;
alter table vault_projects disable row level security;

-- --------------------------------------------------------
-- UPDATING AN EXISTING DATABASE (QUICK ALTER SCRIPT):
-- If you already have the database running and just want to add the new fields, run:
-- alter table applications add column if not exists email text not null default 'unknown@example.com';
-- alter table applications add column if not exists mobile_number text not null default '000-000-0000';
-- alter table applications add column if not exists password text;
-- --------------------------------------------------------
