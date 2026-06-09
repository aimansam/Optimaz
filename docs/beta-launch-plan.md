# Optimaz — Beta Testing & Launch Plan

> **Product**: Optimaz — Goal-driven productivity app  
> **Production URL**: https://optimaz.app  
> **Legacy URL**: https://optimaz.mavoralabs.com (redirect to optimaz.app once DNS is live)  
> **Stack**: Next.js 16 + Supabase + Vercel  
> **Last Updated**: June 2026

---

## 🌐 New Domain: optimaz.app

Now that `optimaz.app` has been purchased, here are the steps to go live on it:

### Domain Setup Checklist
- [ ] Add `optimaz.app` custom domain in **Vercel Dashboard** → Project → Settings → Domains
- [ ] Update DNS records at your domain registrar:
  - `A` record: `optimaz.app` → Vercel IP (or CNAME to `cname.vercel-dns.com`)
  - `www` CNAME: `www.optimaz.app` → `cname.vercel-dns.com`
- [ ] Verify SSL certificate auto-provisioned by Vercel (usually within 5 min)
- [ ] Set `optimaz.app` as the **primary domain** in Vercel, set `optimaz.mavoralabs.com` as a redirect
- [ ] Update `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL` env var in Vercel to `https://optimaz.app`
- [ ] Update **Google OAuth** allowed redirect URIs:
  - Add: `https://optimaz.app/auth/callback`
  - Keep: `https://optimaz.mavoralabs.com/auth/callback` (during transition)
- [ ] Update **Supabase Auth** → URL Configuration:
  - Site URL: `https://optimaz.app`
  - Add redirect URL: `https://optimaz.app/**`
- [ ] Update **Resend** email FROM domain if needed (currently `noreply@mavoralabs.com` — can keep or add `noreply@optimaz.app`)
- [ ] Update all hardcoded URLs in the codebase (`mavoralabs.com` references)
- [ ] Test: full sign up, login, OAuth flow on `optimaz.app`

---

## Phase 1: Pre-Beta Hardening (Week 1–2)

**Goal**: Ensure the app is stable, secure, and production-ready before inviting testers.

### 🔐 Auth & Security
- [ ] Fix **Google OAuth redirect_uri_mismatch** on production (add `optimaz.app/auth/callback` to Google Console)
- [ ] Review **Supabase RLS policies** — ensure every table has row-level security enforced; users only see their own data
- [ ] Verify **account deletion** (`/api/account/delete`) removes all user data from all tables
- [ ] Verify **data export** (`/api/account/export`) returns complete user data (GDPR/PDPA compliance)
- [ ] Apply **rate limiting** (`src/lib/rate-limit.ts`) to auth, feedback, and push API routes

### 🛠 Error Monitoring
- [x] Custom error monitoring already wired up — `ErrorMonitor` component captures all JS errors and unhandled rejections, stores in Supabase `app_errors` table via `/api/monitoring/errors` ✅
- [x] `src/components/providers/error-monitor.tsx` is mounted in `providers-client.tsx` ✅
- [ ] Optionally add Sentry in the future for richer stack traces and alerting

### ✅ End-to-End Testing
- [ ] Run full E2E smoke test on `optimaz.app`:
  - Sign up (email + Google OAuth)
  - Complete onboarding flow
  - Create task → complete task → delete task
  - Create project → add tasks → complete project
  - Create goal → link milestones
  - Kanban drag-and-drop
  - Push notification opt-in
  - PWA install (Android Chrome + iOS Safari)
  - Account settings + delete account
- [ ] Run **Playwright** tests: `npx playwright test` (see `tests/live-smoke.spec.ts`)
- [ ] Run **Lighthouse** audit on `/` and `/dashboard` (target: 90+ performance, 100 accessibility)
- [ ] Test **dark mode** and **light mode** across all pages

### ⚙️ Infrastructure
- [x] **Vercel cron job** already configured in `vercel.json`: runs `/api/cron/task-reminders` daily at 01:00 UTC ✅
- [ ] Enable **Supabase point-in-time recovery** (upgrade to Pro plan if needed)
- [ ] Confirm **Cloudflare Web Analytics** is active on `optimaz.app` (auto-inject via proxy)

---

## Phase 2: Closed Beta (Weeks 2–4)

**Goal**: 10–30 trusted users. Gather qualitative feedback, find critical bugs.

