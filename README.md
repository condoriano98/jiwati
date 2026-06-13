# Jiwati — Toko Kesehatan & Nutrisi Alami

E-commerce store (Bahasa Indonesia) for natural health & nutrition products,
inspired by naturalfarm.id. Built with **Next.js 16 (App Router)**,
**Supabase** (Postgres + Auth), **Tailwind CSS v4**, and **Midtrans** for
payments. Includes a full **admin dashboard with CSV product import**.

## Features

- 🛍️ Storefront: home, catalog with sort/search, category & product pages
- 🛒 Cart (persisted in localStorage) + checkout
- 💳 Payments via Midtrans Snap (falls back to a simulated flow when unset)
- 👤 Auth & accounts (Supabase) with order history
- 🧑‍💼 Admin dashboard: stats, product CRUD, order management
- 📥 **Bulk product import from CSV** (auto-creates brands & categories)
- 📰 Blog + static pages (About, Contact, FAQ)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev
```

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only; used by admin actions & webhooks |
| `MIDTRANS_SERVER_KEY` | ⛔️ optional | Without it, checkout simulates a paid order |
| `MIDTRANS_IS_PRODUCTION` | ⛔️ optional | `true` for production Midtrans |

## Database

Schema and seed live in `supabase/`:

```bash
# Apply schema then seed (via Supabase SQL editor, CLI, or MCP)
supabase/migrations/0001_init.sql
supabase/seed.sql
```

To make a user an admin, set their `profiles.role` to `admin`:

```sql
update profiles set role = 'admin' where id = '<auth-user-id>';
```

## Admin: importing products

1. Sign in as an admin, go to **/admin/produk/import**.
2. Download the CSV template (or use these columns):
   `name, price, compare_at_price, stock, sku, brand, category, description, image, is_bestseller`
3. Upload the file, review the preview, and click **Impor**.

Products are matched by name (slug) — existing ones are updated, new ones
created. Brands and categories are created automatically when referenced.

## Tech notes

- `proxy.ts` refreshes the Supabase session on each request (replaces the
  deprecated `middleware` convention in Next.js 16).
- Server pricing: checkout re-prices every line from the database, never
  trusting client-supplied prices.
- Row Level Security is enabled on all tables; admin writes are gated by an
  `is_admin()` SQL helper.
