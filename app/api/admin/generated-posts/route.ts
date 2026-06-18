import { NextRequest, NextResponse } from 'next/server'
import { supabaseInsert, supabasePatch, supabaseSelect } from '@/lib/services/supabase-rest'

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
    'roar_generated_posts',
    'select=*&order=created_at.desc&limit=80',
  )

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, generatedPosts: result.data || [] })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const body = await request.json()

  if (!body.svg || !body.template_kind) {
    return NextResponse.json({ ok: false, error: 'Missing svg or template_kind' }, { status: 400 })
  }

  const record = {
    title: body.title || `${body.template_kind} post`,
    caption: body.caption || '',
    template_kind: body.template_kind,
    status: body.status || 'draft',
    svg: body.svg,
    template_payload: body.template_payload || {},
    source_match_id: body.source_match_id || null,
    is_hidden: false,
    updated_at: new Date().toISOString(),
  }

  const result = await supabaseInsert('roar_generated_posts', record)

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, generatedPost: result.data?.[0] || null })
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const body = await request.json()
  const id = body.id

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing generated post id' }, { status: 400 })
  }

  const allowed = ['title', 'caption', 'status', 'template_payload', 'source_match_id', 'is_hidden']
  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))

  if (patch.status === 'approved') {
    ;(patch as { approved_at?: string }).approved_at = new Date().toISOString()
  }

  ;(patch as { updated_at?: string }).updated_at = new Date().toISOString()

  const result = await supabasePatch('roar_generated_posts', id, patch)

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, generatedPost: result.data?.[0] || null })
}
