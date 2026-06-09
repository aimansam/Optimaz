# Optimaz Subscription Plan

## Philosophy

> "Paid plans should focus on high-value power features, not basic access."

Free users get a **fully working app**. Paid users get **more scale, analytics, and automation** — not gated core functionality. This builds trust, drives word-of-mouth, and makes the upgrade feel like a genuine improvement rather than a paywall.

---

## Tier Structure

### 🆓 Free — Always

Everything needed to actually use the app day-to-day:

| Feature | Limit |
|---------|-------|
| Tasks | Unlimited |
| Subtasks per task | Unlimited |
| Projects | Up to **5** active |
| Goals | Up to **5** |
| Kanban board | Full access |
| Calendar view | Full access |
| Routines | Full access |
| Dashboard & stats (7-day) | Full access |
| Global search (Cmd+K) | Full access |
| Push notifications | Full access |
| Data export | Limited (last 90 days) |
| Feedback submission | Full access |

---

### ⚡ Pro — ~$6/month (or $48/year)

Power features for heavy users and professionals:

| Feature | Details |
|---------|---------|
| **Unlimited projects** | No 5-project cap |
| **Unlimited goals** | No 5-goal cap |
| **Saved views** | Save & reload custom filter combinations |
| **Extended analytics** | Full history beyond 7 days, weekly/monthly trends |
| **Full data export** | Complete CSV/JSON export of all tasks, projects, goals, history |
| **Advanced reminders** | Custom notification times, per-task lead times |
| **Priority support** | Faster response for feedback and bugs |
| **Early access** | First access to new features before public rollout |

---

### 🏢 Team — ~$12/month per user *(future)*

Collaboration features for small teams:

| Feature | Details |
|---------|---------|
| Everything in Pro | |
| **Shared workspaces** | Team members see and collaborate on shared projects |
| **Task assignment** | Assign tasks to specific team members |
| **Team projects & goals** | Shared tracking across the team |
| **Permission levels** | View / Edit / Admin roles |
| **Team dashboard** | See everyone's workload and progress |

---

## Technical Implementation

When ready to launch paid plans, the following changes are needed:

### 1. User plan field
Add `plan: 'free' | 'pro' | 'team'` to Supabase user metadata (or a separate `subscriptions` table).

```sql
-- Option A: simple, no new table
-- Store in auth.users user_metadata: { plan: 'pro', plan_expires_at: '...' }

-- Option B: proper table (recommended for production)
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due')),
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2. Plan checks in hooks

Add limit enforcement in `use-projects.ts` and `use-goals.ts`:

```typescript
// In use-projects.ts
const FREE_PLAN_PROJECT_LIMIT = 5;

export function useCanCreateProject() {
  const { data: projects } = useProjects();
  const { data: user } = useUser();
  const plan = user?.user_metadata?.plan ?? 'free';
  if (plan !== 'free') return { canCreate: true };
  return { canCreate: (projects?.length ?? 0) < FREE_PLAN_PROJECT_LIMIT };
}
```

### 3. Upgrade prompt UI

When a free user hits a limit, show an upgrade dialog:

```tsx
// Component: UpgradePrompt
// Props: feature (string), limit (number)
// Renders: "You've reached the free plan limit for projects (5/5). 
//           Upgrade to Pro for unlimited projects."
// CTA: "Upgrade to Pro →" → /settings/billing
```

### 4. Stripe integration

- **Stripe Checkout** for payment
- **Stripe Webhook** (`customer.subscription.updated`) → updates `subscriptions` table
- **Stripe Customer Portal** for subscription management

API routes to add:
```
POST /api/billing/checkout        → create Stripe Checkout session
POST /api/billing/portal          → create Stripe Customer Portal session
POST /api/billing/webhook         → handle Stripe webhook events
GET  /api/billing/subscription    → get current subscription status
```

### 5. Settings → Billing page

New page: `/settings/billing`
- Show current plan (Free / Pro)
- "Upgrade to Pro" button (links to Stripe Checkout)
- If Pro: show renewal date, "Manage subscription" button (Stripe Portal)
- Cancel anytime, no commitment messaging

---

## Rollout Priority

Based on the pricing waitlist feedback, build Pro features in this likely order:

1. **Unlimited projects & goals** — most obvious limit for power users
2. **Advanced reminders** — recurring, time-based notifications (waitlist top request)
3. **Saved views** — infrastructure already exists (`saved_views` table + hook)
4. **Extended analytics** — full history visualization
5. **Full export** — CSV/JSON dump of all data
6. **Team features** — only after strong solo user base

---

## Notes

- The `saved_views` table and `use-saved-views` hook are already built — this is Pro-ready
- The `notification_deliveries` table for push notifications is already built
- Stripe integration is the main new technical component
- Use Stripe's hosted Checkout to minimize PCI compliance burden
- Consider offering a **14-day Pro trial** to convert waitlist users
