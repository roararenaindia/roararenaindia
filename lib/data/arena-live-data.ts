export type ArenaTeam = {
  name: string
  short?: string
  logo: string
}

export type ArenaMatch = {
  id: string
  sport: 'football' | 'basketball' | 'cricket' | 'formula-1' | 'tennis' | 'multi-sport'
  league: string
  leagueLogo: string
  leagueLogoLight?: string
  leagueLogoFrame?: 'default' | 'clear' | 'dark-chip' | 'light-chip'
  status: 'final' | 'live' | 'upcoming'
  statusLabel: string
  dateLabel: string
  timeLabel: string
  kickoffIso?: string
  venue: string
  home: ArenaTeam
  away: ArenaTeam
  homeScore?: number
  awayScore?: number
  winner?: 'home' | 'away' | 'draw'
  priority: number
  isFeatured?: boolean
  isHidden?: boolean
}

export type ArenaSocialPost = {
  id: string
  title: string
  type: 'Result' | 'Fixtures' | 'Preview' | 'Announcement'
  image: string
  caption: string
  permalink: string
  timestamp: string
  category: string
}

import { resolveTeamLogo } from '@/lib/domain/team-logos'

const fifaLogo = '/assets/leagues/fifa-world-cup-dark.png'
const fifaLogoLight = '/assets/leagues/fifa-world-cup-2026-light.png'

// Resolve a country logo, falling back to the generic FIFA crest.
const teamLogo = (name: string) => resolveTeamLogo(name) || ''

export const liveMatches: ArenaMatch[] = [
  {
    id: 'fifa-spain-cape-verde-2026-06-15',
    sport: 'football',
    league: 'FIFA World Cup 2026',
    leagueLogo: fifaLogo,
    leagueLogoLight: fifaLogoLight,
    leagueLogoFrame: 'clear',
    status: 'upcoming',
    statusLabel: 'Today',
    dateLabel: 'June 15, 2026',
    timeLabel: '12:00 PM EDT',
    kickoffIso: '2026-06-15T16:00:00.000Z',
    venue: 'FIFA World Cup 2026',
    home: { name: 'Spain', short: 'ESP', logo: teamLogo('Spain') },
    away: { name: 'Cape Verde', short: 'CPV', logo: teamLogo('Cape Verde') },
    priority: 96,
  },
  {
    id: 'fifa-belgium-egypt-2026-06-15',
    sport: 'football',
    league: 'FIFA World Cup 2026',
    leagueLogo: fifaLogo,
    leagueLogoLight: fifaLogoLight,
    leagueLogoFrame: 'clear',
    status: 'upcoming',
    statusLabel: 'Today',
    dateLabel: 'June 15, 2026',
    timeLabel: '3:00 PM EDT',
    kickoffIso: '2026-06-15T19:00:00.000Z',
    venue: 'FIFA World Cup 2026',
    home: { name: 'Belgium', short: 'BEL', logo: teamLogo('Belgium') },
    away: { name: 'Egypt', short: 'EGY', logo: teamLogo('Egypt') },
    priority: 94,
  },
  {
    id: 'fifa-germany-curacao-2026-06-14',
    sport: 'football',
    league: 'FIFA World Cup 2026',
    leagueLogo: fifaLogo,
    leagueLogoLight: fifaLogoLight,
    leagueLogoFrame: 'clear',
    status: 'final',
    statusLabel: 'Full time',
    dateLabel: 'June 14, 2026',
    timeLabel: 'Final',
    kickoffIso: '2026-06-14T17:00:00.000Z',
    venue: 'Houston Stadium',
    home: { name: 'Germany', short: 'GER', logo: teamLogo('Germany') },
    away: { name: 'Curaçao', short: 'CUW', logo: teamLogo('Curaçao') },
    homeScore: 7,
    awayScore: 1,
    winner: 'home',
    priority: 92,
  },
  {
    id: 'fifa-brazil-morocco-2026-06-13',
    sport: 'football',
    league: 'FIFA World Cup 2026',
    leagueLogo: fifaLogo,
    leagueLogoLight: fifaLogoLight,
    leagueLogoFrame: 'clear',
    status: 'final',
    statusLabel: 'Full time',
    dateLabel: 'June 13, 2026',
    timeLabel: 'Final',
    kickoffIso: '2026-06-13T22:00:00.000Z',
    venue: 'New York New Jersey Stadium',
    home: { name: 'Brazil', short: 'BRA', logo: teamLogo('Brazil') },
    away: { name: 'Morocco', short: 'MAR', logo: teamLogo('Morocco') },
    homeScore: 1,
    awayScore: 1,
    winner: 'draw',
    priority: 90,
  },
  {
    id: 'nba-knicks-champions-2026',
    sport: 'basketball',
    league: 'NBA Finals 2026',
    leagueLogo: '/assets/leagues/nba.svg',
    leagueLogoLight: '/assets/leagues/nba-light.svg',
    status: 'final',
    statusLabel: 'Champions',
    dateLabel: 'June 2026',
    timeLabel: 'Final',
    kickoffIso: '2026-06-15T03:00:00.000Z',
    venue: 'NBA Finals',
    home: { name: 'New York Knicks', short: 'NYK', logo: '/assets/teams/nba/new-york-knicks.png' },
    away: { name: 'San Antonio Spurs', short: 'SAS', logo: '/assets/teams/nba/san-antonio-spurs.png' },
    winner: 'home',
    priority: 82,
  },
  {
    id: 'fifa-france-senegal-2026-06-16',
    sport: 'football',
    league: 'FIFA World Cup 2026',
    leagueLogo: fifaLogo,
    leagueLogoLight: fifaLogoLight,
    leagueLogoFrame: 'clear',
    status: 'upcoming',
    statusLabel: 'Up next',
    dateLabel: 'June 16, 2026',
    timeLabel: '3:00 PM EDT',
    kickoffIso: '2026-06-16T19:00:00.000Z',
    venue: 'FIFA World Cup 2026',
    home: { name: 'France', short: 'FRA', logo: teamLogo('France') },
    away: { name: 'Senegal', short: 'SEN', logo: teamLogo('Senegal') },
    priority: 80,
  },
]

export const arenaSocialPosts: ArenaSocialPost[] = []

export const automationStatus = [
  {
    title: 'Instagram Sync',
    status: 'Ready',
    detail: 'Connect Meta credentials to auto-pull the same images you already post on Instagram.',
  },
  {
    title: 'Match Data Sync',
    status: 'Ready',
    detail: 'football-data.org sync is wired to refresh FIFA fixtures and scores every 15 minutes when Supabase and GitHub Actions are configured.',
  },
  {
    title: 'Manual Override',
    status: 'Ready',
    detail: 'Admin can feature, hide, pin, and fix content safely when the story changes.',
  },
] as const

export function getHomePayload() {
  const heroMatch = [...liveMatches].sort((a, b) => b.priority - a.priority)[0]
  return {
    generatedAt: new Date().toISOString(),
    source: 'static-fallback',
    heroMatch,
    matches: liveMatches,
    posts: arenaSocialPosts,
    automationStatus,
  }
}
