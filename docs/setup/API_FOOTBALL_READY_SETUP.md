# Roar Arena - API-Football Ready Setup

This project is now ready to use API-Football / API-Sports for FIFA World Cup schedules and scores.

## Important security rule

Do not paste the real API key into GitHub or the zip source code.

Add it only inside Vercel:

1. Open Vercel
2. Open the Roar Arena project
3. Go to Settings > Environment Variables
4. Add `API_FOOTBALL_KEY`
5. Redeploy the project

## Required Vercel variables

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=your_long_random_secret
API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
```

Supabase is required for automatic updates because the sync route saves fixtures and results into `roar_matches`. Without it, the site still works with fallback data, but live schedule/results are not persisted.

## Why the domain/IP allowlist can stay empty

The API key is used only on server API routes, not inside browser JavaScript. That means visitors do not see the key.

Free API-Football plans cannot use domain/IP restrictions, but this is okay as long as the key stays in Vercel environment variables.

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
- External cron now syncs matches every 2 hours.
- Auto-curation runs after each match sync.
- Instagram and X sync are not required for this phase.
- API-Football key is never hardcoded.

## Expected result

The site should automatically keep these sections updated:

- Hero story
- Featured Match
- FIFA fixtures
- Final results
- Live match state
- Latest story cards from fallback or Supabase content
