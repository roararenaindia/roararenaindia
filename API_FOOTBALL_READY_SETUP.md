# Roar Arena — API-Football Ready Setup

This project is now ready to use API-Football / API-Sports for FIFA World Cup schedules and scores.

## Important security rule

Do not paste the real API key into GitHub or the zip source code.

Add it only inside Vercel:

1. Open Vercel
2. Open the Roar Arena project
3. Go to Settings → Environment Variables
4. Add `API_FOOTBALL_KEY`
5. Redeploy the project

## Required Vercel variables

```txt
API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
```

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
- Vercel cron now syncs matches every 30 minutes.
- Instagram sync is every 2 hours.
- Auto-curation is every 30 minutes.
- API-Football key is never hardcoded.

## Expected result

The site should automatically keep these sections updated:

- Hero story
- Featured Match
- FIFA fixtures
- Final results
- Live match state
- Latest social posts from Instagram

