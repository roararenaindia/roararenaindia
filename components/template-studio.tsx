'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Download, ImageDown, Loader2, RefreshCw, Save, Sparkles, Wand2 } from '@/components/icon-set'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'
import {
  defaultFixturesTemplate,
  defaultInstagramTemplate,
  defaultPreviewTemplate,
  type InstagramTemplateInput,
  type TemplateFixture,
  type TemplateKind,
} from '@/lib/post-template-types'
import type { ArenaMatch } from '@/lib/arena-live-data'

const presets: Record<TemplateKind, InstagramTemplateInput> = {
  result: defaultInstagramTemplate,
  fixtures: defaultFixturesTemplate,
  preview: defaultPreviewTemplate,
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function downloadText(filename: string, text: string, mime = 'image/svg+xml') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function toInputFromMatch(match: ArenaMatch): InstagramTemplateInput {
  const isFinal = match.status === 'final'
  return {
    kind: isFinal ? 'result' : 'preview',
    headline: isFinal ? 'MATCH RESULT' : 'UP NEXT',
    eyebrow: match.league.toUpperCase(),
    league: match.league,
    date: match.dateLabel,
    venue: match.venue,
    brandLogo: '/logos/logo-lockup-dark-transparent.png',
    leagueLogo: match.leagueLogo,
    home: {
      name: match.home.name,
      short: match.home.short,
      logo: match.home.logo,
      score: match.homeScore ?? '',
      tag: match.winner === 'home' ? 'WIN' : '',
    },
    away: {
      name: match.away.name,
      short: match.away.short,
      logo: match.away.logo,
      score: match.awayScore ?? '',
      tag: match.winner === 'away' ? 'WIN' : '',
    },
    footer: 'WHERE FANS COME ALIVE',
    note: isFinal ? 'FULL TIME' : match.timeLabel,
  }
}

function fixturesTextToRows(value: string): TemplateFixture[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [teamsPart, time = '', meta = ''] = line.split('|').map((part) => part.trim())
      const [home = '', away = ''] = teamsPart.split(/\s+vs\s+/i).map((part) => part.trim())
      return { home, away, time, meta }
    })
    .filter((row) => row.home && row.away)
}

function rowsToFixturesText(rows: TemplateFixture[] = []) {
  return rows.map((row) => `${row.home} vs ${row.away} | ${row.time || ''} | ${row.meta || ''}`).join('\n')
}

