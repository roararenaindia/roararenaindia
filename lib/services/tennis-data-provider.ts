import { inferLeagueLogo } from '@/lib/domain/content-inference'
import type { MatchProviderRecord } from '@/lib/services/match-data-provider'

export type TennisProviderResult = {
  provider: 'api-tennis'
  providerLabel: string
  records: MatchProviderRecord[]
  fetched: number
  query: Record<string, string>
}

export type TennisProviderCheck = {
  configured: boolean
  provider: 'api-tennis' | 'none'
  providerLabel: string
  fixturesReachable: boolean
  sampleCount: number
  range: { from: string; to: string }
  query?: Record<string, string>
  error: string | null
}

type ApiTennisFixture = {
  event_key?: string
  event_date?: string
  event_time?: string
  event_first_player?: string
  event_second_player?: string
  event_final_result?: string
  event_status?: string
  event_live?: string
  event_winner?: string | null
  event_type_type?: string
  tournament_name?: string
  tournament_key?: string
  tournament_round?: string
  tournament_season?: string
  event_first_player_logo?: string | null
  event_second_player_logo?: string | null
}

type ApiTennisPayload<T> = {
  success?: number
  result?: T
  error?: string | string[] | Record<string, unknown>
  message?: string
}

const providerLabel = 'API-Tennis'
const defaultTournamentFilter = 'Wimbledon'
const fallbackLogo = '/assets/leagues/wimbledon.svg'

function apiTennisBaseUrl() {
  return (process.env.TENNIS_API_BASE_URL || 'https://api.api-tennis.com/tennis/').replace(/\?$/, '')
}

function tennisApiKey() {
  return process.env.TENNIS_API_KEY || process.env.API_TENNIS_KEY || ''
}

export function hasTennisProvider() {
  return Boolean(tennisApiKey())
}

function apiErrorToString(error: unknown) {
  if (!error) return null
  if (Array.isArray(error) && error.length === 0) return null
  if (typeof error === 'object' && Object.keys(error as Record<string, unknown>).length === 0) return null
  return typeof error === 'string' ? error : JSON.stringify(error)
}

