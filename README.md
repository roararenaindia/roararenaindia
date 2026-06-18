# Roar Arena India

Roar Arena is a Next.js app for a sports fan experience brand. The public site can run with static fallback data, while Supabase and API-Football enable automatic football schedule/result updates.

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
API_FOOTBALL_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Instagram and X keys are optional for this phase.

## Automatic Match Updates

Use an external scheduler to call:

```txt
https://YOUR_DOMAIN.com/api/cron/roar?secret=YOUR_CRON_SECRET
```

Run it every 2 hours. See `docs/setup/EXTERNAL_2_HOUR_MATCH_CRON_SETUP.md`.
