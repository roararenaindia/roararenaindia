# Senior Start Notes

This package starts the real Roar Arena automation path.

Fixed now:
- Broken league SVG placeholders removed.
- League assets are now visible PNGs.
- FIFA team logos optimized to web-safe 512x512 PNGs.
- Unused placeholder files removed.
- Legacy unused components removed to reduce v0 confusion.
- Live Command Centre added to make the site feel active and premium.
- API routes added for Instagram sync, match sync, and public homepage data.
- Vercel cron config added.
- Supabase schema added for the next phase.

Important:
The sync endpoints are safe without keys. They will not crash if env vars are missing.
