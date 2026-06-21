'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Facebook,
  Flame,
  Instagram,
  MessageCircle,
  Radio,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from '@/components/ui/icon-set'
import AssetLogo from '@/components/brand/asset-logo'
import BrandLogo from '@/components/brand/brand-logo'
import TeamLogo from '@/components/brand/team-logo'
import PostModal from '@/components/home/post-modal'
import { usePublicHome, type PublicHomePayload } from '@/components/hooks/use-public-home'
import type { ArenaMatch } from '@/lib/data/arena-live-data'
import { siteConfig, type ArenaPost } from '@/lib/config/site-data'

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
}

type PostLike = {
  id: string
  title: string
  category: string
  type: string
  description?: string
  image: string
  logo?: string
  teams?: { name: string; logo?: string }[]
  caption?: string
  permalink?: string
  timestamp?: string
}

function toModalPost(post: PostLike): ArenaPost {
  return {
    id: post.id,
    title: post.title,
    category: post.category,
    type: post.type,
    description: post.description || post.caption || 'Latest Roar Arena update.',
    image: post.image,
    logo: post.logo || '/logos/logo-icon-dark-transparent.png',
    teams: post.teams?.map((team) => ({ name: team.name, logo: team.logo || '' })) || [],
    caption: post.caption || post.description || 'Open this update to read the full Roar Arena post context.',
    permalink: post.permalink,
    timestamp: post.timestamp,
  }
}

type FilterKey = 'all' | 'live' | 'upcoming' | 'final'

const LIVE_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'final', label: 'Results' },
  { key: 'live', label: 'Live' },
  { key: 'all', label: 'All' },
]

type LogoFrame = 'default' | 'clear' | 'dark-chip' | 'light-chip' | undefined

function clearLogoClass(frame: LogoFrame, clearClass: string, defaultClass: string) {
  return frame === 'clear' ? clearClass : defaultClass
}

function clearLogoImgClass(frame: LogoFrame, defaultClass = '') {
  return frame === 'clear' ? 'scale-95' : defaultClass
}

function statusTone(status?: ArenaMatch['status']) {
  if (status === 'live') return 'border-red-400 bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.35)]'
  if (status === 'final') return 'border-primary bg-primary text-primary-foreground shadow-soft-glow'
  return 'border-border bg-surface text-foreground'
}

function statusLabel(status?: ArenaMatch['status']) {
  if (status === 'live') return 'Live now'
  if (status === 'final') return 'Result'
  return 'Upcoming'
}

function scoreText(match: ArenaMatch) {
  const hasScore = typeof match.homeScore === 'number' || typeof match.awayScore === 'number'
  if (!hasScore) return 'VS'
  return `${match.homeScore ?? '-'}:${match.awayScore ?? '-'}`
}

function matchTimeValue(match: ArenaMatch) {
  const parsed = match.kickoffIso ? Date.parse(match.kickoffIso) : Number.NaN
  return Number.isFinite(parsed) ? parsed : 0
}

function winnerText(match: ArenaMatch) {
  if (match.status !== 'final') return match.dateLabel
  if (match.winner === 'home') return `${match.home.name} won`
  if (match.winner === 'away') return `${match.away.name} won`
  if (match.winner === 'draw') return 'Draw'
  return 'Final result'
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[clamp(2.1rem,5.7vw,4.4rem)] uppercase leading-[0.98] text-foreground text-balance">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{body}</p>
    </div>
  )
}

function LivePill({ status }: { status?: ArenaMatch['status'] }) {
  const isLive = status === 'live'
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${statusTone(status)}`}>
      <span className="relative flex h-2.5 w-2.5">
        {isLive ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" /> : null}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isLive ? 'bg-white' : 'bg-primary'}`} />
      </span>
      {statusLabel(status)}
    </span>
  )
}

