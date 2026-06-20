import { NextRequest, NextResponse } from 'next/server'
import { fetchInstagramAccount, fetchInstagramMedia, instagramApiMode, type InstagramMedia } from '@/lib/services/instagram-api'
import { hasSupabaseWriteAccess, isSupabaseConfigured } from '@/lib/services/supabase-rest'
import { checkInstagramStorageBucket } from '@/lib/services/supabase-storage'
import { getLatestSyncLogs } from '@/lib/services/sync-log'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const igUserId = process.env.INSTAGRAM_USER_ID
  const storage = await checkInstagramStorageBucket()
  const logs = await getLatestSyncLogs(5)

  const checks = {
    env: {
      instagramUserId: Boolean(igUserId),
      instagramAccessToken: Boolean(token),
      cronSecret: Boolean(process.env.CRON_SECRET),
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      instagramStorageBucket: Boolean(process.env.INSTAGRAM_STORAGE_BUCKET || 'roar-instagram'),
    },
    supabase: {
      read: isSupabaseConfigured('read'),
      write: hasSupabaseWriteAccess(),
    },
    storage: {
      configured: storage.configured,
      bucket: storage.bucket,
      public: storage.public,
      ok: storage.ok,
      error: storage.error,
    },
    latestSyncLogs: logs.data || [],
    instagram: {
      configured: Boolean(token && igUserId),
      accountValid: false,
      mediaReadable: false,
      apiMode: instagramApiMode(),
      username: null as string | null,
      accountType: null as string | null,
      mediaCount: null as number | null,
      latestMediaCount: 0,
      error: null as string | null,
    },
  }

  if (!token || !igUserId) {
    return NextResponse.json({
      ok: true,
      ready: false,
      checks,
      nextStep: 'Add INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN in Vercel environment variables.',
    })
  }

  const account = await fetchInstagramAccount(igUserId, token)

  if (!account.ok) {
    checks.instagram.error = account.error
    return NextResponse.json({
      ok: true,
      ready: false,
      checks,
      nextStep: 'Instagram token or user ID is not valid. Regenerate a long-lived token and confirm the numeric IG user ID.',
    })
  }

  checks.instagram.accountValid = true
  checks.instagram.username = account.data?.username || null
  checks.instagram.accountType = account.data?.account_type || null
  checks.instagram.mediaCount = typeof account.data?.media_count === 'number' ? account.data.media_count : null

  try {
    const media = await fetchInstagramMedia(igUserId, token, 6)
    checks.instagram.mediaReadable = true
    checks.instagram.latestMediaCount = media.length

    return NextResponse.json({
      ok: true,
      ready: checks.supabase.write && checks.instagram.accountValid && checks.instagram.mediaReadable,
      checks,
      sampleMedia: media.slice(0, 3).map((item: InstagramMedia) => ({
        id: item.id,
        media_type: item.media_type,
        permalink: item.permalink,
        timestamp: item.timestamp,
      })),
      nextStep: checks.supabase.write
        ? storage.ok
          ? 'Instagram is ready. Run /api/sync/instagram or click Sync IG from admin. Media will be mirrored into Supabase Storage.'
          : 'Instagram is ready, but Supabase Storage bucket is not ready. Sync still works using Instagram CDN URLs; run Sync IG once to auto-create the bucket.'
        : 'Instagram is valid, but Supabase write access is missing. Add SUPABASE_SERVICE_ROLE_KEY.',
    })
  } catch (error) {
    checks.instagram.error = error instanceof Error ? error.message : 'Instagram media check failed'
    return NextResponse.json({
      ok: true,
      ready: false,
      checks,
      nextStep: 'Account is valid but media cannot be read. Check Instagram permissions and app access.',
    })
  }
}
