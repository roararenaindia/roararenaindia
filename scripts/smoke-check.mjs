import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const requiredFiles = [
  'app/page.tsx',
  'app/api/public/home/route.ts',
  'app/api/sync/matches/route.ts',
  'app/api/sync/tennis/route.ts',
  'app/api/admin/matches/check/route.ts',
  'app/api/admin/tennis/check/route.ts',
  'app/api/admin/final-check/route.ts',
  'app/api/auth/instagram/callback/route.ts',
  'app/api/sync/instagram/route.ts',
  'app/api/webhooks/instagram/route.ts',
  'app/api/sync/x/route.ts',
  'app/api/sync/all/route.ts',
  'app/manifest.ts',
  'app/robots.ts',
  'app/sitemap.ts',
  'components/analytics/google-analytics.tsx',
  'components/home/home-experience.tsx',
  'components/admin/admin-dashboard.tsx',
  'lib/config/seo.ts',
  'lib/services/match-self-heal.ts',
  'lib/services/tennis-data-provider.ts',
  'supabase/schema.sql',
  'vercel.json',
  '.github/workflows/roar-cron.yml',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length) {
  console.error('Missing required files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'))
if (!Array.isArray(vercel.crons) || vercel.crons.length !== 1) {
  console.error('vercel.json must contain exactly one Hobby-safe daily Vercel Cron backup.')
  process.exit(1)
}
if (vercel.crons[0]?.path !== '/api/cron/roar' || vercel.crons[0]?.schedule !== '0 0 * * *') {
  console.error('Vercel Cron backup must call /api/cron/roar once daily for Hobby-safe deployment.')
  process.exit(1)
}
if (!fs.existsSync(path.join(root, 'app/api/cron/roar/route.ts'))) {
  console.error('Missing external cron endpoint: app/api/cron/roar/route.ts')
  process.exit(1)
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
if (!packageJson.packageManager?.startsWith('npm@')) {
  console.error('package.json must pin npm via packageManager for deterministic Vercel installs.')
  process.exit(1)
}
if (packageJson.dependencies?.['lucide-react'] || packageJson.devDependencies?.['lucide-react']) {
  console.error('lucide-react dependency found. Use components/ui/icon-set.tsx to avoid icon export/build drift.')
  process.exit(1)
}
if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) {
  console.error('pnpm-lock.yaml found. This project deploys with npm and package-lock.json only.')
  process.exit(1)
}

const nextConfig = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8')
if (nextConfig.includes('ignoreBuildErrors')) {
  console.error('next.config.mjs must not ignore TypeScript build errors for production deploys.')
  process.exit(1)
}

const workflow = fs.readFileSync(path.join(root, '.github/workflows/roar-cron.yml'), 'utf8')
for (const token of ["cron: '3,13,23,33,43,53 * * * *'", "cron: '7,22,37,52 * * * *'", "cron: '17 */2 * * *'", '/api/sync/instagram', '/api/sync/matches', '/api/sync/tennis', 'Authorization: Bearer ${ROAR_CRON_SECRET}']) {
  if (!workflow.includes(token)) {
    console.error(`GitHub Actions cron missing required live-sync token: ${token}`)
    process.exit(1)
  }
}

const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8')
for (const token of [
  'INSTAGRAM_WEBHOOK_VERIFY_TOKEN=',
  'META_APP_SECRET=',
  'MATCH_SYNC_PAST_DAYS=7',
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID=',
  'MATCH_SELF_HEAL_ENABLED=true',
  'MATCH_SELF_HEAL_STALE_MINUTES=20',
  'TENNIS_API_KEY=',
  'TENNIS_TOURNAMENT_NAME_FILTER=Wimbledon',
]) {
  if (!envExample.includes(token)) {
    console.error(`.env.example missing required automation token: ${token}`)
    process.exit(1)
  }
}

const webhookRoute = fs.readFileSync(path.join(root, 'app/api/webhooks/instagram/route.ts'), 'utf8')
for (const token of ['INSTAGRAM_WEBHOOK_VERIFY_TOKEN', 'META_APP_SECRET', 'x-hub-signature-256', '/api/sync/instagram', '/api/admin/auto-curate']) {
  if (!webhookRoute.includes(token)) {
    console.error(`Instagram webhook route missing required behavior: ${token}`)
    process.exit(1)
  }
}

const instagramCallbackRoute = fs.readFileSync(path.join(root, 'app/api/auth/instagram/callback/route.ts'), 'utf8')
for (const token of ['Instagram Business Login Callback Ready', 'no-store', '/admin']) {
  if (!instagramCallbackRoute.includes(token)) {
    console.error(`Instagram business-login callback route missing required behavior: ${token}`)
    process.exit(1)
  }
}

