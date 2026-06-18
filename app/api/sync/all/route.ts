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
  const includeSocial = request.nextUrl.searchParams.get('includeSocial') === '1'
  const paths = includeSocial
    ? ['/api/sync/instagram', '/api/sync/x', '/api/sync/matches', '/api/admin/auto-curate']
    : ['/api/sync/matches', '/api/admin/auto-curate']
  const results = []

  for (const path of paths) {
    const result = await callInternal(origin.replace(/\/$/, ''), path, secret)
    results.push(result)
    if (!result.ok && path === '/api/sync/matches') {
      results.push({
        path: '/api/admin/auto-curate',
        ok: false,
        status: 0,
        data: {
          ok: false,
          mode: 'skipped',
          error: 'Auto-curation skipped because match sync did not complete.',
        },
      })
      break
    }
  }

  return NextResponse.json({
    ok: results.every((result) => result.ok),
    mode: results.every((result) => result.ok)
      ? includeSocial ? 'sync_all_with_social_complete' : 'match_sync_and_curation_complete'
      : includeSocial ? 'sync_all_with_social_failed' : 'match_sync_and_curation_failed',
    note: includeSocial ? 'Social sync was explicitly requested.' : 'Default sync excludes Instagram and X for this phase.',
    results,
  })
}
