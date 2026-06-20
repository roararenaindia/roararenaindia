// Centralized country -> local transparent logo resolver.
// Single source of truth used by both the static fixtures (arena-live-data)
// and the live API-Football sync route so logos reliably show up during
// scheduling / matchmaking everywhere on the site.

const FIFA_BASE = '/assets/teams/fifa'

// Generic FIFA crest used when a specific country logo is not available.
export const FIFA_FALLBACK_LOGO = '/assets/leagues/fifa-world-cup.png'

// Country slug -> local file that actually exists in public/assets/teams/fifa.
const countryLogoFiles: Record<string, string> = {
  algeria: `${FIFA_BASE}/algeria.svg`,
  argentina: `${FIFA_BASE}/argentina.png`,
  australia: `${FIFA_BASE}/australia.png`,
  belgium: `${FIFA_BASE}/belgium.png`,
  'bosnia-herzegovina': `${FIFA_BASE}/bosnia-herzegovina.png`,
  brazil: `${FIFA_BASE}/brazil.png`,
  canada: `${FIFA_BASE}/canada.png`,
  'cape-verde': `${FIFA_BASE}/cape-verde.png`,
  'congo-dr': `${FIFA_BASE}/dr-congo.svg`,
  croatia: `${FIFA_BASE}/croatia.png`,
  curacao: `${FIFA_BASE}/curacao.svg`,
  england: `${FIFA_BASE}/england.png`,
  france: `${FIFA_BASE}/france.png`,
  germany: `${FIFA_BASE}/germany.png`,
  ghana: `${FIFA_BASE}/ghana.png`,
  haiti: `${FIFA_BASE}/haiti.svg`,
  italy: `${FIFA_BASE}/italy.png`,
  japan: `${FIFA_BASE}/japan.png`,
  mexico: `${FIFA_BASE}/mexico.png`,
  morocco: `${FIFA_BASE}/morocco.png`,
  netherlands: `${FIFA_BASE}/netherlands.png`,
  nigeria: `${FIFA_BASE}/nigeria.png`,
  paraguay: `${FIFA_BASE}/paraguay.png`,
  portugal: `${FIFA_BASE}/portugal.png`,
  qatar: `${FIFA_BASE}/qatar.svg`,
  scotland: `${FIFA_BASE}/scotland.svg`,
  senegal: `${FIFA_BASE}/senegal.png`,
  'south-africa': `${FIFA_BASE}/south-africa.png`,
  spain: `${FIFA_BASE}/spain.png`,
  turkiye: `${FIFA_BASE}/turkiye.png`,
  uruguay: `${FIFA_BASE}/uruguay.png`,
  usa: `${FIFA_BASE}/usa.png`,
}

// Country slug -> tiny SVG flag code from flagcdn.com.
// This avoids loading multi-MB crest PNGs and is more reliable than emoji flags on Windows.
const countryFlagCodes: Record<string, string> = {
  algeria: 'dz',
  argentina: 'ar',
  australia: 'au',
  austria: 'at',
  belgium: 'be',
  'bosnia-herzegovina': 'ba',
  brazil: 'br',
  canada: 'ca',
  'cape-verde': 'cv',
  colombia: 'co',
  'congo-dr': 'cd',
  croatia: 'hr',
  curacao: 'cw',
  czechia: 'cz',
  ecuador: 'ec',
  egypt: 'eg',
  england: 'gb-eng',
  france: 'fr',
  germany: 'de',
  ghana: 'gh',
  haiti: 'ht',
  iran: 'ir',
  iraq: 'iq',
  italy: 'it',
  'ivory-coast': 'ci',
  japan: 'jp',
  jordan: 'jo',
  mexico: 'mx',
  morocco: 'ma',
  netherlands: 'nl',
  'new-zealand': 'nz',
  nigeria: 'ng',
  norway: 'no',
  panama: 'pa',
  paraguay: 'py',
  portugal: 'pt',
  qatar: 'qa',
  'saudi-arabia': 'sa',
  scotland: 'gb-sct',
  senegal: 'sn',
  'south-africa': 'za',
  'south-korea': 'kr',
  spain: 'es',
  sweden: 'se',
  switzerland: 'ch',
  tunisia: 'tn',
  turkiye: 'tr',
  uruguay: 'uy',
  usa: 'us',
  uzbekistan: 'uz',
}

