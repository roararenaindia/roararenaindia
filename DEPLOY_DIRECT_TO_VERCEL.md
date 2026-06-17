# Roar Arena — Direct Vercel Deploy Checklist

This zip is prepared for direct Vercel deployment.

## What is included

- Live Roar Arena landing page
- New dynamic Scores + Schedule section
- Latest results and upcoming fixtures display
- NBA champions fallback content replacing old Game 5 content
- FIFA World Cup match engine using API-Football
- Supabase database layer
- Instagram sync route
- X sync route, optional because X API requires credentials/plan
- WhatsApp Channel and email contact links
- Admin dashboard
- Template Studio
- Approval Queue
- Final launch checker
- Vercel cron jobs

## Must add in Vercel Environment Variables

```txt
NEXT_PUBLIC_ROAR_DATA_MODE=live
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
CRON_SECRET=make-a-long-random-secret

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

API_FOOTBALL_KEY=your-api-football-key
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7

NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/roararenaindia/
NEXT_PUBLIC_X_URL=https://x.com/RoarArenaIndia
NEXT_PUBLIC_WHATSAPP_CHANNEL_URL=https://whatsapp.com/channel/0029Vb8bGxc7oQhX9QvoPG1R
NEXT_PUBLIC_CONTACT_EMAIL=apex36office@gmail.com
```

Optional, only when you have API access:

```txt
INSTAGRAM_USER_ID=
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_SYNC_LIMIT=18
INSTAGRAM_STORAGE_BUCKET=roar-instagram

X_USERNAME=RoarArenaIndia
X_USER_ID=
X_BEARER_TOKEN=
X_SYNC_LIMIT=10
```

## Supabase setup

Run the full SQL in:

```txt
supabase/schema.sql
```

Required tables:

- roar_posts
- roar_matches
- roar_generated_posts
- roar_sync_runs

## Vercel cron behavior

- `/api/sync/matches` runs every 30 minutes
- `/api/admin/auto-curate` runs 5 minutes after each match sync
- `/api/sync/instagram` runs every 2 hours
- `/api/sync/x` runs every 4 hours if X credentials exist

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

Note: live API-Football calls may not work inside restricted sandboxes. The real check should be run from v0 or Vercel preview using `/admin → Match API Check`.

## Public site structure
The active public homepage now uses `components/home-experience.tsx`.

Main public sections:
- `#home` live hero
- `#live` latest results and upcoming schedule
- `#updates` social story feed
- `#engine` self-updating system explanation
- `#sports` sports coverage
- `#connect` social and email links

After deployment, open `/admin` and run:
1. Final Check
2. Match API Check
3. Sync Matches
4. Auto Curate
5. Sync Instagram when Meta credentials are ready

## Important: Vercel Hobby 30-minute updates

This zip does not use Vercel Cron because Vercel Hobby rejects cron schedules that run every 30 minutes. Use the included `EXTERNAL_30_MIN_CRON_SETUP.md` and call `/api/cron/roar?secret=CRON_SECRET` every 30 minutes from an external scheduler.