function MatchTeam({ match, side, size = 'regular' }: { match: ArenaMatch; side: 'home' | 'away'; size?: 'regular' | 'hero' }) {
  const team = match[side]
  const isWinner = match.winner === side
  const isLoser = match.status === 'final' && match.winner && match.winner !== 'draw' && !isWinner
  const logoSize = size === 'hero' ? 'h-16 w-16 sm:h-24 sm:w-24 lg:h-28 lg:w-28' : 'h-16 w-16 sm:h-24 sm:w-24'

  return (
    <div className={`min-w-0 text-center transition-opacity duration-300 ${isLoser ? 'opacity-60' : 'opacity-100'}`}>
      <div className="relative inline-block">
        <TeamLogo src={team.logo} alt={`${team.name} logo`} className={`mx-auto rounded-[1rem] p-2 ${logoSize}`} />
        {isWinner ? (
          <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-glow">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 truncate text-xs font-black uppercase text-foreground sm:text-sm">{team.short || team.name}</p>
      <p className="mt-1 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">{team.name}</p>
    </div>
  )
}

function MatchScoreBlock({ match, large = false }: { match: ArenaMatch; large?: boolean }) {
  const isLive = match.status === 'live'
  const sizeClass = large
    ? 'min-h-20 min-w-20 sm:min-h-28 sm:min-w-28'
    : 'min-h-14 min-w-14 min-[420px]:min-h-16 min-[420px]:min-w-16 sm:min-h-20 sm:min-w-20'

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`grid place-items-center rounded-full border border-primary/40 bg-primary/10 shadow-soft-glow ${isLive ? 'animate-score-pulse' : ''} ${sizeClass}`}>
        <span className={`font-display uppercase leading-none text-primary ${large ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'}`}>{scoreText(match)}</span>
      </div>
      {match.winner === 'draw' ? (
        <span className="mt-2 rounded-full bg-surface px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">Draw</span>
      ) : null}
    </div>
  )
}

