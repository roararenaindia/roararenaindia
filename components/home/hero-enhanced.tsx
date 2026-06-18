'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Flame, MessageCircle, Play, Radio, ShieldCheck, Sparkles, Zap } from '@/components/ui/icon-set'
import AssetLogo from '@/components/brand/asset-logo'
import BrandLogo from '@/components/brand/brand-logo'
import TeamLogo from '@/components/brand/team-logo'
import { usePublicHome } from '@/components/hooks/use-public-home'
import type { ArenaMatch } from '@/lib/data/arena-live-data'
import { siteConfig } from '@/lib/config/site-data'

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const statusCopy = {
  live: 'Live now',
  final: 'Result locked',
  upcoming: 'Up next',
} as const

function LiveDot({ status }: { status?: 'live' | 'final' | 'upcoming' }) {
  const isLive = status === 'live'

  return (
    <span className="relative flex h-3 w-3">
      <span className={`absolute inline-flex h-full w-full rounded-full ${isLive ? 'animate-ping bg-red-500 opacity-75' : 'bg-primary/30'}`} />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${isLive ? 'bg-red-500' : 'bg-primary'}`} />
    </span>
  )
}

function MatchScore({ match }: { match?: ArenaMatch }) {
  if (!match) return null

  const hasScore = typeof match.homeScore === 'number' || typeof match.awayScore === 'number'

  if (hasScore) {
    return (
      <div className="text-center">
        <p className="font-display text-[clamp(3.4rem,11vw,6.8rem)] uppercase leading-none text-primary drop-shadow-[0_0_28px_rgba(255,75,31,0.35)]">
          {match.homeScore ?? '-'}<span className="mx-2 text-foreground">:</span>{match.awayScore ?? '-'}
        </p>
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">{match.statusLabel}</p>
      </div>
    )
  }

  return (
    <div className="grid place-items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full border border-primary/45 bg-primary/10 font-display text-2xl text-primary shadow-soft-glow sm:h-20 sm:w-20 sm:text-3xl">
        VS
      </div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">{match.timeLabel}</p>
    </div>
  )
}

function TeamCard({ name, logo, short, align = 'left' }: { name: string; logo: string; short?: string; align?: 'left' | 'right' }) {
  return (
    <div className="min-w-0 rounded-[1.45rem] border border-border bg-background/58 p-3 text-center shadow-soft-glow backdrop-blur-xl sm:rounded-[1.75rem] sm:p-4">
      <TeamLogo src={logo} alt={`${name} logo`} className="mx-auto h-20 w-20 rounded-[1.15rem] sm:h-28 sm:w-28" />
      <p className="mt-3 truncate text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">{short || (align === 'left' ? 'Home' : 'Away')}</p>
      <h3 className="mt-1 truncate font-display text-2xl uppercase leading-none text-foreground sm:text-4xl">{name}</h3>
    </div>
  )
}

function LiveMatchBoard() {
  const { data, isLoading } = usePublicHome()
  const match = data.heroMatch as ArenaMatch | undefined
  const matches = (data.matches || []) as ArenaMatch[]
  const sideMatches = matches.filter((item: ArenaMatch) => item.id !== match?.id).slice(0, 3)

  return (
    <motion.div
      variants={reveal}
      transition={{ duration: 0.6, delay: 0.12 }}
      className="relative overflow-hidden rounded-[2rem] border border-border bg-card/92 p-4 shadow-soft-glow backdrop-blur-2xl sm:p-5 lg:p-6"
    >
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_42%,rgba(255,75,31,0.14)_42.2%,transparent_42.7%,transparent_100%)]" />

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <LiveDot status={match?.status} /> {match ? statusCopy[match.status as keyof typeof statusCopy] : isLoading ? 'Loading live data' : 'Fallback mode'}
          </span>
          <h2 className="mt-4 truncate text-sm font-black uppercase tracking-[0.22em] text-muted-foreground">{match?.league || 'Roar Arena'}</h2>
          <p className="mt-2 font-display text-4xl uppercase leading-none text-foreground sm:text-5xl">Matchday HQ</p>
        </div>
        <div className="flex items-center gap-2">
          {match?.leagueLogo ? <AssetLogo src={match.leagueLogo} alt={`${match.league} logo`} className="h-14 w-14 rounded-2xl bg-black/30 p-1.5" /> : null}
          <BrandLogo variant="icon" className="h-14 w-14 opacity-95" />
        </div>
      </div>

      {match ? (
        <div className="relative z-10 mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          <TeamCard name={match.home.name} short={match.home.short} logo={match.home.logo} align="left" />
          <MatchScore match={match} />
          <TeamCard name={match.away.name} short={match.away.short} logo={match.away.logo} align="right" />
        </div>
      ) : (
        <div className="relative z-10 mt-7 grid min-h-[280px] place-items-center rounded-[1.6rem] border border-border bg-background/55 text-center text-sm text-muted-foreground">
          Live data will appear here after Supabase is connected.
        </div>
      )}

      <div className="relative z-10 mt-5 grid gap-3 rounded-[1.5rem] border border-border bg-background/45 p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Date</p>
          <p className="mt-1 font-bold text-foreground">{match?.dateLabel || 'Auto sync'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Venue</p>
          <p className="mt-1 truncate font-bold text-foreground">{match?.venue || 'Live source'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Source</p>
          <p className="mt-1 font-bold text-primary">{data.source || 'checking'}</p>
        </div>
      </div>

      <div className="relative z-10 mt-4 grid gap-2">
        {sideMatches.map((item) => (
          <div key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border bg-surface/70 px-3 py-3">
            <AssetLogo src={item.leagueLogo} alt={`${item.league} logo`} className="h-10 w-10 shrink-0 rounded-xl bg-black/25 p-1" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground">{item.home.short || item.home.name} vs {item.away.short || item.away.name}</p>
              <p className="truncate text-xs text-muted-foreground">{item.dateLabel} • {item.timeLabel}</p>
            </div>
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary">{item.status}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function HeroEnhanced() {
  const { hero } = siteConfig
  const { data } = usePublicHome()

  return (
    <section className="relative overflow-hidden hero-gradient pt-8 sm:pt-12 lg:min-h-[calc(100vh-64px)] lg:pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,75,31,0.22),transparent_34%),radial-gradient(circle_at_82%_30%,rgba(255,75,31,0.22),transparent_30%),linear-gradient(125deg,transparent_0%,transparent_44%,rgba(255,75,31,0.16)_44.2%,transparent_44.7%,transparent_100%)]" />
      <div className="absolute left-1/2 top-0 h-px w-[88vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
      <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-glow-shift" />
      <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12"
        >
          <div className="max-w-3xl">
            <motion.div variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/75 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5" /> {hero.eyebrow}
            </motion.div>

            <motion.h1
              variants={reveal}
              transition={{ duration: 0.7 }}
              className="mt-6 whitespace-pre-line font-display text-[clamp(3rem,13vw,7rem)] uppercase leading-[0.88] tracking-[0.01em] text-foreground text-balance"
            >
              {hero.headline}
            </motion.h1>

            <motion.p variants={reveal} className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Live fixtures, match results, Instagram posts, and fan energy in one auto-updating sports hub built for watch parties and real crowd moments.
            </motion.p>

            <motion.div variants={reveal} className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"><Radio className="h-3.5 w-3.5" /> Matches</p>
                <p className="mt-2 font-display text-4xl uppercase leading-none text-foreground">{data.matches?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"><Flame className="h-3.5 w-3.5" /> Posts</p>
                <p className="mt-2 font-display text-4xl uppercase leading-none text-foreground">{data.posts?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"><Zap className="h-3.5 w-3.5" /> Mode</p>
                <p className="mt-2 truncate text-sm font-black uppercase text-foreground">{data.source || 'Live'}</p>
              </div>
            </motion.div>

            <motion.div variants={reveal} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={siteConfig.links.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground shadow-soft-glow transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                <MessageCircle className="h-4 w-4" /> Join the Roar
              </a>
              <a
                href={siteConfig.links.x || siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/70 px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-foreground backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <Play className="h-4 w-4" /> Follow Matchday Feed
              </a>
            </motion.div>

            <motion.div variants={reveal} className="mt-8 flex flex-wrap gap-2">
              {hero.badges.map((badge) => (
                <span key={badge} className="rounded-full border border-border bg-card/85 px-3 py-2 text-xs font-bold text-muted-foreground backdrop-blur-xl">
                  {badge}
                </span>
              ))}
            </motion.div>
          </div>

          <LiveMatchBoard />
        </motion.div>

        <motion.div variants={reveal} initial="hidden" animate="visible" className="mt-10 overflow-hidden rounded-full border border-border bg-surface/80 py-3 backdrop-blur-xl sm:mt-12">
          <div className="animate-marquee flex w-max gap-6 whitespace-nowrap px-4">
            {[...hero.ticker, ...hero.ticker].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-6 text-xs font-black uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> {item}
                <span className="h-1 w-1 rounded-full bg-primary" />
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
