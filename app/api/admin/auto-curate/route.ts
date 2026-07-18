import { NextRequest, NextResponse } from 'next/server'
import { sortMatchesForBoard } from '@/lib/domain/match-selection'
import { supabasePatch, supabasePatchByQuery, supabaseSelect } from '@/lib/services/supabase-rest'
import { writeSyncLog } from '@/lib/services/sync-log'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

type MatchRow = {
  id: string
  status: string
  kickoff_time?: string | null
  priority?: number | null
  is_hidden?: boolean | null
}

type PostRow = {
  id: string
  posted_at?: string | null
  is_hidden?: boolean | null
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const matches = await supabaseSelect<MatchRow>(
    'roar_matches',
    'select=id,status,kickoff_time,priority,is_hidden&or=(is_hidden.is.null,is_hidden.eq.false)&limit=80',
    'write',
  )

  if (matches.error) {
    await writeSyncLog({ source: 'curation', status: 'error', message: matches.error })
    return NextResponse.json({ ok: false, error: matches.error }, { status: 500 })
  }

  const sortedMatches = sortMatchesForBoard([...(matches.data || [])])
  const hero = sortedMatches[0]

  if (hero) {
    await supabasePatchByQuery('roar_matches', 'is_featured=eq.true', { is_featured: false, updated_at: new Date().toISOString() })
    await supabasePatch('roar_matches', hero.id, { is_featured: true, priority: 999, updated_at: new Date().toISOString() })
  }

  const posts = await supabaseSelect<PostRow>(
    'roar_posts',
    'select=id,posted_at,is_hidden&or=(is_hidden.is.null,is_hidden.eq.false)&order=posted_at.desc.nullslast&limit=6',
    'write',
  )

  if (!posts.error) {
    await supabasePatchByQuery('roar_posts', 'is_featured=eq.true', { is_featured: false, updated_at: new Date().toISOString() })
    for (const post of posts.data || []) {
      await supabasePatch('roar_posts', post.id, { is_featured: true, updated_at: new Date().toISOString() })
    }
  }

  await writeSyncLog({
    source: 'curation',
    status: 'success',
    fetchedCount: (matches.data || []).length + (posts.data || []).length,
    savedCount: (hero ? 1 : 0) + (posts.data?.length || 0),
    message: 'Auto curation complete',
    details: { heroMatchId: hero?.id || null },
  })

  return NextResponse.json({
    ok: true,
    mode: 'curated',
    heroMatchId: hero?.id || null,
    featuredPosts: posts.data?.length || 0,
  })
}
