'use client'

import { motion } from 'framer-motion'
import { Activity, Database, Radio, ShieldCheck } from '@/components/ui/icon-set'
import AssetLogo from '@/components/brand/asset-logo'
import TeamLogo from '@/components/brand/team-logo'
import { usePublicHome } from '@/components/hooks/use-public-home'

export default function LiveCommandCentre() {
  const { data, isLoading } = usePublicHome()
  const matches = data.matches?.slice(0, 4) || []
  const heroMatch = data.heroMatch || matches[0]

  return (
    <section className="relative overflow-hidden bg-surface py-14 sm:py-16 lg:py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-primary">
              <Radio className="h-4 w-4" /> Live command centre
            </p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl">
              Auto-updating match hub
            </h2>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-muted-foreground">
            <span className="text-primary">Source:</span> {isLoading ? 'Checking...' : data.source}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-soft-glow sm:p-7"
          >
            {heroMatch ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      {heroMatch.statusLabel}
                    </span>
                    <h3 className="mt-4 font-display text-4xl uppercase leading-none text-foreground sm:text-5xl">
                      {heroMatch.league}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{heroMatch.venue}</p>
                  </div>
                  <AssetLogo src={heroMatch.leagueLogo} alt={`${heroMatch.league} logo`} className="h-16 w-16 rounded-2xl bg-black/30 p-1.5" />
                </div>

                <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                  <div className="rounded-[1.6rem] border border-border bg-surface p-4 text-center">
                    <TeamLogo src={heroMatch.home.logo} alt={`${heroMatch.home.name} logo`} className="mx-auto h-24 w-24" />
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.13em] text-muted-foreground">{heroMatch.home.short || 'Home'}</p>
                    <h4 className="mt-1 text-sm font-black uppercase text-foreground">{heroMatch.home.name}</h4>
                  </div>

                  <div className="text-center">
                    {heroMatch.status === 'final' || heroMatch.status === 'live' ? (
                      <p className="font-display text-5xl text-primary">
                        {heroMatch.homeScore ?? '-'}:{heroMatch.awayScore ?? '-'}
                      </p>
                    ) : (
                      <p className="grid h-16 w-16 place-items-center rounded-full border border-primary/40 bg-primary/10 font-display text-xl text-primary">VS</p>
                    )}
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{heroMatch.timeLabel}</p>
                  </div>

                  <div className="rounded-[1.6rem] border border-border bg-surface p-4 text-center">
                    <TeamLogo src={heroMatch.away.logo} alt={`${heroMatch.away.name} logo`} className="mx-auto h-24 w-24" />
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.13em] text-muted-foreground">{heroMatch.away.short || 'Away'}</p>
                    <h4 className="mt-1 text-sm font-black uppercase text-foreground">{heroMatch.away.name}</h4>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid min-h-[320px] place-items-center text-center text-muted-foreground">
                Connect Supabase and match sync to activate live match cards.
              </div>
            )}
          </motion.article>

          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Automation status</p>
                  <p className="text-sm text-muted-foreground">{data.database === 'connected' ? 'Supabase connected' : 'Static fallback active'}</p>
                </div>
              </div>
            </div>

            {matches.map((match) => (
              <article key={match.id} className="rounded-[1.5rem] border border-border bg-card p-4 transition hover:border-primary/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <AssetLogo src={match.leagueLogo} alt={`${match.league} logo`} className="h-11 w-11 shrink-0 rounded-xl bg-black/30 p-1" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{match.league}</p>
                      <p className="truncate text-sm font-bold text-foreground">{match.home.name} vs {match.away.name}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary">
                    {match.status}
                  </span>
                </div>
              </article>
            ))}

            <div className="rounded-[1.5rem] border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Site uses live data when available and falls back safely, so Roar Arena never looks broken.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