### 👥 Recruitment
- [ ] Write a personal beta invite message (email/DM template)
- [ ] Reach out to: friends, colleagues, Twitter/X followers, LinkedIn connections, productivity communities
- [ ] Target user personas:
  - Freelancers / solopreneurs managing multiple projects
  - Students with complex task + goal tracking needs
  - Remote workers needing routine + habit tracking
- [ ] Create a beta tester tracking sheet (Google Sheets / Notion) with: name, email, sign-up date, last active, feedback received

### 📣 Feedback System
- [ ] Confirm **feedback button** (`src/components/feedback/feedback-button.tsx`) is visible in the app
- [ ] Set up a **Discord server** (or WhatsApp group) for direct beta tester communication
- [ ] Create a simple **bug report template** for testers to follow
- [ ] Log all feedback in the tracking sheet weekly

### 📊 Analytics to Watch
- [ ] Monitor `analytics_events` Supabase table:
  - `onboarding_completed` events (how many testers finish onboarding?)
  - `task_created`, `task_completed` (are they actually using core features?)
  - `pwa_install_accepted` (PWA adoption rate)
- [ ] Cloudflare Web Analytics: session count, top pages, bounce rate

### ✅ Closed Beta Exit Criteria
- ≥ 10 active users with ≥ 3 sessions each
- Zero **P0 bugs** (auth failures, data loss, app crashes)
- Core flow works end-to-end without confusion
- Push notifications working for ≥ 50% of testers who enabled them

---

## Phase 3: Open Beta (Weeks 4–8)

**Goal**: 50–200 users. Stress-test the system, refine onboarding, validate product-market fit.

### 📢 Opening Up
- [x] **"Open Beta" / "Free during beta"** badge already live on landing page hero ✅
- [ ] Open sign-up publicly (remove any invite restrictions)
- [ ] Announce on:
  - Twitter/X (build-in-public thread: "What I built and why")
  - LinkedIn (professional productivity angle)
  - Reddit: r/productivity, r/selfhosted, r/webdev (share journey)
  - Indie Hackers (post a milestone update)
  - Hacker News "Show HN" post
- [ ] Drip-invite existing **waitlist** users from `pricing_waitlist` table

### 🎯 Onboarding Improvements
- [ ] Review `src/components/onboarding/onboarding-panel.tsx` for friction points
- [ ] Consider adding **sample/demo data** option: "Start with example tasks?" during onboarding
- [ ] Add **empty state** prompts on all pages (tasks, projects, goals) guiding new users
- [ ] Reduce time-to-value: users should have their first task created within 60 seconds

### 📈 Metrics to Track
| Metric | Target |
|--------|--------|
| Sign-ups | 50+ |
| D7 retention | ≥ 30% |
| Onboarding completion rate | ≥ 70% |
| Tasks created per user (week 1) | ≥ 3 |
| Feedback submissions | ≥ 10 |
| P0 bugs | 0 |

### 🔄 Iteration Cadence
- **Weekly**: review feedback, fix bugs, ship small improvements
- **Bi-weekly**: review analytics trends, adjust onboarding if retention is low
- **End of open beta**: feature freeze, final polish for launch

---

## Phase 4: Public Launch

**Goal**: Maximum visibility. Official "v1.0" announcement.

### 📦 Launch Assets to Prepare
- [ ] **Product Hunt** submission:
  - Tagline (e.g., "The productivity app that actually works for you")
  - Description (300 words, benefit-focused)
  - Screenshots (5–6: dashboard, tasks, kanban, goals, mobile PWA)
  - Demo GIF or video (60–90 seconds)
  - Maker comment (personal story / why you built it)
- [ ] **Landing page** final review:
  - Clear value proposition above the fold
  - Feature screenshots / demo
  - Social proof (beta user quotes if available)
  - CTA button: "Get Started Free"
- [ ] **Logo & brand assets** for social sharing (already have Eagle Lake logo ✅)

### 📅 Launch Day Checklist
- [ ] Publish Product Hunt listing (post at 12:01 AM PST for max visibility)
- [ ] Post on Twitter/X: launch thread with screenshots + link
- [ ] Post on LinkedIn: professional productivity angle
- [ ] Post on Reddit communities (r/productivity, r/SideProject)
- [ ] Indie Hackers: "I just launched Optimaz" post
- [ ] Email waitlist users: "Optimaz is live!"
- [ ] Monitor Sentry for errors in real-time (day-of-launch support)
- [ ] Monitor Supabase DB load (watch for connection limits)
- [ ] Be available for 4+ hours post-launch to respond to comments/feedback

