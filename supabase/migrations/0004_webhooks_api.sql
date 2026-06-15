-- Phase 3: outbound webhooks + API hardening (scopes, rate limiting).

create table if not exists webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  secret text not null,
  events text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid references webhook_endpoints(id) on delete cascade,
  topic text not null,
  payload jsonb,
  status_code int,
  ok boolean not null default false,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists webhook_deliveries_endpoint_idx on webhook_deliveries(endpoint_id);

alter table webhook_endpoints enable row level security;
alter table webhook_deliveries enable row level security;
drop policy if exists "webhooks admin" on webhook_endpoints;
create policy "webhooks admin" on webhook_endpoints for all using (is_admin()) with check (is_admin());
drop policy if exists "deliveries admin" on webhook_deliveries;
create policy "deliveries admin" on webhook_deliveries for all using (is_admin()) with check (is_admin());

-- API key rate limiting (fixed window)
alter table api_keys add column if not exists rate_window_start timestamptz not null default now();
alter table api_keys add column if not exists rate_count int not null default 0;

-- Broaden default scopes for new keys
alter table api_keys alter column scopes set default
  '{read_products,write_products,read_orders,write_orders,read_discounts,write_discounts,manage_webhooks}';

-- Fixed-window rate limiter. Returns true when the request is allowed.
create or replace function check_rate_limit(p_key_id uuid, p_limit int, p_window int)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  cur int;
  ws timestamptz;
begin
  select rate_window_start, rate_count into ws, cur from api_keys where id = p_key_id for update;
  if ws is null then
    return true;
  end if;
  if now() - ws > make_interval(secs => p_window) then
    update api_keys set rate_window_start = now(), rate_count = 1 where id = p_key_id;
    return true;
  else
    update api_keys set rate_count = rate_count + 1 where id = p_key_id;
    return (cur + 1) <= p_limit;
  end if;
end;
$$;
