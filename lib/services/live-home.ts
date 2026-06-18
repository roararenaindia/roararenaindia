import { getHomePayload, type ArenaMatch } from '@/lib/data/arena-live-data'
import type { ArenaPost } from '@/lib/config/site-data'
import { descriptionFromCaption, inferLeagueLogo, inferTeams, titleFromCaption } from '@/lib/domain/content-inference'
import { isSupabaseConfigured, supabaseSelect } from '@/lib/services/supabase-rest'

type DbPost = {
  id: string
  instagram_id?: string | null
  title?: string | null
  caption?: string | null
  description?: string | null
  media_url: string
  remote_media_url?: string | null
  thumbnail_url?: string | null
  permalink?: string | null
  media_type?: string | null
  post_type?: string | null
  category?: string | null
  logo?: string | null
  teams?: { name: string; logo: string }[] | null
  posted_at?: string | null
  is_featured?: boolean | null
  is_hidden?: boolean | null
}

type DbMatch = {
  id: string
  provider_match_id?: string | null
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
  status: string
  status_label?: string | null
  kickoff_time?: string | null
  venue?: string | null
  winner?: string | null
  priority?: number | null
  is_featured?: boolean | null
  is_hidden?: boolean | null
}

function dateLabelFromIso(value?: string | null) {
  if (!value) return 'TBA'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function timeLabelFromIso(value?: string | null) {
  if (!value) return 'TBA'
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(value))
}

function mapPost(row: DbPost): ArenaPost {
  const category = row.category || 'Roar Arena'
  const caption = row.caption || ''
  return {
    id: row.instagram_id || row.id,
    title: row.title || titleFromCaption(caption, 'Roar Arena Update'),
    category,
    type: row.post_type || 'Announcement',
    description: row.description || descriptionFromCaption(caption) || 'Latest update from Roar Arena.',
    image: row.media_url,
    logo: row.logo || inferLeagueLogo(category),
    teams: Array.isArray(row.teams) && row.teams.length ? [...row.teams] : [...inferTeams(`${row.title || ''} ${caption}`)],
    caption,
    permalink: row.permalink || undefined,
    timestamp: row.posted_at || undefined,
  }
}

function normalizeStatus(status: string): ArenaMatch['status'] {
  const normalized = status.toLowerCase()
  if (['final', 'ft', 'aet', 'pen', 'complete', 'finished'].includes(normalized)) return 'final'
  if (['live', '1h', '2h', 'ht', 'et', 'p'].includes(normalized)) return 'live'
  return 'upcoming'
}


function matchRecencyScore(match: ArenaMatch) {
  const now = Date.now()
  const time = match.kickoffIso ? Date.parse(match.kickoffIso) : Date.parse(`${match.dateLabel} ${match.timeLabel}`)
  const isParsed = Number.isFinite(time)
  const diffHours = isParsed ? (time - now) / 36e5 : 0
  const featuredBoost = match.isFeatured ? 2500 : 0

  if (match.status === 'live') return 12000 + featuredBoost + match.priority
  if (match.status === 'upcoming') return 9500 + featuredBoost + match.priority - Math.max(0, diffHours / 8)
  if (match.status === 'final' && diffHours >= -36) return 8500 + featuredBoost + match.priority + diffHours
  if (match.status === 'final') return 5000 + featuredBoost + match.priority
  return featuredBoost + match.priority
}

function pickHeroMatch(matches: ArenaMatch[], fallback: ArenaMatch) {
  const visible = matches.filter((match) => !match.isHidden)
  if (!visible.length) return fallback
  return [...visible].sort((a, b) => matchRecencyScore(b) - matchRecencyScore(a))[0]
}

function kickoffTime(match: ArenaMatch) {
  const parsed = match.kickoffIso ? Date.parse(match.kickoffIso) : Number.NaN
  return Number.isFinite(parsed) ? parsed : 0
}

