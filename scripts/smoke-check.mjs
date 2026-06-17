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
  'components/home-experience.tsx',
  'components/admin-dashboard.tsx',
  'supabase/schema.sql',
  'vercel.json',
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
  console.error('vercel.json contains cron jobs. Vercel Hobby rejects 30-minute schedules; use /api/cron/roar with an external scheduler instead.')
  process.exit(1)
}
if (!fs.existsSync(path.join(root, 'app/api/cron/roar/route.ts'))) {
  console.error('Missing external cron endpoint: app/api/cron/roar/route.ts')
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

const homeExperience = fs.readFileSync(path.join(root, 'components/home-experience.tsx'), 'utf8')
for (const section of ['id="live"', 'id="updates"', 'id="engine"', 'id="sports"', 'id="connect"']) {
  if (!homeExperience.includes(section)) {
    console.error(`Home experience missing ${section}`)
    process.exit(1)
  }
}


const siteData = fs.readFileSync(path.join(root, 'lib/site-data.ts'), 'utf8')
for (const token of ['futureEvents', 'posts', 'sports', 'mobileStickyCtA']) {
  if (!siteData.includes(token)) {
    console.error(`siteConfig missing ${token}`)
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
console.log('All checked public asset references exist.')
console.log('siteConfig contains required public sections.')
console.log('Roar Arena smoke check passed.')
console.log('Vercel Cron disabled for Hobby-safe deployment. Use /api/cron/roar every 30 minutes from an external scheduler.')
console.log('Note: live API-Football key check must run from Vercel/v0 because this sandbox has no DNS access to v3.football.api-sports.io.')
