-- COPY AND PASTE THIS ENTIRE FILE INTO THE SUPABASE SQL EDITOR --

-- 1. Create Applications Table (The 'Join Us' Portal)
create table applications (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  college text not null,
  department text not null,
  year_of_study text not null,
  achievements text not null,
  skills text[] not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Posts Table (Admin Post Management)
create table posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  caption text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Resources Table (Internal Library)
create table resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  file_url text not null,
  type text default 'snippet' check (type in ('snippet', '3d_model', 'datasheet')),
  size text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Vault Projects Table ('The Vault' Portfolio)
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
alter table posts disable row level security;
alter table resources disable row level security;
alter table vault_projects disable row level security;
