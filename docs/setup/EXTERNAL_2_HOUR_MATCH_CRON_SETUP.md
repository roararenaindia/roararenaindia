# Roar Arena 2-hour match updates

This phase only needs automatic football schedule/result updates. Instagram and X sync can stay off until the social automation phase.

Use GitHub Actions as the external scheduler. This keeps the site lightweight, avoids Vercel Cron limits on free/hobby plans, and avoids needing social API keys now.

This repo includes:

```txt
.github/workflows/roar-cron.yml
```

It calls the match cron endpoint every 2 hours.

## Endpoint

The workflow calls this endpoint:

```txt
https://YOUR_DOMAIN.com/api/cron/roar
```

It sends `CRON_SECRET` as an authorization header, so the secret is not placed in the URL.

## GitHub Actions secrets

After Vercel deployment, open the GitHub repo:

```txt
https://github.com/roararenaindia/roararenaindia
```

Go to:

```txt
Settings > Secrets and variables > Actions > New repository secret
```

Add:

```txt
ROAR_CRON_URL=https://YOUR_DOMAIN.com/api/cron/roar
ROAR_CRON_SECRET=your_same_vercel_cron_secret
```

Then open:

```txt
Actions > Roar Arena 2-hour match sync > Run workflow
```

If the manual run succeeds, GitHub will call it automatically every 2 hours.

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

`API_FOOTBALL_KEY` is optional. The free default provider is `FOOTBALL_DATA_TOKEN` from football-data.org.

Do not commit real keys to the repo. Add them in Vercel Project Settings > Environment Variables, and use `.env.local` only for local testing.

## Test after deploy

Open this in the browser after replacing the values:

```txt
https://YOUR_DOMAIN.com/api/cron/roar?secret=YOUR_CRON_SECRET
```

This browser URL is only a manual fallback because browsers cannot easily add the `Authorization` header. If it returns `ok: true`, the deployed endpoint is ready. Then run the GitHub Actions workflow manually once, which uses the safer header-based secret.
