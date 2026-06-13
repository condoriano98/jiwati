-- Natural-health e-commerce schema
-- Run via: supabase db push  (or apply through the Supabase MCP / SQL editor)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo text
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image text,
  parent_id uuid references categories(id) on delete set null,
  sort_order int not null default 0
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  stock int not null default 0,
  sku text,
  brand_id uuid references brands(id) on delete set null,
  images text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  is_bestseller boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists products_active_idx on products(is_active);
create index if not exists products_brand_idx on products(brand_id);

create table if not exists product_categories (
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- ---------------------------------------------------------------------------
-- Users / profiles
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient text not null,
  phone text not null,
  line1 text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  is_default boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','paid','processing','shipped','completed','cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','failed')),
  subtotal numeric(12,2) not null default 0,
  shipping_cost numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  shipping_address jsonb,
  midtrans_order_id text,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on orders(user_id);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  price numeric(12,2) not null,
  quantity int not null,
  image text
);

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  cover text,
  body text not null default '',
  published_at timestamptz
);

-- ---------------------------------------------------------------------------
-- New-user trigger: create a profile row automatically
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table blog_posts enable row level security;

-- Catalog: public read, admin write
create policy "catalog read" on brands for select using (true);
create policy "catalog read" on categories for select using (true);
create policy "catalog read" on products for select using (true);
create policy "catalog read" on product_categories for select using (true);
create policy "blog read" on blog_posts for select using (published_at is not null or is_admin());

create policy "admin write brands" on brands for all using (is_admin()) with check (is_admin());
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin write products" on products for all using (is_admin()) with check (is_admin());
create policy "admin write pc" on product_categories for all using (is_admin()) with check (is_admin());
create policy "admin write blog" on blog_posts for all using (is_admin()) with check (is_admin());

-- Profiles
create policy "own profile read" on profiles for select using (auth.uid() = id or is_admin());
create policy "own profile update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Addresses
create policy "own addresses" on addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders
create policy "own orders read" on orders for select using (auth.uid() = user_id or is_admin());
create policy "own orders insert" on orders for insert with check (auth.uid() = user_id);
create policy "admin orders update" on orders for update using (is_admin()) with check (is_admin());

create policy "own order items read" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
);
create policy "own order items insert" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);
