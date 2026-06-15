-- Phase 4: product reviews.

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on reviews(product_id);

alter table reviews enable row level security;

drop policy if exists "reviews read" on reviews;
create policy "reviews read" on reviews for select
  using (status = 'approved' or auth.uid() = user_id or is_admin());

drop policy if exists "reviews insert own" on reviews;
create policy "reviews insert own" on reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "reviews admin" on reviews;
create policy "reviews admin" on reviews for all
  using (is_admin()) with check (is_admin());

-- Recompute a product's star rating from its approved reviews.
create or replace function recompute_product_rating(p_product uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update products
  set rating = coalesce(
    (select round(avg(rating)::numeric, 1) from reviews
     where product_id = p_product and status = 'approved'), 0)
  where id = p_product;
end;
$$;
