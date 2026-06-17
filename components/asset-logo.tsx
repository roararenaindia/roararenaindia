'use client'

import { useMemo, useState } from 'react'

type AssetLogoProps = {
  src?: string | null
  alt: string
  className?: string
  imgClassName?: string
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

export default function AssetLogo({ src, alt, className = '', imgClassName = '' }: AssetLogoProps) {
  const [broken, setBroken] = useState(false)
  const initials = useMemo(() => initialsFromAlt(alt), [alt])
  const usableSrc = Boolean(src && !broken)

  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-2xl border border-border bg-[rgba(255,255,255,0.035)] ${className}`}>
      {usableSrc ? (
        <img
          src={src || ''}
          alt={alt}
          className={`block h-full w-full object-contain ${imgClassName}`}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-xl bg-primary/10 text-center font-display text-base uppercase leading-none text-primary">
          {initials}
        </div>
      )}
    </div>
  )
}
