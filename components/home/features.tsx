'use client'

import { motion } from 'framer-motion'
import { Radio, Trophy, Users, Zap } from '@/components/ui/icon-set'
import { siteConfig } from '@/lib/config/site-data'

const icons = [Zap, Users, Radio, Trophy]

export default function Features() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">What we do</p>
          <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl">Built around the roar</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">Content, community, and offline energy working together. Not just updates. Not just events. A sports culture engine.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {siteConfig.features.map((feature, index) => {
            const Icon = icons[index]
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group rounded-[1.75rem] border border-border bg-card p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-soft-glow"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-3xl uppercase leading-none text-foreground">{feature.title}</h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                <div className="mt-7 h-px w-full bg-gradient-to-r from-primary to-transparent opacity-55" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
