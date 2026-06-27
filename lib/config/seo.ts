import { siteConfig } from '@/lib/config/site-data'

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://roararenaindia.vercel.app').replace(/\/$/, '')

export const seoConfig = {
  siteUrl,
  siteName: siteConfig.brand.name,
  title: 'Roar Arena | Sports Watch Parties & Fan Events in India',
  description:
    'Roar Arena is building live sports screenings, watch parties, fan meetups, match updates, fixtures, and fan community events across India.',
  shortDescription: 'Live sports screenings, match updates, fixtures, and fan community events across India.',
  keywords: [
    'Roar Arena',
    'Roar Arena India',
    'sports watch parties India',
    'live sports screenings',
    'football screening India',
    'cricket screening India',
    'match updates',
    'sports fan community',
    'fan meetups',
    'live match fixtures',
  ],
  ogImage: '/og/og-image.png',
  logo: '/logos/logo-icon-dark-512.png',
} as const

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

