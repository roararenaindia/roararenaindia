import { NextResponse } from 'next/server'
import { getLiveHomePayload } from '@/lib/services/live-home'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const payload = await getLiveHomePayload()
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
