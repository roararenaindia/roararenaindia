# Roar Arena - Match Provider Ready Setup

This project is ready to use football-data.org as the free World Cup provider, with API-Football / API-Sports available only as an optional fallback.

## Important security rule

Do not paste the real API key into GitHub or the zip source code.

Add it only inside Vercel:

1. Open Vercel
2. Open the Roar Arena project
3. Go to Settings > Environment Variables
4. Add `FOOTBALL_DATA_TOKEN`
5. Redeploy the project

## Required Vercel variables

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=your_long_random_secret
MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=your_football_data_org_token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026

# Optional paid/API-Sports fallback
API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=7
MATCH_SYNC_FUTURE_DAYS=7

# Optional tennis/Wimbledon sync via API-Tennis
TENNIS_API_KEY=your_api_tennis_key_here
TENNIS_TOURNAMENT_NAME_FILTER=Wimbledon
TENNIS_TOURNAMENT_KEY=
TENNIS_TIMEZONE=UTC
TENNIS_SYNC_PAST_DAYS=2
TENNIS_SYNC_FUTURE_DAYS=10
```

Supabase is required for automatic updates because the sync route saves fixtures and results into `roar_matches`. Without it, the site still works with fallback data, but live schedule/results are not persisted.

## Why the domain/IP allowlist can stay empty

The API key is used only on server API routes, not inside browser JavaScript. That means visitors do not see the key.

The free football-data.org token is used only by server routes, so it stays private as long as it is stored in Vercel environment variables and never committed to GitHub.

## How to test after deploy

Open:

```txt
/admin
```

Then:

1. Save your admin secret if needed
2. Click `Match API Check`
3. Click `Sync Matches`
4. Click `Curate`
5. Click `Final Check`

## What changed in this build

- Match sync now uses one date-range request instead of one request per day.
- This protects the free 100 requests/day quota.
- External live automation now syncs Instagram fallback polling every 10 minutes, matches every 15 minutes, and the full cron every 2 hours.
- Auto-curation runs after each live sync.
- Instagram runs when Meta credentials are configured; X is skipped until its credentials exist.
- Match provider tokens are never hardcoded.
- Wimbledon tennis sync is wired but optional. Without `TENNIS_API_KEY`, `/api/sync/tennis` safely reports `not_configured`; with the key added, GitHub Actions and `/api/cron/roar` can save Wimbledon fixtures into the same match board as FIFA.

## Expected result

The site should automatically keep these sections updated:

- Hero story
- Featured Match
- FIFA fixtures
- Final results
- Live match state
- Latest story cards from Instagram, fallback, or Supabase content
