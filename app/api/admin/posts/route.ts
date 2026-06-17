import { NextRequest, NextResponse } from 'next/server'
import { supabasePatch, supabaseSelect } from '@/lib/supabase-rest'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
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

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const body = await request.json()
  const id = body.id

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing post id' }, { status: 400 })
  }

  const allowed = ['title', 'description', 'caption', 'post_type', 'category', 'logo', 'teams', 'media_url', 'permalink', 'is_featured', 'is_hidden']
  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))
  ;(patch as { updated_at?: string }).updated_at = new Date().toISOString()

  const result = await supabasePatch('roar_posts', id, patch)

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, post: result.data?.[0] || null })
}
