import type { ArenaMatch } from '@/lib/data/arena-live-data'

export type MatchSelectionInput = {
  status?: string | null
  kickoffIso?: string | null
  kickoff_time?: string | null
  priority?: number | null
  isFeatured?: boolean | null
  is_featured?: boolean | null
  isHidden?: boolean | null
  is_hidden?: boolean | null
}

const staleUpcomingGraceMs = 60 * 60 * 1000

export function normalizeMatchSelectionStatus(status?: string | null): ArenaMatch['status'] {
  const normalized = (status || '').toLowerCase()
  if (['final', 'ft', 'aet', 'pen', 'complete', 'finished'].includes(normalized)) return 'final'
  if (['live', '1h', '2h', 'ht', 'et', 'p'].includes(normalized)) return 'live'
  return 'upcoming'
}

export function matchTimeValue(match: MatchSelectionInput) {
  const value = match.kickoffIso || match.kickoff_time
  const parsed = value ? Date.parse(value) : Number.NaN
  return Number.isFinite(parsed) ? parsed : 0
}

function matchPriority(match: MatchSelectionInput) {
  return match.priority || 0
}

function isHidden(match: MatchSelectionInput) {
  return Boolean(match.isHidden || match.is_hidden)
}

function upcomingSortTime(match: MatchSelectionInput, now: number) {
  const time = matchTimeValue(match)
  if (!time) return Number.POSITIVE_INFINITY
  if (time < now - staleUpcomingGraceMs) return Number.POSITIVE_INFINITY
  return time
}

function compareUpcoming<T extends MatchSelectionInput>(a: T, b: T, now: number) {
  const aTime = upcomingSortTime(a, now)
  const bTime = upcomingSortTime(b, now)

  if (aTime !== bTime) {
    if (aTime === Number.POSITIVE_INFINITY) return 1
    if (bTime === Number.POSITIVE_INFINITY) return -1
    return aTime - bTime
  }

  return matchPriority(b) - matchPriority(a) || matchTimeValue(a) - matchTimeValue(b)
}

function compareFinal<T extends MatchSelectionInput>(a: T, b: T) {
  return matchTimeValue(b) - matchTimeValue(a) || matchPriority(b) - matchPriority(a)
}

function compareLive<T extends MatchSelectionInput>(a: T, b: T) {
  return matchPriority(b) - matchPriority(a) || matchTimeValue(a) - matchTimeValue(b)
}

function boardRank(match: MatchSelectionInput, now: number) {
  if (isHidden(match)) return 4

  const status = normalizeMatchSelectionStatus(match.status)
  if (status === 'live') return 0
  if (status === 'upcoming') return upcomingSortTime(match, now) === Number.POSITIVE_INFINITY ? 3 : 1
  if (status === 'final') return 2
  return 3
}

export function compareMatchesForBoard<T extends MatchSelectionInput>(a: T, b: T, now = Date.now()) {
  const rankDiff = boardRank(a, now) - boardRank(b, now)
  if (rankDiff) return rankDiff

  const status = normalizeMatchSelectionStatus(a.status)
  if (status === 'live') return compareLive(a, b)
  if (status === 'upcoming') return compareUpcoming(a, b, now)
  if (status === 'final') return compareFinal(a, b)
  return matchPriority(b) - matchPriority(a) || matchTimeValue(a) - matchTimeValue(b)
}

export function sortMatchesForBoard<T extends MatchSelectionInput>(matches: T[], now = Date.now()) {
  return matches.filter((match) => !isHidden(match)).sort((a, b) => compareMatchesForBoard(a, b, now))
}

export function pickPrimaryMatch<T extends MatchSelectionInput>(matches: T[], fallback?: T, now = Date.now()) {
  return sortMatchesForBoard([...matches], now)[0] || fallback
}

export function pickNextUpcoming<T extends MatchSelectionInput>(matches: T[], now = Date.now()) {
  return matches
    .filter((match) => !isHidden(match) && normalizeMatchSelectionStatus(match.status) === 'upcoming' && upcomingSortTime(match, now) !== Number.POSITIVE_INFINITY)
    .sort((a, b) => compareUpcoming(a, b, now))[0]
}

export function pickLatestResult<T extends MatchSelectionInput>(matches: T[]) {
  return matches
    .filter((match) => !isHidden(match) && normalizeMatchSelectionStatus(match.status) === 'final')
    .sort(compareFinal)[0]
}
