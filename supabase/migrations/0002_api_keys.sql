-- API keys for the Shopify-style Admin API.
-- Tokens are shown once on creation; only a SHA-256 hash is stored.
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prefix text not null,
  token_hash text not null unique,
  scopes text[] not null default '{read_products,write_products,read_orders}',
  last_used_at timestamptz,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table api_keys enable row level security;

drop policy if exists "admin api_keys" on api_keys;
create policy "admin api_keys" on api_keys for all
  using (is_admin()) with check (is_admin());
