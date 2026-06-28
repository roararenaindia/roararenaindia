import Header from '@/components/layout/header'
import HomeExperience from '@/components/home/home-experience'
import MobileStickyCtA from '@/components/layout/mobile-sticky-cta'
import Footer from '@/components/layout/footer'
import { getLiveHomePayload } from '@/lib/services/live-home'
import { ensureFreshMatchScores } from '@/lib/services/match-self-heal'
import { absoluteUrl, seoConfig } from '@/lib/config/seo'
import { siteConfig } from '@/lib/config/site-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  await ensureFreshMatchScores('homepage-server-render')
  const initialData = await getLiveHomePayload()
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': absoluteUrl('/#organization'),
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
        logo: absoluteUrl(seoConfig.logo),
        description: seoConfig.description,
        email: siteConfig.links.contactEmail,
        sameAs: [siteConfig.links.instagram, siteConfig.links.facebook, siteConfig.links.x].filter(Boolean),
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
        description: seoConfig.description,
        publisher: {
          '@id': absoluteUrl('/#organization'),
        },
        inLanguage: 'en-IN',
      },
    ],
  }

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <HomeExperience initialData={initialData} />
      <Footer />
      <MobileStickyCtA />
    </main>
  )
}
