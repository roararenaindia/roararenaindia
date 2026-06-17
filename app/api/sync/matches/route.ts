import { NextRequest, NextResponse } from 'next/server'
import { inferLeagueLogo } from '@/lib/content-inference'
import { resolveTeamLogo } from '@/lib/team-logos'
import { hasSupabaseWriteAccess, supabaseUpsert } from '@/lib/supabase-rest'
import { writeSyncLog } from '@/lib/sync-log'

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

type ApiFootballFixture = {
  fixture: {
    id: number
    date: string
    status: { short?: string; long?: string }
    venue?: { name?: string; city?: string }
  }
  league: { name?: string; logo?: string }
  teams: {
    home: { name: string; logo?: string; winner?: boolean | null }
    away: { name: string; logo?: string; winner?: boolean | null }
  }
  goals: { home?: number | null; away?: number | null }
}

type ApiFootballPayload<T> = {
  get?: string
  parameters?: Record<string, string>
  errors?: unknown
  results?: number
  response?: T
}

function apiErrorsToString(errors: unknown) {
  if (!errors) return null
  if (Array.isArray(errors) && errors.length === 0) return null
  if (typeof errors === 'object' && Object.keys(errors as Record<string, unknown>).length === 0) return null
  return typeof errors === 'string' ? errors : JSON.stringify(errors)
}


const fifaTeamCodes: Record<string, string> = {
  'argentina': 'ARG', 'australia': 'AUS', 'austria': 'AUT', 'belgium': 'BEL', 'bosnia and herzegovina': 'BIH', 'brazil': 'BRA', 'canada': 'CAN', 'cape verde': 'CPV', 'colombia': 'COL', 'croatia': 'CRO', 'curacao': 'CUW', 'curaçao': 'CUW', 'czechia': 'CZE', 'dr congo': 'COD', 'congo dr': 'COD', 'ecuador': 'ECU', 'egypt': 'EGY', 'england': 'ENG', 'france': 'FRA', 'germany': 'GER', 'ghana': 'GHA', 'haiti': 'HTI', 'iran': 'IRI', 'iraq': 'IRQ', 'ivory coast': 'CIV', 'japan': 'JPN', 'jordan': 'JOR', 'mexico': 'MEX', 'morocco': 'MAR', 'netherlands': 'NED', 'new zealand': 'NZL', 'norway': 'NOR', 'panama': 'PAN', 'paraguay': 'PAR', 'portugal': 'POR', 'qatar': 'QAT', 'saudi arabia': 'KSA', 'scotland': 'SCO', 'senegal': 'SEN', 'south africa': 'RSA', 'south korea': 'KOR', 'spain': 'ESP', 'sweden': 'SWE', 'switzerland': 'SUI', 'tunisia': 'TUN', 'turkey': 'TUR', 'türkiye': 'TUR', 'turkiye': 'TUR', 'united states': 'USA', 'usa': 'USA', 'uruguay': 'URU', 'uzbekistan': 'UZB',
}

