import { NextRequest, NextResponse } from 'next/server'
import { callInternalSync } from '@/lib/services/internal-sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

async function callInternalSummary(origin: string, path: string, secret?: string) {
  const { data: _data, ...summary } = await callInternalSync(origin, path, secret)
  return summary
}

function optionalSocialJobs() {
  const jobs = [
    {
      path: '/api/sync/instagram',
      configured: Boolean(process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN),
      missingMessage: 'Instagram sync skipped because INSTAGRAM_USER_ID or INSTAGRAM_ACCESS_TOKEN is not configured.',
    },
    {
      path: '/api/sync/x',
      configured: Boolean(process.env.X_USER_ID && process.env.X_BEARER_TOKEN),
      missingMessage: 'X sync skipped because X_USER_ID or X_BEARER_TOKEN is not configured.',
    },
  ]

  return jobs
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 })
  }

  const origin = request.nextUrl.origin.replace(/\/$/, '')
  const secret = process.env.CRON_SECRET

  const results = []
  for (const job of optionalSocialJobs()) {
    if (job.configured) {
      results.push(await callInternalSummary(origin, job.path, secret))
    } else {
      results.push({
        path: job.path,
        ok: true,
        status: 0,
        mode: 'skipped_missing_credentials',
        message: job.missingMessage,
        fetched: null,
        providerLabel: null,
      })
    }
  }

  const matchResult = await callInternalSummary(origin, '/api/sync/matches', secret)
  results.push(matchResult)

  const tennisResult = await callInternalSummary(origin, '/api/sync/tennis', secret)
  results.push(tennisResult)

  const tennisHasDataPath = tennisResult.ok && tennisResult.mode !== 'not_configured'

  if (matchResult.ok || tennisHasDataPath) {
    results.push(await callInternalSummary(origin, '/api/admin/auto-curate', secret))
  } else {
    results.push({
      path: '/api/admin/auto-curate',
      ok: false,
      status: 0,
      mode: 'skipped',
      message: 'Auto-curation skipped because sports sync did not complete.',
      fetched: null,
      providerLabel: null,
    })
  }

  return NextResponse.json({
    ok: results.every((item) => item.ok),
    mode: 'external_cron_2_hour_live_sync',
    schedule: 'Use this endpoint as the two-hour full sync. GitHub Actions also runs Instagram fallback polling every 10 minutes and match result sync every 15 minutes.',
    results,
    checkedAt: new Date().toISOString(),
  })
}
