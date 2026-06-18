import { NextRequest, NextResponse } from 'next/server'

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
    phases: [
      'Phase 1: cleaned public website',
      'Phase 2: Supabase live data',
      'Phase 3: private admin dashboard',
      'Phase 4: template studio',
      'Phase 5: approval queue',
      'Phase 6: integration checker and launch readiness',
    ],
    launchOrder: [
      'Deploy latest zip',
      'Run supabase/schema.sql',
      'Add env vars in Vercel',
      'Open /admin and save CRON_SECRET',
      'Click Final Check',
      'Click Seed if database is empty',
      'Click Check Match API',
      'Click Sync Matches',
      'Click Curate',
      'Set external scheduler to call /api/cron/roar every 2 hours',
      'Open /studio and generate a post',
      'Save Queue',
      'Approve and Publish from /admin',
    ],
  })
}