function teamKey(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function shortCodeForTeam(name: string) {
  return fifaTeamCodes[teamKey(name)] || name.split(/\s+/).map((word) => word[0]).join('').slice(0, 3).toUpperCase()
}

// Prefer our local transparent country crest; the API logo is used as fallback.
function localLogoForTeam(name: string) {
  return resolveTeamLogo(name)
}

function normalizeStatus(short?: string, long?: string) {
  const value = (short || long || 'NS').toLowerCase()
  if (['ft', 'aet', 'pen', 'fin', 'finished', 'match finished'].includes(value)) return 'final'
  if (['1h', '2h', 'ht', 'et', 'p', 'live', 'int', 'bt'].includes(value)) return 'live'
  return 'upcoming'
}

function matchWinner(match: ApiFootballFixture) {
  if (match.teams.home.winner === true) return 'home'
  if (match.teams.away.winner === true) return 'away'
  if (match.teams.home.winner === false && match.teams.away.winner === false && match.goals.home === match.goals.away) return 'draw'
  return null
}

function mapFixture(match: ApiFootballFixture) {
  const league = match.league.name || 'FIFA World Cup 2026'
  const status = normalizeStatus(match.fixture.status.short, match.fixture.status.long)

  return {
    provider_match_id: String(match.fixture.id),
    sport: 'football',
    league,
    league_logo: match.league.logo || inferLeagueLogo(league),
    home_team: match.teams.home.name,
    away_team: match.teams.away.name,
    home_short: shortCodeForTeam(match.teams.home.name),
    away_short: shortCodeForTeam(match.teams.away.name),
    home_logo: localLogoForTeam(match.teams.home.name) || match.teams.home.logo,
    away_logo: localLogoForTeam(match.teams.away.name) || match.teams.away.logo,
    home_score: match.goals.home,
    away_score: match.goals.away,
    status,
    status_label: status === 'final' ? 'Full time' : status === 'live' ? 'Live' : 'Upcoming',
    kickoff_time: match.fixture.date,
    venue: [match.fixture.venue?.name, match.fixture.venue?.city].filter(Boolean).join(', ') || null,
    winner: matchWinner(match),
    priority: status === 'live' ? 100 : status === 'upcoming' ? 80 : 60,
    updated_at: new Date().toISOString(),
  }
}

async function apiFootballGet<T>(path: string, apiKey: string) {
  const headers = new Headers()
  headers.set('x-apisports-key', apiKey)

  const response = await fetch(`https://v3.football.api-sports.io${path}`, {
    cache: 'no-store',
    headers,
  })

  const data = (await response.json().catch(() => null)) as ApiFootballPayload<T> | null
  const apiError = apiErrorsToString(data?.errors)

  if (!response.ok || apiError) {
    throw new Error(apiError || response.statusText || `API-Football failed with ${response.status}`)
  }

  return {
    data,
    quota: {
      dailyLimit: response.headers.get('x-ratelimit-requests-limit'),
      dailyRemaining: response.headers.get('x-ratelimit-requests-remaining'),
      minuteLimit: response.headers.get('x-ratelimit-limit') || response.headers.get('X-RateLimit-Limit'),
      minuteRemaining: response.headers.get('x-ratelimit-remaining') || response.headers.get('X-RateLimit-Remaining'),
    },
  }
}

async function fetchFixturesRange(from: string, to: string, apiKey: string) {
  const leagueId = process.env.API_FOOTBALL_LEAGUE_ID || '1'
  const season = process.env.API_FOOTBALL_SEASON || '2026'
  const params = new URLSearchParams({ league: leagueId, season, from, to })
  const result = await apiFootballGet<ApiFootballFixture[]>(`/fixtures?${params.toString()}`, apiKey)
  const payload = result.data
  return {
    fixtures: payload && Array.isArray(payload.response) ? payload.response : [],
    quota: result.quota,
    query: Object.fromEntries(params.entries()),
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 })
  }

  const apiKey = process.env.API_FOOTBALL_KEY

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      mode: 'not_configured',
      message: 'Match sync route is ready. Add API_FOOTBALL_KEY to enable automatic fixtures/results sync.',
    })
  }

  if (!hasSupabaseWriteAccess()) {
    return NextResponse.json({
      ok: true,
      mode: 'database_not_configured',
      message: 'Match fetch is ready, but SUPABASE_SERVICE_ROLE_KEY is missing. Add Supabase env vars to persist matches.',
    })
  }

  const pastDays = Number(process.env.MATCH_SYNC_PAST_DAYS || 2)
  const futureDays = Number(process.env.MATCH_SYNC_FUTURE_DAYS || 7)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)

  try {
    const { fixtures, quota, query } = await fetchFixturesRange(from, to, apiKey)
    const records = fixtures.map(mapFixture)

    const upsertResult = await supabaseUpsert('roar_matches', records, 'provider_match_id')

    if (upsertResult.error) {
      await writeSyncLog({ source: 'matches', status: 'error', fetchedCount: fixtures.length, savedCount: 0, message: upsertResult.error })
      return NextResponse.json({ ok: false, mode: 'supabase_error', error: upsertResult.error }, { status: 500 })
    }

    await writeSyncLog({
      source: 'matches',
      status: 'success',
      fetchedCount: fixtures.length,
      savedCount: upsertResult.data?.length || records.length,
      message: 'Match sync complete',
      details: { from, to, query, quota },
    })

    return NextResponse.json({
      ok: true,
      mode: 'synced',
      from,
      to,
      fetched: fixtures.length,
      upserted: upsertResult.data?.length || records.length,
      quota,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API-Football error'
    await writeSyncLog({ source: 'matches', status: 'error', fetchedCount: 0, savedCount: 0, message })
    return NextResponse.json({ ok: false, mode: 'api_football_error', error: message }, { status: 502 })
  }
}
