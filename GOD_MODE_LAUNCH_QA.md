# God Mode Launch QA

## Done

- Updated fallback content so the site no longer looks stuck on old NBA Game 5 content.
- Added New York Knicks champions post asset.
- Added Germany vs Curaçao fallback post asset.
- Added Brazil vs Morocco fallback post asset.
- Added dynamic Scores + Schedule section.
- Added Connect Hub for Instagram, X, WhatsApp, and email.
- Improved broken logo handling with safe initials fallback.
- Improved API-Football team short codes and logo fallbacks.
- Added Final Check API-Football live validation.
- Fixed admin Match API Check display bug.
- Added Sync All admin action.
- Tuned Vercel cron timing so curation runs after match sync.
- Added smoke check script.

## What cannot be fully verified inside this sandbox

The sandbox cannot resolve `v3.football.api-sports.io`, so the API key cannot be confirmed from here. The site includes `/api/admin/matches/check` and `/api/admin/final-check` to verify the key on v0 or Vercel, where internet access should work.

## Go-live decision

The code package is ready to deploy once these are set in Vercel:

- Supabase URL
- Supabase anon key
- Supabase service role key
- CRON_SECRET
- API_FOOTBALL_KEY

Instagram and X can be connected after launch. The public links already work even before API sync credentials are added.
