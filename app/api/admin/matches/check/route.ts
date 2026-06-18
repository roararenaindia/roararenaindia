import { NextRequest, NextResponse } from 'next/server'
import { hasSupabaseWriteAccess } from '@/lib/services/supabase-rest'

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

function explainApiFootballError(error: string | null, season: string) {
  if (!error) return null
  const lower = error.toLowerCase()
  if (lower.includes('free plans') && lower.includes('season')) {
    return `Your API-Football key is active, but the free plan cannot access season ${season}. Use an allowed season for testing or upgrade API-Sports access for this season.`
  }
  return error
}

async function apiFootballGet(path: string, apiKey: string) {
  const headers = new Headers()
  headers.set('x-apisports-key', apiKey)

  const response = await fetch(`https://v3.football.api-sports.io${path}`, {
    cache: 'no-store',
    headers,
  })

  const data = await response.json().catch(() => null)
  const apiError = apiErrorsToString(data?.errors)

  return {
    ok: response.ok && !apiError,
    status: response.status,
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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const apiKey = process.env.API_FOOTBALL_KEY
  const pastDays = Number(process.env.MATCH_SYNC_PAST_DAYS || 2)
  const futureDays = Number(process.env.MATCH_SYNC_FUTURE_DAYS || 7)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)
  const leagueId = process.env.API_FOOTBALL_LEAGUE_ID || '1'
  const season = process.env.API_FOOTBALL_SEASON || '2026'

  const checks = {
    env: {
      apiFootballKey: Boolean(apiKey),
      apiFootballLeagueId: leagueId,
      apiFootballSeason: season,
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    supabase: {
      write: hasSupabaseWriteAccess(),
    },
    provider: {
      statusReachable: false,
      fixturesReachable: false,
      sampleCount: 0,
      range: { from, to },
      quota: null as null | Record<string, string | null>,
      error: null as string | null,
    },
  }

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      ready: false,
      checks,
      nextStep: 'Add API_FOOTBALL_KEY in Vercel environment variables.',
    })
  }

  const status = await apiFootballGet('/status', apiKey)
  checks.provider.statusReachable = status.ok
  checks.provider.quota = status.quota

  const params = new URLSearchParams({ league: leagueId, season, from, to })
  const fixtures = await apiFootballGet(`/fixtures?${params.toString()}`, apiKey)
  checks.provider.fixturesReachable = fixtures.ok
  checks.provider.sampleCount = Array.isArray(fixtures.data?.response) ? fixtures.data.response.length : 0
  checks.provider.quota = fixtures.quota || status.quota

  if (!status.ok || !fixtures.ok) {
    checks.provider.error = fixtures.error || status.error || 'API-Football did not return valid data.'
    const explanation = explainApiFootballError(checks.provider.error, season)
    return NextResponse.json({
      ok: true,
      ready: false,
      checks,
      nextStep: explanation || 'API-Football key is not ready. Check key, subscription, quota, and World Cup endpoint access.',
    })
  }

  return NextResponse.json({
    ok: true,
    ready: checks.provider.statusReachable && checks.provider.fixturesReachable && checks.supabase.write,
    checks,
    nextStep: checks.supabase.write
      ? 'Match API is ready. Click Sync Matches from admin, then Curate.'
      : 'API-Football key is valid, but Supabase write access is missing. Add SUPABASE_SERVICE_ROLE_KEY.',
    note: checks.provider.sampleCount === 0 ? 'The API key works, but this date range returned zero fixtures. Increase MATCH_SYNC_FUTURE_DAYS or check league/season.' : null,
  })
}
