'use client'

import { motion } from 'framer-motion'
import { Bell, MessageCircle, Radio } from '@/components/ui/icon-set'
import TeamLogo from '@/components/brand/team-logo'
import { usePublicHome } from '@/components/hooks/use-public-home'
import { siteConfig } from '@/lib/config/site-data'

export default function FeaturedMatch() {
  const { data } = usePublicHome()
  const match = data.heroMatch || data.matches?.[0]

  if (!match) return null

  const hasScore = typeof match.homeScore === 'number' || typeof match.awayScore === 'number'

  return (
    <section id="game" className="relative overflow-hidden bg-surface py-14 sm:py-20 lg:py-24">
      <div className="absolute inset-0 section-gradient" />
      <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(135deg,transparent_0%,rgba(255,75,31,0.14)_48%,transparent_49%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-primary"><Radio className="h-4 w-4" /> Featured match</p>
          <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl lg:text-7xl">Next Big Roar</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            This card now follows the live data layer, so the featured game can be pinned from admin or updated automatically.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft-glow"
        >
          <div className="grid gap-0 lg:grid-cols-[1fr_auto_1fr]">
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="rounded-[1.6rem] border border-border bg-surface p-5 text-center sm:p-6">
                <TeamLogo src={match.home.logo} alt={`${match.home.name} logo`} className="mx-auto h-24 w-24 sm:h-32 sm:w-32" />
                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{match.home.short || 'Home'}</p>
                <h3 className="mt-2 font-display text-4xl uppercase leading-none text-foreground">{match.home.name}</h3>
              </div>
            </div>

            <div className="grid place-items-center border-y border-border px-5 py-8 lg:border-x lg:border-y-0 lg:min-w-[310px]">
              <div className="text-center">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">{match.statusLabel}</span>
                {hasScore ? (
                  <p className="mt-5 font-display text-6xl uppercase leading-none text-primary sm:text-7xl">{match.homeScore ?? '-'}:{match.awayScore ?? '-'}</p>
                ) : (
                  <p className="mt-5 font-display text-6xl uppercase leading-none text-foreground">VS</p>
                )}
                <p className="mt-3 text-sm font-bold text-muted-foreground">{match.league}</p>
                <div className="mt-6 grid gap-2 text-sm">
                  <p className="font-black text-foreground">{match.dateLabel}</p>
                  <p className="text-muted-foreground">{match.timeLabel}</p>
                  <p className="text-primary">{match.venue}</p>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <a href={siteConfig.links.whatsappChannel} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground transition hover:shadow-glow">
                    <Bell className="h-4 w-4" /> Set Reminder
                  </a>
                  <a href={siteConfig.links.whatsappChannel} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground transition hover:border-primary/50">
                    <MessageCircle className="h-4 w-4" /> Watch Chat
                  </a>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              <div className="rounded-[1.6rem] border border-border bg-surface p-5 text-center sm:p-6">
                <TeamLogo src={match.away.logo} alt={`${match.away.name} logo`} className="mx-auto h-24 w-24 sm:h-32 sm:w-32" />
                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{match.away.short || 'Away'}</p>
                <h3 className="mt-2 font-display text-4xl uppercase leading-none text-foreground">{match.away.name}</h3>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
