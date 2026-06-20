import { supabaseInsert, supabaseSelect } from '@/lib/services/supabase-rest'

export type SyncSource = 'instagram' | 'x' | 'matches' | 'curation' | 'system'
export type SyncStatus = 'success' | 'warning' | 'error'

export async function writeSyncLog(input: {
  source: SyncSource
  status: SyncStatus
  fetchedCount?: number
  savedCount?: number
  message?: string
  details?: unknown
}) {
  try {
    const result = await supabaseInsert('roar_sync_runs', {
      source: input.source,
      status: input.status,
      fetched_count: input.fetchedCount || 0,
      saved_count: input.savedCount || 0,
      message: input.message || null,
      details: input.details || {},
      created_at: new Date().toISOString(),
    })

    if (result.error) {
      console.warn('Sync log write failed:', result.error)
    }
  } catch {
    // Sync logs should never break the user-facing sync route.
  }
}

export async function getLatestSyncLogs(limit = 20) {
  return supabaseSelect(
    'roar_sync_runs',
    `select=*&order=created_at.desc&limit=${limit}`,
    'write',
  )
}
