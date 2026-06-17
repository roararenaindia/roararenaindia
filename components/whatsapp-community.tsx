'use client'

import BrandLogo from '@/components/brand-logo'
import { motion } from 'framer-motion'
import { MessageCircle, Send } from '@/components/icon-set'
import { siteConfig } from '@/lib/site-data'

const messages = [
  'Knicks are champions. FIFA keeps moving.',
  'Scores, fixtures, and watch chats live here.',
  "Don’t watch it alone.",
  'Join the roar.',
]

export default function WhatsAppCommunity() {
  return (
    <section id="community" className="relative overflow-hidden bg-surface py-16 sm:py-20 lg:py-28">
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Community</p>
          <h2 className="mt-3 whitespace-pre-line font-display text-5xl uppercase leading-none text-foreground sm:text-6xl lg:text-7xl">
            NOT JUST FANS.
A WHOLE ARENA.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
            Join early fans for matchday updates, predictions, watch party drops, and community chats. Big games feel different when your people are watching with you.
          </p>
          <a
            href={siteConfig.links.whatsappChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground shadow-soft-glow transition hover:shadow-glow"
          >
            <MessageCircle className="h-4 w-4" /> Join WhatsApp Channel
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mx-auto w-full max-w-md rounded-[2rem] border border-border bg-card p-3 shadow-soft-glow">
          <div className="rounded-[1.5rem] border border-border bg-background overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-surface p-4">
              <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-border bg-surface p-1"><BrandLogo variant="icon" className="h-8 w-8" /></div>
              <div>
                <p className="text-sm font-black text-foreground">Roar Arena Channel</p>
                <p className="text-xs text-muted-foreground">Matchday updates • Community drops</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              {messages.map((message, index) => (
                <motion.div key={message} initial={{ opacity: 0, x: index % 2 ? 18 : -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className={`flex ${index % 2 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-5 ${index % 2 ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-surface text-foreground border border-border'}`}>
                    {message}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border bg-surface p-3">
              <div className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">Drop your match prediction...</div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="h-4 w-4" /></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
