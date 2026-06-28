import { NextResponse } from 'next/server'
import { getLiveHomePayload } from '@/lib/services/live-home'
import { ensureFreshMatchScores } from '@/lib/services/match-self-heal'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  await ensureFreshMatchScores('public-home-api')
  const payload = await getLiveHomePayload()
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
