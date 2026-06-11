# Optimaz — Developer Guide

Optimaz is a personal productivity PWA built with Next.js 16, Supabase, and Tailwind CSS v4.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase (Postgres + RLS) |
| Data Fetching | TanStack React Query v5 |
| Drag & Drop | @dnd-kit |
| Push Notifications | web-push (VAPID) |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated app pages
│   │   ├── dashboard/  # Today view + analytics
│   │   ├── kanban/     # Kanban board with filters + saved views
│   │   ├── calendar/   # Month/week calendar view
│   │   ├── projects/   # Project list + detail
│   │   ├── goals/      # Goal list + detail
│   │   ├── routines/   # Recurring task management
│   │   ├── settings/   # Push notifications, account, export
│   │   └── admin/      # Admin monitoring (restricted by email)
│   ├── api/            # API routes (push, cron, export, monitoring)
│   └── auth/           # Supabase OAuth callback
├── components/
│   ├── layout/         # Header (with GlobalSearch), Sidebar
│   ├── tasks/          # TaskCard, TaskList (drag-to-reorder), TaskForm
│   ├── kanban/         # KanbanBoard, KanbanColumn, KanbanCard
│   ├── goals/          # GoalCard, GoalForm, GoalQuestionFlow
│   ├── projects/       # ProjectCard, ProjectQuestionFlow
│   ├── routines/       # RoutineCard
│   ├── dashboard/      # DashboardAnalytics (7-day chart), DashboardWidgets
│   └── ui/             # Design system components
├── hooks/              # React Query hooks for all data operations
├── lib/
│   ├── supabase/       # Client, server, admin, middleware helpers
│   ├── types.ts        # Core TypeScript types
│   ├── recurrence.ts   # Recurring task date calculation
│   ├── analytics.ts    # trackEvent() → Supabase analytics_events
│   └── utils.ts        # cn(), formatDate(), isOverdue()
└── middleware.ts       # Next.js middleware (auth guard + session refresh)

supabase/
├── schema.sql          # Full DB schema (run this on a fresh project)
└── migrations/         # Incremental SQL migrations
```

---

## Required Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase — required
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase service role — required for admin page and cron job
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Push notifications — required for web push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:you@example.com

# Cron job security — required for /api/cron/task-reminders
CRON_SECRET=your-random-secret-string

# Admin panel — comma-separated emails that can access /admin
OPTIMAZ_ADMIN_EMAILS=you@example.com

# Email notifications (optional) — used to email feedback@mavoralabs.com on new feedback
# Get a free API key at https://resend.com (100 emails/day free)
RESEND_API_KEY=re_your_api_key_here
# Optional: override the from address once you've verified your domain in Resend
# RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Generating VAPID keys

```bash
npx web-push generate-vapid-keys
```

---

## Supabase Setup

### 1. Create a new Supabase project
Go to https://supabase.com and create a new project.

### 2. Apply the database schema
In the **Supabase Dashboard → SQL Editor**, run:

```sql
-- Full schema (tables, indexes, triggers, RLS)
-- Copy and paste the contents of supabase/schema.sql
```

### 3. Apply all migrations (in order)
Run each file in `supabase/migrations/` in chronological filename order through the SQL Editor.

### 4. Ensure RLS policies are applied
If you ever toggle RLS on/off in the dashboard and data disappears, run the restore migration:

```sql
-- Copy and paste supabase/migrations/20260609000000_restore_rls_policies.sql
```

### 5. Enable Google OAuth (optional)
In **Supabase Dashboard → Authentication → Providers**, enable Google and add your OAuth credentials. Add your app URL to the allowed redirect URLs.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the dev server (Webpack mode)
npm run dev
```

App runs at `http://localhost:3000`.

> **Note:** After modifying `.env.local`, restart the dev server for variables to take effect.

---

## Running E2E Tests

```bash
# Save auth state first (logs in and saves session)
npm run test:smoke:auth-state

# Run smoke tests
npm run test:smoke

# Run with browser visible
npm run test:smoke:headed
```

---

## Deployment (Vercel)

1. Push to GitHub — Vercel auto-deploys on push to `main`
2. Add all environment variables in **Vercel → Project → Settings → Environment Variables**
3. The cron job (`/api/cron/task-reminders`) runs **every 4 hours** via `vercel.json` to cover all timezones

---

## Key Data Flows

### Authentication
`src/middleware.ts` (Next.js middleware) runs on every request:
- Unauthenticated users → `/auth/login`
- Logged-in users visiting `/auth/*` → `/dashboard`
- Public pages (`/pricing`, `/privacy`, `/terms`) — no auth check

### Recurring Tasks
When a recurring task is marked **done**:
1. The current task's `is_recurring` flag is set to false
2. A new task is created with the next due date (daily/weekly/monthly)
3. All subtasks are cloned to the new task instance

### Push Reminders
Vercel cron calls `GET /api/cron/task-reminders` every 4 hours:
1. Fetches tasks due within ±2 days
2. Checks each user's `notification_lead_time_minutes` preference
3. Deduplicates via `notification_deliveries` table
4. Sends web push via VAPID keys

### Global Search (⌘K)
`GlobalSearch` in the header queries Supabase directly (debounced 200ms) for tasks, projects, and goals matching the user's input. Results are grouped by type with keyboard navigation.

---

## Admin Page

Available at `/admin` — only accessible to emails listed in `OPTIMAZ_ADMIN_EMAILS`.

Shows:
- Usage counts (tasks, projects, goals, feedback, errors)
- Operational health (errors/feedback/events/reminders in last 24h, active users 7d)
- Recent feedback, app errors, notification deliveries, pricing waitlist

Requires `SUPABASE_SERVICE_ROLE_KEY` to be set.

---

## Common Issues

| Problem | Solution |
|---|---|
| Goals/tasks not showing after enabling RLS | Run `supabase/migrations/20260609000000_restore_rls_policies.sql` in SQL Editor |
| Push notifications not working | Check VAPID keys are set and `NEXT_PUBLIC_VAPID_PUBLIC_KEY` matches |
| Admin page shows "not configured" | Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars |
| Cron job returns 401 | `CRON_SECRET` env var must match the `Authorization: Bearer` header Vercel sends |
| Feedback emails not arriving | Add `RESEND_API_KEY` to Vercel env vars; check spam folder |
