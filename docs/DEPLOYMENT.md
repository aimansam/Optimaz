# Deployment Guide

Optimaz is deployed through GitHub and Vercel. The normal production workflow is:

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

Optional:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=mailto:you@example.com
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPTIMAZ_ADMIN_EMAILS=you@example.com,teammate@example.com

# Email OTP (custom auth flow via Resend — required for email sign-in)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@optimaz.app
FEEDBACK_NOTIFY_EMAIL=hello@optimaz.app
```

`SUPABASE_SERVICE_ROLE_KEY` is required for account deletion. Keep it server-only in Vercel and never expose it with a `NEXT_PUBLIC_` prefix.
`OPTIMAZ_ADMIN_EMAILS` controls access to `/admin` for operational feedback, error, and usage insights.

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

- `/auth/login` shows Google, GitHub, and email OTP sign-in options.
- Entering an email sends a 6-digit code via Resend; entering the correct code signs in.
- `/dashboard` redirects unauthenticated users to login.
- Authenticated dashboard loads without React hydration errors.
- Create, edit, complete, and delete tasks.
- Clear nullable task fields such as due date, project, and goal.
- Bulk complete/delete tasks.
- Create, favorite, and archive projects.
- Goals, Kanban, Projects, and Settings pages load.
- `/manifest.json` and `/sw.js` return `200`.
- `/api/monitoring/errors` rejects invalid payloads and records valid browser error reports after migrations are applied.

## Stable Tags

Create a stable tag only after the deployed app passes smoke testing:

```bash
git tag stable-YYYY-MM-DD-N
git push origin stable-YYYY-MM-DD-N
```

Use a suffix such as `-2` for follow-up releases on the same day.