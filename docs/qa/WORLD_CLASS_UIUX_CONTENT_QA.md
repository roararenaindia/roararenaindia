# Roar Arena UI/UX + Content QA

## Homepage direction
- Brand name preserved: Roar Arena
- Slogan updated: Where Fans Come Alive.
- Homepage rebuilt around one clear story: live sport moves fast, Roar Arena moves with it.
- Removed the old stacked/duplicated section feeling from the public page.
- New flow: Hero -> Scores/Schedule -> Stories -> Engine -> Sports -> Connect -> Final CTA.

## Content direction
- Rewrote public-facing copy across the active homepage experience.
- Tone: sharp, fan-first, energetic, simple, premium.
- Avoided overexplaining technical details to visitors.
- Kept the automation story understandable: live scores, upcoming fixtures, social posts, admin control.

## UI/UX direction
- Built a stronger hero with a live match poster on the right.
- Added a clearer results/schedule split: "Who won?" and "What's next?"
- Added a social story grid that works for Instagram/Facebook/X/WhatsApp creative reuse.
- Added a system section explaining why the site stays alive.
- Added a cleaner connect section for Instagram, Facebook, X, WhatsApp, and email.
- Kept responsive mobile sticky CTA.

## Data/automation check
- `/api/cron/roar` remains scheduled every 2 hours from an external scheduler.
- `/api/sync/instagram` runs during the live cron when Meta credentials exist.
- `/api/sync/x` runs during the live cron when X credentials exist.
- `/api/admin/auto-curate` runs after each 2-hour live sync.
- Public homepage still reads `/api/public/home` and falls back safely if Supabase/API is not ready.
- API-Football key still stays private in Vercel environment variables.

## Smoke check
- `node scripts/smoke-check.mjs` passed in the sandbox.
- Full Next build requires dependency install on Vercel because this sandbox does not include `node_modules`.
- Live API-Football request must be checked from Vercel/v0 because this sandbox cannot resolve the external API-Football host.
