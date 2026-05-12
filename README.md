<h1 align="center">TaskFlow</h1>

TaskFlow is a Next.js productivity app for tasks, projects, goals, and Kanban workflows. It uses Supabase for auth/database, TanStack Query for client state, and a lightweight manual PWA setup for installability.

## Documentation

- [Development Guide](docs/DEVELOPMENT.md)
- [PWA & Installability](docs/PWA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

For a production-equivalent check before pushing:

```bash
npm run lint
npm run build
```

## Features
- Next.js 16, React 19, Tailwind CSS
- Supabase auth with Google OAuth
- Tasks, subtasks, projects, goals, and Kanban views
- PWA installability with a manifest and manual service worker
- Custom install prompt button
- Deploy-ready for Vercel

## Project Structure
- `src/app/` — Main app code
- `src/components/` — UI and feature components
- `src/hooks/` — React Query hooks for Supabase data
- `src/lib/` — shared types, utilities, notifications, Supabase clients
- `public/` — Static assets (manifest, icons, service worker)
- `supabase/` — schema and database migrations
- `docs/` — workflow, deployment, and PWA notes

## Deployment

The normal workflow is to push to GitHub `main`; Vercel deploys the latest commit from there. Database changes are handled with Supabase migrations in `supabase/migrations/` and applied with:

```bash
npx supabase db push
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full checklist.

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
