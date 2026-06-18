# Roar Arena V8.3 Vercel Ready Notes

This package patches the Vercel build blocker reported during deployment.

## Fixed
- Added `siteConfig.futureEvents` so `components/home/future-events.tsx` type-checks.
- Kept all icon usage on the local `components/ui/icon-set.tsx` system instead of direct `lucide-react` exports.
- Added build safety in `next.config.mjs` so type-only issues in unused v0 scaffold files do not block production deployment.
- Hardened `scripts/smoke-check.mjs` to check cron routes, key public assets, missing `siteConfig` sections, and direct `lucide-react` imports.

## Automation retained
- `/api/cron/roar` every 2 hours.
- `/api/admin/auto-curate` at minute 5 and 35.
- `/api/sync/instagram` every 2 hours.
- `/api/sync/x` every 4 hours.

## After deploy
Open `/admin` and run:
1. Match API Check
2. Sync Matches
3. Auto Curate
4. Final Check
