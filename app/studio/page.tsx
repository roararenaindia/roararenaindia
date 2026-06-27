import type { Metadata } from 'next'
import TemplateStudio from '@/components/studio/template-studio'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Studio',
  robots: {
    index: false,
    follow: false,
  },
}

export default function StudioPage() {
  return <TemplateStudio />
}
