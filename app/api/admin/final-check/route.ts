import { NextRequest, NextResponse } from 'next/server'
import { getLiveHomePayload } from '@/lib/live-home'
import { hasSupabaseWriteAccess, isSupabaseConfigured, supabaseSelect } from '@/lib/supabase-rest'
import { checkInstagramStorageBucket } from '@/lib/supabase-storage'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return request.headers.get('authorization') === `Bearer ${secret}`
}

function isoDateOffset(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function apiErrorsToString(errors: unknown) {
  if (!errors) return null
  if (Array.isArray(errors) && errors.length === 0) return null
  if (typeof errors === 'object' && Object.keys(errors as Record<string, unknown>).length === 0) return null
  return typeof errors === 'string' ? errors : JSON.stringify(errors)
}

async function checkApiFootball() {
  const apiKey = process.env.API_FOOTBALL_KEY
  const leagueId = process.env.API_FOOTBALL_LEAGUE_ID || '1'
  const season = process.env.API_FOOTBALL_SEASON || '2026'
  const pastDays = Number(process.env.MATCH_SYNC_PAST_DAYS || 2)
  const futureDays = Number(process.env.MATCH_SYNC_FUTURE_DAYS || 7)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)

  if (!apiKey) {
    return {
      configured: false,
      statusReachable: false,
      fixturesReachable: false,
      sampleCount: 0,
      range: { from, to },
      quota: null,
      error: 'API_FOOTBALL_KEY is missing.',
    }
  }

  const apiFootballKey: string = apiKey

  async function call(path: string) {
    const headers = new Headers()
    headers.set('x-apisports-key', apiFootballKey)

    const response = await fetch(`https://v3.football.api-sports.io${path}`, {
      cache: 'no-store',
      headers,
    })
    const data = await response.json().catch(() => null)
    const apiError = apiErrorsToString(data?.errors)
    return {
      ok: response.ok && !apiError,
      error: apiError || (!response.ok ? response.statusText : null),
      data,
      quota: {
        dailyLimit: response.headers.get('x-ratelimit-requests-limit'),
        dailyRemaining: response.headers.get('x-ratelimit-requests-remaining'),
        minuteLimit: response.headers.get('x-ratelimit-limit') || response.headers.get('X-RateLimit-Limit'),
        minuteRemaining: response.headers.get('x-ratelimit-remaining') || response.headers.get('X-RateLimit-Remaining'),
      },
    }
  }

  try {
    const status = await call('/status')
    const params = new URLSearchParams({ league: leagueId, season, from, to })
    const fixtures = await call(`/fixtures?${params.toString()}`)
    return {
      configured: true,
      statusReachable: status.ok,
      fixturesReachable: fixtures.ok,
      sampleCount: Array.isArray(fixtures.data?.response) ? fixtures.data.response.length : 0,
      range: { from, to },
      quota: fixtures.quota || status.quota,
      error: fixtures.error || status.error || null,
    }
  } catch (error) {
    return {
      configured: true,
      statusReachable: false,
      fixturesReachable: false,
      sampleCount: 0,
      range: { from, to },
      quota: null,
      error: error instanceof Error ? error.message : 'Unknown API-Football error',
    }
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const payload = await getLiveHomePayload()
  const queue = await supabaseSelect('roar_generated_posts', 'select=id,status&limit=20')
  const posts = await supabaseSelect('roar_posts', 'select=id,is_hidden&limit=20')
  const matches = await supabaseSelect('roar_matches', 'select=id,is_hidden&limit=20')
  const syncRuns = await supabaseSelect('roar_sync_runs', 'select=id,source,status&limit=5')
  const storage = await checkInstagramStorageBucket()
  const apiFootball = await checkApiFootball()

  const checks = {
    env: {
      cronSecret: Boolean(process.env.CRON_SECRET),
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      instagramUserId: Boolean(process.env.INSTAGRAM_USER_ID),
      instagramAccessToken: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN),
      apiFootballKey: Boolean(process.env.API_FOOTBALL_KEY),
      xUserId: Boolean(process.env.X_USER_ID),
      xBearerToken: Boolean(process.env.X_BEARER_TOKEN),
      contactEmail: Boolean(process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'apex36office@gmail.com'),
    },
    socialLinks: {
      instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/roararenaindia/',
      x: process.env.NEXT_PUBLIC_X_URL || 'https://x.com/RoarArenaIndia',
      whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb8bGxc7oQhX9QvoPG1R',
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'apex36office@gmail.com',
    },
    supabase: {
      read: isSupabaseConfigured('read'),
      write: hasSupabaseWriteAccess(),
      postsTable: !posts.error,
      matchesTable: !matches.error,
      generatedPostsTable: !queue.error,
      syncRunsTable: !syncRuns.error,
      instagramStorageBucket: storage.ok,
    },
    apiFootball,
    publicHome: {
      source: payload.source,
      posts: payload.posts?.length || 0,
      matches: payload.matches?.length || 0,
      heroReady: Boolean(payload.heroMatch),
    },
    automation: {
      instagramRoute: true,
      xRoute: true,
      autoCurateRoute: true,
      matchRoute: true,
      matchCronEvery30Minutes: true,
      autoCurateCronEvery30Minutes: true,
      templateStudio: true,
      approvalQueue: !queue.error,
      syncLogging: !syncRuns.error,
      instagramStorage: storage.ok,
      adminDashboard: true,
    },
  }

  const required = [
    checks.env.cronSecret,
    checks.supabase.read,
    checks.supabase.write,
    checks.supabase.postsTable,
    checks.supabase.matchesTable,
    checks.supabase.generatedPostsTable,
    checks.supabase.syncRunsTable,
    checks.publicHome.heroReady,
    checks.apiFootball.configured,
    checks.apiFootball.statusReachable,
    checks.apiFootball.fixturesReachable,
  ]

  return NextResponse.json({
    ok: true,
    productionReady: required.every(Boolean),
    checks,
    warnings: [
      !checks.env.instagramUserId || !checks.env.instagramAccessToken ? 'Instagram is not connected yet. Site can still go live with static fallback and match data.' : null,
      !checks.supabase.instagramStorageBucket ? 'Instagram storage bucket is not ready. Sync can auto-create it when Supabase service role is configured.' : null,
      !checks.apiFootball.configured ? 'Match API key is not connected yet.' : null,
      checks.apiFootball.configured && !checks.apiFootball.fixturesReachable ? `Match API could not fetch fixtures: ${checks.apiFootball.error}` : null,
      !checks.env.xUserId || !checks.env.xBearerToken ? 'X API is not connected yet. Public X link is still active.' : null,
      payload.source?.includes('fallback') ? 'Homepage is still using fallback data until Supabase sync runs.' : null,
    ].filter(Boolean),
  })
}
