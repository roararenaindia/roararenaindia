'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  ImageDown,
  Camera,
  Loader2,
  PlugZap,
  Radio,
  RefreshCw,
  Save,
  Send,
  Shield,
  Star,
  XCircle,
} from '@/components/ui/icon-set'
import BrandLogo from '@/components/brand/brand-logo'

type Health = {
  ok: boolean
  supabaseRead?: boolean
  supabaseWrite?: boolean
  instagramConfigured?: boolean
  apiFootballConfigured?: boolean
  xConfigured?: boolean
  mode?: string
}

type AdminPost = {
  id: string
  title?: string | null
  caption?: string | null
  description?: string | null
  media_url: string
  permalink?: string | null
  post_type?: string | null
  category?: string | null
  is_featured?: boolean | null
  is_hidden?: boolean | null
}

type ManualPostDraft = {
  title: string
  description: string
  caption: string
  media_url: string
  permalink: string
  category: string
  post_type: string
  logo: string
  is_featured: boolean
}

type AdminMatch = {
  id: string
  league: string
  home_team: string
  away_team: string
  status: string
  venue?: string | null
  priority?: number | null
  is_featured?: boolean | null
  is_hidden?: boolean | null
}

type GeneratedPost = {
  id: string
  title: string
  caption?: string | null
  template_kind: string
  status: string
  svg: string
  created_at?: string
  is_hidden?: boolean | null
}

type Toast = {
  type: 'success' | 'error' | 'info'
  message: string
}

type CheckResult = Record<string, unknown>

function authHeaders(secret: string): Record<string, string> {
  return secret ? { Authorization: `Bearer ${secret}` } : {}
}

