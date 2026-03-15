# Stop Repeat

A family task management app that helps parents automate reminders, track tasks, and reward children for building independence.

## Architecture

This is a **pure frontend Vite/React application** that connects directly to an external **Supabase** project. There is no custom backend server.

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui components with Tailwind CSS
- **Routing**: React Router v6
- **State/data**: TanStack React Query + Supabase client
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Database & backend logic**: Supabase (PostgreSQL + Edge Functions)
- **i18n**: i18next (French & English)

## Key Files

- `src/App.tsx` — Root component, route definitions, providers
- `src/hooks/useAuth.tsx` — Authentication context (login, signup, session)
- `src/integrations/supabase/client.ts` — Supabase client singleton
- `src/integrations/supabase/types.ts` — Auto-generated Supabase types
- `src/pages/` — Top-level page components
- `src/hooks/` — Feature-specific data hooks (tasks, rewards, family, etc.)
- `supabase/migrations/` — Database schema migrations (applied to remote Supabase project)
- `supabase/functions/` — Edge Functions deployed on Supabase

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |

## Development

```bash
npm run dev      # Start dev server on port 5000
npm run build    # Production build
npm run preview  # Preview production build
```

## Supabase Setup

The app uses an existing Supabase project (`fzstjebbxbejypgwamqx`). The database schema is defined in `supabase/migrations/` and Edge Functions in `supabase/functions/`. These are deployed to the remote Supabase project — not run locally.

## Features

- Parent/child role system with family invite codes
- Daily task templates with recurrence scheduling
- Points, wallet balance, and streak tracking for children
- Reward redemption system
- House rules with penalty enforcement
- Push notifications (via Web Push API + Supabase Edge Functions)
- Stripe payment integration (family plan upgrade)
- Badge/achievement system
- Savings goals for children
- Family calendar view
