import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function requireFile(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    console.error(`Missing sports schedule file: ${relativePath}`)
    process.exit(1)
  }
}

function requireToken(relativePath, token, message) {
  const content = read(relativePath)
  if (!content.includes(token)) {
    console.error(message || `${relativePath} missing required token: ${token}`)
    process.exit(1)
  }
}

const liveHome = read('lib/services/live-home.ts')
if (!liveHome.includes('fetchHomeMatchRows')) {
  console.error('Public home must fetch live/upcoming/final match windows with fetchHomeMatchRows.')
  process.exit(1)
}

for (const token of ['status=eq.live', 'status=eq.upcoming', 'status=eq.final', 'is_featured=eq.true']) {
  if (!liveHome.includes(token)) {
    console.error(`Public home match query missing status-aware selector: ${token}`)
    process.exit(1)
  }
}

if (liveHome.includes("'order=kickoff_time.asc.nullslast',\n      'limit=80'")) {
  console.error('Public home still clips the match table to the earliest 80 kickoff rows.')
  process.exit(1)
}

requireFile('lib/services/tennis-data-provider.ts')
requireFile('app/api/sync/tennis/route.ts')
requireFile('app/api/admin/tennis/check/route.ts')

requireToken('lib/data/arena-live-data.ts', "'tennis'", 'ArenaMatch sport union must include tennis.')
requireToken('lib/services/tennis-data-provider.ts', 'get_fixtures', 'Tennis provider must use API-Tennis fixtures.')
requireToken('lib/services/tennis-data-provider.ts', 'Wimbledon', 'Tennis provider must default to Wimbledon filtering.')
requireToken('app/api/cron/roar/route.ts', '/api/sync/tennis', 'Full cron must include tennis sync.')
requireToken('components/home/home-experience.tsx', 'LeagueFilterKey', 'Home match board must expose a league filter.')
requireToken('.env.example', 'TENNIS_API_KEY=', '.env.example must document the private tennis API key.')

console.log('Sports schedule check passed.')
