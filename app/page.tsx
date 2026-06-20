import Header from '@/components/layout/header'
import HomeExperience from '@/components/home/home-experience'
import MobileStickyCtA from '@/components/layout/mobile-sticky-cta'
import Footer from '@/components/layout/footer'
import { getLiveHomePayload } from '@/lib/services/live-home'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  const initialData = await getLiveHomePayload()

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <Header />
      <HomeExperience initialData={initialData} />
      <Footer />
      <MobileStickyCtA />
    </main>
  )
}