function StatusPill({ active, label }: { active?: boolean; label: string }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
      active ? 'border-primary/35 bg-primary/10 text-primary' : 'border-border bg-surface text-muted-foreground'
    }`}>
      {label}
    </span>
  )
}

function CheckLine({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <span className="text-sm font-bold text-foreground">{label}</span>
      {ok ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
    </div>
  )
}

function svgUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function downloadSvg(filename: string, svg: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function AdminDashboard() {
  const [secret, setSecret] = useState('')
  const [health, setHealth] = useState<Health | null>(null)
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [matches, setMatches] = useState<AdminMatch[]>([])
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [activeTab, setActiveTab] = useState<'setup' | 'queue' | 'posts' | 'matches'>('setup')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [postDrafts, setPostDrafts] = useState<Record<string, Partial<AdminPost>>>({})
  const [manualPost, setManualPost] = useState<ManualPostDraft>({
    title: '',
    description: '',
    caption: '',
    media_url: '',
    permalink: '',
    category: 'Roar Arena',
    post_type: 'Instagram',
    logo: '',
    is_featured: false,
  })
  const [matchDrafts, setMatchDrafts] = useState<Record<string, Partial<AdminMatch>>>({})
  const [queueDrafts, setQueueDrafts] = useState<Record<string, Partial<GeneratedPost>>>({})
  const [instagramCheck, setInstagramCheck] = useState<CheckResult | null>(null)
  const [xCheck, setXCheck] = useState<CheckResult | null>(null)
  const [matchCheck, setMatchCheck] = useState<CheckResult | null>(null)
  const [finalCheck, setFinalCheck] = useState<CheckResult | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('roar-admin-secret') || ''
    setSecret(saved)
  }, [])

  const headers = useMemo(() => authHeaders(secret), [secret])

  function notify(type: Toast['type'], message: string) {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3600)
  }

  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        ...headers,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...((options.headers as Record<string, string> | undefined) || {}),
      },
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `${path} failed`)
    }

    return data
  }

  async function loadAll() {
    setLoading(true)
    try {
      const [healthData, postsData, matchesData, queueData] = await Promise.all([
        api('/api/admin/health'),
        api('/api/admin/posts'),
        api('/api/admin/matches'),
        api('/api/admin/generated-posts'),
      ])
      setHealth(healthData)
      setPosts(postsData.posts || [])
      setMatches(matchesData.matches || [])
      setGeneratedPosts(queueData.generatedPosts || [])
      notify('success', 'Admin data refreshed')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Could not load admin data')
    } finally {
      setLoading(false)
    }
  }

  async function runCheck(kind: 'instagram' | 'x' | 'matches' | 'final') {
    setLoading(true)
    try {
      const path = kind === 'instagram' ? '/api/admin/instagram/check' : kind === 'x' ? '/api/admin/x/check' : kind === 'matches' ? '/api/admin/matches/check' : '/api/admin/final-check'
      const data = await api(path)
      if (kind === 'instagram') setInstagramCheck(data)
      if (kind === 'x') setXCheck(data)
      if (kind === 'matches') setMatchCheck(data)
      if (kind === 'final') setFinalCheck(data)
      notify('success', `${kind} check complete`)
    } catch (error) {
      notify('error', error instanceof Error ? error.message : `${kind} check failed`)
    } finally {
      setLoading(false)
    }
  }

  function saveSecret() {
    window.localStorage.setItem('roar-admin-secret', secret)
    notify('success', 'Admin key saved on this browser')
  }

  async function runAction(label: string, path: string) {
    setLoading(true)
    try {
      await api(path)
      notify('success', `${label} done`)
      await loadAll()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : `${label} failed`)
    } finally {
      setLoading(false)
    }
  }

  async function patch(path: string, body: Record<string, unknown>, success: string) {
    try {
      await api(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      notify('success', success)
      await loadAll()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Update failed')
    }
  }

  async function createManualPost() {
    if (!manualPost.media_url.trim()) {
      notify('error', 'Add an image/media URL first')
      return
    }

    try {
      await api('/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify(manualPost),
      })
      notify('success', 'Manual post added')
      setManualPost({
        title: '',
        description: '',
        caption: '',
        media_url: '',
        permalink: '',
        category: 'Roar Arena',
        post_type: 'Instagram',
        logo: '',
        is_featured: false,
      })
      await loadAll()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Could not add post')
    }
  }

  function updateManualPost<Field extends keyof ManualPostDraft>(field: Field, value: ManualPostDraft[Field]) {
    setManualPost((draft) => ({ ...draft, [field]: value }))
  }

  async function publishGenerated(id: string) {
    try {
      await api('/api/admin/generated-posts/publish', {
        method: 'POST',
        body: JSON.stringify({ id }),
      })
      notify('success', 'Published to Latest from Arena')
      await loadAll()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Publish failed')
    }
  }

  const final = finalCheck as { productionReady?: boolean; checks?: { env?: Record<string, boolean>; supabase?: Record<string, boolean>; publicHome?: Record<string, unknown>; apiFootball?: Record<string, unknown>; socialLinks?: Record<string, unknown> }; warnings?: string[] } | null
  const instagram = instagramCheck as { ready?: boolean; checks?: { instagram?: Record<string, unknown>; supabase?: Record<string, boolean>; env?: Record<string, boolean> }; nextStep?: string } | null
  const x = xCheck as { ready?: boolean; checks?: { x?: Record<string, unknown>; supabase?: Record<string, boolean>; env?: Record<string, boolean> }; nextStep?: string } | null
  const matchApi = matchCheck as { ready?: boolean; checks?: { provider?: Record<string, unknown>; supabase?: Record<string, boolean>; env?: Record<string, boolean> }; nextStep?: string } | null

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,75,31,0.18),transparent_60%)]" />

      <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-border bg-card/80 p-5 shadow-soft-glow backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo variant="icon" className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" priority />
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-primary">
                <Shield className="h-4 w-4" /> Private control room
              </p>
              <h1 className="mt-1 break-words font-display text-[clamp(2rem,9vw,3rem)] uppercase leading-none text-foreground sm:text-5xl">
                Roar Arena Admin
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="/studio" className="rounded-2xl bg-primary px-5 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-primary-foreground transition hover:shadow-glow">
              Open Studio
            </a>
            <a href="/" className="rounded-2xl border border-border bg-surface px-5 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-foreground transition hover:border-primary/45 hover:text-primary">
              View website
            </a>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[1.5rem] border border-border bg-card p-4">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Admin key / CRON_SECRET</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                type="password"
                placeholder="Paste CRON_SECRET"
                className="min-h-12 flex-1 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary/55"
              />
              <button onClick={saveSecret} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground transition hover:shadow-glow">
                <Save className="h-4 w-4" /> Save key
              </button>
              <button onClick={loadAll} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-foreground transition hover:border-primary/45 disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
              </button>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 rounded-[1.5rem] border border-border bg-card p-4 lg:min-w-[280px]">
            <StatusPill active={health?.supabaseRead} label="DB read" />
            <StatusPill active={health?.supabaseWrite} label="DB write" />
            <StatusPill active={health?.instagramConfigured} label="IG optional" />
            <StatusPill active={health?.apiFootballConfigured} label="Matches" />
            <StatusPill active={health?.xConfigured} label="X optional" />
          </div>
        </div>

        {toast && (
          <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-bold ${
            toast.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-200'
              : toast.type === 'success'
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground'
          }`}>
            {toast.message}
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          <button onClick={() => runAction('Seed content', '/api/admin/seed')} className="rounded-[1.4rem] border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:border-primary/45">
            <Database className="mb-4 h-6 w-6 text-primary" />
            <p className="font-display text-3xl uppercase leading-none">Seed</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Push starter content into Supabase.</p>
          </button>
          <button onClick={() => runAction('Instagram sync', '/api/sync/instagram')} className="rounded-[1.4rem] border border-border bg-card p-5 text-left opacity-80 transition hover:-translate-y-1 hover:border-primary/45 hover:opacity-100">
            <Camera className="mb-4 h-6 w-6 text-primary" />
            <p className="font-display text-3xl uppercase leading-none">IG Optional</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Later-phase social automation.</p>
          </button>
          <button onClick={() => runAction('X sync', '/api/sync/x')} className="rounded-[1.4rem] border border-border bg-card p-5 text-left opacity-80 transition hover:-translate-y-1 hover:border-primary/45 hover:opacity-100">
            <Activity className="mb-4 h-6 w-6 text-primary" />
            <p className="font-display text-3xl uppercase leading-none">X Optional</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Later-phase social automation.</p>
          </button>
          <button onClick={() => runAction('Match sync', '/api/sync/matches')} className="rounded-[1.4rem] border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:border-primary/45">
            <Radio className="mb-4 h-6 w-6 text-primary" />
            <p className="font-display text-3xl uppercase leading-none">Sync Matches</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Fetch fixtures and scores.</p>
          </button>
          <button onClick={() => runAction('Auto curate', '/api/admin/auto-curate')} className="rounded-[1.4rem] border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:border-primary/45">
            <Star className="mb-4 h-6 w-6 text-primary" />
            <p className="font-display text-3xl uppercase leading-none">Curate</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Auto-pick hero and featured posts.</p>
          </button>

          <button onClick={() => runAction('Match sync + curation', '/api/sync/all')} className="rounded-[1.4rem] border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:border-primary/45">
            <Send className="mb-4 h-6 w-6 text-primary" />
            <p className="font-display text-3xl uppercase leading-none">Sync Core</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Run matches and curation only. Social stays optional.</p>
          </button>
          <button onClick={() => runCheck('final')} className="rounded-[1.4rem] border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:border-primary/45">
            <PlugZap className="mb-4 h-6 w-6 text-primary" />
            <p className="font-display text-3xl uppercase leading-none">Final Check</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Verify launch readiness.</p>
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-[1.4rem] border border-border bg-card p-2 sm:grid-cols-4">
          {(['setup', 'queue', 'posts', 'matches'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'queue' ? `Queue (${generatedPosts.length})` : tab}
            </button>
          ))}
        </div>

        {activeTab === 'setup' && (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            <section className="rounded-[1.7rem] border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Instagram</p>
                  <h2 className="mt-1 font-display text-3xl uppercase leading-none">Connection</h2>
                </div>
                <button onClick={() => runCheck('instagram')} className="rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground">Check</button>
              </div>
              <div className="grid gap-3">
                <CheckLine ok={Boolean(instagram?.checks?.env?.instagramUserId)} label="IG user ID set" />
                <CheckLine ok={Boolean(instagram?.checks?.env?.instagramAccessToken)} label="Access token set" />
                <CheckLine ok={Boolean(instagram?.checks?.instagram?.accountValid)} label="Account valid" />
                <CheckLine ok={Boolean(instagram?.checks?.instagram?.mediaReadable)} label="Media readable" />
                <CheckLine ok={Boolean(instagram?.checks?.supabase?.write)} label="Can save to Supabase" />
              </div>
              {instagram?.nextStep && <p className="mt-4 text-xs leading-5 text-muted-foreground">{instagram.nextStep}</p>}
              <div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-xs leading-5 text-muted-foreground">
                <p className="font-black uppercase tracking-[0.14em] text-foreground">Important</p>
                <p className="mt-2">Instagram password is not used by this app. For auto-sync, create a Meta developer token for the Roar Arena professional Instagram account, then add:</p>
                <p className="mt-2 font-mono text-[11px] text-primary">INSTAGRAM_USER_ID</p>
                <p className="font-mono text-[11px] text-primary">INSTAGRAM_ACCESS_TOKEN</p>
                <p className="mt-2">Use a long-lived token and refresh it before expiry.</p>
              </div>
            </section>

            <section className="rounded-[1.7rem] border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">X</p>
                  <h2 className="mt-1 font-display text-3xl uppercase leading-none">Connection</h2>
                </div>
                <button onClick={() => runCheck('x')} className="rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground">Check</button>
              </div>
              <div className="grid gap-3">
                <CheckLine ok={Boolean(x?.checks?.env?.xUserId)} label="X user ID set" />
                <CheckLine ok={Boolean(x?.checks?.env?.xBearerToken)} label="Bearer token set" />
                <CheckLine ok={Boolean(x?.checks?.x?.accountValid)} label="Account valid" />
                <CheckLine ok={Boolean(x?.checks?.x?.postsReadable)} label="Posts readable" />
                <CheckLine ok={Boolean(x?.checks?.supabase?.write)} label="Can save to Supabase" />
              </div>
              {x?.nextStep && <p className="mt-4 text-xs leading-5 text-muted-foreground">{x.nextStep}</p>}
            </section>

            <section className="rounded-[1.7rem] border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Matches</p>
                  <h2 className="mt-1 font-display text-3xl uppercase leading-none">API</h2>
                </div>
                <button onClick={() => runCheck('matches')} className="rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground">Check</button>
              </div>
              <div className="grid gap-3">
                <CheckLine ok={Boolean(matchApi?.checks?.env?.footballDataToken || matchApi?.checks?.env?.apiFootballKey)} label="Match provider token set" />
                <CheckLine ok={Boolean(matchApi?.checks?.provider?.fixturesReachable || matchApi?.checks?.provider?.statusReachable)} label="Provider reachable" />
                <CheckLine ok={Boolean(matchApi?.checks?.supabase?.write)} label="Can save to Supabase" />
              </div>
              {matchApi?.checks?.provider ? (
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Fixtures found: {String(matchApi.checks.provider.sampleCount ?? 0)}. Range: {String((matchApi.checks.provider.range as { from?: string; to?: string } | undefined)?.from || 'auto')} to {String((matchApi.checks.provider.range as { from?: string; to?: string } | undefined)?.to || 'auto')}.
                </p>
              ) : null}
              {matchApi?.checks?.provider?.error ? (
                <p className="mt-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
                  API issue: {String(matchApi.checks.provider.error)}
                </p>
              ) : null}
              {matchApi?.nextStep && <p className="mt-3 text-xs leading-5 text-muted-foreground">{matchApi.nextStep}</p>}
            </section>

            <section className="rounded-[1.7rem] border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Launch</p>
                  <h2 className="mt-1 font-display text-3xl uppercase leading-none">Readiness</h2>
                </div>
                <button onClick={() => runCheck('final')} className="rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground">Check</button>
              </div>
              <div className="grid gap-3">
                <CheckLine ok={Boolean(final?.checks?.env?.cronSecret)} label="Admin key set" />
                <CheckLine ok={Boolean(final?.checks?.supabase?.read)} label="Supabase read" />
                <CheckLine ok={Boolean(final?.checks?.supabase?.write)} label="Supabase write" />
                <CheckLine ok={Boolean(final?.checks?.supabase?.postsTable)} label="Posts table" />
                <CheckLine ok={Boolean(final?.checks?.supabase?.matchesTable)} label="Matches table" />
                <CheckLine ok={Boolean(final?.checks?.supabase?.generatedPostsTable)} label="Queue table" />
                <CheckLine ok={Boolean(final?.checks?.publicHome?.heroReady)} label="Hero data ready" />
                <CheckLine ok={Boolean(final?.checks?.apiFootball?.fixturesReachable)} label="Match provider working" />
                <CheckLine ok={Boolean(final?.checks?.env?.contactEmail)} label="Contact email ready" />
              </div>
              {final?.checks?.apiFootball ? (
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Provider fixtures found: {String(final.checks.apiFootball.sampleCount ?? 0)}. Production ready: {final.productionReady ? 'yes' : 'not yet'}.
                </p>
              ) : null}
              {final?.warnings?.length ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{final.warnings.join(' ')}</p> : null}
            </section>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="grid gap-5">
            {generatedPosts.map((item) => {
              const draft = queueDrafts[item.id] || {}
              const merged = { ...item, ...draft }
              return (
                <article key={item.id} className="grid gap-4 rounded-[1.7rem] border border-border bg-card p-4 lg:grid-cols-[240px_1fr_auto]">
                  <div className="overflow-hidden rounded-2xl border border-border bg-black">
                    <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg)}`} alt={item.title} className="aspect-square w-full object-contain" />
                  </div>
                  <div className="grid content-start gap-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusPill active={item.status === 'approved' || item.status === 'published'} label={item.status} />
                      <StatusPill active label={item.template_kind} />
                    </div>
                    <input
                      value={merged.title || ''}
                      onChange={(event) => setQueueDrafts((drafts) => ({ ...drafts, [item.id]: { ...drafts[item.id], title: event.target.value } }))}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-primary/50"
                    />
                    <textarea
                      value={merged.caption || ''}
                      onChange={(event) => setQueueDrafts((drafts) => ({ ...drafts, [item.id]: { ...drafts[item.id], caption: event.target.value } }))}
                      placeholder="Caption"
                      rows={4}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="grid content-start gap-2 lg:w-48">
                    <button onClick={() => patch('/api/admin/generated-posts', { id: item.id, ...draft }, 'Queue item updated')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground">
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button onClick={() => patch('/api/admin/generated-posts', { id: item.id, status: 'approved' }, 'Post approved')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:border-primary/45">
                      <Star className="h-4 w-4" /> Approve
                    </button>
                    <button onClick={() => publishGenerated(item.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:border-primary/45">
                      <Send className="h-4 w-4" /> Publish
                    </button>
                    <button onClick={() => patch('/api/admin/generated-posts', { id: item.id, status: 'rejected' }, 'Post rejected')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:border-primary/45">
                      <EyeOff className="h-4 w-4" /> Reject
                    </button>
                    <button onClick={() => downloadSvg(`${item.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.svg`, item.svg)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:border-primary/45">
                      <ImageDown className="h-4 w-4" /> SVG
                    </button>
                  </div>
                </article>
              )
            })}
            {!generatedPosts.length && (
              <div className="rounded-[1.7rem] border border-border bg-card p-8 text-center text-muted-foreground">
                No generated posts yet. Open Studio, generate a post, then click Save Queue.
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="grid gap-5">
            <section className="rounded-[1.7rem] border border-primary/25 bg-card p-4 shadow-soft-glow sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Manual post</p>
                  <h2 className="mt-1 font-display text-3xl uppercase leading-none">Add Instagram-style update</h2>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">No Instagram login needed. Paste the image URL, caption, and link, then save it to the live site.</p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-foreground">
                  <input
                    type="checkbox"
                    checked={manualPost.is_featured}
                    onChange={(event) => updateManualPost('is_featured', event.target.checked)}
                    className="accent-primary"
                  />
                  Feature
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={manualPost.title}
                  onChange={(event) => updateManualPost('title', event.target.value)}
                  placeholder="Post title"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-primary/50"
                />
                <input
                  value={manualPost.media_url}
                  onChange={(event) => updateManualPost('media_url', event.target.value)}
                  placeholder="Image/media URL or /posts/file-name.png"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <input
                  value={manualPost.category}
                  onChange={(event) => updateManualPost('category', event.target.value)}
                  placeholder="Category, e.g. FIFA World Cup 2026"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <input
                  value={manualPost.post_type}
                  onChange={(event) => updateManualPost('post_type', event.target.value)}
                  placeholder="Type, e.g. Result / Fixtures / Instagram"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <input
                  value={manualPost.permalink}
                  onChange={(event) => updateManualPost('permalink', event.target.value)}
                  placeholder="Instagram post link"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 md:col-span-2"
                />
                <textarea
                  value={manualPost.description}
                  onChange={(event) => updateManualPost('description', event.target.value)}
                  placeholder="Short card description"
                  rows={2}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 md:col-span-2"
                />
                <textarea
                  value={manualPost.caption}
                  onChange={(event) => updateManualPost('caption', event.target.value)}
                  placeholder="Full Instagram caption"
                  rows={4}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 md:col-span-2"
                />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted-foreground">Best temporary workflow: download the Instagram image, place it in <span className="font-mono text-primary">public/posts</span>, then use <span className="font-mono text-primary">/posts/name.png</span>.</p>
                <button onClick={createManualPost} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground shadow-soft-glow">
                  <Save className="h-4 w-4" /> Add Post
                </button>
              </div>
            </section>

            {posts.map((post) => {
              const draft = postDrafts[post.id] || {}
              const merged = { ...post, ...draft }
              return (
                <article key={post.id} className="grid gap-4 rounded-[1.7rem] border border-border bg-card p-4 md:grid-cols-[150px_1fr_auto]">
                  <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
                    <img src={post.media_url} alt={post.title || 'Post'} className="h-full w-full object-cover" />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusPill active={!post.is_hidden} label={post.is_hidden ? 'Hidden' : 'Visible'} />
                      <StatusPill active={Boolean(post.is_featured)} label={post.is_featured ? 'Featured' : 'Normal'} />
                    </div>
                    <input value={merged.title || ''} onChange={(event) => setPostDrafts((drafts) => ({ ...drafts, [post.id]: { ...drafts[post.id], title: event.target.value } }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-primary/50" />
                    <textarea value={merged.description || ''} onChange={(event) => setPostDrafts((drafts) => ({ ...drafts, [post.id]: { ...drafts[post.id], description: event.target.value } }))} rows={2} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50" />
                  </div>
                  <div className="grid content-start gap-2 md:w-44">
                    <button onClick={() => patch('/api/admin/posts', { id: post.id, ...draft }, 'Post updated')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground">
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button onClick={() => patch('/api/admin/posts', { id: post.id, is_featured: !post.is_featured }, 'Post updated')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:border-primary/45">
                      <Star className="h-4 w-4" /> {post.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => patch('/api/admin/posts', { id: post.id, is_hidden: !post.is_hidden }, 'Post updated')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:border-primary/45">
                      {post.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {post.is_hidden ? 'Show' : 'Hide'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="grid gap-5">
            {matches.map((match) => {
              const draft = matchDrafts[match.id] || {}
              const merged = { ...match, ...draft }
              return (
                <article key={match.id} className="rounded-[1.7rem] border border-border bg-card p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="grid gap-3">
                      <div className="flex flex-wrap gap-2">
                        <StatusPill active={!match.is_hidden} label={match.is_hidden ? 'Hidden' : 'Visible'} />
                        <StatusPill active={Boolean(match.is_featured)} label={match.is_featured ? 'Pinned Hero' : 'Not Pinned'} />
                        <StatusPill active label={match.status} />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input value={merged.home_team || ''} onChange={(event) => setMatchDrafts((drafts) => ({ ...drafts, [match.id]: { ...drafts[match.id], home_team: event.target.value } }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-primary/50" />
                        <input value={merged.away_team || ''} onChange={(event) => setMatchDrafts((drafts) => ({ ...drafts, [match.id]: { ...drafts[match.id], away_team: event.target.value } }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-primary/50" />
                        <input value={merged.league || ''} onChange={(event) => setMatchDrafts((drafts) => ({ ...drafts, [match.id]: { ...drafts[match.id], league: event.target.value } }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50" />
                        <input value={merged.venue || ''} onChange={(event) => setMatchDrafts((drafts) => ({ ...drafts, [match.id]: { ...drafts[match.id], venue: event.target.value } }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50" />
                      </div>
                    </div>
                    <div className="grid content-start gap-2 lg:w-44">
                      <button onClick={() => patch('/api/admin/matches', { id: match.id, ...draft }, 'Match updated')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground">
                        <Save className="h-4 w-4" /> Save
                      </button>
                      <button onClick={() => patch('/api/admin/matches', { id: match.id, is_featured: !match.is_featured, priority: match.is_featured ? match.priority || 0 : 999 }, 'Match updated')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:border-primary/45">
                        <Star className="h-4 w-4" /> {match.is_featured ? 'Unpin' : 'Pin Hero'}
                      </button>
                      <button onClick={() => patch('/api/admin/matches', { id: match.id, is_hidden: !match.is_hidden }, 'Match updated')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:border-primary/45">
                        {match.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {match.is_hidden ? 'Show' : 'Hide'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-10 rounded-[1.5rem] border border-border bg-card p-5 text-sm leading-7 text-muted-foreground">
          <p className="font-bold text-foreground">Phase 6 goal:</p>
          <p>
            This is now a launch-ready automation system. The final check tells you exactly what is connected, what is missing, and what to fix before going public.
          </p>
        </div>
      </section>
    </main>
  )
}
