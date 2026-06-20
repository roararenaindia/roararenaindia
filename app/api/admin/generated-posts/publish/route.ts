import { NextRequest, NextResponse } from 'next/server'
import { inferCategory, inferLeagueLogo, inferPostType, inferTeams } from '@/lib/domain/content-inference'
import { supabasePatch, supabaseSelect, supabaseUpsert } from '@/lib/services/supabase-rest'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

type GeneratedPost = {
  id: string
  title: string
  caption?: string | null
  template_kind: string
  status: string
  svg: string
  template_payload?: Record<string, unknown> | null
}

function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const body = await request.json()
  const id = body.id

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing generated post id' }, { status: 400 })
  }

  const selectResult = await supabaseSelect<GeneratedPost>(
    'roar_generated_posts',
    `select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
  )

  if (selectResult.error) {
    return NextResponse.json({ ok: false, error: selectResult.error }, { status: 500 })
  }

  const generated = selectResult.data?.[0]

  if (!generated) {
    return NextResponse.json({ ok: false, error: 'Generated post not found' }, { status: 404 })
  }

  const caption = generated.caption || ''
  const payload = generated.template_payload || {}
  const category = typeof payload.league === 'string' ? payload.league : inferCategory(`${generated.title} ${caption}`)
  const postType = generated.template_kind === 'fixtures' ? 'Fixtures' : generated.template_kind === 'preview' ? 'Preview' : inferPostType(`${generated.title} ${caption}`)

  const record = {
    instagram_id: `generated-${generated.id}`,
    title: generated.title,
    caption,
    description: caption || `Generated ${postType.toLowerCase()} post from Roar Arena Studio.`,
    media_url: svgDataUri(generated.svg),
    permalink: null,
    media_type: 'IMAGE',
    post_type: postType,
    category,
    logo: typeof payload.leagueLogo === 'string' ? payload.leagueLogo : inferLeagueLogo(category),
    teams: inferTeams(`${generated.title} ${caption}`, category),
    is_hidden: false,
    is_featured: true,
    posted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const upsertResult = await supabaseUpsert('roar_posts', [record], 'instagram_id')

  if (upsertResult.error) {
    return NextResponse.json({ ok: false, error: upsertResult.error }, { status: 500 })
  }

  await supabasePatch('roar_generated_posts', id, {
    status: 'published',
    published_at: new Date().toISOString(),
    published_post_id: (upsertResult.data as Array<{ id?: string }> | null)?.[0]?.id || null,
    updated_at: new Date().toISOString(),
  })

  return NextResponse.json({
    ok: true,
    post: upsertResult.data?.[0] || null,
  })
}
