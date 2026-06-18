import { NextRequest, NextResponse } from 'next/server'
import { liveMatches } from '@/lib/data/arena-live-data'
import { siteConfig } from '@/lib/config/site-data'
import { hasSupabaseWriteAccess, supabaseUpsert } from '@/lib/services/supabase-rest'

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

  if (!hasSupabaseWriteAccess()) {
    return NextResponse.json({ ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is required to seed content' }, { status: 500 })
  }

  const postRecords = siteConfig.posts.map((post) => ({
    instagram_id: `seed-${post.id}`,
    title: post.title,
    caption: post.caption,
    description: post.description,
    media_url: post.image,
    permalink: (post as { permalink?: string }).permalink || siteConfig.links.instagram,
    media_type: 'IMAGE',
    post_type: post.type,
    category: post.category,
    logo: post.logo,
    teams: post.teams,
    is_hidden: false,
    is_featured: false,
    posted_at: (post as { timestamp?: string }).timestamp || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const matchRecords = liveMatches.map((match) => ({
    provider_match_id: match.id,
    sport: match.sport,
    league: match.league,
    league_logo: match.leagueLogo,
    home_team: match.home.name,
    away_team: match.away.name,
    home_short: match.home.short || null,
    away_short: match.away.short || null,
    home_logo: match.home.logo,
    away_logo: match.away.logo,
    home_score: match.homeScore || null,
    away_score: match.awayScore || null,
    status: match.status,
    status_label: match.statusLabel,
    kickoff_time: (match as { kickoffIso?: string }).kickoffIso || null,
    venue: match.venue,
    winner: match.winner || null,
    priority: match.priority,
    is_featured: match.priority >= 90,
    updated_at: new Date().toISOString(),
  }))

  const posts = await supabaseUpsert('roar_posts', postRecords, 'instagram_id')
  const matches = await supabaseUpsert('roar_matches', matchRecords, 'provider_match_id')

  if (posts.error || matches.error) {
    return NextResponse.json({ ok: false, postsError: posts.error, matchesError: matches.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    posts: posts.data?.length || postRecords.length,
    matches: matches.data?.length || matchRecords.length,
  })
}
