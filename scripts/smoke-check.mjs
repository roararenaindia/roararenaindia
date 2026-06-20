import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const requiredFiles = [
  'app/page.tsx',
  'app/api/public/home/route.ts',
  'app/api/sync/matches/route.ts',
  'app/api/admin/matches/check/route.ts',
  'app/api/admin/final-check/route.ts',
  'app/api/sync/instagram/route.ts',
  'app/api/sync/x/route.ts',
  'app/api/sync/all/route.ts',
  'components/home/home-experience.tsx',
  'components/admin/admin-dashboard.tsx',
  'supabase/schema.sql',
  'vercel.json',
  '.github/workflows/roar-cron.yml',
  'public/posts/knicks-champions.png',
  'public/posts/germany-curacao-boss-fight.png',
  'public/posts/brazil-morocco-one-save.png',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length) {
  console.error('Missing required files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'))
if (Array.isArray(vercel.crons) && vercel.crons.length > 0) {
  console.error('vercel.json contains cron jobs. Use /api/cron/roar with an external scheduler for the 2-hour live sync.')
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
if (!workflow.includes("cron: '0 */2 * * *'") || !workflow.includes('Authorization: Bearer ${ROAR_CRON_SECRET}')) {
  console.error('GitHub Actions cron must call /api/cron/roar every 2 hours using the Authorization header.')
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
console.log('Vercel Cron disabled for Hobby-safe deployment. Use /api/cron/roar every 2 hours from an external scheduler.')
console.log('Note: live match-provider checks should be run from the deployed app when local network access is restricted.')
