# Roar Arena Phase 2: Supabase Live Data

This build connects the website to Supabase without adding fragile client dependencies.

## What is now live-ready

- `/api/public/home`
  - Reads posts and matches from Supabase.
  - Falls back to static content if database is empty or not configured.

- `/api/sync/instagram`
  - Fetches latest Instagram media.
  - Infers category, post type, teams, and logo.
  - Upserts into `roar_posts`.

- `/api/sync/matches`
  - Fetches FIFA World Cup fixtures/results from API-Football.
  - Upserts into `roar_matches`.

- `/api/admin/seed`
  - Seeds current static posts and matches into Supabase.

- `/api/admin/posts`
  - Lets you list and patch posts for feature/hide/manual control.

## Frontend changes

- Added `LiveCommandCentre`.
- Latest from Arena now pulls from `/api/public/home`.
- Remote Instagram images render with plain `<img>` so they do not break on Next remote image restrictions.
- Team logos support local and remote API logos.

## Setup order

1. Create Supabase project.
2. Run `supabase/schema.sql`.
3. Add env vars in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
4. Deploy.
5. Visit:
   - `/api/admin/seed` with `Authorization: Bearer YOUR_CRON_SECRET`
6. Check:
   - `/api/public/home`
7. Add Instagram and API-Football credentials.
8. Use the external 2-hour match scheduler, or manually call:
   - `/api/sync/instagram`
   - `/api/sync/matches`

## Important

This phase does not auto-generate posts yet. It only makes the website data-driven and stable.
That is the correct foundation before post automation.
