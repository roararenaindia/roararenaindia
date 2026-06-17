import fs from 'fs'
import path from 'path'
import type { InstagramTemplateInput, TemplateFixture, TemplateTeam } from '@/lib/post-template-types'
import { defaultFixturesTemplate, defaultInstagramTemplate, defaultPreviewTemplate } from '@/lib/post-template-types'

const WIDTH = 1080
const HEIGHT = 1080

function escapeXml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function clampText(value: unknown, max = 64) {
  const text = String(value ?? '').trim()
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text
}

function resolveAsset(src?: string) {
  if (!src) return ''
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return src

  try {
    const clean = src.replace(/^\//, '')
    const file = path.join(process.cwd(), 'public', clean)
    if (!fs.existsSync(file)) return src
    const buffer = fs.readFileSync(file)
    const ext = path.extname(file).toLowerCase()
    const mime = ext === '.svg'
      ? 'image/svg+xml'
      : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
          ? 'image/webp'
          : 'image/png'

    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return src
  }
}

function normalize(input: InstagramTemplateInput): InstagramTemplateInput {
  if (input.kind === 'fixtures') return { ...defaultFixturesTemplate, ...input }
  if (input.kind === 'preview') return { ...defaultPreviewTemplate, ...input }
  return { ...defaultInstagramTemplate, ...input }
}

function baseDefs() {
  return `
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#060607"/>
        <stop offset="0.55" stop-color="#101114"/>
        <stop offset="1" stop-color="#030303"/>
      </linearGradient>
      <radialGradient id="orangeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#ff4b1f" stop-opacity="0.4"/>
        <stop offset="1" stop-color="#ff4b1f" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#000000" flood-opacity="0.55"/>
      </filter>
      <filter id="softGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="16" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <pattern id="grain" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M0 119 L119 0" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
        <path d="M-40 119 L79 0" stroke="#ffffff" stroke-opacity="0.025" stroke-width="1"/>
      </pattern>
    </defs>
  `
}

function bg() {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)" opacity="0.65"/>
    <circle cx="90" cy="250" r="260" fill="url(#orangeGlow)"/>
    <circle cx="990" cy="750" r="310" fill="url(#orangeGlow)" opacity="0.9"/>
    <path d="M0 920 C220 830 355 895 540 840 C710 790 825 820 1080 725 L1080 1080 L0 1080 Z" fill="#ff4b1f" opacity="0.05"/>
  `
}

function text(x: number, y: number, value: unknown, size: number, options: {
  fill?: string
  weight?: number
  anchor?: 'start' | 'middle' | 'end'
  spacing?: number
  opacity?: number
  family?: string
} = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${options.anchor || 'middle'}" fill="${options.fill || '#f8f8f8'}" opacity="${options.opacity ?? 1}" font-family="${options.family || 'Arial Black, Impact, system-ui, sans-serif'}" font-size="${size}" font-weight="${options.weight || 900}" letter-spacing="${options.spacing || 0}">${escapeXml(value)}</text>`
}

function image(src: string | undefined, x: number, y: number, w: number, h: number, extra = '') {
  const href = resolveAsset(src)
  if (!href) return ''
  return `<image href="${escapeXml(href)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" ${extra}/>`
}

function logoPlate(team: TemplateTeam | undefined, cx: number, cy: number, options: { winner?: boolean; side?: 'left' | 'right' } = {}) {
  const plate = options.winner ? '#ff4b1f' : '#2a2b31'
  const score = team?.score ?? ''
  return `
    <circle cx="${cx}" cy="${cy}" r="158" fill="#090a0d" stroke="${plate}" stroke-width="${options.winner ? 7 : 3}" filter="url(#shadow)"/>
    ${options.winner ? `<circle cx="${cx}" cy="${cy}" r="178" fill="none" stroke="#ff4b1f" stroke-opacity="0.25" stroke-width="18"/>` : ''}
    ${image(team?.logo, cx - 105, cy - 105, 210, 210)}
    ${team?.tag ? `<rect x="${cx - 58}" y="${cy - 198}" width="116" height="46" rx="23" fill="#ff4b1f"/>${text(cx, cy - 168, team.tag, 25, { fill: '#ffffff', spacing: 2 })}` : ''}
    ${text(cx, cy + 218, clampText(team?.name || '', 18), 38, { fill: '#ffffff' })}
    ${score !== '' ? text(options.side === 'left' ? 432 : 648, 570, score, 165, { fill: '#ffffff' }) : ''}
  `
}

function header(input: InstagramTemplateInput) {
  return `
    ${image(input.brandLogo, 376, 38, 328, 96)}
    <rect x="388" y="132" width="304" height="6" rx="3" fill="#ff4b1f"/>
    ${text(540, 185, input.eyebrow || input.league || 'ROAR ARENA', 28, { fill: '#ff4b1f', spacing: 4 })}
  `
}

function footer(input: InstagramTemplateInput) {
  return `
    <rect x="96" y="900" width="888" height="92" rx="32" fill="#ffffff" opacity="0.055" stroke="#ffffff" stroke-opacity="0.12"/>
    ${text(540, 935, input.date || '', 29, { fill: '#ffffff', spacing: 2 })}
    ${text(540, 970, input.footer || 'WHERE FANS COME ALIVE', 24, { fill: '#ff4b1f', spacing: 3 })}
    ${text(540, 1030, '@ROARARENAINDIA', 25, { fill: '#d7d7d7', spacing: 3 })}
  `
}

