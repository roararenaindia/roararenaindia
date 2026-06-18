import { NextRequest, NextResponse } from 'next/server'
import { supabasePatch, supabaseSelect } from '@/lib/services/supabase-rest'

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
    'roar_matches',
    'select=*&order=priority.desc,kickoff_time.asc.nullslast&limit=80',
  )

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, matches: result.data || [] })
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const body = await request.json()
  const id = body.id

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing match id' }, { status: 400 })
  }

  const allowed = [
    'league',
    'league_logo',
    'home_team',
    'away_team',
    'home_short',
    'away_short',
    'home_logo',
    'away_logo',
    'home_score',
    'away_score',
    'status',
    'status_label',
    'kickoff_time',
    'venue',
    'winner',
    'priority',
    'is_featured',
    'is_hidden',
  ]

  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))
  ;(patch as { updated_at?: string }).updated_at = new Date().toISOString()

  const result = await supabasePatch('roar_matches', id, patch)

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, match: result.data?.[0] || null })
}
