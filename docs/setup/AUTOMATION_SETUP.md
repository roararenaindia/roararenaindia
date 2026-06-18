# Roar Arena Automation Setup

This is Phase 2: Supabase-powered data automation foundation.

## Current architecture

```txt
Instagram Graph API
  → /api/sync/instagram
  → Supabase roar_posts
  → /api/public/home
  → Latest from Arena

football-data.org
  → /api/sync/matches
  → Supabase roar_matches
  → /api/public/home
  → Live Command Centre
```

## Required Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Add these environment variables in Vercel:

```txt
NEXT_PUBLIC_ROAR_DATA_MODE=live
CRON_SECRET=your-long-random-secret
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

## Seed current content

After deployment, call:

```txt
GET /api/admin/seed
Authorization: Bearer YOUR_CRON_SECRET
```

This inserts the current static posts and matches into Supabase so the live site has content immediately.

## Instagram automation

Add:

```txt
INSTAGRAM_USER_ID=
INSTAGRAM_ACCESS_TOKEN=
```

Then External scheduler calls:

```txt
/api/sync/instagram
```

Every 2 hours for this phase.

## FIFA match automation

Add:

```txt
MATCH_DATA_PROVIDER=football-data
FOOTBALL_DATA_TOKEN=
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
```

Then External scheduler calls:

```txt
/api/sync/matches
```

Every 2 hours for this phase.

## Admin control

Use:

```txt
GET /api/admin/posts
PATCH /api/admin/posts
```

Fields allowed:
- title
- description
- caption
- post_type
- category
- logo
- teams
- is_featured
- is_hidden

This gives manual control before we build the visual admin dashboard.

## Next phase

Phase 3 should add a private admin dashboard:
- hide post
- feature post
- pin hero match
- override team logos
- approve Instagram-synced posts


## Phase 3 Admin Dashboard

Open:

```txt
/admin
```

Use your `CRON_SECRET` as the admin key.

Admin actions:
- Seed database
- Sync Instagram
- Sync matches
- Feature/hide posts
- Pin/hide matches
- Edit titles, categories, descriptions, match priority

Run `supabase/schema.sql` again because Phase 3 adds `is_hidden` to matches.


## Phase 4 Template Studio

Open:

```txt
/studio
```

Use this to create locked Roar Arena post designs:
- Result post
- Fixtures post
- Preview post

The Studio pulls live matches from `/api/public/home` and generates a 1080×1080 SVG/PNG using the fixed Roar Arena visual system.

This is intentionally not random image generation. It is template-based so the brand remains consistent.


## Phase 5 Approval Queue

Studio now supports:

```txt
Generate → Save Queue
```

Admin now has a Queue tab:

```txt
/admin
```

Queue actions:
- Save title/caption
- Approve
- Reject
- Publish to Latest from Arena
- Download SVG

Run `supabase/schema.sql` again because Phase 5 adds `roar_generated_posts`.


## Phase 6 Final Automation Checker

Admin now has a Setup tab.

Open:

```txt
/admin
```

Use these checks:
- Instagram Connection
- Match API
- Final Check

New routes:
- `/api/admin/instagram/check`
- `/api/admin/matches/check`
- `/api/admin/final-check`
- `/api/admin/setup`

This is the final launch-readiness layer. It tells you exactly what is connected and what still needs credentials.


## Instagram auto-sync hardened

Instagram sync now:
- reads latest Roar Arena Instagram posts
- mirrors media into Supabase Storage bucket `roar-instagram`
- stores stable image URLs in `roar_posts`
- records sync results in `roar_sync_runs`
- keeps Latest from Arena auto-updated from `/api/public/home`

Run the updated `supabase/schema.sql` again.

New route:
- `/api/admin/sync-logs`


## Automation V2: Social + Match Engine

This version adds X sync, wider World Cup fixture syncing, and auto-curation so the site does not need manual rebuilds every time the sports story changes.

New routes:
- `/api/sync/x`
- `/api/sync/all`
- `/api/admin/x/check`
- `/api/admin/auto-curate`

Add env vars:
```txt
X_USERNAME=RoarArenaIndia
X_USER_ID=
X_BEARER_TOKEN=
X_SYNC_LIMIT=10
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
```

Run the latest `supabase/schema.sql` again.