function tournamentFilters() {
  return (process.env.TENNIS_TOURNAMENT_NAME_FILTER || defaultTournamentFilter)
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

function isWantedTournament(match: ApiTennisFixture) {
  if (process.env.TENNIS_TOURNAMENT_KEY) return true

  const filters = tournamentFilters()
  if (!filters.length) return true

  const tournament = (match.tournament_name || '').toLowerCase()
  return filters.some((filter) => tournament.includes(filter))
}

function normalizeTennisStatus(match: ApiTennisFixture): MatchProviderRecord['status'] {
  const status = (match.event_status || '').toLowerCase()
  const finalResult = (match.event_final_result || '').trim()

  if (match.event_live === '1') return 'live'
  if (status.includes('finished') || (finalResult && finalResult !== '-')) return 'final'
  return 'upcoming'
}

function statusLabel(status: MatchProviderRecord['status'], sourceStatus?: string) {
  if (status === 'final') return 'Finished'
  if (status === 'live') return sourceStatus || 'Live'
  return 'Upcoming'
}

function priorityFor(status: MatchProviderRecord['status'], tournament?: string) {
  const majorBoost = (tournament || '').toLowerCase().includes('wimbledon') ? 10 : 0
  if (status === 'live') return 105 + majorBoost
  if (status === 'upcoming') return 82 + majorBoost
  return 62 + majorBoost
}

function parseScore(value?: string) {
  const parts = (value || '').match(/\d+/g)?.map(Number) || []
  if (parts.length < 2) return [null, null] as const
  return [parts[0], parts[1]] as const
}

function winnerFrom(match: ApiTennisFixture): MatchProviderRecord['winner'] {
  const winner = (match.event_winner || '').toLowerCase()
  if (winner.includes('first')) return 'home'
  if (winner.includes('second')) return 'away'
  return null
}

function playerShort(name: string) {
  const parts = name.split(/[ /]+/).filter(Boolean)
  const last = parts.at(-1) || name
  return last.slice(0, 3).toUpperCase()
}

function eventIso(match: ApiTennisFixture) {
  if (!match.event_date) return new Date().toISOString()
  const time = match.event_time && /^\d{1,2}:\d{2}$/.test(match.event_time) ? match.event_time : '00:00'
  return new Date(`${match.event_date}T${time}:00Z`).toISOString()
}

function mapApiTennisFixture(match: ApiTennisFixture): MatchProviderRecord | null {
  const id = match.event_key?.trim()
  const first = match.event_first_player?.trim()
  const second = match.event_second_player?.trim()

  if (!id || !first || !second) return null

  const status = normalizeTennisStatus(match)
  const [homeScore, awayScore] = parseScore(match.event_final_result)
  const league = match.tournament_name || defaultTournamentFilter
  const leagueLogo = inferLeagueLogo(league) || fallbackLogo

  return {
    provider_match_id: `api-tennis:${id}`,
    sport: 'tennis',
    league,
    league_logo: leagueLogo,
    home_team: first,
    away_team: second,
    home_short: playerShort(first),
    away_short: playerShort(second),
    home_logo: match.event_first_player_logo || leagueLogo,
    away_logo: match.event_second_player_logo || leagueLogo,
    home_score: homeScore,
    away_score: awayScore,
    status,
    status_label: statusLabel(status, match.event_status),
    kickoff_time: eventIso(match),
    venue: match.tournament_round || match.event_type_type || league,
    winner: winnerFrom(match),
    priority: priorityFor(status, league),
    is_hidden: false,
    updated_at: new Date().toISOString(),
  }
}

async function apiTennisGet<T>(params: URLSearchParams) {
  const apiKey = tennisApiKey()
  if (!apiKey) throw new Error('TENNIS_API_KEY is missing.')

  params.set('APIkey', apiKey)

  const separator = apiTennisBaseUrl().includes('?') ? '&' : '?'
  const response = await fetch(`${apiTennisBaseUrl()}${separator}${params.toString()}`, {
    cache: 'no-store',
  })

  const data = (await response.json().catch(() => null)) as ApiTennisPayload<T> | null
  const apiError = apiErrorToString(data?.error) || data?.message || null

  if (!data || !response.ok || apiError || data.success === 0) {
    throw new Error(apiError || response.statusText || `API-Tennis failed with ${response.status}`)
  }

  return data
}

export async function fetchTennisRecordsRange(from: string, to: string): Promise<TennisProviderResult> {
  const timezone = process.env.TENNIS_TIMEZONE || 'UTC'
  const params = new URLSearchParams({
    method: 'get_fixtures',
    date_start: from,
    date_stop: to,
    timezone,
  })

  const tournamentKey = process.env.TENNIS_TOURNAMENT_KEY
  if (tournamentKey) params.set('tournament_key', tournamentKey)

  const data = await apiTennisGet<ApiTennisFixture[]>(params)
  const fixtures = Array.isArray(data.result) ? data.result : []
  const records = fixtures
    .filter(isWantedTournament)
    .map(mapApiTennisFixture)
    .filter((record): record is MatchProviderRecord => Boolean(record))

  return {
    provider: 'api-tennis',
    providerLabel,
    records,
    fetched: records.length,
    query: {
      method: 'get_fixtures',
      date_start: from,
      date_stop: to,
      timezone,
      tournament_key: tournamentKey || '',
      tournament_filter: process.env.TENNIS_TOURNAMENT_NAME_FILTER || defaultTournamentFilter,
    },
  }
}

export async function checkTennisProviderRange(from: string, to: string): Promise<TennisProviderCheck> {
  if (!hasTennisProvider()) {
    return {
      configured: false,
      provider: 'none',
      providerLabel: 'None',
      fixturesReachable: false,
      sampleCount: 0,
      range: { from, to },
      error: 'No tennis provider is configured. Add TENNIS_API_KEY to enable Wimbledon schedule sync.',
    }
  }

  try {
    const result = await fetchTennisRecordsRange(from, to)
    return {
      configured: true,
      provider: result.provider,
      providerLabel: result.providerLabel,
      fixturesReachable: true,
      sampleCount: result.fetched,
      range: { from, to },
      query: result.query,
      error: null,
    }
  } catch (error) {
    return {
      configured: true,
      provider: 'api-tennis',
      providerLabel,
      fixturesReachable: false,
      sampleCount: 0,
      range: { from, to },
      error: error instanceof Error ? error.message : 'Unknown tennis provider error',
    }
  }
}
