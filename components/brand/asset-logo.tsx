'use client'

import { useMemo, useState } from 'react'

type AssetLogoProps = {
  src?: string | null
  lightSrc?: string | null
  alt: string
  className?: string
  imgClassName?: string
  variant?: 'default' | 'stage' | 'minimal'
  tone?: 'neutral' | 'strong'
  lightFrame?: 'default' | 'clear' | 'dark-chip' | 'light-chip'
  loading?: 'lazy' | 'eager'
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
  lightSrc,
  alt,
  className = '',
  imgClassName = '',
  variant = 'default',
  tone = 'neutral',
  lightFrame = 'default',
  loading = 'lazy',
}: AssetLogoProps) {
  const [broken, setBroken] = useState(false)
  const [lightBroken, setLightBroken] = useState(false)
  const initials = useMemo(() => initialsFromAlt(alt), [alt])
  const usableSrc = Boolean(src && !broken)
  const usableLightSrc = Boolean(lightSrc && !lightBroken)
  const frameClass =
    lightFrame === 'clear'
      ? 'asset-logo-clear-light'
      : lightFrame === 'dark-chip'
        ? 'asset-logo-dark-chip'
        : lightFrame === 'light-chip'
          ? 'asset-logo-light-chip'
          : ''

  return (
    <div
      className={`asset-logo-frame ${usableLightSrc ? 'asset-logo-has-light' : ''} relative grid place-items-center overflow-hidden ${variantClass[variant]} before:pointer-events-none before:absolute before:inset-0 before:opacity-80 after:pointer-events-none after:absolute after:inset-0 after:opacity-70 ${toneClass[tone]} ${frameClass} ${className}`}
    >
      {usableSrc ? (
        <>
          <img
            src={src || ''}
            alt={alt}
            className={`asset-logo-dark relative z-10 h-full w-full object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.78)] drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)] ${imgClassName}`}
            style={{
              position: 'absolute',
              inset: variant === 'minimal' ? 0 : '10%',
              width: variant === 'minimal' ? '100%' : '80%',
              height: variant === 'minimal' ? '100%' : '80%',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: 'none',
            }}
            loading={loading}
            decoding="async"
            onError={() => setBroken(true)}
          />
          {usableLightSrc ? (
            <img
              src={lightSrc || ''}
              alt=""
              aria-hidden="true"
              className={`asset-logo-light relative z-10 h-full w-full object-contain drop-shadow-[0_1px_1px_rgba(255,255,255,0.74)] drop-shadow-[0_12px_20px_rgba(17,24,39,0.22)] ${imgClassName}`}
              style={{
                position: 'absolute',
                inset: variant === 'minimal' ? 0 : '10%',
                width: variant === 'minimal' ? '100%' : '80%',
                height: variant === 'minimal' ? '100%' : '80%',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: 'none',
              }}
              loading={loading}
              decoding="async"
              onError={() => setLightBroken(true)}
            />
          ) : null}
        </>
      ) : (
        <div className="relative z-10 grid h-full w-full place-items-center rounded-xl bg-primary/10 text-center font-display text-base uppercase leading-none text-primary">
          {initials}
        </div>
      )}
    </div>
  )
}