export default function TemplateStudio() {
  const [template, setTemplate] = useState<InstagramTemplateInput>(defaultInstagramTemplate)
  const [fixturesText, setFixturesText] = useState(rowsToFixturesText(defaultFixturesTemplate.fixtures))
  const [svg, setSvg] = useState('')
  const [filename, setFilename] = useState('roar-arena-post.svg')
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<ArenaMatch[]>([])
  const [message, setMessage] = useState('')
  const [postTitle, setPostTitle] = useState('Roar Arena Post')
  const [caption, setCaption] = useState('')

  const previewUrl = useMemo(() => (svg ? svgToDataUrl(svg) : ''), [svg])

  async function generate(nextTemplate = template) {
    setLoading(true)
    setMessage('')
    try {
      const payload = nextTemplate.kind === 'fixtures'
        ? { ...nextTemplate, fixtures: fixturesTextToRows(fixturesText) }
        : nextTemplate

      const response = await fetch('/api/templates/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Template generation failed')

      setSvg(data.svg)
      setFilename(data.filename || 'roar-arena-post.svg')
      setPostTitle(payload.headline || `${payload.kind} post`)
      setMessage('Template ready')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Template failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadMatches() {
    try {
      const response = await fetch('/api/public/home', { cache: 'no-store' })
      const data = await response.json()
      setMatches(data.matches || [])
    } catch {
      setMatches([])
    }
  }

  async function downloadPng() {
    if (!svg) return
    setMessage('Rendering PNG...')

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(image, 0, 0, 1080, 1080)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename.replace(/\.svg$/i, '.png')
        anchor.click()
        URL.revokeObjectURL(url)
        setMessage('PNG downloaded')
      }, 'image/png')
    }
    image.onerror = () => setMessage('PNG render failed. Download SVG and export it in Canva/Figma.')
    image.src = svgToDataUrl(svg)
  }


  async function saveToQueue() {
    if (!svg) {
      setMessage('Generate a post first')
      return
    }

    const secret = window.localStorage.getItem('roar-admin-secret') || ''
    if (!secret) {
      setMessage('Open Admin first and save your CRON_SECRET as admin key')
      return
    }

    setLoading(true)
    try {
      const payload = template.kind === 'fixtures'
        ? { ...template, fixtures: fixturesTextToRows(fixturesText) }
        : template

      const response = await fetch('/api/admin/generated-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          title: postTitle || payload.headline || 'Roar Arena Post',
          caption,
          template_kind: payload.kind,
          svg,
          template_payload: payload,
          source_match_id: undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Could not save to queue')

      setMessage('Saved to approval queue')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatches()
    generate(defaultInstagramTemplate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function update(next: Partial<InstagramTemplateInput>) {
    setTemplate((current) => ({ ...current, ...next }))
  }

  function updateTeam(side: 'home' | 'away', key: string, value: string) {
    setTemplate((current) => ({
      ...current,
      [side]: {
        ...(current[side] || {}),
        [key]: value,
      },
    }))
  }

  function changeKind(kind: TemplateKind) {
    const next = presets[kind]
    setTemplate(next)
    if (kind === 'fixtures') setFixturesText(rowsToFixturesText(next.fixtures))
    generate(next)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,75,31,0.18),transparent_60%)]" />

      <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-5 rounded-[2rem] border border-border bg-card/85 p-5 shadow-soft-glow backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo variant="icon" className="h-14 w-14" priority />
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-primary">
                <Wand2 className="h-4 w-4" /> Template system
              </p>
              <h1 className="mt-1 font-display text-4xl uppercase leading-none text-foreground sm:text-5xl">
                Roar Arena Studio
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-foreground transition hover:border-primary/45 hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Admin
            </Link>
            <button onClick={() => generate()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground transition hover:shadow-glow disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate
            </button>
            <button onClick={saveToQueue} disabled={loading || !svg} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-foreground transition hover:border-primary/45 disabled:opacity-60">
              <Save className="h-4 w-4" /> Save Queue
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="grid gap-5">
            <div className="rounded-[1.6rem] border border-border bg-card p-5">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-primary">Template type</p>
              <div className="grid grid-cols-3 gap-2">
                {(['result', 'fixtures', 'preview'] as TemplateKind[]).map((kind) => (
                  <button
                    key={kind}
                    onClick={() => changeKind(kind)}
                    className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.12em] transition ${
                      template.kind === kind ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {kind}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Use live match</p>
                <button onClick={loadMatches} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-foreground">
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
              <div className="grid gap-2">
                {matches.slice(0, 6).map((match) => (
                  <button
                    key={match.id}
                    onClick={() => {
                      const next = toInputFromMatch(match)
                      setTemplate(next)
                      generate(next)
                    }}
                    className="rounded-2xl border border-border bg-surface px-4 py-3 text-left text-sm transition hover:border-primary/45"
                  >
                    <span className="block font-bold text-foreground">{match.home.name} vs {match.away.name}</span>
                    <span className="text-xs text-muted-foreground">{match.league} • {match.statusLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-border bg-card p-5">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-primary">Post copy</p>
              <div className="grid gap-3">
                <input value={template.eyebrow || ''} onChange={(event) => update({ eyebrow: event.target.value })} placeholder="Eyebrow" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                <input value={template.headline || ''} onChange={(event) => update({ headline: event.target.value })} placeholder="Headline" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                <input value={template.date || ''} onChange={(event) => update({ date: event.target.value })} placeholder="Date" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                <input value={template.venue || ''} onChange={(event) => update({ venue: event.target.value })} placeholder="Venue / bottom note" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                <input value={postTitle} onChange={(event) => setPostTitle(event.target.value)} placeholder="Queue title" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                <textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Caption for approval queue" rows={3} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
              </div>
            </div>

            {template.kind === 'fixtures' ? (
              <div className="rounded-[1.6rem] border border-border bg-card p-5">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-primary">Fixtures</p>
                <p className="mb-3 text-xs leading-5 text-muted-foreground">Format: Team A vs Team B | Time | Group</p>
                <textarea value={fixturesText} onChange={(event) => setFixturesText(event.target.value)} rows={7} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
              </div>
            ) : (
              <div className="rounded-[1.6rem] border border-border bg-card p-5">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-primary">Teams</p>
                <div className="grid gap-3">
                  <input value={template.home?.name || ''} onChange={(event) => updateTeam('home', 'name', event.target.value)} placeholder="Home team" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                  <input value={String(template.home?.score ?? '')} onChange={(event) => updateTeam('home', 'score', event.target.value)} placeholder="Home score" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                  <input value={template.away?.name || ''} onChange={(event) => updateTeam('away', 'name', event.target.value)} placeholder="Away team" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                  <input value={String(template.away?.score ?? '')} onChange={(event) => updateTeam('away', 'score', event.target.value)} placeholder="Away score" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50" />
                </div>
              </div>
            )}
          </div>

          <div className="sticky top-6 h-fit rounded-[2rem] border border-border bg-card p-4 shadow-soft-glow">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Preview</p>
                <p className="mt-1 text-xs text-muted-foreground">1080 × 1080 Instagram-ready template</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => svg && downloadText(filename, svg)} disabled={!svg} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground disabled:opacity-50">
                  <Download className="h-4 w-4" /> SVG
                </button>
                <button onClick={downloadPng} disabled={!svg} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-50">
                  <ImageDown className="h-4 w-4" /> PNG
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-black">
              {previewUrl ? (
                <img src={previewUrl} alt="Roar Arena template preview" className="aspect-square w-full object-contain" />
              ) : (
                <div className="grid aspect-square place-items-center text-muted-foreground">Generate a template</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
