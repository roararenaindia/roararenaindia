import { leagueLogos, type LogoAsset } from '@/lib/domain/logo-assets'

const fallbackLogo = '/logos/logo-icon-dark-transparent.png'

function normalizeLeagueName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const leagueAliases: Record<string, string> = {
  basketball: 'nba',
  'champions league': 'uefa-champions-league',
  'cricket world cup': 'icc-cricket',
  f1: 'formula-1',
  fia: 'formula-1',
  fifa: 'fifa',
  'fifa world cup': 'fifa-world-cup',
  football: 'fifa-world-cup',
  formula: 'formula-1',
  'formula one': 'formula-1',
  'formula 1': 'formula-1',
  'grand prix': 'formula-1',
  icc: 'icc-cricket',
  'icc cricket': 'icc-cricket',
  ipl: 'ipl',
  'indian premier league': 'ipl',
  'major league baseball': 'mlb',
  mlb: 'mlb',
  motogp: 'motogp',
  nba: 'nba',
  'nba finals': 'nba',
  nfl: 'nfl',
  nhl: 'nhl',
  olympics: 'olympics',
  pga: 'pga-tour',
  'pga tour': 'pga-tour',
  'premier league': 'premier-league',
  soccer: 'fifa-world-cup',
  'the masters': 'the-masters',
  ucl: 'uefa-champions-league',
  ufc: 'ufc',
  wimbledon: 'wimbledon',
  'world cup': 'fifa-world-cup',
}

const logoBySlug = Object.fromEntries(leagueLogos.map((league) => [league.slug, league.logo]))
const assetBySlug = Object.fromEntries(leagueLogos.map((league) => [league.slug, league])) as Record<string, LogoAsset>

function resolveLeagueSlug(name: string | null | undefined) {
  if (!name) return null

  const normalized = normalizeLeagueName(name)
  const directSlug = normalized.replace(/\s+/g, '-')
  if (logoBySlug[directSlug]) return directSlug

  const aliasSlug = leagueAliases[normalized]
  if (aliasSlug && logoBySlug[aliasSlug]) return aliasSlug

  const partialMatch = Object.entries(leagueAliases).find(([alias]) => normalized.includes(alias))
  if (partialMatch) {
    const slug = partialMatch[1]
    if (logoBySlug[slug]) return slug
  }

  return null
}

export function resolveLeagueLogo(name: string | null | undefined, fallback = fallbackLogo): string {
  const slug = resolveLeagueSlug(name)
  if (slug && logoBySlug[slug]) return logoBySlug[slug]
  return fallback
}

export function resolveLeagueLogoLight(name: string | null | undefined, logo?: string | null): string | undefined {
  const slug = resolveLeagueSlug(name)
  if (slug && assetBySlug[slug]?.lightLogo) return assetBySlug[slug].lightLogo || undefined

  const normalizedLogo = (logo || '').toLowerCase()
  if (normalizedLogo.includes('fifa-world-cup')) return '/assets/leagues/fifa-world-cup-2026-light.png'
  if (normalizedLogo.includes('nba')) return '/assets/leagues/nba-light.svg'
  if (normalizedLogo.includes('ipl')) return '/assets/leagues/ipl-light.svg'
  if (normalizedLogo.includes('formula-1') || normalizedLogo.includes('f1')) return '/assets/leagues/formula-1-red.svg'

  return undefined
}

export function resolveLeagueLogoFrame(name: string | null | undefined, logo?: string | null): 'default' | 'clear' | 'dark-chip' | 'light-chip' {
  const slug = resolveLeagueSlug(name)
  if (slug && assetBySlug[slug]?.logoFrame) return assetBySlug[slug].logoFrame || 'default'

  const normalizedLogo = (logo || '').toLowerCase()
  if (normalizedLogo.includes('fifa-world-cup')) return 'clear'

  return 'default'
}
