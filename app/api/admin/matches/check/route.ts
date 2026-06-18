import { NextRequest, NextResponse } from 'next/server'
import { checkMatchProviderRange } from '@/lib/services/match-data-provider'
import { hasSupabaseWriteAccess } from '@/lib/services/supabase-rest'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return request.headers.get('authorization') === `Bearer ${secret}`
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

  const pastDays = Number(process.env.MATCH_SYNC_PAST_DAYS || 2)
  const futureDays = Number(process.env.MATCH_SYNC_FUTURE_DAYS || 7)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)
  const provider = await checkMatchProviderRange(from, to)

  const checks = {
    env: {
      matchDataProvider: process.env.MATCH_DATA_PROVIDER || 'auto',
      footballDataToken: Boolean(process.env.FOOTBALL_DATA_TOKEN),
      footballDataCompetition: process.env.FOOTBALL_DATA_COMPETITION || 'WC',
      footballDataSeason: process.env.FOOTBALL_DATA_SEASON || process.env.API_FOOTBALL_SEASON || '2026',
      apiFootballKey: Boolean(process.env.API_FOOTBALL_KEY),
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
      nextStep: 'Add FOOTBALL_DATA_TOKEN in Vercel environment variables for free World Cup match data.',
    })
  }

  return NextResponse.json({
    ok: true,
    ready: provider.fixturesReachable && checks.supabase.write,
    checks,
    nextStep: !provider.fixturesReachable
      ? `Match provider could not fetch fixtures: ${provider.error}`
      : checks.supabase.write
        ? 'Match provider is ready. Click Sync Matches from admin, then Curate.'
        : `${provider.providerLabel} is valid, but Supabase write access is missing. Add SUPABASE_SERVICE_ROLE_KEY to save matches.`,
    note: provider.sampleCount === 0 ? 'The provider works, but this date range returned zero fixtures. Increase MATCH_SYNC_FUTURE_DAYS or check competition/season.' : null,
  })
}
