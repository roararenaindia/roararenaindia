import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
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
      fetched: typeof data?.fetched === 'number' ? data.fetched : null,
      providerLabel: data?.providerLabel || null,
    }
  } catch (error) {
    return {
      path,
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Internal sync call failed',
      fetched: null,
      providerLabel: null,
    }
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 })
  }

  const origin = request.nextUrl.origin.replace(/\/$/, '')
  const secret = process.env.CRON_SECRET

  const results = []
  const matchResult = await callInternal(origin, '/api/sync/matches', secret)
  results.push(matchResult)

  if (matchResult.ok) {
    results.push(await callInternal(origin, '/api/admin/auto-curate', secret))
  } else {
    results.push({
      path: '/api/admin/auto-curate',
      ok: false,
      status: 0,
      mode: 'skipped',
      message: 'Auto-curation skipped because match sync did not complete.',
      fetched: null,
      providerLabel: null,
    })
  }

  return NextResponse.json({
    ok: results.every((item) => item.ok),
    mode: 'external_cron_2_hour_match_sync',
    schedule: 'Use this endpoint from an external scheduler every 2 hours to update fixtures, results, and homepage curation.',
    results,
    checkedAt: new Date().toISOString(),
  })
}
