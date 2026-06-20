import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: 'Roar Arena - Where Fans Come Alive',
  description:
    'Feel the Game. Join the Roar. Roar Arena is building live screenings, watch parties, fan meetups, and matchday community events in India.',
  generator: 'Roar Arena',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://roararenaindia.vercel.app'),
  openGraph: {
    title: 'Roar Arena - Where Fans Come Alive',
    description:
      'Feel the Game. Join the Roar. Match updates, results, fixtures, and fan stories live now.',
    images: ['/og/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roar Arena - Where Fans Come Alive',
    description: 'Feel the Game. Join the Roar. Match updates live now.',
    images: ['/og/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/logos/favicon-dark-32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/logos/favicon-light-32.png', media: '(prefers-color-scheme: light)' },
    ],
    apple: '/logos/apple-icon-dark.png',
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
