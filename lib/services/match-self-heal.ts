import { fetchMatchRecordsRange, hasAnyMatchProvider } from '@/lib/services/match-data-provider'
import { hasSupabaseWriteAccess, supabaseSelect, supabaseUpsert } from '@/lib/services/supabase-rest'
import { writeSyncLog } from '@/lib/services/sync-log'

type MatchSyncRun = {
  created_at?: string | null
}

export type MatchSelfHealResult = {
  checked: boolean
  triggered: boolean
  reason: string
  lastSyncAt?: string | null
  fetched?: number
  saved?: number
  from?: string
  to?: string
  error?: string
}

const defaultStaleMinutes = 20

function numberFromEnv(name: string, fallback: number) {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function isoDateOffset(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

async function latestSuccessfulMatchSync() {
  const result = await supabaseSelect<MatchSyncRun>(
    'roar_sync_runs',
    ['select=created_at', 'source=eq.matches', 'status=eq.success', 'order=created_at.desc', 'limit=1'].join('&'),
    'write',
  )

  return result.data?.[0]?.created_at || null
}

async function safeLatestSuccessfulMatchSync(): Promise<{ lastSyncAt: string | null; error?: string }> {
  try {
    return { lastSyncAt: await latestSuccessfulMatchSync() }
  } catch (error) {
    return {
      lastSyncAt: null,
      error: error instanceof Error ? error.message : 'Unknown sync-log lookup error',
    }
  }
}

function isFresh(lastSyncAt: string | null, staleMinutes: number) {
  if (!lastSyncAt) return false
  const parsed = Date.parse(lastSyncAt)
  if (!Number.isFinite(parsed)) return false
  return Date.now() - parsed < staleMinutes * 60_000
}

export async function ensureFreshMatchScores(reason: string): Promise<MatchSelfHealResult> {
  if (process.env.MATCH_SELF_HEAL_ENABLED === 'false') {
    return { checked: true, triggered: false, reason: 'disabled' }
  }

  if (!hasAnyMatchProvider()) {
    return { checked: true, triggered: false, reason: 'match_provider_not_configured' }
  }

  if (!hasSupabaseWriteAccess()) {
    return { checked: true, triggered: false, reason: 'supabase_write_not_configured' }
  }

  const staleMinutes = numberFromEnv('MATCH_SELF_HEAL_STALE_MINUTES', defaultStaleMinutes)
  const { lastSyncAt, error: syncLogError } = await safeLatestSuccessfulMatchSync()

  if (syncLogError) {
    return {
      checked: true,
      triggered: false,
      reason: 'sync_log_unavailable',
      lastSyncAt,
      error: syncLogError,
    }
  }

  if (isFresh(lastSyncAt, staleMinutes)) {
    return { checked: true, triggered: false, reason: 'fresh', lastSyncAt }
  }

  const pastDays = numberFromEnv('MATCH_SYNC_PAST_DAYS', 7)
  const futureDays = numberFromEnv('MATCH_SYNC_FUTURE_DAYS', 7)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)

  try {
    const { records, fetched, provider, providerLabel, quota, query } = await fetchMatchRecordsRange(from, to)
    const upsertResult = await supabaseUpsert('roar_matches', records, 'provider_match_id')

    if (upsertResult.error) {
      await writeSyncLog({
        source: 'matches',
        status: 'error',
        fetchedCount: fetched,
        savedCount: 0,
        message: `Self-heal match sync failed: ${upsertResult.error}`,
        details: { reason, from, to, provider, providerLabel, query, quota, lastSyncAt },
      })
      return {
        checked: true,
        triggered: true,
        reason: 'supabase_error',
        lastSyncAt,
        fetched,
        saved: 0,
        from,
        to,
        error: upsertResult.error,
      }
    }

    const saved = upsertResult.data?.length || records.length
    await writeSyncLog({
      source: 'matches',
      status: 'success',
      fetchedCount: fetched,
      savedCount: saved,
      message: 'Self-heal match sync complete',
      details: { reason, from, to, provider, providerLabel, query, quota, lastSyncAt, staleMinutes },
    })

    return {
      checked: true,
      triggered: true,
      reason: 'synced',
      lastSyncAt,
      fetched,
      saved,
      from,
      to,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown self-heal match sync error'
    await writeSyncLog({
      source: 'matches',
      status: 'error',
      fetchedCount: 0,
      savedCount: 0,
      message: `Self-heal match sync failed: ${message}`,
      details: { reason, from, to, lastSyncAt },
    })
    return {
      checked: true,
      triggered: true,
      reason: 'match_provider_error',
      lastSyncAt,
      fetched: 0,
      saved: 0,
      from,
      to,
      error: message,
    }
  }
}
