import { resolveLeagueLogo } from '@/lib/domain/league-logos'

type TeamAsset = {
  name: string
  aliases: string[]
  logo: string
}

const FIFA_BASE = '/assets/teams/fifa'
const NBA_BASE = '/assets/teams/nba'
const F1_BASE = '/assets/teams/f1'

const fifaTeamAssets: TeamAsset[] = [
  { name: 'USA', aliases: ['usa', 'united states', 'usmnt'], logo: `${FIFA_BASE}/usa.png` },
  { name: 'Paraguay', aliases: ['paraguay', 'par'], logo: `${FIFA_BASE}/paraguay.png` },
  { name: 'Canada', aliases: ['canada', 'can'], logo: `${FIFA_BASE}/canada.png` },
  { name: 'Qatar', aliases: ['qatar', 'qat'], logo: `${FIFA_BASE}/qatar.svg` },
  { name: 'Bosnia and Herzegovina', aliases: ['bosnia and herzegovina', 'bosnia herzegovina', 'bosnia', 'bih'], logo: `${FIFA_BASE}/bosnia-herzegovina.png` },
  { name: 'Croatia', aliases: ['croatia', 'hrvatska', 'cro'], logo: `${FIFA_BASE}/croatia.png` },
  { name: 'Mexico', aliases: ['mexico', 'mex'], logo: `${FIFA_BASE}/mexico.png` },
  { name: 'South Africa', aliases: ['south africa', 'rsa'], logo: `${FIFA_BASE}/south-africa.png` },
  { name: 'Australia', aliases: ['australia', 'aus'], logo: `${FIFA_BASE}/australia.png` },
  { name: 'Turkiye', aliases: ['turkiye', 'trkiye', 'turkey', 'tur'], logo: `${FIFA_BASE}/turkiye.png` },
  { name: 'Brazil', aliases: ['brazil', 'bra'], logo: `${FIFA_BASE}/brazil.png` },
  { name: 'Morocco', aliases: ['morocco', 'mar'], logo: `${FIFA_BASE}/morocco.png` },
  { name: 'Germany', aliases: ['germany', 'deutschland', 'ger'], logo: `${FIFA_BASE}/germany.png` },
  { name: 'Ghana', aliases: ['ghana', 'gha', 'black stars'], logo: `${FIFA_BASE}/ghana.png` },
  { name: 'Haiti', aliases: ['haiti', 'hai'], logo: `${FIFA_BASE}/haiti.svg` },
  { name: 'Italy', aliases: ['italy', 'italia', 'ita', 'azzurri'], logo: `${FIFA_BASE}/italy.png` },
  { name: 'Japan', aliases: ['japan', 'samurai blue', 'jpn'], logo: `${FIFA_BASE}/japan.png` },
  { name: 'Spain', aliases: ['spain', 'esp'], logo: `${FIFA_BASE}/spain.png` },
  { name: 'France', aliases: ['france', 'fra'], logo: `${FIFA_BASE}/france.png` },
  { name: 'Senegal', aliases: ['senegal', 'sen'], logo: `${FIFA_BASE}/senegal.png` },
  { name: 'Belgium', aliases: ['belgium', 'bel'], logo: `${FIFA_BASE}/belgium.png` },
  { name: 'England', aliases: ['england', 'eng'], logo: `${FIFA_BASE}/england.png` },
  { name: 'Netherlands', aliases: ['netherlands', 'holland', 'ned'], logo: `${FIFA_BASE}/netherlands.png` },
  { name: 'Nigeria', aliases: ['nigeria', 'super eagles', 'nga'], logo: `${FIFA_BASE}/nigeria.png` },
  { name: 'Portugal', aliases: ['portugal', 'por'], logo: `${FIFA_BASE}/portugal.png` },
  { name: 'DR Congo', aliases: ['dr congo', 'drcongo', 'drc', 'congo dr', 'democratic republic of congo', 'leopards'], logo: `${FIFA_BASE}/dr-congo.svg` },
  { name: 'Scotland', aliases: ['scotland', 'sco'], logo: `${FIFA_BASE}/scotland.svg` },
  { name: 'Argentina', aliases: ['argentina', 'arg'], logo: `${FIFA_BASE}/argentina.png` },
  { name: 'Algeria', aliases: ['algeria', 'alg'], logo: `${FIFA_BASE}/algeria.svg` },
  { name: 'Uruguay', aliases: ['uruguay', 'uru'], logo: `${FIFA_BASE}/uruguay.png` },
  { name: 'Cape Verde', aliases: ['cape verde', 'cabo verde', 'capeverde', 'cpv'], logo: `${FIFA_BASE}/cape-verde.png` },
  { name: 'Curacao', aliases: ['curacao', 'curaçao', 'cuw'], logo: `${FIFA_BASE}/curacao.svg` },
]