function resultTemplate(input: InstagramTemplateInput) {
  const homeWinner = input.home?.tag || input.home?.score !== undefined && input.away?.score !== undefined && Number(input.home.score) > Number(input.away.score)
  const awayWinner = input.away?.tag || input.home?.score !== undefined && input.away?.score !== undefined && Number(input.away.score) > Number(input.home.score)

  return `
    ${header(input)}
    ${text(540, 250, input.headline || 'MATCH RESULT', 84, { fill: '#ffffff', spacing: -2 })}
    <rect x="72" y="302" width="936" height="560" rx="38" fill="#111216" stroke="#ffffff" stroke-opacity="0.12" filter="url(#shadow)"/>
    <rect x="112" y="336" width="856" height="8" rx="4" fill="#ff4b1f"/>
    ${image(input.leagueLogo, 476, 360, 128, 94)}
    ${logoPlate(input.home, 270, 570, { winner: Boolean(homeWinner), side: 'left' })}
    ${logoPlate(input.away, 810, 570, { winner: Boolean(awayWinner), side: 'right' })}
    ${text(540, 548, '—', 94, { fill: '#ff4b1f' })}
    <rect x="410" y="708" width="260" height="48" rx="24" fill="#ff4b1f" opacity="0.16" stroke="#ff4b1f" stroke-opacity="0.5"/>
    ${text(540, 740, input.note || 'FULL TIME', 30, { fill: '#ff4b1f', spacing: 2 })}
    ${text(540, 822, input.venue || input.league || '', 32, { fill: '#9fa1a8', spacing: 1 })}
    ${footer(input)}
  `
}

function fixtureRow(row: TemplateFixture, i: number) {
  const y = 358 + i * 144
  return `
    <rect x="96" y="${y}" width="888" height="116" rx="30" fill="#111216" stroke="#ffffff" stroke-opacity="0.12"/>
    ${image(row.homeLogo, 130, y + 20, 76, 76)}
    ${text(225, y + 65, clampText(row.home, 16), 30, { anchor: 'start', fill: '#ffffff' })}
    <rect x="476" y="${y + 34}" width="128" height="48" rx="24" fill="#ff4b1f" opacity="0.14" stroke="#ff4b1f" stroke-opacity="0.45"/>
    ${text(540, y + 67, 'VS', 26, { fill: '#ff4b1f', spacing: 2 })}
    ${text(676, y + 65, clampText(row.away, 16), 30, { anchor: 'start', fill: '#ffffff' })}
    ${image(row.awayLogo, 874, y + 20, 76, 76)}
    ${text(540, y + 106, `${row.time || ''}${row.meta ? `  •  ${row.meta}` : ''}`, 18, { fill: '#9fa1a8', spacing: 1 })}
  `
}

function fixturesTemplate(input: InstagramTemplateInput) {
  const rows = (input.fixtures || []).slice(0, 4)
  return `
    ${header(input)}
    ${text(540, 252, input.headline || "TODAY'S FIXTURES", 80, { fill: '#ffffff', spacing: -1 })}
    ${text(540, 302, input.date || input.league || '', 28, { fill: '#9fa1a8', spacing: 2 })}
    ${image(input.leagueLogo, 456, 160, 168, 100)}
    <rect x="72" y="334" width="936" height="${rows.length * 144 + 46}" rx="38" fill="#0c0d10" stroke="#ffffff" stroke-opacity="0.1" filter="url(#shadow)"/>
    ${rows.map(fixtureRow).join('')}
    ${footer(input)}
  `
}

function previewTemplate(input: InstagramTemplateInput) {
  return `
    ${header(input)}
    ${text(540, 248, input.headline || 'UP NEXT', 92, { fill: '#ffffff', spacing: -1 })}
    ${text(540, 300, input.note || input.league || 'MATCH PREVIEW', 28, { fill: '#ff4b1f', spacing: 4 })}
    <rect x="72" y="332" width="936" height="532" rx="38" fill="#111216" stroke="#ffffff" stroke-opacity="0.12" filter="url(#shadow)"/>
    ${image(input.leagueLogo, 476, 370, 128, 90)}
    ${logoPlate(input.home, 270, 585, { side: 'left' })}
    ${logoPlate(input.away, 810, 585, { side: 'right' })}
    <circle cx="540" cy="584" r="72" fill="#ff4b1f" fill-opacity="0.12" stroke="#ff4b1f" stroke-opacity="0.45" stroke-width="3"/>
    ${text(540, 608, 'VS', 46, { fill: '#ff4b1f' })}
    ${text(540, 790, input.venue || 'Matchday venue', 30, { fill: '#9fa1a8', spacing: 1 })}
    ${footer(input)}
  `
}

export function generateInstagramSvg(rawInput: InstagramTemplateInput) {
  const input = normalize(rawInput)
  const body = input.kind === 'fixtures'
    ? fixturesTemplate(input)
    : input.kind === 'preview'
      ? previewTemplate(input)
      : resultTemplate(input)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${baseDefs()}
  ${bg()}
  ${body}
</svg>`
}
