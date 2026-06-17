# Roar Arena Phase 3: Private Admin Dashboard

This phase adds a private browser-based control room at:

```txt
/admin
```

## What it does

- Save your admin key locally in the browser.
- Check Supabase, Instagram, and match API configuration.
- Run manual sync actions:
  - Seed static content
  - Sync Instagram
  - Sync matches
  - Check public homepage payload
- Manage Instagram-synced posts:
  - edit title
  - edit category
  - edit post type
  - edit description
  - feature / unfeature
  - hide / show
- Manage matches:
  - edit teams
  - edit league
  - edit venue
  - edit status
  - edit priority
  - pin / unpin hero match
  - hide / show

## Required environment variables

```txt
CRON_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional live sync:

```txt
INSTAGRAM_USER_ID=
INSTAGRAM_ACCESS_TOKEN=
API_FOOTBALL_KEY=
```

## First use

1. Deploy the zip.
2. Run `supabase/schema.sql` again in Supabase SQL Editor.
3. Open `/admin`.
4. Paste your `CRON_SECRET`.
5. Click **Save key**.
6. Click **Seed**.
7. Click **Refresh**.
8. Start managing posts and matches.

## Important

The admin page is visible as a route, but all real data/actions require the admin key through server API authorization.
Do not share your `CRON_SECRET`.
