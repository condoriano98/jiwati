-- Phase 0: commerce foundations + inventory (stock-decrement) fix.

-- Product variants (full use in Phase 1; defined here so apply_order_stock can
-- reference them).
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  title text not null,
  options jsonb not null default '{}',
  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  sku text,
  stock int not null default 0,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on product_variants(product_id);

-- Discounts (full use in Phase 2; defined here so apply_order_stock can bump
-- used_count).
create table if not exists discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage','fixed')),
  value numeric(12,2) not null,
  min_subtotal numeric(12,2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int,
  used_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Order additions
alter table orders add column if not exists discount_code text;
alter table orders add column if not exists discount_amount numeric(12,2) not null default 0;
alter table orders add column if not exists tax_amount numeric(12,2) not null default 0;
alter table orders add column if not exists stock_applied boolean not null default false;
alter table orders add column if not exists guest_email text;
alter table orders alter column user_id drop not null;

alter table order_items add column if not exists variant_id uuid references product_variants(id) on delete set null;
alter table order_items add column if not exists variant_title text;

-- updated_at for API `?updated_since` filtering
alter table products add column if not exists updated_at timestamptz not null default now();
alter table orders add column if not exists updated_at timestamptz not null default now();

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();
drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- RLS for new tables
alter table product_variants enable row level security;
alter table discounts enable row level security;

drop policy if exists "variants read" on product_variants;
create policy "variants read" on product_variants for select using (true);
drop policy if exists "variants admin" on product_variants;
create policy "variants admin" on product_variants for all using (is_admin()) with check (is_admin());

drop policy if exists "discounts admin" on discounts;
create policy "discounts admin" on discounts for all using (is_admin()) with check (is_admin());

-- Idempotent stock application when an order becomes paid. Decrements product
-- (and variant) stock once and bumps any used discount's counter.
create or replace function apply_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_applied boolean;
  v_code text;
  it record;
begin
  select stock_applied, discount_code into v_applied, v_code
  from orders where id = p_order_id for update;

  if v_applied is null or v_applied = true then
    return; -- unknown order or already applied
  end if;

  for it in
    select product_id, variant_id, quantity from order_items where order_id = p_order_id
  loop
    if it.variant_id is not null then
      update product_variants set stock = greatest(0, stock - it.quantity)
      where id = it.variant_id;
    end if;
    if it.product_id is not null then
      update products set stock = greatest(0, stock - it.quantity)
      where id = it.product_id;
    end if;
  end loop;

  if v_code is not null then
    update discounts set used_count = used_count + 1 where code = v_code;
  end if;

  update orders set stock_applied = true where id = p_order_id;
end;
$$;
