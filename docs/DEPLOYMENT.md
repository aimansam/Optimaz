# Deployment Guide

TaskFlow is deployed through GitHub and Vercel. The normal production workflow is:

1. Make changes locally.
2. Run checks.
3. Commit and push to `main`.
4. Let Vercel deploy the pushed commit.
5. Apply Supabase migrations when needed.
6. Smoke test production.
7. Create a stable tag after production passes.

## Required Checks

```bash
npm run lint
npm run build
```

## Environment Variables

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Optional for push notifications:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=mailto:you@example.com
```

Optional for Sentry error monitoring:

```bash
NEXT_PUBLIC_SENTRY_DSN=your-public-client-dsn
SENTRY_DSN=your-server-dsn
SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ORG=your-sentry-org-slug
SENTRY_PROJECT=your-sentry-project-slug
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_TEST_TOKEN=your-random-test-token
```

## Database Migrations

When a change includes files in `supabase/migrations/`, apply them to the remote Supabase project:

```bash
npx supabase db push
```

If the CLI asks for login, run:

```bash
npx supabase login
```

## Production Smoke Test

After Vercel deploys, test:

- `/auth/login` shows Google login only.
- `/dashboard` redirects unauthenticated users to login.
- Authenticated dashboard loads without React hydration errors.
- Create, edit, complete, and delete tasks.
- Clear nullable task fields such as due date, project, and goal.
- Bulk complete/delete tasks.
- Create, favorite, and archive projects.
- Goals, Kanban, Projects, and Settings pages load.
- `/manifest.json` and `/sw.js` return `200`.
- Sentry receives errors after the DSN variables are configured. To verify it, run `SMOKE_SENTRY_TEST_TOKEN=your-random-test-token npm run test:smoke` or POST to `/api/monitoring/sentry-test` with the `x-sentry-test-token` header.

## Stable Tags

Create a stable tag only after the deployed app passes smoke testing:

```bash
git tag stable-YYYY-MM-DD-N
git push origin stable-YYYY-MM-DD-N
```

Use a suffix such as `-2` for follow-up releases on the same day.