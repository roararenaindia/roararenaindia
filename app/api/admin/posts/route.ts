import { NextRequest, NextResponse } from 'next/server'
import { supabaseInsert, supabasePatch, supabaseSelect } from '@/lib/services/supabase-rest'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const result = await supabaseSelect(
    'roar_posts',
    'select=*&order=posted_at.desc.nullslast&limit=50',
  )

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, posts: result.data || [] })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const body = await request.json()
  const mediaUrl = typeof body.media_url === 'string' ? body.media_url.trim() : ''
  const caption = typeof body.caption === 'string' ? body.caption.trim() : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''

  if (!mediaUrl) {
    return NextResponse.json({ ok: false, error: 'Image/media URL is required' }, { status: 400 })
  }

  const record = {
    instagram_id: typeof body.instagram_id === 'string' ? body.instagram_id.trim() : null,
    title: title || caption.split('\n').find(Boolean)?.slice(0, 58) || 'Roar Arena Update',
    caption,
    description: typeof body.description === 'string' ? body.description.trim() : '',
    media_url: mediaUrl,
    permalink: typeof body.permalink === 'string' ? body.permalink.trim() : '',
    post_type: typeof body.post_type === 'string' ? body.post_type.trim() || 'Announcement' : 'Announcement',
    category: typeof body.category === 'string' ? body.category.trim() || 'Roar Arena' : 'Roar Arena',
    logo: typeof body.logo === 'string' ? body.logo.trim() : '',
    teams: Array.isArray(body.teams) ? body.teams : [],
    sync_source: 'manual',
    source_payload: { source: 'admin-manual' },
    posted_at: body.posted_at || new Date().toISOString(),
    is_featured: Boolean(body.is_featured),
    is_hidden: Boolean(body.is_hidden),
  }

  const result = await supabaseInsert('roar_posts', record)

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, post: result.data?.[0] || null }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const body = await request.json()
  const id = body.id

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing post id' }, { status: 400 })
  }

  const allowed = ['title', 'description', 'caption', 'post_type', 'category', 'logo', 'teams', 'media_url', 'permalink', 'posted_at', 'is_featured', 'is_hidden']
  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))
  ;(patch as { updated_at?: string }).updated_at = new Date().toISOString()

  const result = await supabasePatch('roar_posts', id, patch)

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, post: result.data?.[0] || null })
}
