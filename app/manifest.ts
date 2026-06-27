import type { MetadataRoute } from 'next'
import { seoConfig } from '@/lib/config/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.siteName,
    short_name: 'Roar Arena',
    description: seoConfig.shortDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#ff4b1f',
    icons: [
      {
        src: '/logos/logo-icon-dark-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logos/logo-icon-light-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
