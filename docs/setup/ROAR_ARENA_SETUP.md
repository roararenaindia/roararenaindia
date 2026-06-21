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
NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/RoarArena
NEXT_PUBLIC_X_URL=https://x.com/RoarArenaIndia
NEXT_PUBLIC_WHATSAPP_CHANNEL_URL=https://whatsapp.com/channel/0029Vb8bGxc7oQhX9QvoPG1R
NEXT_PUBLIC_CONTACT_EMAIL=roararenaindia@gmail.com

CRON_SECRET=your-long-random-secret

MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=your-football-data-org-token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
MATCH_SYNC_PAST_DAYS=7
MATCH_SYNC_FUTURE_DAYS=7

NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-secret-or-service-role-key
```

Optional fallback provider:

```txt
API_FOOTBALL_KEY=your-api-football-key
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=7
MATCH_SYNC_FUTURE_DAYS=7
```

Instagram API keys activate automatic post sync. The webhook gives near-instant updates, and the 10-minute GitHub fallback poll catches delayed webhook events. X remains optional and is skipped unless its credentials are configured.

```txt
INSTAGRAM_API_MODE=instagram_login
INSTAGRAM_GRAPH_API_VERSION=v20.0
INSTAGRAM_USER_ID=your_numeric_instagram_user_id
INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_access_token
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_long_random_webhook_verify_token
META_APP_SECRET=your_meta_app_secret
INSTAGRAM_SYNC_LIMIT=18
INSTAGRAM_STORAGE_BUCKET=roar-instagram

X_USERNAME=RoarArenaIndia
X_USER_ID=your_x_user_id
X_BEARER_TOKEN=your_x_bearer_token
X_SYNC_LIMIT=10
```

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

## Automatic updates

This project uses GitHub Actions as the external scheduler, so it does not depend on Vercel Hobby cron limits.

After Vercel deployment, add these GitHub repository secrets:

```txt
ROAR_CRON_URL=https://YOUR_DOMAIN.com/api/cron/roar
ROAR_CRON_SECRET=the-same-value-as-CRON_SECRET
```

Then run:

```txt
GitHub > Actions > Roar Arena live sync > Run workflow
```

If the manual run succeeds, GitHub will call Instagram fallback polling every 10 minutes, match result sync every 15 minutes, and the full live sync every 2 hours.

## Main public files

- `app/page.tsx` loads the public homepage.
- `components/home/home-experience.tsx` contains the main site sections.
- `components/hooks/use-public-home.ts` refreshes live homepage data while visitors are active.
- `app/api/cron/roar/route.ts` runs configured social sync, match sync, and auto-curation.
- `app/api/webhooks/instagram/route.ts` receives verified Meta Instagram webhook events and triggers immediate sync.
- `app/api/sync/matches/route.ts` fetches match data and saves it to Supabase.
- `app/api/public/home/route.ts` serves the homepage live data payload.

## Deployment

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add all required Vercel environment variables.
4. Deploy.
5. Open `/admin`, run Final Check, Match API Check, Sync Matches, and Curate.
6. Add the GitHub Actions cron secrets and run the workflow manually once.