### 🏷 Post-Launch (Week 1)
- [ ] Respond to every Product Hunt comment
- [ ] Thank early users personally (DMs/emails)
- [ ] Fix any launch-day bugs within 24 hours
- [ ] Write a "Day 1 numbers" tweet/post (transparency builds trust)

---

## 🎫 Beta Access System

All users who sign up during the beta period automatically receive full Pro access via the `beta_access` database table.

### How It Works

| Period | `pro_expires_at` | Access |
|---|---|---|
| Beta (now) | `NULL` | ✅ Full Pro — no expiry |
| v1.0 launch day | Set to `NOW() + 1 month` | ✅ 1 month free Pro |
| After 1 month post-launch | Expired date | ❌ Free tier — subscribe to continue |

### Files
- **Migration**: `supabase/migrations/20260610000000_add_beta_access.sql`
- **Hook**: `src/hooks/use-beta-access.ts` — `useBetaAccess()` and `useHasBetaPro()`

### On v1.0 Launch Day — run this SQL in Supabase:
```sql
-- Give all existing beta users exactly 1 month of free Pro
UPDATE beta_access
SET pro_expires_at = now() + INTERVAL '1 month'
WHERE pro_expires_at IS NULL;

-- Stop granting beta access to new signups (drop the trigger)
DROP TRIGGER IF EXISTS on_auth_user_created_beta_access ON auth.users;
```

### Feature gate check when Stripe is added (v1.0):
```ts
import { useHasBetaPro } from '@/hooks/use-beta-access'

const hasBetaPro = useHasBetaPro()
const hasPro = hasBetaPro || stripeSubscriptionActive
```

### After beta fully ends (clean up):
1. Remove `useHasBetaPro()` checks from all components
2. Run in Supabase SQL editor:
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created_beta_access ON auth.users;
   DROP FUNCTION IF EXISTS public.grant_beta_access_on_signup();
   DROP TABLE IF EXISTS public.beta_access;
   ```
3. Delete `src/hooks/use-beta-access.ts`
4. Delete `supabase/migrations/20260610000000_add_beta_access.sql`

---

## 💰 Monetization Roadmap (Post-Launch)

Per `docs/subscription-plan.md`:

| Tier | Price | Key Limits |
|------|-------|-----------|
| Free | $0 | 50 tasks, 3 projects, 2 goals |
| Pro | ~$8/mo | Unlimited + AI features |
| Team | ~$15/user/mo | Shared workspace |

### Stripe Integration Steps
- [ ] Set up **Stripe** account and products
- [ ] Add `stripe` npm package and webhook handler
- [ ] Implement **feature gating** in the app (check subscription tier)
- [ ] Replace pricing waitlist form with **Stripe Checkout** on `/pricing`
- [ ] Test subscription flow end-to-end (subscribe → upgrade → cancel → downgrade)

---

## 📅 Master Timeline

| Week | Phase | Key Actions |
|------|-------|-------------|
| **1** | Domain + Hardening | Point `optimaz.app` to Vercel, fix OAuth, set up Sentry |
| **2** | Pre-Beta Testing | E2E tests, Lighthouse, Playwright smoke tests |
| **3–4** | Closed Beta | Invite 10–30 trusted users, collect feedback |
| **5–6** | Open Beta | Open sign-ups, announce on social, iterate |
| **7** | Launch Prep | Product Hunt assets, landing page final polish |
| **8** | 🚀 Public Launch | PH post, social blast, email waitlist |
| **9+** | Post-Launch | Stripe integration, retention features |

---

## 🔧 Immediate Next Actions (This Week)

1. **Connect `optimaz.app` to Vercel** — add domain, update DNS
2. **Update Google OAuth** — add `optimaz.app/auth/callback`
3. **Update Supabase Auth** — set site URL to `optimaz.app`
4. **Wire up Sentry** — add DSN to env vars
5. **Run E2E test** on the new domain once DNS propagates

---

## 📁 Related Docs

- `docs/subscription-plan.md` — Free/Pro/Team tier details + Stripe roadmap
- `docs/dev-workflow.md` — Git branching (dev → staging → main → production)
- `supabase/schema.sql` — Full database schema
- `src/lib/analytics.ts` — Self-built analytics event tracking
- `src/app/privacy/page.tsx` — PDPA Malaysia + GDPR privacy policy
- `src/app/terms/page.tsx` — Terms of service (Malaysian law)