// Legacy emoji mapping retained only as a fallback if a browser blocks external images.
const countryFlagEmojis: Record<string, string> = {
  algeria: '🇩🇿',
  argentina: '🇦🇷',
  australia: '🇦🇺',
  austria: '🇦🇹',
  belgium: '🇧🇪',
  'bosnia-herzegovina': '🇧🇦',
  brazil: '🇧🇷',
  canada: '🇨🇦',
  'cape-verde': '🇨🇻',
  colombia: '🇨🇴',
  'congo-dr': '🇨🇩',
  croatia: '🇭🇷',
  curacao: '🇨🇼',
  czechia: '🇨🇿',
  ecuador: '🇪🇨',
  egypt: '🇪🇬',
  england: '🏴',
  france: '🇫🇷',
  germany: '🇩🇪',
  ghana: '🇬🇭',
  haiti: '🇭🇹',
  iran: '🇮🇷',
  iraq: '🇮🇶',
  italy: '🇮🇹',
  'ivory-coast': '🇨🇮',
  japan: '🇯🇵',
  jordan: '🇯🇴',
  mexico: '🇲🇽',
  morocco: '🇲🇦',
  netherlands: '🇳🇱',
  'new-zealand': '🇳🇿',
  nigeria: '🇳🇬',
  norway: '🇳🇴',
  panama: '🇵🇦',
  paraguay: '🇵🇾',
  portugal: '🇵🇹',
  qatar: '🇶🇦',
  'saudi-arabia': '🇸🇦',
  scotland: '🏴',
  senegal: '🇸🇳',
  'south-africa': '🇿🇦',
  'south-korea': '🇰🇷',
  spain: '🇪🇸',
  sweden: '🇸🇪',
  switzerland: '🇨🇭',
  tunisia: '🇹🇳',
  turkiye: '🇹🇷',
  uruguay: '🇺🇾',
  usa: '🇺🇸',
  uzbekistan: '🇺🇿',
}

