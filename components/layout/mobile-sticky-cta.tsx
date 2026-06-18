import Link from 'next/link';
import { siteConfig } from '@/lib/config/site-data';

export default function MobileStickyCtA() {
  const { buttons } = siteConfig.mobileStickyCtA;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-2">
        {buttons.map((btn, idx) => (
          <Link
            key={idx}
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 py-3 text-xs md:text-sm font-semibold rounded-2xl transition-all text-center ${
              idx === 0
                ? 'bg-primary text-primary-foreground hover:shadow-md hover:shadow-orange-500/20'
                : 'border border-border bg-surface-elevated text-foreground hover:border-primary/30'
            }`}
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
