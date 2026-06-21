import { NextRequest, NextResponse } from 'next/server'
import { checkMatchProviderRange } from '@/lib/services/match-data-provider'
import { getLiveHomePayload } from '@/lib/services/live-home'
import { hasSupabaseWriteAccess, isSupabaseConfigured, supabaseSelect } from '@/lib/services/supabase-rest'
import { checkInstagramStorageBucket } from '@/lib/services/supabase-storage'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

function isoDateOffset(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

async function checkMatchProvider() {
  const pastDays = Number(process.env.MATCH_SYNC_PAST_DAYS || 7)
  const futureDays = Number(process.env.MATCH_SYNC_FUTURE_DAYS || 7)
  const from = isoDateOffset(-pastDays)
  const to = isoDateOffset(futureDays)
  return checkMatchProviderRange(from, to)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized request' }, { status: 401 })
  }

  const payload = await getLiveHomePayload()
  const queue = await supabaseSelect('roar_generated_posts', 'select=id,status&limit=20', 'write')
  const posts = await supabaseSelect('roar_posts', 'select=id,is_hidden&limit=20', 'write')
  const matches = await supabaseSelect('roar_matches', 'select=id,is_hidden&limit=20', 'write')
  const syncRuns = await supabaseSelect('roar_sync_runs', 'select=id,source,status&limit=5', 'write')
  const storage = await checkInstagramStorageBucket()
  const matchProvider = await checkMatchProvider()

  const checks = {
    env: {
      cronSecret: Boolean(process.env.CRON_SECRET),
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      instagramUserId: Boolean(process.env.INSTAGRAM_USER_ID),
      instagramAccessToken: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN),
      instagramWebhookVerifyToken: Boolean(process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN),
      metaAppSecret: Boolean(process.env.META_APP_SECRET),
      footballDataToken: Boolean(process.env.FOOTBALL_DATA_TOKEN),
      apiFootballKey: Boolean(process.env.API_FOOTBALL_KEY),
      xUserId: Boolean(process.env.X_USER_ID),
      xBearerToken: Boolean(process.env.X_BEARER_TOKEN),
      contactEmail: Boolean(process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'roararenaindia@gmail.com'),
    },
    socialLinks: {
      instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/roararenaindia/',
      facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/RoarArena',
      x: process.env.NEXT_PUBLIC_X_URL || 'https://x.com/RoarArenaIndia',
      whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb8bGxc7oQhX9QvoPG1R',
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'roararenaindia@gmail.com',
    },
    supabase: {
      read: isSupabaseConfigured('read'),
      write: hasSupabaseWriteAccess(),
      postsTable: !posts.error,
      matchesTable: !matches.error,
      generatedPostsTable: !queue.error,
      syncRunsTable: !syncRuns.error,
      instagramStorageBucket: storage.ok,
    },
    apiFootball: matchProvider,
    publicHome: {
      source: payload.source,
      posts: payload.posts?.length || 0,
      matches: payload.matches?.length || 0,
      heroReady: Boolean(payload.heroMatch),
    },
    automation: {
      instagramRoute: true,
      instagramWebhookRoute: true,
      xRoute: true,
      autoCurateRoute: true,
      matchRoute: true,
      matchCronEvery2Hours: true,
      socialCronEnabledWhenConfigured: true,
      autoCurateAfterMatchSync: true,
      templateStudio: true,
      approvalQueue: !queue.error,
      syncLogging: !syncRuns.error,
      instagramStorage: storage.ok,
      adminDashboard: true,
    },
  }

  const required = [
    checks.env.cronSecret,
    checks.supabase.read,
    checks.supabase.write,
    checks.supabase.postsTable,
    checks.supabase.matchesTable,
    checks.supabase.generatedPostsTable,
    checks.supabase.syncRunsTable,
    checks.env.instagramUserId,
    checks.env.instagramAccessToken,
    checks.env.instagramWebhookVerifyToken,
    checks.env.metaAppSecret,
    checks.publicHome.heroReady,
    checks.apiFootball.configured,
    checks.apiFootball.statusReachable,
    checks.apiFootball.fixturesReachable,
  ]

  return NextResponse.json({
    ok: true,
    productionReady: required.every(Boolean),
    checks,
    warnings: [
      !checks.env.instagramUserId || !checks.env.instagramAccessToken ? 'Instagram automation is enabled when Vercel has INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN.' : null,
      !checks.env.instagramWebhookVerifyToken || !checks.env.metaAppSecret ? 'Near-instant Instagram updates require INSTAGRAM_WEBHOOK_VERIFY_TOKEN and META_APP_SECRET.' : null,
      !checks.supabase.instagramStorageBucket ? 'Instagram storage is optional for this phase.' : null,
      !checks.apiFootball.configured ? 'Match provider is not connected yet. Add FOOTBALL_DATA_TOKEN for the free provider.' : null,
      checks.apiFootball.configured && !checks.apiFootball.fixturesReachable ? `Match provider could not fetch fixtures: ${checks.apiFootball.error}` : null,
      !checks.env.xUserId || !checks.env.xBearerToken ? 'X automation will be skipped until X_USER_ID and X_BEARER_TOKEN are added.' : null,
      payload.source?.includes('fallback') ? 'Homepage is still using fallback data until Supabase sync runs.' : null,
    ].filter(Boolean),
  })
}
