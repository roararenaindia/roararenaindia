# Roar Arena Phase 6: Final Automation + Launch Checker

This is the final build phase for the current Roar Arena automation system.

## What Phase 6 adds

### Admin Setup tab

`/admin` now has a **Setup** tab with three check panels:

1. Instagram Connection
2. Match API
3. Launch Readiness

### New API routes

```txt
GET /api/admin/instagram/check
GET /api/admin/matches/check
GET /api/admin/final-check
GET /api/admin/setup
```

## What the Instagram checker validates

- `INSTAGRAM_USER_ID` exists
- `INSTAGRAM_ACCESS_TOKEN` exists
- Instagram account can be reached
- Instagram media can be read
- Supabase write access is available
- Sample latest media is readable

## What the Match API checker validates

- `API_FOOTBALL_KEY` exists
- API-Football endpoint is reachable
- Supabase write access is available

## What Final Check validates

- `CRON_SECRET`
- Supabase read/write access
- Posts table
- Matches table
- Generated posts queue table
- Public homepage payload
- Hero match readiness
- Automation route readiness

## Final launch order

1. Deploy this zip.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Add env vars in Vercel.
4. Open `/admin`.
5. Paste your `CRON_SECRET`.
6. Click **Save key**.
7. Click **Final Check**.
8. Click **Seed** if database is empty.
9. Click **Check Instagram**.
10. Click **Check Match API**.
11. Click **Sync IG**.
12. Click **Sync Matches**.
13. Open `/studio`.
14. Generate a post.
15. Save Queue.
16. Approve and Publish from `/admin`.

## Important

The Instagram profile URL alone is not enough to connect automation.

You still need:
- numeric Instagram User ID
- long-lived Instagram access token
- Instagram professional account
- Meta app permissions
