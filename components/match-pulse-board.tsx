'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, MapPin, Radio } from '@/components/icon-set'
import AssetLogo from '@/components/asset-logo'
import TeamLogo from '@/components/team-logo'
import { usePublicHome } from '@/components/use-public-home'
import type { ArenaMatch } from '@/lib/arena-live-data'

type FilterKey = 'all' | 'live' | 'upcoming' | 'final'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'final', label: 'Results' },
]

function matchTime(match: ArenaMatch) {
  return match.status === 'final' ? match.statusLabel : `${match.dateLabel} • ${match.timeLabel}`
}

function hasScore(match: ArenaMatch) {
  return match.status === 'final' || match.status === 'live'
}

function StatusPill({ match }: { match: ArenaMatch }) {
  if (match.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        Live
      </span>
    )
  }
  if (match.status === 'final') {
    return (
      <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
        Result
      </span>
    )
  }
  return (
    <span className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
      Fixture
    </span>
  )
}

function TeamColumn({ match, side }: { match: ArenaMatch; side: 'home' | 'away' }) {
  const team = match[side]
  const isWinner = match.winner === side
  const isLoser = hasScore(match) && match.winner && match.winner !== 'draw' && !isWinner

  return (
    <div className={`flex min-w-0 flex-col items-center text-center transition-opacity ${isLoser ? 'opacity-60' : 'opacity-100'}`}>
      <div className="relative">
        <TeamLogo
          src={team.logo}
          alt={`${team.name} logo`}
          className="h-[68px] w-[68px] rounded-2xl sm:h-20 sm:w-20"
        />
        {isWinner ? (
          <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-glow">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 line-clamp-1 text-xs font-black uppercase tracking-tight text-foreground sm:text-sm">{team.name}</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{team.short || side}</p>
    </div>
  )
}

function MatchCard({ match }: { match: ArenaMatch }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-[1.6rem] border border-border bg-card p-4 shadow-soft-glow transition-colors duration-300 hover:border-primary/45 sm:p-5"
    >
      <span className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl transition-opacity duration-300 group-hover:bg-primary/20" />

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <AssetLogo src={match.leagueLogo} alt={`${match.league} logo`} className="h-10 w-10 shrink-0 rounded-xl bg-black/35 p-1.5" />
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-primary">{match.league}</p>
            <p className="truncate text-[11px] font-bold text-muted-foreground">{matchTime(match)}</p>
          </div>
        </div>
        <StatusPill match={match} />
      </div>

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <TeamColumn match={match} side="home" />

        <div className="flex min-w-[64px] flex-col items-center px-1">
          {hasScore(match) ? (
            <p className="font-display text-3xl uppercase leading-none text-primary sm:text-4xl">
              {match.homeScore ?? '-'}
              <span className="px-1 text-muted-foreground">:</span>
              {match.awayScore ?? '-'}
            </p>
          ) : (
            <p className="font-display text-2xl uppercase leading-none text-foreground sm:text-3xl">VS</p>
          )}
          {match.winner === 'draw' ? (
            <span className="mt-1.5 rounded-full bg-surface px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">Draw</span>
          ) : null}
        </div>

        <TeamColumn match={match} side="away" />
      </div>

      {match.venue ? (
        <div className="relative mt-4 flex items-center justify-center gap-1.5 border-t border-border/60 pt-3 text-[11px] font-semibold text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary/80" />
          <span className="truncate">{match.venue}</span>
        </div>
      ) : null}
    </motion.article>
  )
}

export default function MatchPulseBoard() {
  const { data, isLoading } = usePublicHome()
  const [filter, setFilter] = useState<FilterKey>('all')

  const matches = useMemo(
    () => ((data.matches || []) as ArenaMatch[]).filter((match) => !match.isHidden),
    [data.matches],
  )

  const counts = useMemo(
    () => ({
      all: matches.length,
      live: matches.filter((m) => m.status === 'live').length,
      upcoming: matches.filter((m) => m.status === 'upcoming').length,
      final: matches.filter((m) => m.status === 'final').length,
    }),
    [matches],
  )

  const visible = useMemo(() => {
    const ordered = [...matches].sort((a, b) => {
      const rank = (m: ArenaMatch) => (m.status === 'live' ? 0 : m.status === 'upcoming' ? 1 : 2)
      return rank(a) - rank(b) || b.priority - a.priority
    })
    return filter === 'all' ? ordered : ordered.filter((m) => m.status === filter)
  }, [matches, filter])

  return (
    <section id="live" className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-primary">
              <Radio className="h-4 w-4" /> Live pulse board
            </p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl lg:text-7xl">
              Scores + schedule
            </h2>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-muted-foreground">
            {isLoading ? 'Checking live layer...' : `Source: ${data.source || 'static'}`}
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          {FILTERS.map((tab) => {
            const active = filter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                aria-pressed={active}
                className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-colors ${
                  active ? 'border-primary/50 text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="filter-pill"
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    className="absolute inset-0 -z-10 rounded-full bg-primary shadow-glow"
                  />
                ) : null}
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-black/20 text-primary-foreground' : 'bg-surface text-muted-foreground'}`}>
                  {counts[tab.key]}
                </span>
              </button>
            )
          })}
        </div>

        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.length ? (
              visible.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full rounded-[1.6rem] border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground"
              >
                No {filter === 'all' ? '' : filter} matches to show right now. Connect the match API to populate this view.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-8 flex items-start gap-3 rounded-[1.6rem] border border-border bg-card p-5 text-sm leading-6 text-muted-foreground">
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            The live board reads Supabase first. Cron refreshes match data every 30 minutes, then auto-curates the hero so the site never gets stuck on an old story. Country crests resolve from a shared logo map, so they stay correct across fixtures, results, and the featured match.
          </p>
        </div>
      </div>
    </section>
  )
}
