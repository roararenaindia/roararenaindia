import type { MetadataRoute } from 'next'
import { absoluteUrl, seoConfig } from '@/lib/config/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/studio', '/studio/', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: seoConfig.siteUrl,
  }
}

