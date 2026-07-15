# atur-gizi-web

Next.js App Router frontend for Atur Gizi MVP.

## Setup

```bash
cp .env.example .env.local
npm run dev
```

App: `http://localhost:3000`

With `NEXT_PUBLIC_DEV_AUTH=true`, no Kinde token is required; API must run with `AUTH_DEV_BYPASS=true`.

## Routes

- `/` landing
- `/login`
- `/onboarding`
- `/dashboard`
- `/food/new` manual log
- `/food/scan` AI Food Snap
- `/activities/new`
- `/history`
- `/profile`
