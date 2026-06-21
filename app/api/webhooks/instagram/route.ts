import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { callInternalSync } from '@/lib/services/internal-sync'
import { writeSyncLog } from '@/lib/services/sync-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function verifyToken(token: string | null) {
  const expected = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN
  return Boolean(expected && token && token === expected)
}

function signatureIsValid(rawBody: Buffer, signature: string | null) {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret || !signature?.startsWith('sha256=')) return false

  const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`
  const actualBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

function eventCount(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('entry' in payload)) return 0
  const entries = (payload as { entry?: unknown }).entry
  return Array.isArray(entries) ? entries.length : 0
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && verifyToken(token) && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return NextResponse.json({ ok: false, error: 'Invalid Instagram webhook verification request' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  const rawBody = Buffer.from(await request.arrayBuffer())
  const signature = request.headers.get('x-hub-signature-256')

  if (!process.env.META_APP_SECRET) {
    await writeSyncLog({
      source: 'instagram',
      status: 'warning',
      message: 'Instagram webhook received, but META_APP_SECRET is not configured.',
    })
    return NextResponse.json({ ok: false, error: 'Instagram webhook signing secret is not configured' }, { status: 500 })
  }

  if (!signatureIsValid(rawBody, signature)) {
    await writeSyncLog({
      source: 'instagram',
      status: 'warning',
      message: 'Instagram webhook rejected because signature verification failed.',
    })
    return NextResponse.json({ ok: false, error: 'Invalid Instagram webhook signature' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = rawBody.length ? JSON.parse(rawBody.toString('utf8')) : {}
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid Instagram webhook JSON payload' }, { status: 400 })
  }

  const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const secret = process.env.CRON_SECRET
  const instagram = await callInternalSync(origin, '/api/sync/instagram', secret)
  const curation = instagram.ok
    ? await callInternalSync(origin, '/api/admin/auto-curate', secret)
    : null

  await writeSyncLog({
    source: 'instagram',
    status: instagram.ok && (!curation || curation.ok) ? 'success' : 'error',
    fetchedCount: instagram.fetched || 0,
    savedCount: instagram.ok ? instagram.fetched || 0 : 0,
    message: instagram.ok
      ? 'Instagram webhook processed and sync was triggered.'
      : instagram.message || 'Instagram webhook sync failed.',
    details: {
      eventCount: eventCount(payload),
      instagram: {
        ok: instagram.ok,
        status: instagram.status,
        mode: instagram.mode,
        message: instagram.message,
      },
      curation: curation
        ? {
            ok: curation.ok,
            status: curation.status,
            mode: curation.mode,
            message: curation.message,
          }
        : null,
    },
  })

  return NextResponse.json({
    ok: true,
    mode: 'instagram_webhook_received',
    eventCount: eventCount(payload),
    sync: {
      instagram: {
        ok: instagram.ok,
        status: instagram.status,
        mode: instagram.mode,
        message: instagram.message,
        fetched: instagram.fetched,
      },
      curation: curation
        ? {
            ok: curation.ok,
            status: curation.status,
            mode: curation.mode,
            message: curation.message,
          }
        : null,
    },
  })
}
