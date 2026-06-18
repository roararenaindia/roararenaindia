import { inferLeagueLogo } from '@/lib/domain/content-inference'
import { resolveTeamLogo } from '@/lib/domain/team-logos'

export type MatchProviderName = 'football-data' | 'api-football'

export type MatchProviderRecord = {
  provider_match_id: string
  sport: string
  league: string
  league_logo?: string | null
  home_team: string
  away_team: string
  home_short?: string | null
  away_short?: string | null
  home_logo?: string | null
  away_logo?: string | null
  home_score?: number | null
  away_score?: number | null
  status: 'upcoming' | 'live' | 'final'
  status_label: string
  kickoff_time: string
  venue?: string | null
  winner?: 'home' | 'away' | 'draw' | null
  priority: number
  updated_at: string
}

type ProviderQuota = Record<string, string | null>

export type MatchProviderResult = {
  provider: MatchProviderName
  providerLabel: string
  records: MatchProviderRecord[]
  fetched: number
  quota: ProviderQuota
  query: Record<string, string>
}

export type MatchProviderCheck = {
  configured: boolean
  provider: MatchProviderName | 'none'
  providerLabel: string
  statusReachable: boolean
  fixturesReachable: boolean
  sampleCount: number
  range: { from: string; to: string }
  quota: ProviderQuota | null
  query?: Record<string, string>
  error: string | null
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
  errors?: unknown
  response?: T
}

type FootballDataMatch = {
  id: number
  utcDate: string
  status: string
  stage?: string | null
  group?: string | null
  competition?: { name?: string; emblem?: string | null }
  homeTeam: { name?: string | null; shortName?: string | null; tla?: string | null; crest?: string | null }
  awayTeam: { name?: string | null; shortName?: string | null; tla?: string | null; crest?: string | null }
  score?: {
    winner?: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
    fullTime?: { home?: number | null; away?: number | null }
    regularTime?: { home?: number | null; away?: number | null }
    halfTime?: { home?: number | null; away?: number | null }
  }
}

type FootballDataPayload = {
  matches?: FootballDataMatch[]
  message?: string
  error?: string
}

const fifaTeamCodes: Record<string, string> = {
  argentina: 'ARG',
  australia: 'AUS',
  austria: 'AUT',
  belgium: 'BEL',
  'bosnia and herzegovina': 'BIH',
  'bosnia-herzegovina': 'BIH',
  brazil: 'BRA',
  canada: 'CAN',
  'cape verde': 'CPV',
  colombia: 'COL',
  croatia: 'CRO',
  curacao: 'CUW',
  curaçao: 'CUW',
  czechia: 'CZE',
  'dr congo': 'COD',
  'congo dr': 'COD',
  ecuador: 'ECU',
  egypt: 'EGY',
  england: 'ENG',
  france: 'FRA',
  germany: 'GER',
  ghana: 'GHA',
  haiti: 'HTI',
  iran: 'IRI',
  iraq: 'IRQ',
  'ivory coast': 'CIV',
  japan: 'JPN',
  jordan: 'JOR',
  mexico: 'MEX',
  morocco: 'MAR',
  netherlands: 'NED',
  'new zealand': 'NZL',
  norway: 'NOR',
  panama: 'PAN',
  paraguay: 'PAR',
  portugal: 'POR',
  qatar: 'QAT',
  'saudi arabia': 'KSA',
  scotland: 'SCO',
  senegal: 'SEN',
  'south africa': 'RSA',
  'south korea': 'KOR',
  spain: 'ESP',
  sweden: 'SWE',
  switzerland: 'SUI',
  tunisia: 'TUN',
  turkey: 'TUR',
  türkiye: 'TUR',
  turkiye: 'TUR',
  'united states': 'USA',
  usa: 'USA',
  uruguay: 'URU',
  uzbekistan: 'UZB',
}

function apiErrorsToString(errors: unknown) {
  if (!errors) return null
  if (Array.isArray(errors) && errors.length === 0) return null
  if (typeof errors === 'object' && Object.keys(errors as Record<string, unknown>).length === 0) return null
  return typeof errors === 'string' ? errors : JSON.stringify(errors)
}

