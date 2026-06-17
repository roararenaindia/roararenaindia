import { NextResponse } from 'next/server'
import { getLiveHomePayload } from '@/lib/live-home'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getLiveHomePayload()
  return NextResponse.json(payload)
}
