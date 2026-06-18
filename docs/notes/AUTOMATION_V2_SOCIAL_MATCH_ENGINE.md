# Roar Arena Automation V2: Social + Match Engine

This update fixes the repeating problem where the website needs manual rebuilds every time a sports story changes.

## New source-of-truth flow

```txt
Instagram posts
  → /api/sync/instagram
  → Supabase posts

X posts
  → /api/sync/x
  → Supabase posts

API-Football World Cup fixtures/results
  → /api/sync/matches
  → Supabase matches

Auto-curation
  → /api/admin/auto-curate
  → chooses hero match + featured posts

Website
  → /api/public/home
  → always reads latest live content
```

## X account

Roar Arena X account:

```txt
https://x.com/RoarArenaIndia
```

Required env vars:

```txt
X_USERNAME=RoarArenaIndia
X_USER_ID=
X_BEARER_TOKEN=
X_SYNC_LIMIT=10
```

## FIFA / match data

Do not scrape FIFA pages as the main automation source. Use API-Football for structured data.

World Cup 2026 config:

```txt
API_FOOTBALL_KEY=
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
MATCH_SYNC_PAST_DAYS=2
MATCH_SYNC_FUTURE_DAYS=7
```

## Cron jobs

```txt
/api/sync/all every 30 min
/api/sync/matches every 15 min
/api/admin/auto-curate every 30 min
```

## Admin controls

Go to `/admin`:

- Sync IG
- Sync X
- Sync Matches
- Curate
- Final Check

## Why this fixes the NBA/FIFA shift problem

The homepage no longer needs a rebuild when the NBA story ends or a FIFA match becomes the biggest story.

The site now looks at:

1. live matches
2. upcoming matches
3. recent final results
4. newest social posts
5. featured overrides from admin

Then it picks the best thing to show.
