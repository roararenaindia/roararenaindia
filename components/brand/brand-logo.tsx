'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

type BrandLogoProps = {
  variant?: 'lockup' | 'icon'
  className?: string
  priority?: boolean
}

export default function BrandLogo({ variant = 'lockup', className = '', priority = false }: BrandLogoProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, theme } = useTheme()

  useEffect(() => setMounted(true), [])

  const activeTheme = mounted ? resolvedTheme || theme : 'dark'
  const isLight = activeTheme === 'light'

  const src = variant === 'icon'
    ? isLight
      ? '/logos/logo-icon-light-transparent.png'
      : '/logos/logo-icon-dark-transparent.png'
    : isLight
      ? '/logos/logo-lockup-light-transparent.png'
      : '/logos/logo-lockup-dark-transparent.png'

  const alt = variant === 'icon' ? 'Roar Arena RA icon' : 'Roar Arena logo'
  const width = variant === 'icon' ? 512 : 1200
  const height = variant === 'icon' ? 512 : 296

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority={priority}
    />
  )
}
