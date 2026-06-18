# Roar Arena India

Roar Arena is a Next.js app for a sports fan experience brand. The public site can run with static fallback data, while Supabase and football-data.org enable automatic football schedule/result updates.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run typecheck
npm run smoke
npm run build
```

## Current Folder Structure

```txt
app/                         Next.js App Router pages and API routes
components/admin/            Admin dashboard UI
components/brand/            Logo, crest, and brand display components
components/home/             Public homepage sections
components/hooks/            Client-side React hooks
components/layout/           Header, footer, theme, mobile CTA
components/studio/           Template studio UI
components/ui/               Shared low-level UI primitives and icons
lib/config/                  Site configuration and public content model
lib/data/                    Static fallback data
lib/domain/                  Pure domain helpers such as logos and inference
lib/services/                External service adapters and live data loading
lib/templates/               Post/card template generation
public/                      Static images and generated assets
scripts/                     Local validation/build helper scripts
supabase/                    Database schema
```

## Important Runtime Setup

For automatic schedule/results updates, configure:

```txt
CRON_SECRET=
MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional fallback only
API_FOOTBALL_KEY=
```

Instagram and X keys are optional for this phase.

`FOOTBALL_DATA_TOKEN` is the free World Cup provider token. `API_FOOTBALL_KEY` is optional fallback only.

## Automatic Match Updates

Use the included GitHub Actions scheduler. It defaults to:

```txt
GET https://roararenaindia.vercel.app/api/cron/roar
Authorization: Bearer YOUR_CRON_SECRET
```

Add GitHub secret `ROAR_CRON_SECRET` with the same value as Vercel `CRON_SECRET`, then run the workflow manually once from GitHub Actions. It will continue every 2 hours. Use `ROAR_CRON_URL` only if the production domain changes.

If production shows stale matches, check `https://roararenaindia.vercel.app/api/public/home`. `"source":"static-fallback"` means Vercel is missing Supabase environment variables.

Use the query-string secret only as a last-resort fallback. See `docs/setup/EXTERNAL_2_HOUR_MATCH_CRON_SETUP.md`.
