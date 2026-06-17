# Roar Arena 30-minute updates on Vercel Hobby

Vercel Hobby does not allow cron expressions like `*/30 * * * *`. To keep the site free and still update every 30 minutes, this project removes Vercel Cron entries and exposes one safe endpoint for an external scheduler.

## Endpoint

Use this URL in an external scheduler such as cron-job.org:

```txt
https://YOUR_DOMAIN.com/api/cron/roar?secret=YOUR_CRON_SECRET
```

Schedule it for every 30 minutes.

## What it runs

- FIFA schedule and score sync
- Auto-curation for hero/match board
- Instagram sync if configured
- X sync if configured

## Required env vars

```txt
CRON_SECRET=your_secret
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN.com
API_FOOTBALL_KEY=your_api_football_key
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Test after deploy

Open this in the browser after replacing the values:

```txt
https://YOUR_DOMAIN.com/api/cron/roar?secret=YOUR_CRON_SECRET
```

If it returns `ok: true`, the scheduler can call it every 30 minutes.
