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
```

Run `npm run lint` and `npm run build` before pushing to `main`.

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