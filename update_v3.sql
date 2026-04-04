-- v3 Update: Contribute and E-commerce (Amazon Style)
-- 1. Orders Table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references applications(id) on delete cascade not null,
  full_name text not null,
  email text not null,
  mobile text not null,
  address text not null,
  total_amount numeric(10,2) not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Order Items Table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  component_id uuid references components(id) on delete cascade not null,
  component_name text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Contributions Table (Renamed from payments logic)
create table if not exists contributions (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references applications(id) on delete cascade,
  amount numeric(10,2) not null,
  note text,
  transaction_id text,
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table orders disable row level security;
alter table order_items disable row level security;
alter table contributions disable row level security;

-- Add stock and rating for Amazon-style components
alter table components add column if not exists stock integer default 100;
alter table components add column if not exists rating numeric(2,1) default 4.5;
alter table components add column if not exists reviews_count integer default 12;
