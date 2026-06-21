import { NextRequest, NextResponse } from 'next/server'
import { hasAnyMatchProvider } from '@/lib/services/match-data-provider'
import { hasSupabaseWriteAccess, isSupabaseConfigured } from '@/lib/services/supabase-rest'

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

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    supabaseRead: isSupabaseConfigured('read'),
    supabaseWrite: hasSupabaseWriteAccess(),
    instagramConfigured: Boolean(process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN),
    instagramWebhookConfigured: Boolean(process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN && process.env.META_APP_SECRET),
    xConfigured: Boolean(process.env.X_USER_ID && process.env.X_BEARER_TOKEN),
    apiFootballConfigured: hasAnyMatchProvider(),
    mode: isSupabaseConfigured('read') ? 'supabase-ready' : 'static-fallback',
  })
}