const matchSyncRoute = fs.readFileSync(path.join(root, 'app/api/sync/matches/route.ts'), 'utf8')
for (const token of ['resultValidation', 'homepageValidation', 'MATCH_SYNC_PAST_DAYS || 7']) {
  if (!matchSyncRoute.includes(token)) {
    console.error(`Match sync route missing result visibility guard: ${token}`)
    process.exit(1)
  }
}

const publicHomeRoute = fs.readFileSync(path.join(root, 'app/api/public/home/route.ts'), 'utf8')
for (const token of ['ensureFreshMatchScores', 'public-home-api', 'Cache-Control']) {
  if (!publicHomeRoute.includes(token)) {
    console.error(`Public home route missing self-healing score freshness token: ${token}`)
    process.exit(1)
  }
}

const pageRoute = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8')
for (const token of ['ensureFreshMatchScores', 'homepage-server-render']) {
  if (!pageRoute.includes(token)) {
    console.error(`Homepage route missing self-healing score freshness token: ${token}`)
    process.exit(1)
  }
}

const matchSelfHeal = fs.readFileSync(path.join(root, 'lib/services/match-self-heal.ts'), 'utf8')
for (const token of [
  'MATCH_SELF_HEAL_STALE_MINUTES',
  'source=eq.matches',
  'status=eq.success',
  'fetchMatchRecordsRange',
  'supabaseUpsert',
  'Self-heal match sync complete',
]) {
  if (!matchSelfHeal.includes(token)) {
    console.error(`Match self-heal service missing required token: ${token}`)
    process.exit(1)
  }
}

const sportsScheduleCheck = fs.readFileSync(path.join(root, 'scripts/sports-schedule-check.mjs'), 'utf8')
for (const token of ['fetchHomeMatchRows', 'TENNIS_API_KEY=', 'app/api/sync/tennis/route.ts']) {
  if (!sportsScheduleCheck.includes(token)) {
    console.error(`Sports schedule check missing guard token: ${token}`)
    process.exit(1)
  }
}

if (!workflow.includes('Authorization: Bearer ${ROAR_CRON_SECRET}')) {
  console.error('GitHub Actions cron must call sync endpoints using the Authorization header.')
  process.exit(1)
}

const schema = fs.readFileSync(path.join(root, 'supabase/schema.sql'), 'utf8')
for (const table of ['roar_posts', 'roar_matches', 'roar_generated_posts', 'roar_sync_runs']) {
  if (!schema.includes(table)) {
    console.error(`Schema missing ${table}`)
    process.exit(1)
  }
}

const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8')
for (const component of ['HomeExperience', 'Header', 'Footer', 'MobileStickyCtA']) {
  if (!page.includes(component)) {
    console.error(`Page missing ${component}`)
    process.exit(1)
  }
}
if (!page.includes('application/ld+json')) {
  console.error('Homepage missing JSON-LD structured data.')
  process.exit(1)
}

const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8')
for (const token of [
  'alternates',
  'canonical',
  'openGraph',
  'twitter',
  'manifest',
  'seoConfig.description',
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  'verification',
  'GoogleAnalytics',
]) {
  if (!layout.includes(token)) {
    console.error(`Root metadata missing SEO token: ${token}`)
    process.exit(1)
  }
}

const googleAnalytics = fs.readFileSync(path.join(root, 'components/analytics/google-analytics.tsx'), 'utf8')
for (const token of ['NEXT_PUBLIC_GA_MEASUREMENT_ID', 'googletagmanager.com/gtag/js', "process.env.NODE_ENV !== 'production'", '^G-[A-Z0-9]+$']) {
  if (!googleAnalytics.includes(token)) {
    console.error(`Google Analytics component missing required token: ${token}`)
    process.exit(1)
  }
}

const robotsRoute = fs.readFileSync(path.join(root, 'app/robots.ts'), 'utf8')
for (const token of ['/admin', '/studio', '/api/', '/sitemap.xml']) {
  if (!robotsRoute.includes(token)) {
    console.error(`robots.txt route missing crawl directive token: ${token}`)
    process.exit(1)
  }
}

const sitemapRoute = fs.readFileSync(path.join(root, 'app/sitemap.ts'), 'utf8')
if (!sitemapRoute.includes('priority: 1') || !sitemapRoute.includes("changeFrequency: 'hourly'")) {
  console.error('sitemap route missing homepage priority/freshness metadata.')
  process.exit(1)
}

const manifestRoute = fs.readFileSync(path.join(root, 'app/manifest.ts'), 'utf8')
for (const token of ['standalone', 'logo-icon-dark-512.png', 'logo-icon-light-512.png']) {
  if (!manifestRoute.includes(token)) {
    console.error(`manifest route missing PWA/SEO token: ${token}`)
    process.exit(1)
  }
}

