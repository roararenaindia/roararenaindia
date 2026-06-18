import { NextRequest, NextResponse } from 'next/server'
import { descriptionFromCaption, inferCategory, inferLeagueLogo, inferPostType, inferTeams, titleFromCaption } from '@/lib/domain/content-inference'
import { createXTextCardDataUri } from '@/lib/templates/x-post-card'
import { hasSupabaseWriteAccess, supabaseUpsert } from '@/lib/services/supabase-rest'
import { writeSyncLog } from '@/lib/services/sync-log'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

type XMedia = {
  media_key: string
  type?: string
  url?: string
  preview_image_url?: string
}

type XPost = {
  id: string
  text: string
  created_at?: string
  attachments?: { media_keys?: string[] }
}

async function fetchXPosts(userId: string, token: string, limit: number) {
  const params = new URLSearchParams({
    max_results: String(Math.max(5, Math.min(limit, 100))),
    'tweet.fields': 'created_at,text,attachments',
    expansions: 'attachments.media_keys',
    'media.fields': 'media_key,type,url,preview_image_url,width,height',
    exclude: 'replies,retweets',
  })

  const response = await fetch(`https://api.x.com/2/users/${userId}/tweets?${params.toString()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.detail || data?.title || data?.errors?.[0]?.message || `X sync failed: ${response.status}`)

  const media = new Map<string, XMedia>()
  for (const item of data?.includes?.media || []) media.set(item.media_key, item)

  return {
    posts: Array.isArray(data?.data) ? (data.data as XPost[]) : [],
    media,
  }
}

function getPostMedia(post: XPost, media: Map<string, XMedia>) {
  const keys = post.attachments?.media_keys || []
  for (const key of keys) {
    const item = media.get(key)
    if (!item) continue
    if (item.url) return item.url
    if (item.preview_image_url) return item.preview_image_url
  }
  return createXTextCardDataUri(post.text)
}

function mapXPost(post: XPost, media: Map<string, XMedia>) {
  const caption = post.text || ''
  const category = inferCategory(caption)
  const postType = inferPostType(caption)
  const username = process.env.X_USERNAME || 'RoarArenaIndia'

  return {
    instagram_id: `x-${post.id}`,
    title: titleFromCaption(caption, `${category} Update`),
    caption,
    description: descriptionFromCaption(caption),
    media_url: getPostMedia(post, media),
    remote_media_url: null,
    thumbnail_url: null,
    storage_path: null,
    permalink: `https://x.com/${username}/status/${post.id}`,
    media_type: 'X_POST',
    post_type: postType,
    category,
    logo: inferLeagueLogo(category),
    teams: inferTeams(caption),
    sync_source: 'x',
    source_payload: post,
    last_synced_at: new Date().toISOString(),
    posted_at: post.created_at,
    updated_at: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 })
  }

  const token = process.env.X_BEARER_TOKEN
  const userId = process.env.X_USER_ID
  const limit = Number(process.env.X_SYNC_LIMIT || 10)

  if (!token || !userId) {
    await writeSyncLog({
      source: 'x',
      status: 'warning',
      message: 'X env vars are missing',
      details: { hasUserId: Boolean(userId), hasToken: Boolean(token) },
    })

    return NextResponse.json({
      ok: true,
      mode: 'not_configured',
      message: 'X sync route is ready. Add X_BEARER_TOKEN and X_USER_ID to enable live sync.',
    })
  }

  if (!hasSupabaseWriteAccess()) {
    await writeSyncLog({ source: 'x', status: 'warning', message: 'Supabase write access missing' })
    return NextResponse.json({
      ok: true,
      mode: 'database_not_configured',
      message: 'X fetch is ready, but SUPABASE_SERVICE_ROLE_KEY is missing. Add Supabase env vars to persist posts.',
    })
  }

  try {
    const { posts, media } = await fetchXPosts(userId, token, limit)
    const records = posts.map((post) => mapXPost(post, media))
    const upsertResult = await supabaseUpsert('roar_posts', records, 'instagram_id')

    if (upsertResult.error) {
      await writeSyncLog({ source: 'x', status: 'error', fetchedCount: posts.length, savedCount: 0, message: upsertResult.error })
      return NextResponse.json({ ok: false, mode: 'supabase_error', error: upsertResult.error }, { status: 500 })
    }

    await writeSyncLog({
      source: 'x',
      status: 'success',
      fetchedCount: posts.length,
      savedCount: upsertResult.data?.length || records.length,
      message: 'X sync complete',
    })

    return NextResponse.json({
      ok: true,
      mode: 'synced',
      fetched: posts.length,
      upserted: upsertResult.data?.length || records.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'X sync failed'
    await writeSyncLog({ source: 'x', status: 'error', message })
    return NextResponse.json({ ok: false, mode: 'x_error', error: message }, { status: 502 })
  }
}
