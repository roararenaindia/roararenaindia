import { Instagram, Mail, MessageCircle, Send } from '@/components/icon-set'
import { siteConfig } from '@/lib/site-data'

const channels = [
  {
    label: 'Instagram',
    detail: 'Main visual feed. Post once here, sync to site.',
    href: siteConfig.links.instagram,
    icon: Instagram,
  },
  {
    label: 'X',
    detail: 'Fast reactions, match captions, and live fan energy.',
    href: siteConfig.links.x,
    icon: Send,
  },
  {
    label: 'WhatsApp Channel',
    detail: 'Community alerts, match reminders, and fan drops.',
    href: siteConfig.links.whatsappChannel,
    icon: MessageCircle,
  },
  {
    label: 'Email',
    detail: `Collaborations, venues, screenings: ${siteConfig.links.contactEmail}`,
    href: siteConfig.links.contact,
    icon: Mail,
  },
]

export default function ConnectHub() {
  return (
    <section id="connect" className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-0 section-gradient opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Connect with us</p>
          <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl lg:text-7xl">
            One arena. Every channel.
          </h2>
          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
            Follow the same Roar Arena story across Instagram, X, WhatsApp, and email. Social APIs can be connected when tokens are ready, but the public site already points fans to every official channel.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {channels.map((channel) => {
            const Icon = channel.icon
            return (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={channel.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="group rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-glow transition duration-300 hover:-translate-y-1 hover:border-primary/45"
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-4xl uppercase leading-none text-foreground">{channel.label}</h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{channel.detail}</p>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-primary">Open channel</p>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