function pickHomeMatches(matches: ArenaMatch[]) {
  const visible = matches.filter((match) => !match.isHidden)
  const selected = new Map<string, ArenaMatch>()

  const add = (match: ArenaMatch) => {
    selected.set(match.id, match)
  }

  visible.filter((match) => match.isFeatured).forEach(add)

  visible
    .filter((match) => match.status === 'live')
    .sort((a, b) => b.priority - a.priority || kickoffTime(a) - kickoffTime(b))
    .forEach(add)

  visible
    .filter((match) => match.status === 'upcoming')
    .sort((a, b) => kickoffTime(a) - kickoffTime(b) || b.priority - a.priority)
    .slice(0, 12)
    .forEach(add)

  visible
    .filter((match) => match.status === 'final')
    .sort((a, b) => kickoffTime(b) - kickoffTime(a) || b.priority - a.priority)
    .slice(0, 8)
    .forEach(add)

  return Array.from(selected.values())
}

function mapMatch(row: DbMatch): ArenaMatch {
  const status = normalizeStatus(row.status)
  const winner =
    row.winner === 'home' || row.winner === 'away' || row.winner === 'draw'
      ? row.winner
      : undefined

  return {
    id: row.provider_match_id || row.id,
    sport: row.sport as ArenaMatch['sport'],
    league: row.league,
    leagueLogo: row.league_logo || inferLeagueLogo(row.league),
    status,
    statusLabel: row.status_label || (status === 'final' ? 'Full time' : status === 'live' ? 'Live' : 'Upcoming'),
    dateLabel: dateLabelFromIso(row.kickoff_time),
    timeLabel: status === 'final' ? 'Final' : timeLabelFromIso(row.kickoff_time),
    venue: row.venue || 'TBA',
    home: { name: row.home_team, short: row.home_short || undefined, logo: row.home_logo || '/logos/logo-icon-dark-transparent.png' },
    away: { name: row.away_team, short: row.away_short || undefined, logo: row.away_logo || '/logos/logo-icon-dark-transparent.png' },
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
    winner,
    priority: row.priority || 0,
    isFeatured: Boolean(row.is_featured),
    isHidden: Boolean(row.is_hidden),
  }
}

export async function getLiveHomePayload() {
  const fallback = getHomePayload()

  if (!isSupabaseConfigured('read')) {
    return {
      ...fallback,
      source: 'static-fallback',
      database: 'not_configured',
    }
  }

  const postsResult = await supabaseSelect<DbPost>(
    'roar_posts',
    [
      'select=id,instagram_id,title,caption,description,media_url,remote_media_url,thumbnail_url,permalink,media_type,post_type,category,logo,teams,posted_at,is_featured',
      'is_hidden=eq.false',
      'order=posted_at.desc.nullslast',
      'limit=9',
    ].join('&'),
  )

  const matchesResult = await supabaseSelect<DbMatch>(
    'roar_matches',
    [
      'select=id,provider_match_id,sport,league,league_logo,home_team,away_team,home_short,away_short,home_logo,away_logo,home_score,away_score,status,status_label,kickoff_time,venue,winner,priority,is_featured,is_hidden',
      'or=(is_hidden.is.null,is_hidden.eq.false)',
      'order=kickoff_time.asc.nullslast',
      'limit=80',
    ].join('&'),
  )

  const posts = postsResult.data?.map(mapPost).filter(Boolean) || []
  const allMatches = matchesResult.data?.map(mapMatch).filter(Boolean) || []
  const matches = pickHomeMatches(allMatches)
  const heroMatch = pickHeroMatch(matches, fallback.heroMatch)

  return {
    generatedAt: new Date().toISOString(),
    source: posts.length || matches.length ? 'supabase-live' : 'supabase-empty-fallback',
    database: 'connected',
    errors: [postsResult.error, matchesResult.error].filter(Boolean),
    heroMatch,
    matches: matches.length ? matches : fallback.matches,
    posts: posts.length ? posts : fallback.posts,
    automationStatus: fallback.automationStatus.map((item) =>
      item.title === 'Instagram Sync' || item.title === 'Match Data Sync'
        ? { ...item, status: 'Database ready', detail: 'Supabase persistence is wired. Add credentials and run sync routes.' }
        : item,
    ),
  }
}
