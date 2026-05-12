# Development Guide

## Prerequisites

- Node.js 20.9 or newer
- npm
- Supabase project credentials

## Setup

```bash
npm install
```

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Optional push notification variables:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=mailto:you@example.com
```

## Scripts

```bash
npm run dev      # local dev server, uses next dev --webpack
npm run lint     # eslint
npm run build    # production build
npm run start    # serve a production build
npm run test:smoke # Playwright smoke tests against the live app by default
```

Run `npm run lint` and `npm run build` before pushing to `main`.

## Live Smoke Tests

Smoke tests use Playwright and target the production Vercel URL by default:

```bash
npm run test:smoke
```

Override the target with `SMOKE_BASE_URL`:

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run test:smoke
```

The default run verifies public behavior such as the login page, protected-route redirects, and PWA assets. Authenticated route checks are optional. To run them, save a Playwright storage state for a signed-in account at `tests/.auth/user.json`, then run:

```bash
SMOKE_AUTH_STATE=tests/.auth/user.json npm run test:smoke
```

The `tests/.auth` folder is ignored by git so local sessions are not committed.

## Database Changes

Keep schema changes in `supabase/migrations/`. Apply pending migrations to the linked remote project with:

```bash
npx supabase db push
```

The base schema is in `supabase/schema.sql`; migrations are the source of truth for production changes after initial setup.

## Auth Notes

The production app currently exposes Google OAuth only. GitHub OAuth was removed from the login UI because the provider was not enabled in Supabase.

## Current Known Audit State

`npm audit --audit-level=moderate` may still report a moderate PostCSS advisory through Next's bundled dependency. npm currently suggests a forced downgrade to `next@9.3.3`, so do not run `npm audit fix --force` without reviewing the proposed changes.