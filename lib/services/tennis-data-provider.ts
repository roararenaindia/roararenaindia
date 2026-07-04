import { inferLeagueLogo } from '@/lib/domain/content-inference'
import type { MatchProviderRecord } from '@/lib/services/match-data-provider'

export type TennisProviderResult = {
  provider: TennisProviderName
  providerLabel: string
  records: MatchProviderRecord[]
  fetched: number
  query: Record<string, string>
}

export type TennisProviderName = 'espn' | 'api-tennis'

export type TennisProviderCheck = {
  configured: boolean
  provider: TennisProviderName | 'none'
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

type EspnTournamentPayload = {
  id?: string
  name?: string
  shortName?: string
  groupings?: EspnGrouping[]
}

type EspnGrouping = {
  grouping?: {
    id?: string
    slug?: string
    displayName?: string
  }
  competitions?: EspnCompetition[]
}

type EspnCompetition = {
  id?: string
  date?: string
  startDate?: string
  timeValid?: boolean
  status?: {
    type?: {
      state?: string
      completed?: boolean
      description?: string
      detail?: string
      shortDetail?: string
    }
  }
  venue?: {
    fullName?: string
    court?: string
  }
  notes?: { text?: string; type?: string }[]
  competitors?: EspnCompetitor[]
  round?: {
    displayName?: string
  }
  type?: {
    text?: string
    slug?: string
  }
}

type EspnCompetitor = {
  id?: string
  order?: number
  homeAway?: 'home' | 'away' | string
  winner?: boolean
  score?: string | number
  linescores?: { value?: number; winner?: boolean }[]
  athlete?: {
    displayName?: string
    shortName?: string
    fullName?: string
    flag?: {
      href?: string
      alt?: string
    }
  }
  displayName?: string
  name?: string
  team?: {
    displayName?: string
    shortDisplayName?: string
    logo?: string
  }
}

type ApiTennisPayload<T> = {
  success?: number
  result?: T
  error?: string | string[] | Record<string, unknown>
  message?: string
}

const apiTennisProviderLabel = 'API-Tennis'
const espnProviderLabel = 'ESPN public Wimbledon scoreboard'
const defaultTournamentFilter = 'Wimbledon'
const fallbackLogo = '/assets/leagues/wimbledon.svg'

function tennisProviderName(): TennisProviderName {
  const value = (process.env.TENNIS_DATA_PROVIDER || process.env.TENNIS_PROVIDER || 'espn').trim().toLowerCase()
  return value === 'api-tennis' || value === 'api_tennis' ? 'api-tennis' : 'espn'
}

function apiTennisBaseUrl() {
  return (process.env.TENNIS_API_BASE_URL || 'https://api.api-tennis.com/tennis/').replace(/\?$/, '')
}

function tennisApiKey() {
  return process.env.TENNIS_API_KEY || process.env.API_TENNIS_KEY || ''
}

export function hasTennisProvider() {
  if (tennisProviderName() === 'espn') return true
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

function espnLeagueSlug() {
  const value = (process.env.TENNIS_ESPN_LEAGUE || 'atp').trim().toLowerCase()
  return value === 'wta' ? 'wta' : 'atp'
}

function espnTournamentEventId() {
  return process.env.TENNIS_ESPN_EVENT_ID || '188-2026'
}

function espnTournamentUrl() {
  const baseUrl = (process.env.TENNIS_ESPN_BASE_URL || 'https://site.web.api.espn.com/apis/site/v2/sports/tennis').replace(/\/$/, '')
  const params = new URLSearchParams({ event: espnTournamentEventId() })
  return `${baseUrl}/${espnLeagueSlug()}/scoreboard/tournament?${params.toString()}`
}

function isInDateRange(value: string | undefined, from: string, to: string) {
  if (!value) return false
  const day = value.slice(0, 10)
  return day >= from && day <= to
}

function isWantedEspnTournament(payload: EspnTournamentPayload) {
  const filters = tournamentFilters()
  if (!filters.length) return true
  const tournament = `${payload.name || ''} ${payload.shortName || ''}`.toLowerCase()
  return filters.some((filter) => tournament.includes(filter))
}

function normalizeTennisStatus(match: ApiTennisFixture): MatchProviderRecord['status'] {
  const status = (match.event_status || '').toLowerCase()
  const finalResult = (match.event_final_result || '').trim()

  if (match.event_live === '1') return 'live'
  if (status.includes('finished') || (finalResult && finalResult !== '-')) return 'final'
  return 'upcoming'
}

function normalizeEspnStatus(match: EspnCompetition): MatchProviderRecord['status'] {
  const type = match.status?.type
  const state = (type?.state || '').toLowerCase()
  const description = `${type?.description || ''} ${type?.detail || ''} ${type?.shortDetail || ''}`.toLowerCase()

  if (state === 'in' || description.includes('live') || description.includes('progress')) return 'live'
  if (state === 'post' || type?.completed || description.includes('final')) return 'final'
  return 'upcoming'
}

function statusLabel(status: MatchProviderRecord['status'], sourceStatus?: string) {
  if (status === 'final') return 'Finished'
  if (status === 'live') return sourceStatus || 'Live'
  return 'Upcoming'
}

function espnStatusLabel(match: EspnCompetition, status: MatchProviderRecord['status']) {
  const source = match.status?.type?.shortDetail || match.status?.type?.detail || match.status?.type?.description
  if (source) return source
  return statusLabel(status)
}

function priorityFor(status: MatchProviderRecord['status'], tournament?: string, groupName?: string) {
  const majorBoost = (tournament || '').toLowerCase().includes('wimbledon') ? 10 : 0
  const singlesBoost = (groupName || '').toLowerCase().includes('singles') ? 6 : 0
  if (status === 'live') return 105 + majorBoost + singlesBoost
  if (status === 'upcoming') return 82 + majorBoost + singlesBoost
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

function espnCompetitorName(competitor?: EspnCompetitor) {
  return (
    competitor?.athlete?.displayName ||
    competitor?.athlete?.fullName ||
    competitor?.displayName ||
    competitor?.team?.displayName ||
    competitor?.name ||
    ''
  ).trim()
}

function espnCompetitorShort(competitor: EspnCompetitor, fallback: string) {
  return competitor.athlete?.shortName || competitor.team?.shortDisplayName || playerShort(fallback)
}

function eventIso(match: ApiTennisFixture) {
  if (!match.event_date) return new Date().toISOString()
  const time = match.event_time && /^\d{1,2}:\d{2}$/.test(match.event_time) ? match.event_time : '00:00'
  return new Date(`${match.event_date}T${time}:00Z`).toISOString()
}

function espnCompetitionIso(match: EspnCompetition) {
  return match.startDate || match.date || new Date().toISOString()
}

function orderedEspnCompetitors(match: EspnCompetition) {
  const competitors = [...(match.competitors || [])]
  const home = competitors.find((competitor) => competitor.homeAway === 'home')
  const away = competitors.find((competitor) => competitor.homeAway === 'away')
  if (home && away) return [home, away] as const

  competitors.sort((a, b) => (a.order || 99) - (b.order || 99))
  return [competitors[0], competitors[1]] as const
}

function numericScore(value: string | number | undefined) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function espnSetsWon(target: EspnCompetitor, opponent: EspnCompetitor) {
  const explicitScore = numericScore(target.score)
  if (explicitScore !== null) return explicitScore

  const targetSets = target.linescores || []
  const opponentSets = opponent.linescores || []
  const won = targetSets.reduce((count, set, index) => {
    if (set.winner) return count + 1
    const targetValue = Number(set.value)
    const opponentValue = Number(opponentSets[index]?.value)
    if (Number.isFinite(targetValue) && Number.isFinite(opponentValue) && targetValue > opponentValue) {
      return count + 1
    }
    return count
  }, 0)

  const hasScoreDetail = targetSets.length > 0 || opponentSets.length > 0
  return hasScoreDetail ? won : null
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

function mapEspnCompetition(match: EspnCompetition, grouping: EspnGrouping, eventName: string): MatchProviderRecord | null {
  const id = match.id?.trim()
  const [home, away] = orderedEspnCompetitors(match)
  const homeName = espnCompetitorName(home)
  const awayName = espnCompetitorName(away)

  if (!id || !home || !away || !homeName || !awayName) return null

  const groupName = grouping.grouping?.displayName || match.type?.text || 'Singles'
  const league = `${eventName || defaultTournamentFilter} ${groupName}`.trim()
  const status = normalizeEspnStatus(match)
  const leagueLogo = inferLeagueLogo(league) || fallbackLogo
  const homeScore = espnSetsWon(home, away)
  const awayScore = espnSetsWon(away, home)
  const winner = home.winner ? 'home' : away.winner ? 'away' : null
  const court = match.venue?.court || match.venue?.fullName || ''
  const round = match.round?.displayName || ''
  const venue = [round, court].filter(Boolean).join(' / ') || league

  return {
    provider_match_id: `espn-tennis:${espnTournamentEventId()}:${id}`,
    sport: 'tennis',
    league,
    league_logo: leagueLogo,
    home_team: homeName,
    away_team: awayName,
    home_short: espnCompetitorShort(home, homeName),
    away_short: espnCompetitorShort(away, awayName),
    home_logo: home.athlete?.flag?.href || home.team?.logo || leagueLogo,
    away_logo: away.athlete?.flag?.href || away.team?.logo || leagueLogo,
    home_score: homeScore,
    away_score: awayScore,
    status,
    status_label: espnStatusLabel(match, status),
    kickoff_time: espnCompetitionIso(match),
    venue,
    winner,
    priority: priorityFor(status, league, groupName),
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
  if (tennisProviderName() === 'espn') return fetchEspnTennisRecordsRange(from, to)

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
    providerLabel: apiTennisProviderLabel,
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

async function fetchEspnTennisRecordsRange(from: string, to: string): Promise<TennisProviderResult> {
  const url = espnTournamentUrl()
  const response = await fetch(url, { cache: 'no-store' })
  const data = (await response.json().catch(() => null)) as EspnTournamentPayload | null

  if (!data || !response.ok) {
    throw new Error(response.statusText || `ESPN Wimbledon scoreboard failed with ${response.status}`)
  }

  if (!isWantedEspnTournament(data)) {
    return {
      provider: 'espn',
      providerLabel: espnProviderLabel,
      records: [],
      fetched: 0,
      query: {
        endpoint: url,
        event: espnTournamentEventId(),
        league: espnLeagueSlug(),
        date_start: from,
        date_stop: to,
        tournament_filter: process.env.TENNIS_TOURNAMENT_NAME_FILTER || defaultTournamentFilter,
      },
    }
  }

  const records = (data.groupings || [])
    .flatMap((grouping) =>
      (grouping.competitions || [])
        .filter((match) => isInDateRange(espnCompetitionIso(match), from, to))
        .map((match) => mapEspnCompetition(match, grouping, data.name || defaultTournamentFilter)),
    )
    .filter((record): record is MatchProviderRecord => Boolean(record))

  return {
    provider: 'espn',
    providerLabel: espnProviderLabel,
    records,
    fetched: records.length,
    query: {
      endpoint: url,
      event: espnTournamentEventId(),
      league: espnLeagueSlug(),
      date_start: from,
      date_stop: to,
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
      error: 'No tennis provider is configured. Use TENNIS_DATA_PROVIDER=espn for free Wimbledon data or add TENNIS_API_KEY for API-Tennis.',
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
    const provider = tennisProviderName()
    return {
      configured: true,
      provider,
      providerLabel: provider === 'espn' ? espnProviderLabel : apiTennisProviderLabel,
      fixturesReachable: false,
      sampleCount: 0,
      range: { from, to },
      error: error instanceof Error ? error.message : 'Unknown tennis provider error',
    }
  }
}
