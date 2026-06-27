import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { absoluteUrl, seoConfig } from '@/lib/config/seo'

export const metadata: Metadata = {
  title: {
    default: seoConfig.title,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.description,
  applicationName: seoConfig.siteName,
  authors: [{ name: seoConfig.siteName, url: seoConfig.siteUrl }],
  creator: seoConfig.siteName,
  publisher: seoConfig.siteName,
  generator: 'Roar Arena',
  metadataBase: new URL(seoConfig.siteUrl),
  alternates: {
    canonical: '/',
  },
  keywords: [...seoConfig.keywords],
  category: 'sports',
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: seoConfig.title,
    description: seoConfig.description,
    url: '/',
    siteName: seoConfig.siteName,
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: seoConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Roar Arena sports fan community and matchday updates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.title,
    description: seoConfig.shortDescription,
    images: [absoluteUrl(seoConfig.ogImage)],
  },
  icons: {
    icon: [
      { url: '/logos/favicon-dark-32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/logos/favicon-light-32.png', media: '(prefers-color-scheme: light)' },
    ],
    apple: '/logos/apple-icon-dark.png',
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
    { media: '(prefers-color-scheme: light)', color: '#F7F3EA' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} storageKey="roar-arena-theme">
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
