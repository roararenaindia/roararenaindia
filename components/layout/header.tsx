'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Facebook, Instagram, Menu, MessageCircle, Send, X } from '@/components/ui/icon-set'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import BrandLogo from '@/components/brand/brand-logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { siteConfig } from '@/lib/config/site-data'

export default function Header() {
  const [open, setOpen] = useState(false)
  const socialLinks = [
    { label: 'WhatsApp Channel', href: siteConfig.links.whatsappChannel, icon: MessageCircle, primary: true },
    { label: 'Instagram', href: siteConfig.links.instagram, icon: Instagram },
    { label: 'Facebook', href: siteConfig.links.facebook, icon: Facebook },
    { label: 'X / Twitter', href: siteConfig.links.x, icon: Send },
  ]

  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setOpen(false)
    }

    closeOnDesktop()
    window.addEventListener('resize', closeOnDesktop)
    return () => window.removeEventListener('resize', closeOnDesktop)
  }, [open])

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <button
              type="button"
              aria-label="Close menu backdrop"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/62 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 top-0 flex h-[100dvh] w-[min(88vw,410px)] flex-col overflow-y-auto border-l border-border bg-background shadow-[0_0_80px_rgba(0,0,0,0.45)]"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <Link href="#home" onClick={() => setOpen(false)} aria-label="Roar Arena home">
                  <BrandLogo priority className="h-auto w-[156px]" />
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-elevated text-foreground"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col px-5 py-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Navigate</p>
                <nav className="mt-4 grid gap-2" aria-label="Mobile navigation">
                  {siteConfig.navigation.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * index, duration: 0.22 }}
                      className="group flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-foreground transition hover:border-primary/45 hover:bg-card"
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                    </motion.a>
                  ))}
                </nav>

                <div className="mt-7 rounded-[1.5rem] border border-border bg-card/88 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Social links</p>
                  <div className="mt-4 grid gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.1em] transition ${
                          link.primary
                            ? 'bg-primary text-primary-foreground shadow-soft-glow hover:shadow-glow'
                            : 'border border-border bg-background text-foreground hover:border-primary/45'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <div className="rounded-[1.5rem] border border-primary/25 bg-primary/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Roar Arena</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Follow match updates, future screening drops, and fan community posts from one menu.</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
