'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from '@/components/icon-set'
import AssetLogo from '@/components/asset-logo'
import { siteConfig } from '@/lib/site-data'

export default function FutureEvents() {
  return (
    <section id="events" className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-0 section-gradient opacity-70" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Coming soon</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl">Future event drops</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground md:text-right">
            Watch nights, screenings, race weekends, and local tournaments. Built city by city.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {siteConfig.futureEvents.map((event, index) => (
            <motion.article
              key={event.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative flex min-h-[350px] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card p-5 transition duration-300 hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-soft-glow"
            >
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/20" />
              <div className="relative z-10 flex items-center justify-between gap-3">
                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">Coming soon</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </div>

              <AssetLogo
                src={event.logo}
                alt={`${event.title} logo`}
                className="relative z-10 mt-6 h-28 w-28 rounded-[1.5rem] border-primary/15 bg-black/35 p-1.5 transition group-hover:border-primary/45"
                imgClassName="scale-110"
              />

              <p className="relative z-10 mt-6 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{event.tag}</p>
              <h3 className="relative z-10 mt-3 font-display text-4xl uppercase leading-[0.9] text-foreground">{event.title}</h3>
              <p className="relative z-10 mt-4 flex-1 text-sm leading-6 text-muted-foreground">{event.description}</p>
              <a href={siteConfig.links.whatsappChannel} target="_blank" rel="noopener noreferrer" className="relative z-10 mt-6 rounded-2xl border border-border bg-surface px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-foreground transition hover:border-primary/50 hover:text-primary">
                Notify me
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
