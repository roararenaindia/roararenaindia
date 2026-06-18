import Header from '@/components/layout/header'
import HomeExperience from '@/components/home/home-experience'
import MobileStickyCtA from '@/components/layout/mobile-sticky-cta'
import Footer from '@/components/layout/footer'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <Header />
      <HomeExperience />
      <Footer />
      <MobileStickyCtA />
    </main>
  )
}
