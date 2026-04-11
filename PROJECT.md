# TaskFlow Project Documentation

## Overview
TaskFlow is a full-stack productivity app built with Next.js 16 (App Router), React 19, Supabase (auth + database), TanStack React Query, and Tailwind CSS v4. It features:
- Auth (Google/GitHub OAuth via Supabase)
- Kanban board (drag & drop)
- Tasks, subtasks, projects, goals
- PWA support (offline, push notifications)
- Minimalist black/white design with full dark mode

## Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Supabase (Postgres, RLS, auth)
- **State:** TanStack React Query v5
- **Drag & Drop:** dnd-kit
- **Styling:** Tailwind CSS v4 (with custom dark variant)
- **Icons:** lucide-react

## Key Features
- **Authentication:** Google/GitHub OAuth via Supabase
- **Tasks:** CRUD, priorities, due dates, recurring, subtasks
- **Projects:** Organize tasks by project
- **Goals:** High-level objectives, link tasks to goals
- **Kanban:** Drag & drop columns/cards
- **PWA:** Installable, offline, push notifications
- **Dark Mode:** Toggle, respects system, custom Tailwind variant

## Deployment
- **Recommended:** Vercel (import repo, set env vars, deploy)
- **Env Vars:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - (Optional: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
- **Self-hosting:** `npm run build` + `npm start` (Docker optional)

## Local Development
1. Clone repo
2. Copy `.env.local.example` to `.env.local` and fill in Supabase keys
3. `npm install`
4. `npm run dev`

## Database Schema
- See `supabase/schema.sql` for full schema
- RLS enabled on all tables

## Customizations
- Tailwind v4 dark mode: `@custom-variant dark (&:where(.dark, .dark *));` in `globals.css`
- Greeting: Personalized, time-aware on dashboard

## Contact
For issues or contributions, open an issue or PR on the repository.
