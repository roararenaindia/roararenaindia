# Roar Arena Automation Setup

This phase focuses on automatic football fixtures/results. Instagram and X automation can stay disabled until the social automation phase.

## Current architecture

```txt
football-data.org or API-Football
  -> /api/sync/matches
  -> Supabase roar_matches
  -> /api/admin/auto-curate
  -> /api/public/home
  -> Matchday command board

Manual or future social posts
  -> Supabase roar_posts
  -> /api/public/home
  -> Latest from Arena
```

## Required Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Add the required variables in Vercel.

```txt
CRON_SECRET=your-long-random-secret
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-or-secret-key

MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=your-football-data-org-token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

## Optional fallback provider

```txt
API_FOOTBALL_KEY=your-api-football-key
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
```

## Admin control

Open:

```txt
/admin
```

Use your `CRON_SECRET` as the admin key.

Admin actions:

- Final launch check
- Match API check
- Sync matches
- Auto-curate the featured board
- Feature/hide posts
- Pin/hide matches
- Edit titles, categories, descriptions, and match priority

## Automatic 2-hour match updates

Use GitHub Actions instead of Vercel Cron for the 2-hour schedule.

The workflow file is:

```txt
.github/workflows/roar-cron.yml
```

After deployment, add GitHub repository secrets:

```txt
ROAR_CRON_SECRET=the-same-value-as-CRON_SECRET
```

The workflow defaults to `https://roararenaindia-mu.vercel.app/api/cron/roar`. Add `ROAR_CRON_URL` only if the production domain changes.

Then run:

```txt
GitHub > Actions > Roar Arena 2-hour match sync > Run workflow
```

If the manual workflow succeeds, GitHub will keep calling the deployed endpoint every 2 hours.

## Social automation later

The routes exist, but credentials are optional for this phase:

- `/api/sync/instagram`
- `/api/sync/x`
- `/api/sync/all`
- `/api/admin/instagram/check`
- `/api/admin/x/check`

Only add these when the Meta/X developer setup is ready:

```txt
INSTAGRAM_USER_ID=
INSTAGRAM_ACCESS_TOKEN=
X_USER_ID=
X_BEARER_TOKEN=
```

If these Instagram/X variables are empty in Vercel, social posts will not auto-sync. That is expected for the current phase.
