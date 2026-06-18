'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveTeamFlag } from '@/lib/domain/team-logos'

type TeamLogoProps = {
  src?: string | null
  alt: string
  className?: string
  imageClassName?: string
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

export default function TeamLogo({ src, alt, className = '', imageClassName = '' }: TeamLogoProps) {
  const [broken, setBroken] = useState(false)
  const [flagBroken, setFlagBroken] = useState(false)
  const initials = useMemo(() => initialsFromAlt(alt), [alt])
  const flagSrc = useMemo(() => resolveTeamFlag(alt.replace(/logo/gi, '').trim()), [alt])
  const usableFlagSrc = Boolean(flagSrc && !flagBroken)
  const usableSrc = Boolean(src && !broken)

  useEffect(() => {
    setBroken(false)
    setFlagBroken(false)
  }, [src, alt])

  return (
    <div className={`group/logo relative grid place-items-center overflow-hidden rounded-[1rem] border border-border bg-background/60 p-2.5 shadow-soft-glow ${className}`}>
      <span className="pointer-events-none absolute inset-0 rounded-[1rem] bg-[radial-gradient(circle_at_50%_30%,rgba(255,75,31,0.18),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100" />
      {usableFlagSrc ? (
        <img
          src={flagSrc || ''}
          alt={alt}
          className={`relative h-full w-full rounded-[0.35rem] bg-white object-contain shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out group-hover/logo:scale-[1.08] ${imageClassName}`}
          loading="lazy"
          decoding="async"
          onError={() => setFlagBroken(true)}
        />
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
