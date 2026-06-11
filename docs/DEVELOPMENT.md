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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPTIMAZ_ADMIN_EMAILS=you@example.com,teammate@example.com
```

`SUPABASE_SERVICE_ROLE_KEY` is only used by server routes that need Supabase admin permissions, such as account deletion. Do not expose it to the browser.
`OPTIMAZ_ADMIN_EMAILS` is a comma-separated allowlist for the protected `/admin` insights page.

## Scripts

```bash
npm run dev      # local dev server, uses next dev --webpack
npm run lint     # eslint
npm run build    # production build
npm run start    # serve a production build
npm run test:smoke # Playwright smoke tests against the live app by default
npm run test:smoke:auth-state # create local signed-in Playwright state
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

The default run verifies public behavior such as the login page, protected-route redirects, legal pages, PWA assets, and API payload validation. Authenticated route checks are optional and cover the dashboard, projects, goals, routines, calendar, kanban, settings, notifications, and feedback. To create a local storage state, run:

```bash
npm run test:smoke:auth-state
```

A headed browser opens. Sign in with Google, wait for the dashboard, and Playwright saves `tests/.auth/user.json`. Then run:

```bash
SMOKE_AUTH_STATE=tests/.auth/user.json npm run test:smoke
```

Override either target as needed:

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run test:smoke:auth-state
SMOKE_AUTH_STATE=tests/.auth/user.json SMOKE_BASE_URL=http://localhost:3000 npm run test:smoke
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

## Production Monitoring

TaskFlow uses Vercel runtime logs for server visibility and a Supabase-backed `app_errors` table for browser/runtime error reports. The browser monitor posts production `error` and `unhandledrejection` events to `/api/monitoring/errors`. Apply the `app_errors` migration before expecting rows in production.

## Current Known Audit State

`npm audit --audit-level=moderate` may still report a moderate PostCSS advisory through Next's bundled dependency. npm currently suggests a forced downgrade to `next@9.3.3`, so do not run `npm audit fix --force` without reviewing the proposed changes.
