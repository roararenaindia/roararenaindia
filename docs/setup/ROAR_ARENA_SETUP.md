# Roar Arena Setup Guide

This project is a Next.js public site with a safe static fallback. For real automatic schedule/results updates, it also needs Supabase plus a football data provider.

## Local setup

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

Useful checks before deployment:

```bash
npm run typecheck
npm run smoke
npm run build
```

## Required environment variables

Keep real values in `.env.local` locally and Vercel Environment Variables in production.

```txt
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN.com
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/roararenaindia/
NEXT_PUBLIC_X_URL=https://x.com/RoarArenaIndia
NEXT_PUBLIC_WHATSAPP_CHANNEL_URL=https://whatsapp.com/channel/0029Vb8bGxc7oQhX9QvoPG1R
NEXT_PUBLIC_CONTACT_EMAIL=apex36office@gmail.com

CRON_SECRET=your-long-random-secret

MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=your-football-data-org-token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026

NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-secret-or-service-role-key
```

Optional fallback provider:

```txt
API_FOOTBALL_KEY=your-api-football-key
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
```

Instagram and X API keys are not required for the current match-update phase.

## Supabase setup

Supabase is required for self-sustaining updates. Without it, the site still loads fallback content, but fetched matches cannot be saved.

Run the full SQL from:

```txt
supabase/schema.sql
```

Required tables:

- `roar_posts`
- `roar_matches`
- `roar_generated_posts`
- `roar_sync_runs`

## Automatic 2-hour updates

This project uses GitHub Actions as the external scheduler, so it does not depend on Vercel Hobby cron limits.

After Vercel deployment, add these GitHub repository secrets:

```txt
ROAR_CRON_URL=https://YOUR_DOMAIN.com/api/cron/roar
ROAR_CRON_SECRET=the-same-value-as-CRON_SECRET
```

Then run:

```txt
GitHub > Actions > Roar Arena 2-hour match sync > Run workflow
```

If the manual run succeeds, GitHub will call the deployed site every 2 hours.

## Main public files

- `app/page.tsx` loads the public homepage.
- `components/home/home-experience.tsx` contains the main site sections.
- `components/hooks/use-public-home.ts` refreshes live homepage data while visitors are active.
- `app/api/cron/roar/route.ts` runs match sync plus auto-curation.
- `app/api/sync/matches/route.ts` fetches match data and saves it to Supabase.
- `app/api/public/home/route.ts` serves the homepage live data payload.

## Deployment

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add all required Vercel environment variables.
4. Deploy.
5. Open `/admin`, run Final Check, Match API Check, Sync Matches, and Curate.
6. Add the GitHub Actions cron secrets and run the workflow manually once.
