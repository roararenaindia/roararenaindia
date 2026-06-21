export type InternalSyncResult = {
  path: string
  ok: boolean
  status: number
  mode: string | null
  message: string | null
  fetched: number | null
  providerLabel: string | null
  data: unknown
}

export async function callInternalSync(origin: string, path: string, secret?: string): Promise<InternalSyncResult> {
  try {
    const response = await fetch(`${origin.replace(/\/$/, '')}${path}`, {
      cache: 'no-store',
      headers: secret ? { Authorization: `Bearer ${secret}` } : {},
    })
    const data = await response.json().catch(() => ({}))
    const record = data as {
      ok?: boolean
      mode?: string
      message?: string
      error?: string
      fetched?: number
      providerLabel?: string
    }

    return {
      path,
      ok: response.ok && record.ok !== false,
      status: response.status,
      mode: record.mode || null,
      message: record.message || record.error || null,
      fetched: typeof record.fetched === 'number' ? record.fetched : null,
      providerLabel: record.providerLabel || null,
      data,
    }
  } catch (error) {
    return {
      path,
      ok: false,
      status: 0,
      mode: null,
      message: error instanceof Error ? error.message : 'Internal sync call failed',
      fetched: null,
      providerLabel: null,
      data: null,
    }
  }
}