function MatchDetailsModal({ match, onClose }: { match: ArenaMatch | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {match ? (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-black/80 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${match.home.name} vs ${match.away.name} details`}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-border bg-card p-5 shadow-soft-glow sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/20 blur-3xl sm:h-72 sm:w-72" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <LivePill status={match.status} />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-primary">{match.league}</p>
                <h3 className="mt-2 font-display text-[clamp(2rem,6vw,4rem)] uppercase leading-none text-foreground text-balance">
                  {match.home.name} vs {match.away.name}
                </h3>
              </div>
              <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface text-foreground" aria-label="Close match details">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-[1.6rem] border border-border bg-background/55 p-3 min-[420px]:gap-3 sm:gap-5 sm:p-5">
              <MatchTeam match={match} side="home" size="hero" />
              <MatchScoreBlock match={match} large />
              <MatchTeam match={match} side="away" size="hero" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Story', value: winnerText(match), icon: Trophy },
                { label: 'Kickoff', value: match.status === 'final' ? 'Full time' : match.timeLabel, icon: Clock3 },
                { label: 'Venue', value: match.venue || 'TBA', icon: CalendarDays },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-background/65 p-4">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"><item.icon className="h-3.5 w-3.5" /> {item.label}</p>
                  <p className="mt-2 text-sm font-black text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              This card is powered by the Roar Arena match layer. When football-data.org and Supabase are connected, fixtures and results refresh automatically and this detail view updates with the same data.
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function MatchPoster({ match, onOpen }: { match?: ArenaMatch; onOpen: (match: ArenaMatch) => void }) {
  if (!match) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[2rem] border border-border bg-card/80 p-8 text-center shadow-soft-glow">
        <div>
          <BrandLogo variant="icon" className="mx-auto h-16 w-16 opacity-80" />
          <p className="mt-5 text-sm text-muted-foreground">Connect Supabase and the match API to activate the live board.</p>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(match)}
      className="group relative block w-full overflow-hidden rounded-[2rem] border border-border bg-card p-4 text-left shadow-soft-glow transition duration-300 hover:-translate-y-1 hover:border-primary/45 sm:p-5"
      aria-label={`Open ${match.home.name} vs ${match.away.name} details`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,75,31,0.24),transparent_34%),linear-gradient(140deg,rgba(255,255,255,0.07),transparent_32%,rgba(255,75,31,0.12))]" />
      <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(115deg,transparent_0%,transparent_48%,rgba(255,75,31,0.14)_48.2%,transparent_49%,transparent_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="relative z-10 flex items-start justify-between gap-4 rounded-[1.45rem] border border-border bg-background/55 p-4 backdrop-blur-xl">
        <div>
          <LivePill status={match.status} />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{match.league}</p>
          <h3 className="mt-2 font-display text-[clamp(2.1rem,5vw,3.9rem)] uppercase leading-none text-foreground">Matchday Board</h3>
        </div>
        <AssetLogo
          src={match.leagueLogo}
          lightSrc={match.leagueLogoLight}
          lightFrame={match.leagueLogoFrame}
          alt={`${match.league} logo`}
          variant="stage"
          tone="strong"
          className={clearLogoClass(match.leagueLogoFrame, 'h-16 w-12 shrink-0 p-0', 'h-14 w-14 shrink-0')}
          imgClassName={clearLogoImgClass(match.leagueLogoFrame)}
        />
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 min-[420px]:gap-3 sm:gap-4">
        <div className="rounded-[1.4rem] border border-border bg-background/65 p-3 text-center backdrop-blur-xl sm:p-4">
          <MatchTeam match={match} side="home" size="hero" />
        </div>
        <MatchScoreBlock match={match} large />
        <div className="rounded-[1.4rem] border border-border bg-background/65 p-3 text-center backdrop-blur-xl sm:p-4">
          <MatchTeam match={match} side="away" size="hero" />
        </div>
      </div>

      <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Story', value: winnerText(match), icon: Trophy },
          { label: 'Time', value: match.timeLabel, icon: Clock3 },
          { label: 'Venue', value: match.venue || 'TBA', icon: CalendarDays },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-background/60 p-3 backdrop-blur-xl sm:p-4">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary"><item.icon className="h-3.5 w-3.5" /> {item.label}</p>
            <p className="mt-2 truncate text-sm font-black text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-4 text-center text-[10px] font-black uppercase tracking-[0.18em] text-primary/90">Click for full match details</div>
    </button>
  )
}

function CompactMatchCard({ match, onOpen }: { match: ArenaMatch; onOpen: (match: ArenaMatch) => void }) {
  const isLive = match.status === 'live'

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(match)}
      className="group relative overflow-hidden rounded-[1.35rem] border border-border bg-card p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.08)] transition-colors duration-300 hover:border-primary/45 hover:shadow-soft-glow sm:p-5"
      aria-label={`Open ${match.home.name} vs ${match.away.name} details`}
    >
      <span className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${isLive ? 'bg-red-500' : match.status === 'final' ? 'bg-primary' : 'bg-border'}`} />
      <span className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:h-40 sm:w-40" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <LivePill status={match.status} />
          <p className="mt-3 truncate text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{match.league}</p>
        </div>
        <AssetLogo
          src={match.leagueLogo}
          lightSrc={match.leagueLogoLight}
          lightFrame={match.leagueLogoFrame}
          alt={`${match.league} logo`}
          variant="stage"
          className={clearLogoClass(match.leagueLogoFrame, 'h-12 w-9 shrink-0 p-0', 'h-11 w-11 shrink-0 rounded-xl p-1.5')}
          imgClassName={clearLogoImgClass(match.leagueLogoFrame)}
        />
      </div>

      <div className="relative mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 min-[420px]:gap-3">
        <MatchTeam match={match} side="home" />
        <MatchScoreBlock match={match} />
        <MatchTeam match={match} side="away" />
      </div>

      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="truncate font-bold">{winnerText(match)}</span>
        <span className="shrink-0 font-black text-primary">{match.status === 'final' ? match.statusLabel : match.timeLabel}</span>
      </div>
    </motion.button>
  )
}

function PostCard({ post, onOpen }: { post: PostLike; onOpen: (post: ArenaPost) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(toModalPost(post))}
      className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-border bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-soft-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-square">
        <img src={post.image} alt={post.title} className="h-full w-full object-contain transition duration-700" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-xl">
          <AssetLogo src={post.logo || '/logos/logo-icon-dark-transparent.png'} alt={`${post.category} logo`} variant="minimal" className="h-7 w-7 border-0 bg-transparent p-0" imgClassName="drop-shadow-none" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white">{post.type}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{post.category}</p>
        <h3 className="mt-2 font-display text-2xl uppercase leading-none text-foreground sm:text-3xl">{post.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.description || post.caption || 'Latest Roar Arena update.'}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary">
          Read full post <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  )
}

