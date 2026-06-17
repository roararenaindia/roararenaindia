'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Activity, Radio, RefreshCw, ShieldCheck } from '@/components/icon-set'
import { liveMatches, automationStatus } from '@/lib/arena-live-data'

const statusStyles = {
  final: 'bg-primary text-primary-foreground',
  live: 'bg-red-500 text-white',
  upcoming: 'bg-surface text-foreground border border-border',
} as const

export default function LiveOpsHub() {
  const featured = liveMatches[0]
  const next = liveMatches.slice(1, 3)

  return (
    <section className="relative overflow-hidden bg-surface py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 section-gradient" />
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Live command centre</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl">Auto-updating matchday HQ</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-right">
            Built to pull Instagram posts, fixtures, results, and featured matches from one data layer instead of manually updating every section.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.06fr_0.94fr]">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-soft-glow sm:p-8"
          >
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                <Radio className="h-3.5 w-3.5" /> Featured result
              </span>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusStyles[featured.status]}`}>{featured.statusLabel}</span>
            </div>

            <div className="relative z-10 mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
              <div className="text-center">
                <div className="relative mx-auto h-28 w-28 rounded-[1.7rem] border border-border bg-background p-3 sm:h-36 sm:w-36">
                  <Image src={featured.home.logo} alt={`${featured.home.name} logo`} fill className="object-contain p-3" sizes="144px" />
                </div>
                <p className="mt-4 font-display text-4xl uppercase leading-none text-foreground">{featured.home.short || featured.home.name}</p>
              </div>

              <div className="text-center">
                <div className="font-display text-7xl uppercase leading-none text-primary sm:text-8xl">
                  {featured.homeScore}<span className="text-foreground">-</span>{featured.awayScore}
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{featured.league}</p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto h-28 w-28 rounded-[1.7rem] border border-border bg-background p-3 sm:h-36 sm:w-36">
                  <Image src={featured.away.logo} alt={`${featured.away.name} logo`} fill className="object-contain p-3" sizes="144px" />
                </div>
                <p className="mt-4 font-display text-4xl uppercase leading-none text-foreground">{featured.away.short || featured.away.name}</p>
              </div>
            </div>

            <div className="relative z-10 mt-8 grid gap-3 rounded-3xl border border-border bg-surface p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Date</p>
                <p className="mt-1 font-bold text-foreground">{featured.dateLabel}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Venue</p>
                <p className="mt-1 font-bold text-foreground">{featured.venue}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Source-ready</p>
                <p className="mt-1 font-bold text-primary">API sync prepared</p>
              </div>
            </div>
          </motion.article>

          <div className="grid gap-5">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Automation base</p>
                  <h3 className="font-display text-3xl uppercase leading-none text-foreground">Ready for sync</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {automationStatus.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-foreground">{item.title}</p>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">{item.status}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-2 text-primary">
                <Activity className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-[0.18em]">More match cards</p>
              </div>
              <div className="grid gap-3">
                {next.map((match) => (
                  <div key={match.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                    <div className="relative h-12 w-12 rounded-xl bg-background p-2">
                      <Image src={match.leagueLogo} alt={`${match.league} logo`} fill className="object-contain p-2" sizes="48px" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground">{match.home.name} vs {match.away.name}</p>
                      <p className="text-xs text-muted-foreground">{match.dateLabel} • {match.venue}</p>
                    </div>
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary">
                      {match.status === 'final' && typeof match.homeScore === 'number' ? `${match.homeScore}-${match.awayScore}` : 'Soon'}
                    </span>
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
