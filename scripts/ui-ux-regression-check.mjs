import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const globals = read('app/globals.css')
const home = read('components/home/home-experience.tsx')
const eventPromotionPath = new URL('../lib/config/event-promotion.ts', import.meta.url)
const eventPromotion = existsSync(eventPromotionPath) ? read('lib/config/event-promotion.ts') : ''
const eventPromotionHook = read('components/hooks/use-event-promotion.ts')
const mobileStickyCta = read('components/layout/mobile-sticky-cta.tsx')
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

assert.doesNotMatch(home, /wimbledon-men|wimbledon-women|Wimbledon|sport-wimbledon/, 'post-Wimbledon cleanup must remove completed-event filters and labels from the homepage')
assert.doesNotMatch(globals, /sport-wimbledon/, 'post-Wimbledon cleanup must remove completed-event theme classes')
assert.match(home, /teamLogoSrc\s*=\s*team\.logo/, 'match cards must preserve provider-supplied logo URLs')
assert.match(home, /sourceMode=\{match\.sport === 'tennis' \? 'sourceOnly' : 'auto'\}/, 'tennis player cards must render provider flags without name-based inference if a future tennis event is added')
assert.match(home, /function MarqueeMotionTrack/, 'desktop marquee rows must use the runtime motion track')
assert.match(home, /scrollWidth \/ 2/, 'marquee motion must measure the duplicated track distance in pixels')
assert.match(home, /ResizeObserver/, 'marquee motion must react to responsive width changes')
assert.doesNotMatch(home, /x:\s*reverse \? \['-50%', '0%'\]/, 'marquee motion must not rely on percentage x keyframes')
assert.match(home, /<MarqueeMotionTrack[^>]*reverse[^>]*duration=\{30\}/s, 'hero ticker must use the runtime motion track')
assert.match(home, /<MarqueeMotionTrack[^>]*duration=\{24\}/s, 'sports league rail must use the runtime motion track')
assert.doesNotMatch(home, /className="animate-marquee-reverse/, 'hero ticker must not rely on the static CSS marquee class')
assert.doesNotMatch(home, /className="animate-league-rail/, 'league rail must not rely on the static CSS marquee class')
const eventSurface = `${eventPromotion}\n${eventPromotionHook}\n${home}\n${mobileStickyCta}`

assert.match(eventPromotion, /EVENT_PROMOTION_END_ISO = '2026-07-20T05:00:00\+05:30'/, 'event promotion must automatically expire after the Spain vs Argentina final screening window')
assert.match(eventPromotion, /function isEventPromotionActive/, 'event promotion must expose a reusable cutoff check for restoring standard CTAs')
assert.match(home, /function EventHeroSection/, 'homepage must render a dedicated temporary event hero')
assert.match(home, /<EventHeroSection \/>[\s\S]*:\s*<HeroSection data=\{data\} isLoading=\{isLoading\} onOpenMatch=\{setSelectedMatch\} \/>/, 'homepage must fall back to the original hero after the event cutoff')
assert.match(eventSurface, /Spain vs Argentina/, 'event promotion must announce Spain vs Argentina')
assert.match(eventSurface, /World Cup 2026 Final/, 'event promotion must identify the World Cup 2026 Final')
assert.match(eventSurface, /711 Rest O' Cafe/, 'event promotion must show the new venue')
assert.match(eventSurface, /Kanakia Park, Mira Bhayandar/, 'event promotion must show the new venue locality')
assert.match(eventSurface, /Unlimited buffet included/i, 'event promotion must show the included unlimited buffet')
assert.match(eventPromotion, /price: '\\u20b9850'/, 'event promotion must show the INR 850 price')
assert.match(eventSurface, /\/assets\/events\/spain-argentina-final-screening\.png/, 'event promotion must use the supplied final poster asset')
assert.match(eventPromotion, /EVENT_REGISTRATION_FORM_URL = 'https:\/\/forms\.gle\/TyLA2zmmmeWR6axp7'/, 'event promotion must store the published Google Form responder URL')
assert.match(home, /href=\{eventPromotion\.bookingUrl\}/, 'event hero booking CTA must open the registration form')
assert.match(mobileStickyCta, /label: 'Book Now'/, 'mobile sticky CTA must switch to event booking while the promotion is active')
assert.match(mobileStickyCta, /useEventPromotionActive/, 'mobile sticky CTA must restore its default action after the event cutoff')
assert.doesNotMatch(eventSurface, /Spain vs Belgium|AV Sports Arena & Cafe|Vinay Nagar, Mira Road|quarter-final|1 starter \+ 1 main course \+ 1 soft drink|\\u20b9299/i, 'event promotion must remove the previous screening details')
assert.doesNotMatch(eventSurface, /1FAIpQLSfIJUScvxpf8q1qhtNElX-ZT9AwQkmlTjyZomIyejumO3PksA/, 'event promotion must remove the previous registration form URL')
assert.doesNotMatch(home, /MorphingSportsBall|HeroMorphingBallStage|ARENA_SPIN_SPORTS/, 'homepage must not keep the rejected ball hero graphic')
assert.doesNotMatch(home, /<motion\.div initial="hidden" animate="visible"[^>]*className="grid items-center/, 'homepage hero must not hide the first viewport until client animation runs')
assert.equal(existsSync(new URL('../public/assets/events/spain-argentina-final-screening.png', import.meta.url)), true, 'event poster asset must exist in public assets')
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
assert.match(postModal, /function FormattedCaption/, 'post modal must format captions through a dedicated renderer')
assert.match(postModal, /split\(\/\\n\{2,\}\//, 'post modal captions must keep paragraph spacing from Instagram-style blank lines')
assert.match(postModal, /whitespace-pre-wrap/, 'post modal captions must preserve caption line breaks')
assert.match(postModal, /\[overflow-wrap:anywhere\]/, 'post modal captions must wrap long URLs and hashtags inside the modal')
assert.doesNotMatch(postModal, /<p className="mt-3 text-sm leading-7 text-foreground">\{fullCaption\}<\/p>/, 'post modal must not collapse the full caption into one plain paragraph')

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
