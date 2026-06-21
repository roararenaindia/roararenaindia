# Roar Arena - Direct Vercel Deploy Checklist

This zip is prepared for direct Vercel deployment.

## What is included

- Live Roar Arena landing page
- New dynamic Scores + Schedule section
- Latest results and upcoming fixtures display
- NBA champions fallback content replacing old Game 5 content
- FIFA World Cup match engine using football-data.org, with API-Football as an optional fallback
- Supabase database layer for saving live match updates
- Instagram/X sync routes wired into the live cron when credentials exist
- WhatsApp Community and email contact links
- Admin dashboard
- Template Studio
- Approval Queue
- Final launch checker
- External live update endpoints

## Must add in Vercel Environment Variables

```txt
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
CRON_SECRET=make-a-long-random-secret

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=your-football-data-org-token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026

# Optional paid/API-Sports fallback only
API_FOOTBALL_KEY=your-api-football-key
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=7
MATCH_SYNC_FUTURE_DAYS=7

NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/roararenaindia/
NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/RoarArena
NEXT_PUBLIC_X_URL=https://x.com/RoarArenaIndia
NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL=https://chat.whatsapp.com/JG52Kavaw0MGDOGfO0EzUT?s=sw&p=a&ilr=1
NEXT_PUBLIC_CONTACT_EMAIL=roararenaindia@gmail.com
```

Instagram posting automation:

```txt
INSTAGRAM_API_MODE=instagram_login
INSTAGRAM_GRAPH_API_VERSION=v20.0
INSTAGRAM_USER_ID=your_numeric_instagram_user_id
INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_access_token
INSTAGRAM_SYNC_LIMIT=18
INSTAGRAM_STORAGE_BUCKET=roar-instagram
```

Optional X automation:

```txt
X_USERNAME=RoarArenaIndia
X_USER_ID=your_x_user_id
X_BEARER_TOKEN=your_x_bearer_token
X_SYNC_LIMIT=10
```

## Supabase setup

Supabase is required if you want the schedule and results to update automatically. Without Supabase, the public site still loads fallback content, but match-provider results cannot be saved for the homepage.

Run the full SQL in:

```txt
supabase/schema.sql
```

Required tables:

- roar_posts
- roar_matches
- roar_generated_posts
- roar_sync_runs

## Live cron behavior

- `/api/cron/roar` runs configured social sync, match sync, and auto-curation together
- Call split live sync jobs from GitHub Actions: Instagram every 10 minutes, matches every 15 minutes, full cron every 2 hours
- Instagram and X are skipped safely until their credentials exist

## After deploy

Open:

```txt
/admin
```

Then run:

```txt
1. Save CRON_SECRET
2. Final Check
3. Match API Check
4. Sync Matches
5. Curate
6. Refresh public site
```

## Local sanity command

```txt
npm run smoke
```

Note: live match-provider calls may not work inside restricted sandboxes. The real check should be run from Vercel preview using `/admin > Match API Check`.

## Public site structure
The active public homepage now uses `components/home/home-experience.tsx`.

Main public sections:
- `#home` startup hero
- `#updates` latest story feed
- `#matches` latest results and upcoming schedule
- `#building` what Roar Arena is building
- `#events` live events coming soon
- `#community` social and community links

After deployment, open `/admin` and run:
1. Final Check
2. Match API Check
3. Sync Matches
4. Auto Curate
5. Set GitHub Actions to call Instagram every 10 minutes, matches every 15 minutes, and `/api/cron/roar` every 2 hours

## Important: live match updates

This project does not rely on Vercel Cron for this phase. Use `docs/setup/EXTERNAL_2_HOUR_MATCH_CRON_SETUP.md` and run the GitHub Actions scheduler with `Authorization: Bearer CRON_SECRET`.