function teamKey(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function shortCodeForTeam(name: string, fallback?: string | null) {
  if (fallback) return fallback.toUpperCase()
  return fifaTeamCodes[teamKey(name)] || name.split(/\s+/).map((word) => word[0]).join('').slice(0, 3).toUpperCase()
}

function normalizeApiFootballStatus(short?: string, long?: string): MatchProviderRecord['status'] {
  const value = (short || long || 'NS').toLowerCase()
  if (['ft', 'aet', 'pen', 'fin', 'finished', 'match finished'].includes(value)) return 'final'
  if (['1h', '2h', 'ht', 'et', 'p', 'live', 'int', 'bt'].includes(value)) return 'live'
  return 'upcoming'
}

function normalizeFootballDataStatus(status: string): MatchProviderRecord['status'] {
  const value = status.toUpperCase()
  if (['FINISHED', 'AWARDED'].includes(value)) return 'final'
  if (['IN_PLAY', 'PAUSED', 'LIVE'].includes(value)) return 'live'
  return 'upcoming'
}

function statusLabel(status: MatchProviderRecord['status']) {
  if (status === 'final') return 'Full time'
  if (status === 'live') return 'Live'
  return 'Upcoming'
}

function priorityForStatus(status: MatchProviderRecord['status']) {
  if (status === 'live') return 100
  if (status === 'upcoming') return 80
  return 60
}

function apiFootballWinner(match: ApiFootballFixture) {
  if (match.teams.home.winner === true) return 'home'
  if (match.teams.away.winner === true) return 'away'
  if (match.teams.home.winner === false && match.teams.away.winner === false && match.goals.home === match.goals.away) return 'draw'
  return null
}

function footballDataWinner(match: FootballDataMatch) {
  if (match.score?.winner === 'HOME_TEAM') return 'home'
  if (match.score?.winner === 'AWAY_TEAM') return 'away'
  if (match.score?.winner === 'DRAW') return 'draw'
  return null
}

function footballDataScore(match: FootballDataMatch, side: 'home' | 'away') {
  return match.score?.fullTime?.[side] ?? match.score?.regularTime?.[side] ?? match.score?.halfTime?.[side] ?? null
}

function mapApiFootballFixture(match: ApiFootballFixture): MatchProviderRecord {
  const league = match.league.name || 'FIFA World Cup 2026'
  const status = normalizeApiFootballStatus(match.fixture.status.short, match.fixture.status.long)

  return {
    provider_match_id: `api-football:${match.fixture.id}`,
    sport: 'football',
    league,
    league_logo: match.league.logo || inferLeagueLogo(league),
    home_team: match.teams.home.name,
    away_team: match.teams.away.name,
    home_short: shortCodeForTeam(match.teams.home.name),
    away_short: shortCodeForTeam(match.teams.away.name),
    home_logo: resolveTeamLogo(match.teams.home.name) || match.teams.home.logo,
    away_logo: resolveTeamLogo(match.teams.away.name) || match.teams.away.logo,
    home_score: match.goals.home,
    away_score: match.goals.away,
    status,
    status_label: statusLabel(status),
    kickoff_time: match.fixture.date,
    venue: [match.fixture.venue?.name, match.fixture.venue?.city].filter(Boolean).join(', ') || null,
    winner: apiFootballWinner(match),
    priority: priorityForStatus(status),
    updated_at: new Date().toISOString(),
  }
}

function mapFootballDataMatch(match: FootballDataMatch): MatchProviderRecord {
  const league = match.competition?.name || 'FIFA World Cup'
  const homeName = match.homeTeam.name || match.homeTeam.shortName || 'Home Team'
  const awayName = match.awayTeam.name || match.awayTeam.shortName || 'Away Team'
  const status = normalizeFootballDataStatus(match.status)

  return {
    provider_match_id: `football-data:${match.id}`,
    sport: 'football',
    league,
    league_logo: match.competition?.emblem || inferLeagueLogo(league),
    home_team: homeName,
    away_team: awayName,
    home_short: shortCodeForTeam(homeName, match.homeTeam.tla),
    away_short: shortCodeForTeam(awayName, match.awayTeam.tla),
    home_logo: resolveTeamLogo(homeName) || match.homeTeam.crest,
    away_logo: resolveTeamLogo(awayName) || match.awayTeam.crest,
    home_score: footballDataScore(match, 'home'),
    away_score: footballDataScore(match, 'away'),
    status,
    status_label: statusLabel(status),
    kickoff_time: match.utcDate,
    venue: [match.stage, match.group].filter(Boolean).join(' - ') || league,
    winner: footballDataWinner(match),
    priority: priorityForStatus(status),
    updated_at: new Date().toISOString(),
  }
}

async function apiFootballGet<T>(path: string, apiKey: string) {
  const response = await fetch(`https://v3.football.api-sports.io${path}`, {
    cache: 'no-store',
    headers: { 'x-apisports-key': apiKey },
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

async function footballDataGet(path: string, token: string) {
  const response = await fetch(`https://api.football-data.org/v4${path}`, {
    cache: 'no-store',
    headers: { 'X-Auth-Token': token },
  })

  const data = (await response.json().catch(() => null)) as FootballDataPayload | null
  const apiError = data?.message || data?.error || null

  if (!response.ok || apiError) {
    throw new Error(apiError || response.statusText || `football-data.org failed with ${response.status}`)
  }

  return {
    data,
    quota: {
      requestCounterReset: response.headers.get('x-requestcounter-reset'),
      requestsAvailable: response.headers.get('x-requests-available'),
    },
  }
}

function preferredProvider(): MatchProviderName | 'auto' {
  const value = (process.env.MATCH_DATA_PROVIDER || 'auto').toLowerCase()
  if (value === 'football-data' || value === 'api-football') return value
  return 'auto'
}

function canUseFootballData() {
  return Boolean(process.env.FOOTBALL_DATA_TOKEN)
}

function canUseApiFootball() {
  return Boolean(process.env.API_FOOTBALL_KEY)
}

export function hasAnyMatchProvider() {
  return canUseFootballData() || canUseApiFootball()
}

export function selectedMatchProvider(): MatchProviderName | 'none' {
  const preferred = preferredProvider()
  if (preferred === 'football-data') return canUseFootballData() ? 'football-data' : 'none'
  if (preferred === 'api-football') return canUseApiFootball() ? 'api-football' : 'none'
  if (canUseFootballData()) return 'football-data'
  if (canUseApiFootball()) return 'api-football'
  return 'none'
}

async function fetchFootballDataRange(from: string, to: string): Promise<MatchProviderResult> {
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) throw new Error('FOOTBALL_DATA_TOKEN is missing.')

  const competition = process.env.FOOTBALL_DATA_COMPETITION || 'WC'
  const season = process.env.FOOTBALL_DATA_SEASON || process.env.API_FOOTBALL_SEASON || '2026'
  const params = new URLSearchParams({ season, dateFrom: from, dateTo: to })
  const result = await footballDataGet(`/competitions/${encodeURIComponent(competition)}/matches?${params.toString()}`, token)
  const matches = Array.isArray(result.data?.matches) ? result.data.matches : []

  return {
    provider: 'football-data',
    providerLabel: 'football-data.org',
    records: matches.map(mapFootballDataMatch),
    fetched: matches.length,
    quota: result.quota,
    query: { competition, season, dateFrom: from, dateTo: to },
  }
}

async function fetchApiFootballRange(from: string, to: string): Promise<MatchProviderResult> {
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) throw new Error('API_FOOTBALL_KEY is missing.')

  const leagueId = process.env.API_FOOTBALL_LEAGUE_ID || '1'
  const season = process.env.API_FOOTBALL_SEASON || '2026'
  const params = new URLSearchParams({ league: leagueId, season, from, to })
  const result = await apiFootballGet<ApiFootballFixture[]>(`/fixtures?${params.toString()}`, apiKey)
  const fixtures = result.data && Array.isArray(result.data.response) ? result.data.response : []

  return {
    provider: 'api-football',
    providerLabel: 'API-Football',
    records: fixtures.map(mapApiFootballFixture),
    fetched: fixtures.length,
    quota: result.quota,
    query: { league: leagueId, season, from, to },
  }
}

export async function fetchMatchRecordsRange(from: string, to: string) {
  const provider = selectedMatchProvider()
  if (provider === 'football-data') return fetchFootballDataRange(from, to)
  if (provider === 'api-football') return fetchApiFootballRange(from, to)
  throw new Error('No match provider is configured. Add FOOTBALL_DATA_TOKEN or API_FOOTBALL_KEY.')
}

export async function checkMatchProviderRange(from: string, to: string): Promise<MatchProviderCheck> {
  const provider = selectedMatchProvider()

  if (provider === 'none') {
    return {
      configured: false,
      provider,
      providerLabel: 'None',
      statusReachable: false,
      fixturesReachable: false,
      sampleCount: 0,
      range: { from, to },
      quota: null,
      error: 'No match provider is configured. Add FOOTBALL_DATA_TOKEN for the free World Cup provider.',
    }
  }

  try {
    const result = await fetchMatchRecordsRange(from, to)
    return {
      configured: true,
      provider: result.provider,
      providerLabel: result.providerLabel,
      statusReachable: true,
      fixturesReachable: true,
      sampleCount: result.fetched,
      range: { from, to },
      quota: result.quota,
      query: result.query,
      error: null,
    }
  } catch (error) {
    return {
      configured: true,
      provider,
      providerLabel: provider === 'football-data' ? 'football-data.org' : 'API-Football',
      statusReachable: false,
      fixturesReachable: false,
      sampleCount: 0,
      range: { from, to },
      quota: null,
      error: error instanceof Error ? error.message : 'Unknown match provider error',
    }
  }
}
