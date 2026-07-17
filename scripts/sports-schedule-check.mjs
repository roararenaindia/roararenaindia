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

requireToken('lib/services/match-data-provider.ts', 'football-data:537389', 'The completed France vs England third-place fixture must stay suppressed during provider sync.')
requireToken('lib/services/match-data-provider.ts', 'suppressedMatchProviderIds', 'Match sync must support permanent provider fixture corrections.')
requireToken('lib/data/arena-live-data.ts', "'tennis'", 'ArenaMatch sport union must include tennis.')
requireToken('lib/services/tennis-data-provider.ts', 'site.web.api.espn.com', 'Tennis provider must include the keyless ESPN tennis endpoint.')
requireToken('lib/services/tennis-data-provider.ts', 'TENNIS_DATA_PROVIDER', 'Tennis provider must expose a provider selector for ESPN/API-Tennis.')
requireToken('lib/services/tennis-data-provider.ts', 'espn-tennis:', 'Tennis provider must persist ESPN competition IDs with a stable namespace.')
requireToken('lib/services/tennis-data-provider.ts', 'get_fixtures', 'Tennis provider must keep API-Tennis fixtures as a fallback.')
requireToken('lib/services/tennis-data-provider.ts', "const defaultTournamentFilter = ''", 'Tennis provider must not default to a completed tournament after event cleanup.')
requireToken('lib/services/tennis-data-provider.ts', 'return hasScoreDetail ? won : null', 'ESPN tennis score mapping must preserve 0-set scores instead of blanking them.')
requireToken('app/api/cron/roar/route.ts', '/api/sync/tennis', 'Full cron must include tennis sync.')
requireToken('components/home/home-experience.tsx', 'LeagueFilterKey', 'Home match board must expose a league filter.')
requireToken('components/home/home-experience.tsx', 'leagueTone', 'Home match board must style sport-specific filters.')
requireToken('components/home/home-experience.tsx', "logo: '/assets/leagues/fifa-world-cup-dark.png'", 'Home sport selector must show the FIFA football logo.')
if (/wimbledon-men|wimbledon-women|Wimbledon/.test(read('components/home/home-experience.tsx'))) {
  console.error('Home sport selector must not show Wimbledon after the completed event cleanup.')
  process.exit(1)
}
requireToken('lib/services/live-home.ts', 'matchFamily', 'Public home must balance match picks by sport family so FIFA rows are not crowded out by stale completed events.')
requireToken('.env.example', 'TENNIS_DATA_PROVIDER=espn', '.env.example must document the keyless ESPN tennis provider.')
requireToken('.env.example', 'TENNIS_API_KEY=', '.env.example must document the private tennis API key.')

console.log('Sports schedule check passed.')
