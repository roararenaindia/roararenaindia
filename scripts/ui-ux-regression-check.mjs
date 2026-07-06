import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const globals = read('app/globals.css')
const home = read('components/home/home-experience.tsx')
const postModal = read('components/home/post-modal.tsx')
const teamLogo = read('components/brand/team-logo.tsx')
const inference = read('lib/domain/content-inference.ts')
const ferrariLogo = read('public/assets/teams/f1/ferrari.svg')

const lightTheme = globals.match(/\[data-theme='light'\]\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body || ''

assert.match(lightTheme, /--sport-fifa-accent:\s*#[0-9a-f]{6};/i, 'light theme must define a FIFA accent token')
assert.doesNotMatch(
  lightTheme,
  /--sport-fifa-(accent|text|soft|border|border-strong|hover|shadow|panel):[^;]*(b57918|7c540d|140,\s*91|181,\s*121)/i,
  'light-mode FIFA styling must stay blue, not gold/brown',
)

assert.match(home, /wimbledon-men/, 'homepage must expose a Wimbledon men filter')
assert.match(home, /wimbledon-women/, 'homepage must expose a Wimbledon women filter')
assert.match(home, /function wimbledonDivision/, 'homepage must classify Wimbledon divisions from live match data')
assert.match(home, /wimbledonDivisionTone/, 'homepage must provide distinct Wimbledon men/women tones')
assert.match(home, /sport-wimbledon-men/, 'homepage must use a distinct Wimbledon men tone')
assert.match(home, /sport-wimbledon-women/, 'homepage must use a distinct Wimbledon women tone')
assert.match(home, /teamLogoSrc\s*=\s*team\.logo/, 'Wimbledon player cards must preserve provider-supplied flag URLs')
assert.match(home, /sourceMode=\{match\.sport === 'tennis' \? 'sourceOnly' : 'auto'\}/, 'tennis player cards must render provider flags without name-based inference')
assert.match(home, /function MarqueeMotionTrack/, 'desktop marquee rows must use the runtime motion track')
assert.match(home, /scrollWidth \/ 2/, 'marquee motion must measure the duplicated track distance in pixels')
assert.match(home, /ResizeObserver/, 'marquee motion must react to responsive width changes')
assert.doesNotMatch(home, /x:\s*reverse \? \['-50%', '0%'\]/, 'marquee motion must not rely on percentage x keyframes')
assert.match(home, /<MarqueeMotionTrack[^>]*reverse[^>]*duration=\{30\}/s, 'hero ticker must use the runtime motion track')
assert.match(home, /<MarqueeMotionTrack[^>]*duration=\{24\}/s, 'sports league rail must use the runtime motion track')
assert.doesNotMatch(home, /className="animate-marquee-reverse/, 'hero ticker must not rely on the static CSS marquee class')
assert.doesNotMatch(home, /className="animate-league-rail/, 'league rail must not rely on the static CSS marquee class')
assert.match(globals, /\.roar-marquee-track/, 'marquee tracks must have a dedicated GPU-stable class')
assert.match(teamLogo, /sourceMode\?: 'auto' \| 'sourceOnly'/, 'TeamLogo must expose source-only rendering mode')
assert.match(teamLogo, /sourceMode === 'sourceOnly'/, 'TeamLogo source-only mode must bypass name-based flag inference')

assert.match(inference, /wimbledon\|tennis\|grand slam\|singles/i, 'content inference must recognize Wimbledon/tennis posts')
assert.match(inference, /isWimbledon/i, 'team inference must guard Wimbledon/player posts from country-team extraction')

assert.match(postModal, /showTeamStrip/, 'post modal must explicitly decide when team tiles are relevant')
assert.doesNotMatch(postModal, /resolveTeamFlag/, 'post modal must not replace stored post-team logos with inferred flags')
assert.match(postModal, /resolveLeagueLogoLight/, 'post modal must pass light-mode league logo assets')
assert.match(postModal, /lightSrc=\{postLogoLight\}/, 'post modal league logo must use the resolved light logo')
assert.match(postModal, /lightFrame=\{postLogoFrame\}/, 'post modal league logo must use the resolved light logo frame')
assert.match(postModal, /isWidePostLogo/, 'post modal must handle wide logos such as Formula 1 without shrinking them into a square')
assert.match(postModal, /flex flex-wrap/, 'post team tiles must wrap naturally at tablet and mobile widths')
assert.match(postModal, /overflow-hidden/, 'post team tile logo frames must contain their images')
assert.match(postModal, /max-h-\[2\.85rem\] max-w-\[3\.75rem\]/, 'post team logos must be size-capped inside their tiles')
assert.doesNotMatch(postModal, /grid-cols-3 gap-3 sm:grid-cols-4/, 'post team tiles must not use narrow fixed column counts')
assert.doesNotMatch(postModal, /Synced content/, 'post modal metadata should not include the redundant synced-content label')
assert.match(postModal, /whitespace-nowrap/, 'post modal metadata pills must not split labels across lines at tablet width')
assert.match(postModal, /min-w-0/, 'post modal metadata copy must be width-aware next to the logo')

assert.match(ferrariLogo, /aria-label="Scuderia Ferrari badge"/, 'Ferrari team asset must identify the current team badge')
assert.match(ferrariLogo, /#ffd532/i, 'Ferrari team asset should use the recognizable yellow shield base')
assert.doesNotMatch(ferrariLogo, />SF</, 'Ferrari team asset must not use the old generic SF placeholder')

for (const [path, source] of [
  ['components/home/home-experience.tsx', home],
  ['components/home/post-modal.tsx', postModal],
]) {
  assert.doesNotMatch(source, /rounded-\[(2|1\.85|1\.7|1\.6)rem\]|rounded-3xl/g, `${path} should avoid oversized public-card radii`)
}

console.log('UI/UX regression checks passed')
