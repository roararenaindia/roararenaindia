import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'
import { siteConfig } from '@/lib/site-data'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background pb-28 pt-14 md:pb-16 md:pt-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <Link href="#home" className="inline-block" aria-label="Roar Arena home">
              <BrandLogo className="h-auto w-[190px] sm:w-[230px] lg:w-[260px]" />
            </Link>
            <p className="mt-5 font-display text-4xl uppercase leading-none text-foreground sm:text-5xl">{siteConfig.brand.tagline}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{siteConfig.brand.description}</p>
            <p className="mt-4 max-w-2xl text-xs leading-6 text-muted-foreground">{siteConfig.footer.disclaimer}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Explore</h3>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                {siteConfig.navigation.map((link) => (
                  <a key={link.href} href={link.href} className="transition hover:text-primary">{link.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Connect</h3>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" className="transition hover:text-primary">Instagram</a>
                <a href={siteConfig.links.x} target="_blank" rel="noopener noreferrer" className="transition hover:text-primary">X</a>
                <a href={siteConfig.links.whatsappChannel} target="_blank" rel="noopener noreferrer" className="transition hover:text-primary">WhatsApp Channel</a>
                <a href={siteConfig.links.contact} className="transition hover:text-primary">Email</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{siteConfig.footer.copyright}</p>
          <p>Built for fans. Powered by live data. Controlled by Roar Arena.</p>
        </div>
      </div>
    </footer>
  )
}
