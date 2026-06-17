import { NextRequest, NextResponse } from 'next/server'
import { hasSupabaseWriteAccess, isSupabaseConfigured } from '@/lib/supabase-rest'
import { getLatestSyncLogs } from '@/lib/sync-log'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return request.headers.get('authorization') === `Bearer ${secret}`
}

async function readJson(url: string, token: string) {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    return { ok: false, status: response.status, data, error: data?.detail || data?.title || data?.errors?.[0]?.message || response.statusText }
  }

  return { ok: true, status: response.status, data, error: null }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const token = process.env.X_BEARER_TOKEN
  const userId = process.env.X_USER_ID
  const username = process.env.X_USERNAME || 'RoarArenaIndia'
  const logs = await getLatestSyncLogs(5)

  const checks = {
    env: {
      xBearerToken: Boolean(token),
      xUserId: Boolean(userId),
      xUsername: Boolean(username),
      cronSecret: Boolean(process.env.CRON_SECRET),
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    supabase: {
      read: isSupabaseConfigured('read'),
      write: hasSupabaseWriteAccess(),
    },
    x: {
      configured: Boolean(token && userId),
      accountValid: false,
      postsReadable: false,
      username: null as string | null,
      name: null as string | null,
      latestPostCount: 0,
      error: null as string | null,
    },
    latestSyncLogs: logs.data || [],
  }

  if (!token || !userId) {
    return NextResponse.json({
      ok: true,
      ready: false,
      checks,
      nextStep: 'Add X_BEARER_TOKEN and X_USER_ID in Vercel environment variables.',
    })
  }

  const account = await readJson(`https://api.x.com/2/users/${userId}?user.fields=username,name`, token)
  if (!account.ok) {
    checks.x.error = account.error
    return NextResponse.json({ ok: true, ready: false, checks, nextStep: 'X token or user ID is not valid.' })
  }

  checks.x.accountValid = true
  checks.x.username = account.data?.data?.username || null
  checks.x.name = account.data?.data?.name || null

  const posts = await readJson(`https://api.x.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,text&exclude=replies,retweets`, token)
  if (!posts.ok) {
    checks.x.error = posts.error
    return NextResponse.json({ ok: true, ready: false, checks, nextStep: 'X account is valid but posts cannot be read. Check API access level and token.' })
  }

  checks.x.postsReadable = true
  checks.x.latestPostCount = Array.isArray(posts.data?.data) ? posts.data.data.length : 0

  return NextResponse.json({
    ok: true,
    ready: checks.supabase.write && checks.x.accountValid && checks.x.postsReadable,
    checks,
    nextStep: checks.supabase.write ? 'X is ready. Run /api/sync/x or click Sync X from admin.' : 'X is valid, but Supabase write access is missing.',
  })
}
