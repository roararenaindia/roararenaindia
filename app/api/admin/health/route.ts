import { NextRequest, NextResponse } from 'next/server'
import { hasSupabaseWriteAccess, isSupabaseConfigured } from '@/lib/supabase-rest'

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

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    supabaseRead: isSupabaseConfigured('read'),
    supabaseWrite: hasSupabaseWriteAccess(),
    instagramConfigured: Boolean(process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN),
    xConfigured: Boolean(process.env.X_USER_ID && process.env.X_BEARER_TOKEN),
    apiFootballConfigured: Boolean(process.env.API_FOOTBALL_KEY),
    mode: process.env.NEXT_PUBLIC_ROAR_DATA_MODE || 'static-fallback',
  })
}
