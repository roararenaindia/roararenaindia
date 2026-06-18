'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from '@/components/ui/icon-set'
import Link from 'next/link'
import { useState } from 'react'
import BrandLogo from '@/components/brand/brand-logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { siteConfig } from '@/lib/config/site-data'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/82 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href="#home" className="flex shrink-0 items-center" aria-label="Roar Arena home">
          <BrandLogo priority className="h-auto w-[136px] sm:w-[168px] lg:w-[198px]" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {siteConfig.navigation.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-2 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <a
            href={siteConfig.links.whatsappChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground shadow-soft-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
          >
            Join Channel
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-elevated text-foreground"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="overflow-hidden border-t border-border bg-background/96 backdrop-blur-2xl lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
              <nav className="grid gap-2" aria-label="Mobile navigation">
                {siteConfig.navigation.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <a
                href={siteConfig.links.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block rounded-2xl bg-primary px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-primary-foreground"
              >
                Join WhatsApp Channel
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
