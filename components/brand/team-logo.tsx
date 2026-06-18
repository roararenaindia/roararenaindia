'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveTeamFlag } from '@/lib/domain/team-logos'

type TeamLogoProps = {
  src?: string | null
  alt: string
  className?: string
  imageClassName?: string
  frame?: 'premium' | 'simple'
}

function initialsFromAlt(alt: string) {
  return alt
    .replace(/logo/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'RA'
}

export default function TeamLogo({ src, alt, className = '', imageClassName = '', frame = 'premium' }: TeamLogoProps) {
  const [broken, setBroken] = useState(false)
  const [flagBroken, setFlagBroken] = useState(false)
  const initials = useMemo(() => initialsFromAlt(alt), [alt])
  const flagSrc = useMemo(() => resolveTeamFlag(alt.replace(/logo/gi, '').trim()), [alt])
  const usableFlagSrc = Boolean(flagSrc && !flagBroken)
  const usableSrc = Boolean(src && !broken)
  const premiumFrame = frame === 'premium'

  useEffect(() => {
    setBroken(false)
    setFlagBroken(false)
  }, [src, alt])

  return (
    <div className={`group/logo relative grid place-items-center overflow-hidden rounded-[1.1rem] border border-border bg-card/86 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_44px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/35 ${className}`}>
      <span className="pointer-events-none absolute inset-0 rounded-[1.1rem] bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.16),transparent_45%),radial-gradient(circle_at_52%_82%,rgba(255,75,31,0.18),transparent_62%)] opacity-80 transition-opacity duration-300 group-hover/logo:opacity-100" />
      <span className="pointer-events-none absolute inset-x-3 top-1 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      {usableFlagSrc ? (
        <span
          className={`relative grid h-full w-full place-items-center overflow-hidden rounded-[0.78rem] bg-transparent p-[4px] transition-transform duration-300 ease-out group-hover/logo:scale-[1.06] ${
            premiumFrame
              ? 'border border-black/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_0_0_4px_rgba(0,0,0,0.82),0_10px_24px_rgba(0,0,0,0.28)]'
              : 'border border-black/70 shadow-[0_8px_18px_rgba(0,0,0,0.22)]'
          }`}
        >
          <span className="pointer-events-none absolute inset-[4px] z-10 rounded-[0.48rem] ring-1 ring-white/35" />
          <img
            src={flagSrc || ''}
            alt={alt}
            className={`relative h-full w-full rounded-[0.48rem] object-cover ${imageClassName}`}
            loading="lazy"
            decoding="async"
            onError={() => setFlagBroken(true)}
          />
        </span>
      ) : usableSrc ? (
        <img
          src={src || ''}
          alt={alt}
          className={`relative h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out group-hover/logo:scale-[1.08] ${imageClassName}`}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-[0.65rem] bg-primary/10 text-center font-display text-xl uppercase leading-none text-primary sm:text-2xl">
          {initials}
        </div>
      )}
    </div>
  )
}
