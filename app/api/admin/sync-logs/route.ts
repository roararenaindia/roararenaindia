import { NextRequest, NextResponse } from 'next/server'
import { getLatestSyncLogs } from '@/lib/sync-log'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const limit = Number(request.nextUrl.searchParams.get('limit') || 30)
  const result = await getLatestSyncLogs(limit)

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    logs: result.data || [],
  })
}
