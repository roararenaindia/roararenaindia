# Roar Arena Automation Setup

This phase runs automatic live updates. The two-hour cron always updates fixtures/results and auto-curation, and it also syncs Instagram/X posts when the matching credentials are configured.

## Current architecture

```txt
football-data.org or API-Football
  -> /api/sync/matches
  -> Supabase roar_matches
  -> /api/admin/auto-curate
  -> /api/public/home
  -> Matchday command board

Instagram/X social posts
  -> Supabase roar_posts
  -> /api/public/home
  -> Latest from Arena
```

## Required Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Add the required variables in Vercel.

```txt
CRON_SECRET=your-long-random-secret
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-or-secret-key

MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=your-football-data-org-token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

## Optional fallback provider

```txt
API_FOOTBALL_KEY=your-api-football-key
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
```

## Admin control

Open:

```txt
/admin
```

Use your `CRON_SECRET` as the admin key.

Admin actions:

- Final launch check
- Match API check
- Sync matches
- Auto-curate the featured board
- Feature/hide posts
- Pin/hide matches
- Edit titles, categories, descriptions, and match priority

## Automatic 2-hour live updates

Use GitHub Actions instead of Vercel Cron for the 2-hour schedule.

The workflow file is:

```txt
.github/workflows/roar-cron.yml
```

After deployment, add GitHub repository secrets:

```txt
ROAR_CRON_SECRET=the-same-value-as-CRON_SECRET
```

The workflow defaults to `https://roararenaindia.vercel.app/api/cron/roar`. Add `ROAR_CRON_URL` only if the production domain changes.

Then run:

```txt
GitHub > Actions > Roar Arena 2-hour live sync > Run workflow
```

If the manual workflow succeeds, GitHub will keep calling the deployed endpoint every 2 hours.

## Social automation

The routes run from `/api/cron/roar` when their credentials exist:

- `/api/sync/instagram`
- `/api/sync/x`
- `/api/sync/all`
- `/api/admin/instagram/check`
- `/api/admin/x/check`

Add Instagram now that the Meta developer setup is ready:

```txt
INSTAGRAM_API_MODE=instagram_login
INSTAGRAM_GRAPH_API_VERSION=v20.0
INSTAGRAM_USER_ID=your_numeric_instagram_user_id
INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_access_token
INSTAGRAM_SYNC_LIMIT=18
INSTAGRAM_STORAGE_BUCKET=roar-instagram
```

X remains optional and will be skipped unless these exist:

```txt
X_USERNAME=RoarArenaIndia
X_USER_ID=your_x_user_id
X_BEARER_TOKEN=your_x_bearer_token
X_SYNC_LIMIT=10
```
