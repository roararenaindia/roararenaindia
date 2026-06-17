import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const authHeader = request.headers.get('authorization')
  const querySecret = request.nextUrl.searchParams.get('secret')
  return authHeader === `Bearer ${secret}` || querySecret === secret
}

async function callInternal(origin: string, path: string, secret?: string) {
  const response = await fetch(`${origin}${path}`, {
    cache: 'no-store',
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  })
  const data = await response.json().catch(() => ({}))
  return { path, ok: response.ok && data.ok !== false, status: response.status, data }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 })
  }

  const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const secret = process.env.CRON_SECRET
  const paths = ['/api/sync/instagram', '/api/sync/x', '/api/sync/matches', '/api/admin/auto-curate']
  const results = []

  for (const path of paths) {
    results.push(await callInternal(origin.replace(/\/$/, ''), path, secret))
  }

  return NextResponse.json({
    ok: results.every((result) => result.ok),
    mode: 'sync_all_complete',
    results,
  })
}
