# Optimaz Dev Workflow

## Overview

```
feature branch  →  dev branch  →  main branch
  (local dev)      (preview)       (production)
```

| Branch | URL | Database |
|--------|-----|----------|
| `main` | https://optimaz.mavoralabs.com | Production Supabase (`dunncxzd...`) |
| `dev` | Vercel preview URL | Dev Supabase (`tikxjczm...`) |
| feature/* | Vercel preview URL | Dev Supabase |

---

## Local Development Setup

### 1. Environment files

- `.env.local` — **production** keys (used by Vercel, do not commit)
- `.env.development.local` — **dev** keys (auto-loaded by Next.js in `npm run dev`)

Both are git-ignored (`.env*` in `.gitignore`).

Your `.env.development.local` should contain:
```
NEXT_PUBLIC_SUPABASE_URL=https://tikxjczmegyltzwymmra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev anon key>
SUPABASE_SERVICE_ROLE_KEY=<dev service role key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Run the app locally

```bash
npm run dev
```

Next.js automatically picks up `.env.development.local` in dev mode, so `localhost:3000` always hits the **dev Supabase** project.

---

## Running Migrations on Dev Database

When you add a new migration file to `supabase/migrations/`, run it against dev first:

```bash
# Get your DB password from:
# Supabase Dashboard → Settings → Database → Database password
DEV_DB_PASSWORD=yourpassword node scripts/migrate-dev.mjs
```

This script runs the full schema + all migrations against dev Supabase. It's idempotent — safe to run multiple times.

Once tested, apply the same migration to production from the Supabase SQL Editor.

---

## Git Branching Strategy

### Starting a new feature

```bash
git checkout dev
git pull origin dev
git checkout -b feature/my-feature
```

### Developing and testing locally

```bash
npm run dev   # hits dev Supabase
```

### Merging to dev (staging)

```bash
git push origin feature/my-feature
# Open a PR → merge into dev
# Vercel auto-deploys a preview URL pointing to dev Supabase
```

### Promoting to production

```bash
# Once tested on dev preview:
# Open a PR from dev → main on GitHub
# GitHub Actions runs build check automatically
# After merge, Vercel deploys to optimaz.mavoralabs.com
```

---

## Vercel Environment Variables

In [Vercel Dashboard → Project → Settings → Environment Variables](https://vercel.com/dashboard):

| Variable | Production | Preview |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | prod URL | dev URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key | dev anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | prod service key | dev service key |
| `VAPID_*` keys | production values | same or separate |
| `RESEND_API_KEY` | production | same |

Set the **Preview** environment variables to point to your dev Supabase project so Vercel preview deployments hit dev data.

---

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on:
- Every push to `dev`
- Every PR targeting `main`

It runs `npm run build` to catch TypeScript errors and broken builds before they reach production.

---

## Database Schema

The full schema is in `supabase/schema.sql`.  
Incremental changes are in `supabase/migrations/` (named by timestamp).

**Never modify `schema.sql` directly** — always add a new migration file.

```
supabase/
  schema.sql           ← initial schema (run once on new project)
  migrations/
    20260411_*.sql     ← incremental changes in chronological order
    ...
```
