import { NextRequest, NextResponse } from 'next/server'
import { hasSupabaseWriteAccess, isSupabaseConfigured } from '@/lib/supabase-rest'
import { checkInstagramStorageBucket } from '@/lib/supabase-storage'
import { getLatestSyncLogs } from '@/lib/sync-log'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return request.headers.get('authorization') === `Bearer ${secret}`
}

async function readJson(url: string) {
  const response = await fetch(url, { cache: 'no-store' })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
      error: data?.error?.message || response.statusText,
    }
  }

  return { ok: true, status: response.status, data, error: null }
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

  const accountUrl = `https://graph.facebook.com/v20.0/${igUserId}?fields=id,username,account_type,media_count&access_token=${token}`
  const account = await readJson(accountUrl)

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

  const fields = 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url'
  const mediaUrl = `https://graph.facebook.com/v20.0/${igUserId}/media?fields=${fields}&limit=6&access_token=${token}`
  const media = await readJson(mediaUrl)

  if (!media.ok) {
    checks.instagram.error = media.error
    return NextResponse.json({
      ok: true,
      ready: false,
      checks,
      nextStep: 'Account is valid but media cannot be read. Check Instagram permissions and app access.',
    })
  }

  checks.instagram.mediaReadable = true
  checks.instagram.latestMediaCount = Array.isArray(media.data?.data) ? media.data.data.length : 0

  return NextResponse.json({
    ok: true,
    ready: checks.supabase.write && checks.instagram.accountValid && checks.instagram.mediaReadable,
    checks,
    sampleMedia: Array.isArray(media.data?.data)
      ? media.data.data.slice(0, 3).map((item: { id: string; media_type?: string; permalink?: string; timestamp?: string }) => ({
          id: item.id,
          media_type: item.media_type,
          permalink: item.permalink,
          timestamp: item.timestamp,
        }))
      : [],
    nextStep: checks.supabase.write
      ? storage.ok
        ? 'Instagram is ready. Run /api/sync/instagram or click Sync IG from admin. Media will be mirrored into Supabase Storage.'
        : 'Instagram is ready, but Supabase Storage bucket is not ready. Sync still works using Instagram CDN URLs; run Sync IG once to auto-create the bucket.'
      : 'Instagram is valid, but Supabase write access is missing. Add SUPABASE_SERVICE_ROLE_KEY.',
  })
}
