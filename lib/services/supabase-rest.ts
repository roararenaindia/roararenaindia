export type SupabaseMode = 'read' | 'write'

type SupabaseFetchOptions = {
  mode?: SupabaseMode
  prefer?: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

function getSupabaseConfig(mode: SupabaseMode = 'read') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const key = mode === 'write' ? serviceRoleKey || anonKey : anonKey || serviceRoleKey

  return {
    url,
    key,
    isConfigured: Boolean(url && key),
    hasServiceRole: Boolean(url && serviceRoleKey),
  }
}

export function isSupabaseConfigured(mode: SupabaseMode = 'read') {
  return getSupabaseConfig(mode).isConfigured
}

export function hasSupabaseWriteAccess() {
  return getSupabaseConfig('write').hasServiceRole
}

export async function supabaseRest<T>(
  path: string,
  options: SupabaseFetchOptions = {},
): Promise<{ data: T | null; error: string | null; status: number }> {
  const mode = options.mode || 'read'
  const config = getSupabaseConfig(mode)

  if (!config.url || !config.key) {
    return { data: null, error: 'Supabase is not configured', status: 0 }
  }

  const cleanBase = config.url.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  const response = await fetch(`${cleanBase}/rest/v1/${cleanPath}`, {
    method: options.method || (options.body ? 'POST' : 'GET'),
    cache: 'no-store',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  })

  const text = await response.text()
  const parsed = text ? safeJson(text) : null

  if (!response.ok) {
    return {
      data: null,
      error: typeof parsed === 'object' && parsed && 'message' in parsed ? String((parsed as { message?: string }).message) : text || response.statusText,
      status: response.status,
    }
  }

  return { data: parsed as T, error: null, status: response.status }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function supabaseSelect<T>(table: string, query: string) {
  return supabaseRest<T[]>(`${table}?${query}`, { mode: 'read' })
}

export async function supabaseUpsert<T>(table: string, records: T[], onConflict: string) {
  if (!records.length) return { data: [] as T[], error: null, status: 200 }
  const query = `${table}?on_conflict=${encodeURIComponent(onConflict)}`
  return supabaseRest<T[]>(query, {
    mode: 'write',
    method: 'POST',
    body: records,
    prefer: 'resolution=merge-duplicates,return=representation',
  })
}

export async function supabasePatch<T>(table: string, id: string, patch: Partial<T>) {
  return supabaseRest<T[]>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    mode: 'write',
    method: 'PATCH',
    body: patch,
    prefer: 'return=representation',
  })
}


export async function supabaseInsert<T>(table: string, record: T) {
  return supabaseRest<T[]>(table, {
    mode: 'write',
    method: 'POST',
    body: record,
    prefer: 'return=representation',
  })
}


export async function supabasePatchByQuery<T>(table: string, query: string, patch: Partial<T>) {
  return supabaseRest<T[]>(`${table}?${query}`, {
    mode: 'write',
    method: 'PATCH',
    body: patch,
    prefer: 'return=representation',
  })
}
