import Header from '@/components/header'
import HomeExperience from '@/components/home-experience'
import MobileStickyCtA from '@/components/mobile-sticky-cta'
import Footer from '@/components/footer'

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
