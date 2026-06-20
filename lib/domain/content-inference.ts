import { siteConfig } from '@/lib/config/site-data'
import { resolveLeagueLogo } from '@/lib/domain/league-logos'

type TeamAsset = {
  name: string
  aliases: string[]
  logo: string
}

export const teamAssets: TeamAsset[] = [
  { name: 'USA', aliases: ['usa', 'united states', 'usmnt'], logo: '/assets/teams/fifa/usa.png' },
  { name: 'Paraguay', aliases: ['paraguay', 'par'], logo: '/assets/teams/fifa/paraguay.png' },
  { name: 'Canada', aliases: ['canada', 'can'], logo: '/assets/teams/fifa/canada.png' },
  { name: 'Bosnia and Herzegovina', aliases: ['bosnia', 'bosnia and herz', 'bih'], logo: '/assets/teams/fifa/bosnia-herzegovina.png' },
  { name: 'Mexico', aliases: ['mexico', 'mex'], logo: '/assets/teams/fifa/mexico.png' },
  { name: 'South Africa', aliases: ['south africa', 'rsa'], logo: '/assets/teams/fifa/south-africa.png' },
  { name: 'Australia', aliases: ['australia', 'aus'], logo: '/assets/teams/fifa/australia.png' },
  { name: 'Türkiye', aliases: ['turkiye', 'turkey', 'tur'], logo: '/assets/teams/fifa/turkiye.png' },
  { name: 'Brazil', aliases: ['brazil', 'bra'], logo: '/assets/teams/fifa/brazil.png' },
  { name: 'Morocco', aliases: ['morocco', 'mar'], logo: '/assets/teams/fifa/morocco.png' },
  { name: 'Germany', aliases: ['germany', 'ger'], logo: '/assets/teams/fifa/germany.png' },
  { name: 'Spain', aliases: ['spain', 'esp'], logo: '/assets/teams/fifa/spain.png' },
  { name: 'France', aliases: ['france', 'fra'], logo: '/assets/teams/fifa/france.png' },
  { name: 'Senegal', aliases: ['senegal', 'sen'], logo: '/assets/teams/fifa/senegal.png' },
  { name: 'Belgium', aliases: ['belgium', 'bel'], logo: '/assets/teams/fifa/belgium.png' },
  { name: 'England', aliases: ['england', 'eng'], logo: '/assets/teams/fifa/england.png' },
  { name: 'Portugal', aliases: ['portugal', 'por'], logo: '/assets/teams/fifa/portugal.png' },
  { name: 'Argentina', aliases: ['argentina', 'arg'], logo: '/assets/teams/fifa/argentina.png' },
  { name: 'Uruguay', aliases: ['uruguay', 'uru'], logo: '/assets/teams/fifa/uruguay.png' },
  { name: 'New York Knicks', aliases: ['knicks', 'new york', 'nyk'], logo: '/assets/teams/nba/new-york-knicks.png' },
  { name: 'San Antonio Spurs', aliases: ['spurs', 'san antonio', 'sas'], logo: '/assets/teams/nba/san-antonio-spurs.png' },
]

export function inferCategory(text = '') {
  const normalized = text.toLowerCase()
  if (/(fifa|world cup|football|soccer|usa|paraguay|mexico|brazil|canada|germany|spain|france|senegal|belgium|argentina|portugal|uruguay)/i.test(normalized)) return 'FIFA World Cup 2026'
  if (/(nba|knicks|spurs|basketball|nba finals)/i.test(normalized)) return 'NBA Finals 2026'
  if (/(ipl|cricket)/i.test(normalized)) return 'Cricket'
  if (/(f1|formula|grand prix|race)/i.test(normalized)) return 'Formula 1'
  return 'Roar Arena'
}

export function inferPostType(text = '') {
  const normalized = text.toLowerCase()
  if (/(result|full time|final score|defeats|beats|wins|win|won|draw|[0-9]\s*[-–—]\s*[0-9])/i.test(normalized)) return 'Result'
  if (/(fixture|fixtures|today'?s matches|schedule|lineup)/i.test(normalized)) return 'Fixtures'
  if (/(preview|up next|watch|vs|versus)/i.test(normalized)) return 'Preview'
  return 'Announcement'
}

export function inferLeagueLogo(category: string) {
  return resolveLeagueLogo(category)
}

export function inferTeams(text = '') {
  const normalized = text.toLowerCase()
  const matched = teamAssets.filter((team) => team.aliases.some((alias) => normalized.includes(alias)))
  return matched.length ? matched : siteConfig.posts[0].teams
}

export function titleFromCaption(caption = '', fallback = 'Roar Arena Update') {
  const firstLine = caption.split('\n').find(Boolean)?.trim()
  if (!firstLine) return fallback
  return firstLine.length > 58 ? `${firstLine.slice(0, 55).trim()}...` : firstLine
}

export function descriptionFromCaption(caption = '') {
  const clean = caption.replace(/\s+/g, ' ').trim()
  return clean.length > 150 ? `${clean.slice(0, 147).trim()}...` : clean
}
