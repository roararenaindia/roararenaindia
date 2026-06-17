# Roar Arena Instagram Auto-Sync Setup

This build makes Instagram → Website automation production-ready.

## What happens after setup

```txt
You post on Instagram
→ Vercel Cron calls /api/sync/instagram every 30 minutes
→ Instagram media is fetched
→ image is mirrored into Supabase Storage
→ post record is saved into roar_posts
→ /api/public/home reads it
→ Latest from Arena updates automatically
```

## Required Instagram values

The Instagram profile URL is not enough. You need:

```txt
INSTAGRAM_USER_ID=your_numeric_ig_user_id
INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_access_token
```

Optional:

```txt
INSTAGRAM_SYNC_LIMIT=18
INSTAGRAM_STORAGE_BUCKET=roar-instagram
```

## Required Supabase values

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Important database update

Run the latest `supabase/schema.sql` again.

It adds:
- `remote_media_url`
- `thumbnail_url`
- `storage_path`
- `source_payload`
- `last_synced_at`
- `roar_sync_runs`

## Storage bucket

The sync route tries to auto-create this public bucket:

```txt
roar-instagram
```

If bucket auto-create fails, manually create a public Supabase Storage bucket named `roar-instagram`.

## Admin checks

Go to:

```txt
/admin
```

Use:
- Setup → Instagram Check
- Sync IG
- Final Check

## Why media mirroring matters

Instagram CDN media URLs can become unstable over time. This build copies the media into Supabase Storage so the website has a stable public image URL.

## Route list

```txt
/api/sync/instagram
/api/admin/instagram/check
/api/admin/sync-logs
```
