import { NextRequest, NextResponse } from 'next/server'
import { generateInstagramSvg } from '@/lib/templates/post-template-svg'
import { defaultInstagramTemplate } from '@/lib/templates/post-template-types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const svg = generateInstagramSvg(defaultInstagramTemplate)
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => defaultInstagramTemplate)
  const svg = generateInstagramSvg(body)

  return NextResponse.json({
    ok: true,
    width: 1080,
    height: 1080,
    format: 'svg',
    filename: `roar-arena-${body?.kind || 'post'}-${Date.now()}.svg`,
    svg,
  })
}
