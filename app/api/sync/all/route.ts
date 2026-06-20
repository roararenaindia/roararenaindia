import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
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
  const includeSocialParam = request.nextUrl.searchParams.get('includeSocial')
  const instagramConfigured = Boolean(process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN)
  const xConfigured = Boolean(process.env.X_USER_ID && process.env.X_BEARER_TOKEN)
  const socialConfigured = instagramConfigured || xConfigured
  const includeSocial = includeSocialParam === '1' || (includeSocialParam !== '0' && socialConfigured)
  const socialPaths = includeSocialParam === '1'
    ? ['/api/sync/instagram', '/api/sync/x']
    : [
        ...(instagramConfigured ? ['/api/sync/instagram'] : []),
        ...(xConfigured ? ['/api/sync/x'] : []),
      ]
  const paths = includeSocial
    ? [...socialPaths, '/api/sync/matches', '/api/admin/auto-curate']
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
    note: includeSocial
      ? 'Social sync is included because credentials are configured or includeSocial=1 was requested.'
      : 'Social sync is skipped because Instagram/X credentials are not configured.',
    results,
  })
}
