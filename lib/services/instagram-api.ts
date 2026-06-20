export type InstagramMedia = {
  id: string
  caption?: string
  media_type?: string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  timestamp?: string
  username?: string
}

export type InstagramAccount = {
  id?: string
  user_id?: string
  username?: string
  account_type?: string
  media_count?: number
}

export type InstagramJsonResult<T> = {
  ok: boolean
  status: number
  data: T | null
  error: string | null
  url: string
}

function instagramApiVersion() {
  return process.env.INSTAGRAM_GRAPH_API_VERSION || 'v20.0'
}

export function instagramApiMode() {
  const mode = (process.env.INSTAGRAM_API_MODE || 'instagram_login').toLowerCase()
  return mode === 'facebook_login' || mode === 'facebook' ? 'facebook_login' : 'instagram_login'
}

function graphBaseUrl() {
  const host = instagramApiMode() === 'facebook_login' ? 'https://graph.facebook.com' : 'https://graph.instagram.com'
  return `${host}/${instagramApiVersion()}`
}

async function readInstagramJson<T>(path: string, token: string, params: Record<string, string>) {
  const url = new URL(`${graphBaseUrl()}${path}`)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  url.searchParams.set('access_token', token)
  const redactedUrl = new URL(url.toString())
  redactedUrl.searchParams.set('access_token', '[redacted]')

  const response = await fetch(url.toString(), { cache: 'no-store' })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
      error: data?.error?.message || response.statusText,
      url: redactedUrl.toString(),
    } satisfies InstagramJsonResult<T>
  }

  return { ok: true, status: response.status, data, error: null, url: redactedUrl.toString() } satisfies InstagramJsonResult<T>
}

export async function fetchInstagramAccount(igUserId: string, token: string) {
  if (instagramApiMode() === 'instagram_login') {
    return readInstagramJson<InstagramAccount>('/me', token, {
      fields: 'user_id,username,account_type,media_count',
    })
  }

  return readInstagramJson<InstagramAccount>(`/${igUserId}`, token, {
    fields: 'id,username,account_type,media_count',
  })
}

export async function fetchInstagramMedia(igUserId: string, token: string, limit: number) {
  const fields = 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,username'
  const media = await readInstagramJson<{ data?: InstagramMedia[] }>(`/${igUserId}/media`, token, {
    fields,
    limit: String(limit),
  })

  if (!media.ok) {
    throw new Error(media.error || `Instagram fetch failed: ${media.status}`)
  }

  return Array.isArray(media.data?.data) ? media.data.data : []
}
