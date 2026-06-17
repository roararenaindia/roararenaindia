# Roar Arena v8 UI/UX Matchday Fix Notes

This package is prepared for direct v0/Vercel deploy.

## Fixed

- Rebuilt homepage hero so it fits inside one clean desktop frame instead of overflowing below the fold.
- Replaced the oversized heavy headline with a cleaner sports-product headline system.
- Updated display font treatment from Impact-style condensed to a cleaner modern system style.
- Improved matchday board spacing, card hierarchy, and mobile behavior.
- Enlarged team/country logos on hero and score cards.
- Made match/result/upcoming cards clickable.
- Added match detail popup with teams, score/VS, status, story, kickoff, and venue.
- Reworked story/post grid into consistent cards instead of uneven layout.
- Removed broken duplicate anchor markup from the connect section.
- Added Cape Verde / CPV transparent logo and mapped it into the FIFA logo resolver.
- Unknown team logos now fall back to team initials instead of repeating the generic World Cup logo in every team slot.
- Smoke check passed.

## After deploying

Open `/admin` and run:

1. Match API Check
2. Sync Matches
3. Auto Curate
4. Final Check

The external API key can only be verified from v0/Vercel, because this sandbox cannot resolve the API-Football domain.

## Build Fix V8.1
- Fixed TypeScript fetch header typing in app/api/admin/final-check/route.ts so Vercel build does not fail when API_FOOTBALL_KEY is typed as optional.
- API key is still read from Vercel env and not hardcoded.
