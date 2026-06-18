import Image from 'next/image'

type BrandLogoProps = {
  variant?: 'lockup' | 'icon'
  className?: string
  priority?: boolean
}

export default function BrandLogo({ variant = 'lockup', className = '', priority = false }: BrandLogoProps) {
  const lightSrc = variant === 'icon' ? '/logos/logo-icon-light-transparent.png' : '/logos/logo-lockup-light-transparent.png'
  const darkSrc = variant === 'icon' ? '/logos/logo-icon-dark-transparent.png' : '/logos/logo-lockup-dark-transparent.png'
  const alt = variant === 'icon' ? 'Roar Arena RA icon' : 'Roar Arena logo'
  const width = variant === 'icon' ? 512 : 1200
  const height = variant === 'icon' ? 512 : 296

  return (
    <>
      <Image
        src={lightSrc}
        alt={alt}
        width={width}
        height={height}
        className={`brand-logo-light object-contain ${className}`}
        priority={priority}
      />
      <Image
        src={darkSrc}
        alt={alt}
        width={width}
        height={height}
        className={`brand-logo-dark object-contain ${className}`}
        priority={priority}
      />
    </>
  )
}
