# Roar Arena 2-hour match updates

This phase only needs automatic football schedule/result updates. Instagram and X sync can stay off until the social automation phase.

Use an external scheduler to call the match cron endpoint every 2 hours. This keeps the site lightweight and avoids needing social API keys now.

## Endpoint

Use this URL in an external scheduler such as cron-job.org:

```txt
https://YOUR_DOMAIN.com/api/cron/roar?secret=YOUR_CRON_SECRET
```

Schedule it for every 2 hours.

## What it runs

- FIFA schedule and score sync
- Auto-curation for hero/match board
- It does not run Instagram sync
- It does not run X sync

## Required env vars

```txt
CRON_SECRET=your_secret
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN.com
API_FOOTBALL_KEY=your_api_football_key
MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=your_football_data_org_token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit real keys to the repo. Add them in Vercel Project Settings > Environment Variables, and use `.env.local` only for local testing.

## Test after deploy

Open this in the browser after replacing the values:

```txt
https://YOUR_DOMAIN.com/api/cron/roar?secret=YOUR_CRON_SECRET
```

If it returns `ok: true`, the scheduler can call it every 2 hours.
