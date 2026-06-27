import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/config/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1,
    },
  ]
}

