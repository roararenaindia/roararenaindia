# Roar Arena 2-hour live updates

This cron handles automatic football schedule/result updates, homepage curation, and configured social post sync. Instagram runs when `INSTAGRAM_USER_ID` and `INSTAGRAM_ACCESS_TOKEN` exist. X is skipped unless its credentials exist.

Use GitHub Actions as the external scheduler. This keeps the site lightweight, avoids Vercel Cron limits on free/hobby plans, and avoids needing social API keys now.

This repo includes:

```txt
.github/workflows/roar-cron.yml
```

It calls the live cron endpoint every 2 hours.

## Endpoint

The workflow calls this endpoint by default:

```txt
https://roararenaindia.vercel.app/api/cron/roar
```

It sends `CRON_SECRET` as an authorization header, so the secret is not placed in the URL.

If the production domain changes later, add `ROAR_CRON_URL` in GitHub Actions secrets to override the default.

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
Actions > Roar Arena 2-hour live sync > Run workflow
```

If the manual run succeeds, GitHub will call it automatically every 2 hours.

## What it runs

- Instagram post sync when credentials exist
- X post sync when credentials exist
- FIFA schedule and score sync
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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_or_service_role_key
```

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
```

Without these, the cron skips Instagram and the site can still show manual/database posts.

## Test after deploy

Open this in the browser after replacing the values:

```txt
https://YOUR_DOMAIN.com/api/cron/roar?secret=YOUR_CRON_SECRET
```

This browser URL is only a manual fallback because browsers cannot easily add the `Authorization` header. If it returns `ok: true`, the deployed endpoint is ready. Then run the GitHub Actions workflow manually once, which uses the safer header-based secret.
