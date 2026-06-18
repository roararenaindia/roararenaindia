type StorageConfig = {
  url?: string
  serviceRoleKey?: string
  bucket: string
  configured: boolean
}

function getStorageConfig(): StorageConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.INSTAGRAM_STORAGE_BUCKET || 'roar-instagram'

  return {
    url,
    serviceRoleKey,
    bucket,
    configured: Boolean(url && serviceRoleKey),
  }
}

function getMimeExtension(contentType: string | null, fallbackMediaType?: string) {
  const type = (contentType || '').toLowerCase()
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg'
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  if (type.includes('gif')) return 'gif'
  if (type.includes('mp4')) return 'mp4'
  if (fallbackMediaType === 'VIDEO') return 'jpg'
  return 'jpg'
}

function headers(config: StorageConfig, contentType?: string) {
  return {
    apikey: config.serviceRoleKey || '',
    Authorization: `Bearer ${config.serviceRoleKey}`,
    ...(contentType ? { 'Content-Type': contentType } : {}),
  }
}

export function isStorageConfigured() {
  return getStorageConfig().configured
}

export async function checkInstagramStorageBucket() {
  const config = getStorageConfig()

  if (!config.configured || !config.url || !config.serviceRoleKey) {
    return {
      ok: false,
      bucket: config.bucket,
      configured: false,
      public: false,
      error: 'Supabase storage is not configured',
    }
  }

  const base = config.url.replace(/\/$/, '')
  const response = await fetch(`${base}/storage/v1/bucket/${encodeURIComponent(config.bucket)}`, {
    cache: 'no-store',
    headers: headers(config),
  })

  if (!response.ok) {
    return {
      ok: false,
      bucket: config.bucket,
      configured: true,
      public: false,
      error: `Bucket not found or not readable: ${response.status}`,
    }
  }

  const data = await response.json().catch(() => null)

  return {
    ok: true,
    bucket: config.bucket,
    configured: true,
    public: Boolean(data?.public),
    error: null,
  }
}

export async function ensureInstagramStorageBucket() {
  const config = getStorageConfig()

  if (!config.configured || !config.url || !config.serviceRoleKey) {
    return { ok: false, bucket: config.bucket, error: 'Supabase storage is not configured' }
  }

  const current = await checkInstagramStorageBucket()
  if (current.ok) return { ok: true, bucket: config.bucket, created: false, public: current.public }

  const base = config.url.replace(/\/$/, '')
  const response = await fetch(`${base}/storage/v1/bucket`, {
    method: 'POST',
    headers: headers(config, 'application/json'),
    body: JSON.stringify({
      id: config.bucket,
      name: config.bucket,
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    }),
  })

  if (!response.ok && response.status !== 409) {
    const text = await response.text().catch(() => '')
    return { ok: false, bucket: config.bucket, error: text || `Bucket create failed: ${response.status}` }
  }

  return { ok: true, bucket: config.bucket, created: response.status !== 409, public: true }
}

export async function mirrorInstagramMedia(params: {
  instagramId: string
  remoteUrl?: string
  thumbnailUrl?: string
  mediaType?: string
}) {
  const config = getStorageConfig()
  const sourceUrl = params.mediaType === 'VIDEO' ? params.thumbnailUrl || params.remoteUrl : params.remoteUrl

  if (!sourceUrl) {
    return {
      stored: false,
      mediaUrl: '',
      remoteMediaUrl: '',
      storagePath: null as string | null,
      error: 'No media URL found',
    }
  }

  if (!config.configured || !config.url || !config.serviceRoleKey) {
    return {
      stored: false,
      mediaUrl: sourceUrl,
      remoteMediaUrl: sourceUrl,
      storagePath: null as string | null,
      error: 'Storage not configured, using Instagram CDN URL',
    }
  }

  const bucket = await ensureInstagramStorageBucket()
  if (!bucket.ok) {
    return {
      stored: false,
      mediaUrl: sourceUrl,
      remoteMediaUrl: sourceUrl,
      storagePath: null as string | null,
      error: bucket.error || 'Storage bucket unavailable, using Instagram CDN URL',
    }
  }

  const mediaResponse = await fetch(sourceUrl, { cache: 'no-store' })
  if (!mediaResponse.ok) {
    return {
      stored: false,
      mediaUrl: sourceUrl,
      remoteMediaUrl: sourceUrl,
      storagePath: null as string | null,
      error: `Could not fetch Instagram media: ${mediaResponse.status}`,
    }
  }

  const contentType = mediaResponse.headers.get('content-type') || 'image/jpeg'
  const extension = getMimeExtension(contentType, params.mediaType)
  const storagePath = `instagram/${params.instagramId}.${extension}`
  const arrayBuffer = await mediaResponse.arrayBuffer()

  const base = config.url.replace(/\/$/, '')
  const uploadResponse = await fetch(`${base}/storage/v1/object/${config.bucket}/${storagePath}`, {
    method: 'POST',
    headers: {
      ...headers(config, contentType),
      'x-upsert': 'true',
      'cache-control': '31536000',
    },
    body: arrayBuffer,
  })

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text().catch(() => '')
    return {
      stored: false,
      mediaUrl: sourceUrl,
      remoteMediaUrl: sourceUrl,
      storagePath,
      error: text || `Storage upload failed: ${uploadResponse.status}`,
    }
  }

  return {
    stored: true,
    mediaUrl: `${base}/storage/v1/object/public/${config.bucket}/${storagePath}`,
    remoteMediaUrl: sourceUrl,
    storagePath,
    error: null,
  }
}