for (const route of ['app/admin/page.tsx', 'app/studio/page.tsx']) {
  const content = fs.readFileSync(path.join(root, route), 'utf8')
  if (!content.includes('index: false') || !content.includes('follow: false')) {
    console.error(`${route} must stay noindex,nofollow.`)
    process.exit(1)
  }
}

const homeExperience = fs.readFileSync(path.join(root, 'components/home/home-experience.tsx'), 'utf8')
for (const section of ['id="updates"', 'id="matches"', 'id="building"', 'id="events"', 'id="community"']) {
  if (!homeExperience.includes(section)) {
    console.error(`Home experience missing ${section}`)
    process.exit(1)
  }
}


const siteData = fs.readFileSync(path.join(root, 'lib/config/site-data.ts'), 'utf8')
for (const token of ['futureEvents', 'posts', 'sports', 'mobileStickyCtA', 'facebook']) {
  if (!siteData.includes(token)) {
    console.error(`siteConfig missing ${token}`)
    process.exit(1)
  }
}

const logoAssets = fs.readFileSync(path.join(root, 'lib/domain/logo-assets.ts'), 'utf8')
const logoSourceManifest = fs.readFileSync(path.join(root, 'public/assets/leagues/OFFICIAL_SOURCES.md'), 'utf8')
const legacyLogoBasenames = [
  'icc-cricket.png',
  'mlb.png',
  'nfl.png',
  'nhl.png',
  'ufc.png',
  'premier-league.png',
  'uefa-champions-league.png',
  'olympics.png',
  'motogp.png',
  'wimbledon.png',
  'pga-tour.png',
  'the-masters.png',
]
const legacyLogoRefs = legacyLogoBasenames.map((basename) => `/assets/leagues/${basename}`)
for (const ref of legacyLogoRefs) {
  if (siteData.includes(ref) || logoAssets.includes(ref)) {
    console.error(`Legacy placeholder logo is still configured: ${ref}`)
    process.exit(1)
  }
}
const configuredLeagueRefs = new Set()
for (const content of [siteData, logoAssets]) {
  for (const match of content.matchAll(/["']\/assets\/leagues\/[^"']+["']/g)) {
    configuredLeagueRefs.add(match[0].slice(1, -1))
  }
}
for (const ref of configuredLeagueRefs) {
  const target = path.join(root, 'public', ref.replace(/^\//, ''))
  if (!fs.existsSync(target)) {
    console.error(`Configured league logo file is missing: ${ref}`)
    process.exit(1)
  }
  const basename = path.basename(ref)
  if (!logoSourceManifest.includes(`\`${basename}\``)) {
    console.error(`Configured league logo is missing from OFFICIAL_SOURCES.md: ${basename}`)
    process.exit(1)
  }
}

const sourceFiles = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(full)
  }
}
for (const dir of ['app', 'components', 'lib']) walk(path.join(root, dir))
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8')
  if (file.includes(`${path.sep}app${path.sep}api${path.sep}`) && content.includes('if (!secret) return true')) {
    console.error(`Production-unsafe missing-secret auth fallback found in ${path.relative(root, file)}`)
    process.exit(1)
  }
  if (file.includes(`${path.sep}app${path.sep}api${path.sep}`) && content.includes("searchParams.get('secret')")) {
    console.error(`Query-string secret fallback found in ${path.relative(root, file)}. Use Authorization headers only.`)
    process.exit(1)
  }
  if (content.includes("from 'lucide-react'") || content.includes('from \"lucide-react\"')) {
    console.error(`Direct lucide-react import found in ${path.relative(root, file)}`)
    process.exit(1)
  }
}

const publicRefs = new Set()
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8')
  for (const match of content.matchAll(/["']\/(assets|posts|logos|og|logo|icon)[^"']+["']/g)) {
    publicRefs.add(match[0].slice(1, -1))
  }
}
for (const ref of publicRefs) {
  const target = path.join(root, 'public', ref.replace(/^\//, ''))
  if (!fs.existsSync(target)) {
    console.error(`Missing public asset reference: ${ref}`)
    process.exit(1)
  }
}

console.log('No direct lucide-react imports in source files.')
console.log('No production-unsafe admin/cron auth fallback found.')
console.log('All checked public asset references exist.')
console.log('siteConfig contains required public sections.')
console.log('Roar Arena smoke check passed.')
console.log('Vercel Cron daily backup is Hobby-safe. GitHub Actions still runs Instagram every 10 minutes, matches every 15 minutes, and /api/cron/roar every 2 hours.')
console.log('Public home has self-healing match score freshness when scheduled sync is stale.')
console.log('Note: live match-provider checks should be run from the deployed app when local network access is restricted.')