const nbaTeamAssets: TeamAsset[] = [
  { name: 'New York Knicks', aliases: ['new york knicks', 'newyorkknicks', 'knicks', 'nyk'], logo: `${NBA_BASE}/new-york-knicks.png` },
  { name: 'San Antonio Spurs', aliases: ['san antonio spurs', 'sanantoniospurs', 'spurs', 'sas'], logo: `${NBA_BASE}/san-antonio-spurs.png` },
]

const formulaTeamAssets: TeamAsset[] = [
  { name: 'Ferrari', aliases: ['ferrari', 'scuderia ferrari', 'scuderiaferrari'], logo: `${F1_BASE}/ferrari.svg` },
]

export const teamAssets: TeamAsset[] = [...fifaTeamAssets, ...nbaTeamAssets, ...formulaTeamAssets]

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function aliasMatch(text: string, alias: string) {
  const normalizedAlias = normalizeText(alias)
  if (!normalizedAlias) return null

  if (normalizedAlias.length <= 3) {
    const match = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedAlias)}([^a-z0-9]|$)`, 'i').exec(text)
    return match?.index === undefined ? null : { index: match.index + match[1].length, length: normalizedAlias.length }
  }

  const index = text.indexOf(normalizedAlias)
  if (index >= 0) return { index, length: normalizedAlias.length }

  const compactAlias = normalizedAlias.replace(/[^a-z0-9]/g, '')
  if (!compactAlias) return null

  const compactIndex = text.replace(/[^a-z0-9]/g, '').indexOf(compactAlias)
  return compactIndex >= 0 ? { index: compactIndex, length: normalizedAlias.length } : null
}

function findTeamMatches(text: string, teams: TeamAsset[]) {
  return teams
    .map((team) => {
      const matches = team.aliases
        .map((alias) => aliasMatch(text, alias))
        .filter((match): match is { index: number; length: number } => Boolean(match))

      if (!matches.length) return null
      const best = matches.sort((a, b) => a.index - b.index || b.length - a.length)[0]
      return { team, index: best.index, length: best.length }
    })
    .filter((match): match is { team: TeamAsset; index: number; length: number } => Boolean(match))
    .sort((a, b) => a.index - b.index)
}

function uniqueTeams(matches: { team: TeamAsset }[]) {
  const seen = new Set<string>()
  return matches
    .map(({ team }) => team)
    .filter((team) => {
      if (seen.has(team.name)) return false
      seen.add(team.name)
      return true
    })
}

function scorelineTeams(text: string) {
  const scoreRegex = /\b\d{1,2}\s*[-\u2013\u2014]\s*\d{1,2}\b/g
  let score: RegExpExecArray | null

  while ((score = scoreRegex.exec(text))) {
    const before = text.slice(Math.max(0, score.index - 80), score.index)
    const after = text.slice(scoreRegex.lastIndex, scoreRegex.lastIndex + 80)
    const beforeTeams = findTeamMatches(before, fifaTeamAssets)
    const afterTeams = findTeamMatches(after, fifaTeamAssets)
    const home = beforeTeams.at(-1)?.team
    const away = afterTeams[0]?.team

    if (home && away && home.name !== away.name) {
      return [home, away]
    }
  }

  return []
}

function compactVersusPairs(text: string) {
  const compactText = text.replace(/[^a-z0-9]/g, '')
  const pairs: { index: number; teams: [TeamAsset, TeamAsset] }[] = []

  for (const first of fifaTeamAssets) {
    for (const second of fifaTeamAssets) {
      if (first.name === second.name) continue

      for (const firstAlias of first.aliases) {
        const compactFirst = normalizeText(firstAlias).replace(/[^a-z0-9]/g, '')
        if (!compactFirst) continue

        for (const secondAlias of second.aliases) {
          const compactSecond = normalizeText(secondAlias).replace(/[^a-z0-9]/g, '')
          const needle = compactSecond ? `${compactFirst}vs${compactSecond}` : ''
          const index = needle ? compactText.indexOf(needle) : -1

          if (index >= 0) pairs.push({ index, teams: [first, second] })
        }
      }
    }
  }

  return pairs.sort((a, b) => a.index - b.index)
}

function versusTeams(text: string) {
  const compactPair = compactVersusPairs(text)[0]
  if (compactPair) return compactPair.teams

  const matches = findTeamMatches(text, fifaTeamAssets)

  for (let index = 0; index < matches.length - 1; index += 1) {
    const first = matches[index]
    const second = matches[index + 1]
    const between = text.slice(first.index + first.length, second.index).replace(/[^a-z0-9]/g, '')

    if (['v', 'vs', 'versus'].includes(between) && first.team.name !== second.team.name) {
      return [first.team, second.team]
    }
  }

  return []
}

function fixtureTeams(text: string) {
  const compactPairs = compactVersusPairs(text)
  if (!compactPairs.length) return []

  const seen = new Set<string>()
  return compactPairs
    .flatMap((pair) => pair.teams)
    .filter((team) => {
      if (seen.has(team.name)) return false
      seen.add(team.name)
      return true
    })
}

export function inferCategory(text = '') {
  const normalized = normalizeText(text)
  if (/(nba|knicks|spurs|basketball|nba finals)/i.test(normalized)) return 'NBA Finals 2026'
  if (/(f1|formula|grand prix|race|ferrari|hamilton)/i.test(normalized)) return 'Formula 1'
  if (/(fifa|world cup|football|soccer|usa|paraguay|mexico|brazil|canada|qatar|germany|ghana|haiti|italy|japan|scotland|spain|france|senegal|belgium|argentina|algeria|portugal|congo|uruguay|cape verde|curacao|morocco|croatia|netherlands|nigeria)/i.test(normalized)) return 'FIFA World Cup 2026'
  if (/(ipl|cricket)/i.test(normalized)) return 'Cricket'
  return 'Roar Arena'
}

export function inferPostType(text = '') {
  const normalized = normalizeText(text)
  if (/(result|full time|final score|defeats|beats|wins|win|won|draw|[0-9]\s*[-\u2013\u2014]\s*[0-9])/i.test(normalized)) return 'Result'
  if (/(fixture|fixtures|today'?s matches|schedule|lineup)/i.test(normalized)) return 'Fixtures'
  if (/(preview|up next|watch|vs|versus)/i.test(normalized)) return 'Preview'
  return 'Announcement'
}

export function inferLeagueLogo(category: string) {
  return resolveLeagueLogo(category)
}

export function inferTeams(text = '', category = '') {
  const normalized = normalizeText(`${category} ${text}`)
  const isNba = /(nba|basketball|knicks|spurs)/i.test(normalized)
  const isFormula = /(formula|f1|grand prix|motorsport|ferrari|hamilton)/i.test(normalized)
  const isFifa = /(fifa|world cup|football|soccer)/i.test(normalized)
  const isFixture = /(fixture|fixtures|lineup|schedule|today'?s matches)/i.test(normalized)

  if (isFormula) {
    const formulaMatches = uniqueTeams(findTeamMatches(normalized, formulaTeamAssets))
    if (formulaMatches.length) return formulaMatches
  }

  if (isNba) {
    const nbaMatches = uniqueTeams(findTeamMatches(normalized, nbaTeamAssets))
    if (nbaMatches.length) return nbaMatches
  }

  const fixtureMatches = isFixture ? fixtureTeams(normalized) : []
  if (fixtureMatches.length) return fixtureMatches.slice(0, 8)

  const versusMatches = versusTeams(normalized)
  if (versusMatches.length) return versusMatches

  const scoreMatches = scorelineTeams(normalized)
  if (scoreMatches.length) return scoreMatches

  const fifaMatches = uniqueTeams(findTeamMatches(normalized, fifaTeamAssets))
  if (isFifa && fifaMatches.length) return fifaMatches.slice(0, 2)

  return uniqueTeams(findTeamMatches(normalized, teamAssets)).slice(0, 4)
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
