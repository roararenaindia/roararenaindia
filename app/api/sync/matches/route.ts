import { NextRequest, NextResponse } from 'next/server'
import { fetchMatchRecordsRange, hasAnyMatchProvider } from '@/lib/services/match-data-provider'
import { hasSupabaseWriteAccess, supabaseUpsert } from '@/lib/services/supabase-rest'
import { writeSyncLog } from '@/lib/services/sync-log'

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
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 })
  }

  if (!hasAnyMatchProvider()) {
    return NextResponse.json({
      ok: true,
      mode: 'not_configured',
      message: 'Match sync route is ready. Add FOOTBALL_DATA_TOKEN to enable free World Cup fixtures/results sync.',
    })
  }

  const pastDays = Number(process.env.MATCH_SYNC_PAST_DAYS || 2)
  const futureDays = Number(process.env.MATCH_SYNC_FUTURE_DAYS || 7)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)

  try {
    const { records, fetched, provider, providerLabel, quota, query } = await fetchMatchRecordsRange(from, to)

    if (!hasSupabaseWriteAccess()) {
      return NextResponse.json({
        ok: false,
        mode: 'database_not_configured',
        provider,
        providerLabel,
        from,
        to,
        fetched,
        quota,
        query,
        error: 'Supabase write access is missing, so fetched matches cannot be saved to the homepage.',
        nextStep: 'Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY, then run sync again.',
      }, { status: 424 })
    }

    const upsertResult = await supabaseUpsert('roar_matches', records, 'provider_match_id')

    if (upsertResult.error) {
      await writeSyncLog({ source: 'matches', status: 'error', fetchedCount: fetched, savedCount: 0, message: upsertResult.error })
      return NextResponse.json({ ok: false, mode: 'supabase_error', error: upsertResult.error }, { status: 500 })
    }

    await writeSyncLog({
      source: 'matches',
      status: 'success',
      fetchedCount: fetched,
      savedCount: upsertResult.data?.length || records.length,
      message: 'Match sync complete',
      details: { from, to, provider, providerLabel, query, quota },
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
      quota,
      query,
      nextStep: records.length
        ? 'Matches saved. Run auto-curate or wait for /api/cron/roar to update the featured match.'
        : 'The match provider worked, but this competition/season/date range returned zero fixtures.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown match provider error'
    await writeSyncLog({ source: 'matches', status: 'error', fetchedCount: 0, savedCount: 0, message })
    return NextResponse.json({ ok: false, mode: 'match_provider_error', error: message }, { status: 502 })
  }
}
