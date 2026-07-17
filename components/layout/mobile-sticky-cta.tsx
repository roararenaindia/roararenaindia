'use client'

import Link from 'next/link'
import { useEventPromotionActive } from '@/components/hooks/use-event-promotion'
import { eventPromotion } from '@/lib/config/event-promotion'
import { siteConfig } from '@/lib/config/site-data'

export default function MobileStickyCtA() {
  const showEventPromotion = useEventPromotionActive()

  const buttons = showEventPromotion
    ? [{ label: 'Book Now', href: eventPromotion.bookingUrl }, ...siteConfig.mobileStickyCtA.buttons.slice(1)]
    : siteConfig.mobileStickyCtA.buttons

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6">
        {buttons.map((button, index) => (
          <Link
            key={button.href}
            href={button.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-lg px-2 py-3 text-center text-[11px] font-semibold leading-tight transition-all ${
              index === 0
                ? 'bg-primary text-primary-foreground hover:shadow-md hover:shadow-orange-500/20'
                : 'border border-border bg-surface-elevated text-foreground hover:border-primary/30'
            }`}
          >
            {button.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