// Normalize any incoming team name: lowercase, strip accents and punctuation.
function normalize(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[._]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Map of normalized aliases (as they may arrive from API-Football or copy) to a slug.
const nameAliases: Record<string, string> = {
  algeria: 'algeria',
  argentina: 'argentina',
  australia: 'australia',
  socceroos: 'australia',
  austria: 'austria',
  belgium: 'belgium',
  'red devils': 'belgium',
  'bosnia and herzegovina': 'bosnia-herzegovina',
  'bosnia herzegovina': 'bosnia-herzegovina',
  bosnia: 'bosnia-herzegovina',
  brazil: 'brazil',
  brasil: 'brazil',
  canada: 'canada',
  'cape verde': 'cape-verde',
  'cabo verde': 'cape-verde',
  'cape-verde': 'cape-verde',
  cpv: 'cape-verde',
  colombia: 'colombia',
  'congo dr': 'congo-dr',
  'congo democratic republic': 'congo-dr',
  'dr congo': 'congo-dr',
  'democratic republic of congo': 'congo-dr',
  croatia: 'croatia',
  hrvatska: 'croatia',
  curacao: 'curacao',
  curacaoo: 'curacao',
  'curaçao': 'curacao',
  czechia: 'czechia',
  'czech republic': 'czechia',
  ecuador: 'ecuador',
  egypt: 'egypt',
  england: 'england',
  france: 'france',
  'les bleus': 'france',
  germany: 'germany',
  deutschland: 'germany',
  ghana: 'ghana',
  'black stars': 'ghana',
  italy: 'italy',
  italia: 'italy',
  azzurri: 'italy',
  haiti: 'haiti',
  iran: 'iran',
  iraq: 'iraq',
  'ivory coast': 'ivory-coast',
  "cote d'ivoire": 'ivory-coast',
  'cote divoire': 'ivory-coast',
  japan: 'japan',
  'samurai blue': 'japan',
  jordan: 'jordan',
  mexico: 'mexico',
  morocco: 'morocco',
  'atlas lions': 'morocco',
  netherlands: 'netherlands',
  holland: 'netherlands',
  'the netherlands': 'netherlands',
  'new zealand': 'new-zealand',
  nigeria: 'nigeria',
  'super eagles': 'nigeria',
  norway: 'norway',
  panama: 'panama',
  paraguay: 'paraguay',
  portugal: 'portugal',
  qatar: 'qatar',
  'saudi arabia': 'saudi-arabia',
  scotland: 'scotland',
  senegal: 'senegal',
  'south africa': 'south-africa',
  'bafana bafana': 'south-africa',
  'south korea': 'south-korea',
  korea: 'south-korea',
  'korea republic': 'south-korea',
  'republic of korea': 'south-korea',
  spain: 'spain',
  espana: 'spain',
  'la roja': 'spain',
  sweden: 'sweden',
  switzerland: 'switzerland',
  tunisia: 'tunisia',
  turkey: 'turkiye',
  turkiye: 'turkiye',
  türkiye: 'turkiye',
  uruguay: 'uruguay',
  uzbekistan: 'uzbekistan',
  usa: 'usa',
  'united states': 'usa',
  'united states of america': 'usa',
  'usmnt': 'usa',
}

// FIFA 3-letter codes for the countries we support (used for short labels).
const countryShortCodes: Record<string, string> = {
  algeria: 'ALG',
  argentina: 'ARG',
  australia: 'AUS',
  austria: 'AUT',
  belgium: 'BEL',
  'bosnia-herzegovina': 'BIH',
  brazil: 'BRA',
  canada: 'CAN',
  'cape-verde': 'CPV',
  colombia: 'COL',
  'congo-dr': 'COD',
  croatia: 'CRO',
  curacao: 'CUW',
  czechia: 'CZE',
  ecuador: 'ECU',
  egypt: 'EGY',
  england: 'ENG',
  france: 'FRA',
  germany: 'GER',
  ghana: 'GHA',
  haiti: 'HAI',
  iran: 'IRN',
  iraq: 'IRQ',
  italy: 'ITA',
  'ivory-coast': 'CIV',
  japan: 'JPN',
  jordan: 'JOR',
  mexico: 'MEX',
  morocco: 'MAR',
  netherlands: 'NED',
  'new-zealand': 'NZL',
  nigeria: 'NGA',
  norway: 'NOR',
  panama: 'PAN',
  paraguay: 'PAR',
  portugal: 'POR',
  qatar: 'QAT',
  'saudi-arabia': 'KSA',
  scotland: 'SCO',
  senegal: 'SEN',
  'south-africa': 'RSA',
  'south-korea': 'KOR',
  spain: 'ESP',
  sweden: 'SWE',
  switzerland: 'SUI',
  tunisia: 'TUN',
  turkiye: 'TUR',
  uruguay: 'URU',
  usa: 'USA',
  uzbekistan: 'UZB',
}

function slugForName(name: string): string | undefined {
  const normalized = normalize(name)
  if (nameAliases[normalized]) return nameAliases[normalized]
  // Slugified direct match (e.g. "South Africa" -> "south-africa")
  const slug = normalized.replace(/\s+/g, '-')
  if (countryLogoFiles[slug] || countryFlagCodes[slug] || countryFlagEmojis[slug]) return slug
  return undefined
}

/**
 * Resolve a team name to a local transparent country logo.
 * Returns undefined when no local logo exists so callers can decide on a fallback.
 */
export function resolveTeamLogo(name: string | null | undefined): string | undefined {
  if (!name) return undefined
  const slug = slugForName(name)
  return slug ? countryLogoFiles[slug] : undefined
}

/**
 * Resolve a team name to a lightweight SVG flag URL.
 * Used by the public UI because flags are much lighter than image crest files.
 */
export function resolveTeamFlag(name: string | null | undefined): string | undefined {
  if (!name) return undefined
  const slug = slugForName(name)
  const flagCode = slug ? countryFlagCodes[slug] : undefined
  return flagCode ? `https://flagcdn.com/${flagCode}.svg` : undefined
}

/**
 * Resolve a team name to a text fallback flag.
 */
export function resolveTeamFlagEmoji(name: string | null | undefined): string | undefined {
  if (!name) return undefined
  const slug = slugForName(name)
  return slug ? countryFlagEmojis[slug] : undefined
}

/**
 * Resolve a logo with a guaranteed fallback (generic FIFA crest by default).
 */
export function resolveTeamLogoWithFallback(name: string | null | undefined, fallback = FIFA_FALLBACK_LOGO): string {
  return resolveTeamLogo(name) || fallback
}

/**
 * Resolve a FIFA-style 3-letter short code for a team name.
 */
export function resolveTeamShort(name: string | null | undefined): string | undefined {
  if (!name) return undefined
  const slug = slugForName(name)
  if (slug && countryShortCodes[slug]) return countryShortCodes[slug]
  // Fallback: build initials from the name.
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

/** True when we have a dedicated local country logo for this team. */
export function hasTeamLogo(name: string | null | undefined): boolean {
  return Boolean(resolveTeamLogo(name))
}
