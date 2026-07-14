import { NextRequest, NextResponse } from 'next/server'
import { fetchTennisRecordsRange, hasTennisProvider } from '@/lib/services/tennis-data-provider'
import { hasSupabaseWriteAccess, supabaseUpsert } from '@/lib/services/supabase-rest'
import { writeSyncLog } from '@/lib/services/sync-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

function summarize(records: Awaited<ReturnType<typeof fetchTennisRecordsRange>>['records']) {
  return {
    upcomingCount: records.filter((record) => record.status === 'upcoming').length,
    liveCount: records.filter((record) => record.status === 'live').length,
    finalCount: records.filter((record) => record.status === 'final').length,
    tournaments: Array.from(new Set(records.map((record) => record.league))).slice(0, 10),
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  if (!hasTennisProvider()) {
    return NextResponse.json({
      ok: true,
      mode: 'not_configured',
      message: 'Tennis sync route is ready. Use TENNIS_DATA_PROVIDER=espn for the keyless ESPN provider, or add TENNIS_API_KEY with TENNIS_DATA_PROVIDER=api-tennis.',
    })
  }

  const pastDays = numberFromEnv('TENNIS_SYNC_PAST_DAYS', 2)
  const futureDays = numberFromEnv('TENNIS_SYNC_FUTURE_DAYS', 10)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)

  try {
    const { records, fetched, provider, providerLabel, query } = await fetchTennisRecordsRange(from, to)
    const resultValidation = summarize(records)

    if (!hasSupabaseWriteAccess()) {
      return NextResponse.json({
        ok: false,
        mode: 'database_not_configured',
        provider,
        providerLabel,
        from,
        to,
        fetched,
        resultValidation,
        query,
        error: 'Supabase write access is missing, so fetched tennis matches cannot be saved to the homepage.',
      }, { status: 424 })
    }

    const upsertResult = await supabaseUpsert('roar_matches', records, 'provider_match_id')

    if (upsertResult.error) {
      await writeSyncLog({ source: 'tennis', status: 'error', fetchedCount: fetched, savedCount: 0, message: upsertResult.error })
      return NextResponse.json({ ok: false, mode: 'supabase_error', error: upsertResult.error }, { status: 500 })
    }

    await writeSyncLog({
      source: 'tennis',
      status: 'success',
      fetchedCount: fetched,
      savedCount: upsertResult.data?.length || records.length,
      message: 'Tennis sync complete',
      details: { from, to, provider, providerLabel, query, resultValidation },
    })

    return NextResponse.json({
      ok: true,
      mode: records.length ? 'synced' : 'no_fixtures_found',
      provider,
      providerLabel,
      from,
      to,
      fetched,
      upserted: upsertResult.data?.length || records.length,
      resultValidation,
      query,
      nextStep: records.length
        ? 'Tennis matches saved. Run auto-curate or wait for /api/cron/roar to refresh the featured board.'
        : 'The tennis provider worked, but this tournament/date range returned zero fixtures.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown tennis provider error'
    await writeSyncLog({ source: 'tennis', status: 'error', fetchedCount: 0, savedCount: 0, message })
    return NextResponse.json({ ok: false, mode: 'tennis_provider_error', error: message }, { status: 502 })
  }
}
