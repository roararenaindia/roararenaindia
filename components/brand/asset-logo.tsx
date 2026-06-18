'use client'

import { useMemo, useState } from 'react'

type AssetLogoProps = {
  src?: string | null
  alt: string
  className?: string
  imgClassName?: string
  variant?: 'default' | 'stage' | 'minimal'
  tone?: 'neutral' | 'strong'
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

const variantClass = {
  default: 'rounded-2xl border border-border bg-card/80 p-2 shadow-[0_14px_40px_rgba(0,0,0,0.16)]',
  stage: 'rounded-[1.35rem] border border-border bg-card/86 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_55px_rgba(0,0,0,0.18)]',
  minimal: 'rounded-xl border border-transparent bg-transparent p-0',
}

const toneClass = {
  neutral: 'before:bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.22),transparent_42%)] after:bg-[linear-gradient(135deg,transparent_0%,rgba(255,75,31,0.14)_48%,transparent_70%)]',
  strong: 'before:bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.28),transparent_44%)] after:bg-[linear-gradient(135deg,transparent_0%,rgba(255,75,31,0.22)_46%,transparent_72%)]',
}

export default function AssetLogo({
  src,
  alt,
  className = '',
  imgClassName = '',
  variant = 'default',
  tone = 'neutral',
}: AssetLogoProps) {
  const [broken, setBroken] = useState(false)
  const initials = useMemo(() => initialsFromAlt(alt), [alt])
  const usableSrc = Boolean(src && !broken)

  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${variantClass[variant]} before:pointer-events-none before:absolute before:inset-0 before:opacity-80 after:pointer-events-none after:absolute after:inset-0 after:opacity-70 ${toneClass[tone]} ${className}`}
    >
      {usableSrc ? (
        <img
          src={src || ''}
          alt={alt}
          className={`relative z-10 block h-full w-full object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.78)] drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)] ${imgClassName}`}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="relative z-10 grid h-full w-full place-items-center rounded-xl bg-primary/10 text-center font-display text-base uppercase leading-none text-primary">
          {initials}
        </div>
      )}
    </div>
  )
}