function HeroSection({ data, isLoading, onOpenMatch }: { data: ReturnType<typeof usePublicHome>['data']; isLoading: boolean; onOpenMatch: (match: ArenaMatch) => void }) {
  const heroMatch = data.heroMatch
  const matches = data.matches || []
  const storyCount = (data.posts || siteConfig.posts).length
  const finalCount = matches.filter((match) => match.status === 'final').length
  const upcomingCount = matches.filter((match) => match.status === 'upcoming').length
  const trustParts = siteConfig.hero.trustLine.split('. ').filter(Boolean).map((part) => part.endsWith('.') ? part : `${part}.`)

  return (
    <section id="home" className="relative overflow-hidden bg-background py-8 sm:py-10 lg:flex lg:min-h-[calc(100svh-64px)] lg:items-center lg:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,75,31,0.24),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(255,75,31,0.13),transparent_32%),linear-gradient(130deg,transparent_0%,transparent_46%,rgba(255,75,31,0.10)_46.2%,transparent_46.7%,transparent_100%)]" />
      <div className="absolute inset-0 opacity-[0.065] [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="grid items-center gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
          <div>
            <motion.div variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5" /> {siteConfig.hero.eyebrow}
            </motion.div>
            <motion.h1 variants={reveal} className="mt-5 max-w-2xl break-words font-display text-[clamp(2.15rem,11vw,3.2rem)] uppercase leading-[0.94] text-foreground text-balance sm:text-[clamp(2.8rem,7.2vw,5.7rem)]">
              {siteConfig.hero.headline}
            </motion.h1>
            <motion.p variants={reveal} className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {siteConfig.hero.subheadline}
              <span className="mt-3 block">{siteConfig.hero.support}</span>
              <span className="mt-3 block font-black text-foreground">
                {trustParts.map((part) => (
                  <span key={part} className="block sm:inline">{part} </span>
                ))}
              </span>
            </motion.p>

            <motion.div variants={reveal} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={siteConfig.links.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground shadow-soft-glow transition hover:-translate-y-0.5 hover:shadow-glow sm:w-auto">
                <MessageCircle className="h-4 w-4" /> {siteConfig.hero.primaryCta}
              </a>
              <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface/70 px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-foreground backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/50 sm:w-auto">
                <Instagram className="h-4 w-4" /> {siteConfig.hero.secondaryCta}
              </a>
            </motion.div>

            <motion.div variants={reveal} className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Stories', value: storyCount, icon: Flame },
                { label: 'Results', value: finalCount, icon: Trophy },
                { label: 'Fixtures', value: upcomingCount, icon: CalendarDays },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card/76 p-4 backdrop-blur-xl">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary"><item.icon className="h-3.5 w-3.5" /> {item.label}</p>
                  <p className="mt-2 font-display text-3xl uppercase leading-none text-foreground sm:text-4xl">{isLoading ? '—' : item.value}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={reveal} transition={{ duration: 0.7 }}>
            <MatchPoster match={heroMatch} onOpen={onOpenMatch} />
          </motion.div>
        </motion.div>

        <motion.div variants={reveal} initial="hidden" animate="visible" className="mt-7 overflow-hidden rounded-full border border-border bg-surface/82 py-3 backdrop-blur-xl">
          <div className="animate-marquee-reverse flex w-max gap-6 whitespace-nowrap px-4">
            {[...siteConfig.hero.ticker, ...siteConfig.hero.ticker].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-6 text-xs font-black uppercase tracking-[0.16em] text-primary">
                <Flame className="h-3.5 w-3.5" /> {item}
                <span className="h-1 w-1 rounded-full bg-primary" />
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function LiveSection({ data, onOpenMatch }: { data: ReturnType<typeof usePublicHome>['data']; onOpenMatch: (match: ArenaMatch) => void }) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const matches = useMemo(
    () => (data.matches || []).filter((match) => !match.isHidden),
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
    const rank = (m: ArenaMatch) => (m.status === 'live' ? 0 : m.status === 'final' ? 1 : m.status === 'upcoming' ? 2 : 3)
    const ordered = [...matches].sort((a, b) => {
      const statusRank = rank(a) - rank(b)
      if (statusRank) return statusRank
      if (a.status === 'final' && b.status === 'final') return matchTimeValue(b) - matchTimeValue(a) || b.priority - a.priority
      if (a.status === 'upcoming' && b.status === 'upcoming') return matchTimeValue(a) - matchTimeValue(b) || b.priority - a.priority
      return b.priority - a.priority
    })
    return filter === 'all' ? ordered : ordered.filter((m) => m.status === filter)
  }, [matches, filter])
  const latestResult = useMemo(
    () => matches.filter((match) => match.status === 'final').sort((a, b) => matchTimeValue(b) - matchTimeValue(a) || b.priority - a.priority)[0],
    [matches],
  )
  const nextUpcoming = useMemo(
    () => matches.filter((match) => match.status === 'upcoming').sort((a, b) => matchTimeValue(a) - matchTimeValue(b) || b.priority - a.priority)[0],
    [matches],
  )
  const spotlightMatch = matches.find((match) => match.status === 'live') || latestResult || nextUpcoming || matches[0]
  const activeFilterLabel = LIVE_FILTERS.find((tab) => tab.key === filter)?.label || 'All'
  const boardStats = [
    { label: 'Live', value: counts.live, icon: Activity, helper: 'Now' },
    { label: 'Upcoming', value: counts.upcoming, icon: Zap, helper: 'Next' },
    { label: 'Results', value: counts.final, icon: Trophy, helper: 'Done' },
  ]

  return (
    <section id="matches" className="relative overflow-hidden bg-surface py-14 sm:py-20 lg:py-20">
      <div className="absolute inset-0 section-gradient" />
      <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-glow-shift sm:h-96 sm:w-96" />
      <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:h-80 sm:w-80" />
      <div className="absolute inset-0 opacity-[0.08] animate-grid-drift [background-image:linear-gradient(rgba(255,75,31,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,75,31,.24)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Live match center"
          title="Matchday command board."
          body="Fast fixtures, recent results, and community watch picks in one premium command center. Tap a match for the full story."
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-6 overflow-hidden rounded-[2rem] border border-border bg-card/90 shadow-soft-glow backdrop-blur-xl"
        >
          <div className="relative grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-live-scan bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <span className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-primary/15 blur-3xl sm:h-72 sm:w-72" />
            <div className="relative p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary shadow-[0_0_28px_rgba(255,75,31,0.12)]">
                  <Radio className="h-3.5 w-3.5" /> Auto-updating board
                </span>
                <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  Showing {activeFilterLabel}
                </span>
              </div>
              {spotlightMatch ? (
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <AssetLogo
                    src={spotlightMatch.leagueLogo}
                    lightSrc={spotlightMatch.leagueLogoLight}
                    lightFrame={spotlightMatch.leagueLogoFrame}
                    alt={`${spotlightMatch.league} logo`}
                    variant="stage"
                    tone="strong"
                    className={clearLogoClass(
                      spotlightMatch.leagueLogoFrame,
                      'h-28 w-20 p-0 sm:h-32 sm:w-24',
                      'h-24 w-24 rounded-[1.5rem] sm:h-28 sm:w-28',
                    )}
                    imgClassName={clearLogoImgClass(spotlightMatch.leagueLogoFrame, 'scale-105')}
                  />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{spotlightMatch.league}</p>
                </div>
              ) : null}
              <h3 className="mt-5 font-display text-[clamp(2.15rem,5.4vw,4.8rem)] uppercase leading-[0.9] text-foreground">
                {spotlightMatch ? `${spotlightMatch.home.short || spotlightMatch.home.name} vs ${spotlightMatch.away.short || spotlightMatch.away.name}` : 'Connect the match feed'}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {spotlightMatch ? `${winnerText(spotlightMatch)} • ${spotlightMatch.timeLabel} • ${spotlightMatch.venue || 'Venue TBA'}` : 'Once matches sync, this panel highlights the next best fixture automatically.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {spotlightMatch ? (
                  [
                    { label: 'Day', value: spotlightMatch.dateLabel, icon: CalendarDays },
                    { label: 'Kickoff', value: spotlightMatch.timeLabel, icon: Clock3 },
                    { label: 'Story', value: winnerText(spotlightMatch), icon: Trophy },
                  ].map((item) => (
                    <span key={item.label} className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-foreground backdrop-blur-xl">
                      <item.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="truncate">{item.value}</span>
                    </span>
                  ))
                ) : null}
              </div>
              {spotlightMatch ? (
                <button
                  type="button"
                  onClick={() => onOpenMatch(spotlightMatch)}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-black uppercase tracking-[0.13em] text-primary-foreground shadow-soft-glow transition hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Open spotlight match <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="relative grid gap-3 border-t border-border bg-background/70 p-4 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:p-5">
              {boardStats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-[1.35rem] border border-border bg-card/86 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/40"
                >
                  <span className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100 sm:h-28 sm:w-28" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{item.helper}</p>
                      <p className="font-display text-4xl uppercase leading-none text-foreground">{item.value}</p>
                    </div>
                  </div>
                  <p className="relative mt-3 text-xs font-black uppercase tracking-[0.16em] text-primary">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {latestResult ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="mb-6 overflow-hidden rounded-[1.45rem] border border-border bg-background/80 p-4 shadow-[0_16px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Latest result pulse</p>
                <p className="mt-1 text-sm font-black text-foreground">{latestResult.home.name} {scoreText(latestResult)} {latestResult.away.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">{latestResult.statusLabel}</span>
                <p className="text-xs font-bold text-muted-foreground">{winnerText(latestResult)}</p>
              </div>
            </div>
          </motion.div>
        ) : null}

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {LIVE_FILTERS.map((tab) => {
            const active = filter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                aria-pressed={active}
                className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-colors ${
                  active ? 'border-primary/50 text-primary-foreground shadow-soft-glow' : 'border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="live-filter-pill"
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
              visible.map((match) => <CompactMatchCard key={match.id} match={match} onOpen={onOpenMatch} />)
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground"
              >
                No {filter === 'all' ? '' : filter} matches right now. Run the match sync to populate this board.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function UpdatesSection({ data, onOpenPost }: { data: ReturnType<typeof usePublicHome>['data']; onOpenPost: (post: ArenaPost) => void }) {
  const posts = ((data.posts || []) as PostLike[]).slice(0, 6)

  return (
    <section id="updates" className="relative bg-background py-14 sm:py-20 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Latest from the arena"
          title="Match updates live now."
          body="Match results, upcoming fixtures, big moments, and sports stories from the Roar Arena feed. Tap any post to read the full caption without leaving the site."
        />
        {posts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <PostCard key={post.id} post={post} onOpen={onOpenPost} />)}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-border bg-card p-6 text-center shadow-soft-glow">
            <p className="text-sm font-bold text-muted-foreground">Live posts are syncing. Latest database content will appear here as soon as it is available.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function BuildingSection() {
  const icons = [Radio, MessageCircle, Users, Trophy]
  const cards = siteConfig.features.map((feature, index) => ({
    ...feature,
    icon: icons[index] || Sparkles,
  }))
  const pathway = [
    { label: 'Follow', body: 'Get fixtures and results', icon: Bell },
    { label: 'Pick', body: 'Choose the match night', icon: CalendarDays },
    { label: 'Gather', body: 'Bring the fan group', icon: Users },
    { label: 'Roar', body: 'Show up when events open', icon: Trophy },
  ]

  return (
    <section id="building" className="relative overflow-hidden bg-background py-14 sm:py-20 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="absolute left-1/2 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start xl:gap-8">
          <div className="rounded-[2rem] border border-border bg-card/70 p-5 shadow-soft-glow backdrop-blur-xl sm:p-7 lg:sticky lg:top-24">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">What we are building</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4.8vw,4.2rem)] uppercase leading-[0.96] text-foreground text-balance">Built for fans who do not want to watch alone.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Roar Arena is creating a new kind of sports fan space: one where match nights feel louder, bigger, and more connected. We are starting with digital match updates and community content, then growing into live screenings, fan meetups, tournaments, and city-based sports events.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {siteConfig.hero.badges.map((badge) => (
                <span key={badge} className="rounded-full border border-border bg-background px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">{badge}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((card) => (
                <div key={card.title} className="group relative min-h-[210px] overflow-hidden rounded-[1.7rem] border border-border bg-card p-5 shadow-soft-glow transition duration-300 hover:-translate-y-1 hover:border-primary/45 sm:p-6">
                  <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100 sm:h-48 sm:w-48" />
                  <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="relative mt-5 font-display text-[clamp(1.5rem,2.35vw,2.1rem)] uppercase leading-[0.94] text-foreground text-balance">{card.title}</h3>
                  <p className="relative mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-[1.7rem] border border-border bg-card p-3 shadow-soft-glow sm:p-4"
            >
              <div className="absolute inset-x-8 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent lg:block" />
              <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pathway.map((step, index) => (
                  <div key={step.label} className="group relative rounded-[1.25rem] border border-border bg-background p-4 pt-8 transition duration-300 hover:-translate-y-1 hover:border-primary/45">
                    <span className="absolute left-4 top-2 rounded-full border border-primary/30 bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-primary-foreground">0{index + 1}</span>
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <p className="mt-4 font-display text-2xl uppercase leading-none text-foreground">{step.label}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{step.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EventsSection() {
  const marqueeSports = siteConfig.sports
  const spotlightEvents = siteConfig.futureEvents.slice(0, 4)
  const communityEvents = siteConfig.futureEvents.slice(4)

  return (
    <section id="events" className="relative overflow-hidden bg-surface py-14 sm:py-20 lg:py-20">
      <div className="absolute inset-0 section-gradient" />
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-glow-shift sm:h-96 sm:w-96" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Live events coming soon"
          title={siteConfig.brand.campaignLine}
          body="We are preparing our first Roar Arena fan experiences. Expect live screenings, sports watch parties, fan meetups, and local sports events soon."
        />

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {spotlightEvents.map((event, index) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.38, delay: index * 0.06 }}
              className="group relative min-h-[280px] overflow-hidden rounded-[1.85rem] border border-border bg-card p-5 shadow-soft-glow transition duration-300 hover:-translate-y-1.5 hover:border-primary/45"
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,75,31,0.2),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
              <span className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 sm:h-44 sm:w-44" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <AssetLogo
                    src={event.logo}
                    lightSrc={event.lightLogo}
                    lightFrame={event.logoFrame}
                    alt={`${event.title} logo`}
                    variant="stage"
                    tone="strong"
                    className={clearLogoClass(event.logoFrame, 'h-32 w-24 p-0', 'h-28 w-28 rounded-[1.45rem] p-2')}
                    imgClassName={clearLogoImgClass(event.logoFrame, 'scale-110')}
                  />
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">{event.tag}</span>
                </div>
                <div className="mt-auto max-w-full pt-8">
                  <h3 className="max-w-full break-words font-display text-[clamp(2rem,2.45vw,2.55rem)] uppercase leading-[0.92] text-foreground text-balance [overflow-wrap:anywhere]">{event.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{event.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative mb-8 overflow-hidden rounded-[1.5rem] border border-border bg-card/90 py-4 shadow-soft-glow backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-[linear-gradient(90deg,var(--card),transparent)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-[linear-gradient(270deg,var(--card),transparent)]" />
          <div className="animate-league-rail flex w-max gap-4 px-4">
            {[0, 1].map((loop) => (
              <div key={loop} className="flex shrink-0 gap-4" aria-hidden={loop === 1}>
                {marqueeSports.map((sport) => (
                  <div key={`${sport.name}-${loop}`} className="flex min-w-[250px] items-center gap-3 rounded-2xl border border-border bg-background/86 px-4 py-3 backdrop-blur-xl">
                    <AssetLogo
                      src={sport.logo}
                      lightSrc={sport.lightLogo}
                      lightFrame={sport.logoFrame}
                      alt={`${sport.name} logo`}
                      variant="stage"
                      className={clearLogoClass(sport.logoFrame, 'h-14 w-11 p-0', 'h-14 w-14 rounded-xl p-1.5')}
                      imgClassName={clearLogoImgClass(sport.logoFrame, 'scale-105')}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{sport.label}</p>
                      <p className="truncate text-xs font-black uppercase text-foreground">{sport.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-2">
          {communityEvents.map((event, index) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="group relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-soft-glow"
            >
              <span className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100 sm:h-32 sm:w-32" />
              <div className="relative flex items-center gap-4">
                <AssetLogo
                  src={event.logo}
                  lightSrc={event.lightLogo}
                  lightFrame={event.logoFrame}
                  alt={`${event.title} logo`}
                  variant="stage"
                  tone="strong"
                  className={clearLogoClass(event.logoFrame, 'h-16 w-12 shrink-0 p-0', 'h-16 w-16 rounded-[1.2rem] p-2')}
                  imgClassName={clearLogoImgClass(event.logoFrame, 'scale-105')}
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{event.tag}</p>
                  <h3 className="mt-1 text-sm font-black uppercase text-foreground">{event.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{event.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
          <div className="rounded-[1.5rem] border border-border bg-card/86 p-5 shadow-soft-glow">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Stay close</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Join the community now. First screening drops, local meetups, and watch-party calls will land there before anywhere else.</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <a href={siteConfig.links.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground shadow-soft-glow transition hover:-translate-y-0.5 hover:shadow-glow">
            <Bell className="h-4 w-4" /> Get event updates
          </a>
        </div>
      </div>
    </section>
  )
}

function CommunitySection() {
  const links = [
    { label: 'Match updates', body: 'Results and upcoming fixture alerts', href: siteConfig.links.whatsappCommunity, icon: CalendarDays },
    { label: 'Fan reactions', body: 'Stories, edits, and matchday energy', href: siteConfig.links.instagram, icon: Instagram },
    { label: 'Facebook crowd', body: 'Roar Arena posts and community updates', href: siteConfig.links.facebook, icon: Facebook },
    { label: 'Event drops', body: 'First screening and watch-party updates', href: siteConfig.links.whatsappCommunity, icon: Bell },
    { label: 'Fast takes', body: '@RoarArenaIndia on X', href: siteConfig.links.x, icon: Zap },
    { label: 'WhatsApp channel', body: 'Channel alerts and matchday updates', href: 'https://whatsapp.com/channel/0029Vb8bGxc7oQhX9QvoPG1R', icon: MessageCircle },
  ]

  return (
    <section id="community" className="relative overflow-hidden bg-background py-14 sm:py-20 lg:py-20">
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:h-80 sm:w-80" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card p-4 shadow-soft-glow sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Community</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5.8vw,4.8rem)] uppercase leading-[0.98] text-foreground">Not just fans. A whole arena.</h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">Roar Arena is starting with a community of fans who want better match nights, sharper updates, and real sports energy.</p>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {links.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="group min-w-0 overflow-hidden rounded-[1.5rem] border border-border bg-background/70 p-4 transition hover:-translate-y-1 hover:border-primary/45 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><link.icon className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="font-black uppercase text-foreground">{link.label}</p>
                      <p className="truncate text-sm text-muted-foreground">{link.body}</p>
                    </div>
                    <ArrowRight className="ml-auto hidden h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1 min-[420px]:block" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalSection() {
  return (
    <section className="relative overflow-hidden bg-background py-14 sm:py-20 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,75,31,0.2),transparent_32%)]" />
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <BrandLogo variant="icon" className="mx-auto h-20 w-20" />
        <h2 className="mt-6 font-display text-[clamp(2.6rem,8vw,5.8rem)] uppercase leading-[0.95] text-foreground">Your next match night should not be quiet.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Join Roar Arena now and be part of the community before our first live screenings and fan events go live.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={siteConfig.links.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground shadow-soft-glow transition hover:-translate-y-0.5 hover:shadow-glow">
            <MessageCircle className="h-4 w-4" /> Join the community
          </a>
          <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-foreground transition hover:-translate-y-0.5 hover:border-primary/50">
            <Instagram className="h-4 w-4" /> Follow Instagram
          </a>
        </div>
      </div>
    </section>
  )
}

export default function HomeExperience({ initialData }: { initialData?: PublicHomePayload }) {
  const { data, isLoading } = usePublicHome(initialData)
  const [selectedMatch, setSelectedMatch] = useState<ArenaMatch | null>(null)
  const [selectedPost, setSelectedPost] = useState<ArenaPost | null>(null)

  return (
    <>
      <HeroSection data={data} isLoading={isLoading} onOpenMatch={setSelectedMatch} />
      <UpdatesSection data={data} onOpenPost={setSelectedPost} />
      <LiveSection data={data} onOpenMatch={setSelectedMatch} />
      <BuildingSection />
      <EventsSection />
      <CommunitySection />
      <FinalSection />
      <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      {selectedPost ? <PostModal isOpen={Boolean(selectedPost)} onClose={() => setSelectedPost(null)} post={selectedPost} /> : null}
    </>
  )
}
