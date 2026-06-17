import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const authHeader = request.headers.get('authorization')
  const querySecret = request.nextUrl.searchParams.get('secret')
  return authHeader === `Bearer ${secret}` || querySecret === secret
}

async function callInternal(origin: string, path: string, secret?: string) {
  try {
    const response = await fetch(`${origin}${path}`, {
      cache: 'no-store',
      headers: secret ? { Authorization: `Bearer ${secret}` } : {},
    })
    const data = await response.json().catch(() => ({}))
    return {
      path,
      ok: response.ok && data?.ok !== false,
      status: response.status,
      mode: data?.mode || null,
      message: data?.message || data?.error || null,
    }
  } catch (error) {
    return {
      path,
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Internal sync call failed',
    }
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 })
  }

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, '')
  const secret = process.env.CRON_SECRET

  const paths = [
    '/api/sync/matches',
    '/api/admin/auto-curate',
    '/api/sync/instagram',
    '/api/sync/x',
  ]

  const results = []
  for (const path of paths) {
    results.push(await callInternal(origin, path, secret))
  }

  return NextResponse.json({
    ok: results.every((item) => item.ok),
    mode: 'external_cron_30_min_sync',
    schedule: 'Use this endpoint from an external scheduler every 30 minutes on Vercel Hobby.',
    results,
    checkedAt: new Date().toISOString(),
  })
}
