import { NextRequest, NextResponse } from 'next/server'
import { descriptionFromCaption, inferCategory, inferLeagueLogo, inferPostType, inferTeams, titleFromCaption } from '@/lib/domain/content-inference'
import { mirrorInstagramMedia } from '@/lib/services/supabase-storage'
import { hasSupabaseWriteAccess, supabaseUpsert } from '@/lib/services/supabase-rest'
import { writeSyncLog } from '@/lib/services/sync-log'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

type InstagramMedia = {
  id: string
  caption?: string
  media_type?: string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  timestamp?: string
  username?: string
}

async function fetchInstagramMedia(igUserId: string, token: string, limit: number) {
  const fields = 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,username'
  const url = `https://graph.facebook.com/v20.0/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${token}`
  const response = await fetch(url, { cache: 'no-store' })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error?.message || `Instagram fetch failed: ${response.status}`)
  }

  return Array.isArray(data?.data) ? (data.data as InstagramMedia[]) : []
}

async function mapInstagramPost(item: InstagramMedia) {
  const caption = item.caption || ''
  const category = inferCategory(caption)
  const postType = inferPostType(caption)
  const sourceUrl = item.media_type === 'VIDEO' ? item.thumbnail_url || item.media_url : item.media_url
  const mirrored = await mirrorInstagramMedia({
    instagramId: item.id,
    remoteUrl: item.media_url,
    thumbnailUrl: item.thumbnail_url,
    mediaType: item.media_type,
  })

  return {
    instagram_id: item.id,
    title: titleFromCaption(caption, `${category} Update`),
    caption,
    description: descriptionFromCaption(caption),
    media_url: mirrored.mediaUrl || sourceUrl,
    remote_media_url: sourceUrl || null,
    thumbnail_url: item.thumbnail_url || null,
    storage_path: mirrored.storagePath,
    permalink: item.permalink,
    media_type: item.media_type || 'IMAGE',
    post_type: postType,
    category,
    logo: inferLeagueLogo(category),
    teams: inferTeams(caption),
    sync_source: 'instagram',
    source_payload: item,
    last_synced_at: new Date().toISOString(),
    posted_at: item.timestamp,
    updated_at: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request' }, { status: 401 })
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const igUserId = process.env.INSTAGRAM_USER_ID
  const limit = Number(process.env.INSTAGRAM_SYNC_LIMIT || 18)

  if (!token || !igUserId) {
    await writeSyncLog({
      source: 'instagram',
      status: 'warning',
      message: 'Instagram env vars are missing',
      details: { hasUserId: Boolean(igUserId), hasToken: Boolean(token) },
    })

    return NextResponse.json({
      ok: true,
      mode: 'not_configured',
      message: 'Instagram sync route is ready. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to enable live sync.',
    })
  }

  if (!hasSupabaseWriteAccess()) {
    await writeSyncLog({
      source: 'instagram',
      status: 'warning',
      message: 'Supabase write access missing',
    })

    return NextResponse.json({
      ok: true,
      mode: 'database_not_configured',
      message: 'Instagram fetch is ready, but SUPABASE_SERVICE_ROLE_KEY is missing. Add Supabase env vars to persist posts.',
    })
  }

  try {
    const rawPosts = await fetchInstagramMedia(igUserId, token, limit)
    const mapped = await Promise.all(rawPosts.map(mapInstagramPost))
    const records = mapped.filter((post) => Boolean(post.media_url))

    const upsertResult = await supabaseUpsert('roar_posts', records, 'instagram_id')

    if (upsertResult.error) {
      await writeSyncLog({
        source: 'instagram',
        status: 'error',
        fetchedCount: rawPosts.length,
        savedCount: 0,
        message: upsertResult.error,
      })

      return NextResponse.json({ ok: false, mode: 'supabase_error', error: upsertResult.error }, { status: 500 })
    }

    const storedCount = records.filter((record) => Boolean(record.storage_path)).length

    await writeSyncLog({
      source: 'instagram',
      status: 'success',
      fetchedCount: rawPosts.length,
      savedCount: upsertResult.data?.length || records.length,
      message: 'Instagram sync complete',
      details: {
        storedCount,
        usedRemoteFallback: records.length - storedCount,
      },
    })

    return NextResponse.json({
      ok: true,
      mode: 'synced',
      fetched: rawPosts.length,
      upserted: upsertResult.data?.length || records.length,
      mirroredToStorage: storedCount,
      remoteFallback: records.length - storedCount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Instagram sync failed'

    await writeSyncLog({
      source: 'instagram',
      status: 'error',
      message,
    })

    return NextResponse.json({ ok: false, mode: 'instagram_error', error: message }, { status: 502 })
  }
}
