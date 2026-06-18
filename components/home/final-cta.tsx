import { MessageCircle, Play } from '@/components/ui/icon-set'
import { siteConfig } from '@/lib/config/site-data'

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-surface py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-0 section-gradient" />
      <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Join the roar</p>
        <h2 className="mt-4 font-display text-5xl uppercase leading-none text-foreground sm:text-7xl lg:text-8xl">Your next match night should not be quiet.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground">Join Roar Arena and be part of India’s growing sports fan experience community.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={siteConfig.links.whatsappChannel} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground shadow-soft-glow transition hover:shadow-glow">
            <MessageCircle className="h-4 w-4" /> Join WhatsApp
          </a>
          <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-foreground transition hover:border-primary/50">
            <Play className="h-4 w-4" /> Follow Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
