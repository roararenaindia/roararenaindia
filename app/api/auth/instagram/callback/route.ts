import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function htmlPage(title: string, message: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | Roar Arena</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #07110f; color: #f4fff9; font-family: ui-sans-serif, system-ui, sans-serif; }
      main { width: min(92vw, 560px); padding: 32px; border: 1px solid rgba(154, 255, 194, 0.28); border-radius: 24px; background: linear-gradient(145deg, rgba(16, 46, 36, 0.94), rgba(4, 16, 14, 0.98)); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34); }
      p { line-height: 1.65; color: #cce9dd; }
      a { color: #91ffc5; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
      <p><a href="/admin">Return to Roar Arena admin</a></p>
    </main>
  </body>
</html>`
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error') || request.nextUrl.searchParams.get('error_reason')
  const hasCode = Boolean(request.nextUrl.searchParams.get('code'))

  const title = error
    ? 'Instagram Login Was Not Completed'
    : hasCode
      ? 'Instagram Login Response Received'
      : 'Instagram Business Login Callback Ready'
  const message = error
    ? 'Meta returned without completing Instagram Business Login. Roar Arena live Instagram sync can still run from the configured long-lived server token.'
    : hasCode
      ? 'Meta returned an authorization response to Roar Arena. The production Instagram sync uses the secure long-lived server token configured in Vercel, so no code is displayed here.'
      : 'This production endpoint is ready to receive Meta Instagram Business Login redirects.'

  return new NextResponse(htmlPage(title, message), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
    },
  })
}
