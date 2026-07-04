import { NextRequest, NextResponse } from 'next/server'
import { checkTennisProviderRange } from '@/lib/services/tennis-data-provider'
import { hasSupabaseWriteAccess } from '@/lib/services/supabase-rest'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

function numberFromEnv(name: string, fallback: number) {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function isoDateOffset(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const pastDays = numberFromEnv('TENNIS_SYNC_PAST_DAYS', 2)
  const futureDays = numberFromEnv('TENNIS_SYNC_FUTURE_DAYS', 10)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)
  const provider = await checkTennisProviderRange(from, to)

  const checks = {
    env: {
      tennisApiKey: Boolean(process.env.TENNIS_API_KEY || process.env.API_TENNIS_KEY),
      tennisTournamentKey: Boolean(process.env.TENNIS_TOURNAMENT_KEY),
      tennisTournamentNameFilter: process.env.TENNIS_TOURNAMENT_NAME_FILTER || 'Wimbledon',
      tennisTimezone: process.env.TENNIS_TIMEZONE || 'UTC',
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    supabase: {
      write: hasSupabaseWriteAccess(),
    },
    provider,
  }

  if (!provider.configured) {
    return NextResponse.json({
      ok: true,
      ready: false,
      checks,
      nextStep: 'Add TENNIS_API_KEY in Vercel environment variables to enable Wimbledon match data.',
    })
  }

  return NextResponse.json({
    ok: true,
    ready: provider.fixturesReachable && checks.supabase.write,
    checks,
    nextStep: !provider.fixturesReachable
      ? `Tennis provider could not fetch fixtures: ${provider.error}`
      : checks.supabase.write
        ? 'Tennis provider is ready. Run /api/sync/tennis, then Curate.'
        : `${provider.providerLabel} is valid, but Supabase write access is missing. Add SUPABASE_SERVICE_ROLE_KEY to save tennis matches.`,
    note: provider.sampleCount === 0 ? 'The provider works, but this date range/filter returned zero tennis fixtures. Check TENNIS_TOURNAMENT_NAME_FILTER or TENNIS_TOURNAMENT_KEY.' : null,
  })
}
