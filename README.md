# Merchende

Club football jersey storefront + admin for Arush Panwar.

Stack: Next.js (App Router), TypeScript, Tailwind, Postgres, Prisma, NextAuth, Razorpay.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Setup

```bash
# 1. Install deps
npm install

# 2. Copy env and edit if needed
cp .env.example .env

# 3. Create DB (example)
# createdb merchende
# or: psql -c "CREATE DATABASE merchende;"

# 4. Migrate + seed
npx prisma migrate dev --name init
npm run db:seed

# 5. Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Seeded admin credentials

| Field    | Value                 |
|----------|-----------------------|
| Email    | `admin@merchende.com` |
| Password | `admin123`            |

Change these before any public deploy.

## Environment variables

See `.env.example`.

| Variable | Required for | Notes |
|----------|--------------|-------|
| `DATABASE_URL` | Always | Postgres connection string |
| `NEXTAUTH_URL` | Always | e.g. `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Always | Random string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google shopper sign-in | Leave empty to skip; guest checkout still works |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Prepaid checkout | Leave empty to test COD only |

## Features

- Storefront: Home, Shop (kit/club filters), Product, Cart, Checkout, About, Size guide, Returns, Contact
- Catalog: club kits (home/away/third/special), sizes XS–XXL, no customization
- Inventory: per-product tracked or non-tracked
- Checkout: Razorpay prepaid (free shipping) or COD (₹70 shipping); guest or Google
- Admin: products CRUD + stock, orders + status, customers list

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production (`build` runs `prisma migrate deploy` then `next build`, so Vercel deploys apply pending migrations when `DATABASE_URL` is set)
- `npm run db:seed` — re-seed admin + sample kits
- `npx prisma studio` — browse DB

**First prod deploy:** if the DB is empty and the app errors on missing tables (e.g. `Product`), either redeploy after this build script is on `main`, or run once manually: `npx prisma migrate deploy` (and optionally `npm run db:seed`) against prod `DATABASE_URL`.

## Local notes

- Placeholder SVG kit images live in `public/products/`
- No production domain deploy in this phase
- Google OAuth and Razorpay need real keys for those flows; COD checkout works without Razorpay
