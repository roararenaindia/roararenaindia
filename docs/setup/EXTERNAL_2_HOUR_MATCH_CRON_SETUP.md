# Roar Arena live updates

This workflow handles automatic football schedule/result updates, homepage curation, and configured social post sync. Instagram runs when `INSTAGRAM_USER_ID` and `INSTAGRAM_ACCESS_TOKEN` exist. X is skipped unless its credentials exist.

Use GitHub Actions as the external scheduler. This keeps the site lightweight, avoids Vercel Cron limits on free/hobby plans, and avoids needing social API keys now.

This repo includes:

```txt
.github/workflows/roar-cron.yml
```

It runs three schedules:

- Instagram fallback polling every 10 minutes.
- Match fixtures/results sync every 15 minutes.
- Full `/api/cron/roar` health sync every 2 hours.

## Endpoint

The full sync calls this endpoint by default:

```txt
https://roararenaindia.vercel.app/api/cron/roar
```

It sends `CRON_SECRET` as an authorization header, so the secret is not placed in the URL.

If the production domain changes later, add `ROAR_CRON_URL` in GitHub Actions secrets to override the default.
For split 10-minute and 15-minute jobs, the workflow derives the base URL from `ROAR_CRON_URL`. You can also set `ROAR_BASE_URL=https://YOUR_DOMAIN.com`.

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
ROAR_CRON_SECRET=your_same_vercel_cron_secret
```

Optional only if the domain changes:

```txt
ROAR_CRON_URL=https://YOUR_DOMAIN.com/api/cron/roar
```

Then open:

```txt
Actions > Roar Arena live sync > Run workflow
```

If the manual run succeeds, GitHub will call the deployed site on the 10-minute, 15-minute, and 2-hour schedules.

## What it runs

- Instagram post sync when credentials exist
- X post sync when credentials exist
- FIFA schedule and score sync
- Optional Wimbledon tennis schedule/result sync when `TENNIS_API_KEY` is configured
- Auto-curation for hero/match board

## Required env vars

These must exist in Vercel Project Settings > Environment Variables for `Production`, then the project must be redeployed.

```txt
CRON_SECRET=your_secret
NEXT_PUBLIC_SITE_URL=https://roararenaindia.vercel.app
NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/RoarArena
MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=your_football_data_org_token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
MATCH_SYNC_PAST_DAYS=7
MATCH_SYNC_FUTURE_DAYS=7
TENNIS_API_KEY=your_api_tennis_key_here
TENNIS_TOURNAMENT_NAME_FILTER=Wimbledon
TENNIS_TOURNAMENT_KEY=
TENNIS_TIMEZONE=UTC
TENNIS_SYNC_PAST_DAYS=2
TENNIS_SYNC_FUTURE_DAYS=10
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_or_service_role_key
```

`TENNIS_API_KEY` is optional. When it is absent, the tennis sync route returns `not_configured` and the football/social cron continues normally.

`API_FOOTBALL_KEY` is optional. The free default provider is `FOOTBALL_DATA_TOKEN` from football-data.org.

Do not commit real keys to the repo. Add them in Vercel Project Settings > Environment Variables, and use `.env.local` only for local testing.

If `https://roararenaindia.vercel.app/api/public/home` returns `"source":"static-fallback"`, production is missing Supabase read variables. If it returns `401` for admin/cron routes with your local secret, production is missing or using a different `CRON_SECRET`.

## Instagram post automation

Posts auto-sync from Instagram once these are added in Vercel:

```txt
INSTAGRAM_API_MODE=instagram_login
INSTAGRAM_GRAPH_API_VERSION=v20.0
INSTAGRAM_USER_ID=your_instagram_business_user_id
INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_token
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_long_random_webhook_verify_token
META_APP_SECRET=your_meta_app_secret
```

Without the access token/user ID, scheduled Instagram sync is skipped. Without webhook env vars, near-instant webhook delivery is disabled but 10-minute fallback polling still works once the token is valid.

## Test after deploy

Use a request tool that can send headers:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_DOMAIN.com/api/cron/roar
```

Do not place `CRON_SECRET` in a browser URL. URLs can be saved in browser history, analytics, proxies, and logs. If the header-based request returns `ok: true`, the deployed endpoint is ready. Then run the GitHub Actions workflow manually once.
