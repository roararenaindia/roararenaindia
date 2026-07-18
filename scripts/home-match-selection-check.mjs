import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

const root = process.cwd()
const sourcePath = path.join(root, 'lib/domain/match-selection.ts')

if (!fs.existsSync(sourcePath)) {
  throw new Error('Missing match-selection helper.')
}

const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: sourcePath,
}).outputText

const module = { exports: {} }
vm.runInNewContext(
  compiled,
  {
    exports: module.exports,
    module,
    require(specifier) {
      throw new Error(`Unexpected runtime import in match-selection helper: ${specifier}`)
    },
  },
  { filename: sourcePath },
)

const {
  pickPrimaryMatch,
  pickNextUpcoming,
  pickLatestResult,
  sortMatchesForBoard,
} = module.exports

const now = Date.parse('2026-07-18T08:15:00.000Z')

function match(overrides) {
  return {
    id: 'base',
    status: 'upcoming',
    kickoffIso: '2026-07-19T19:00:00.000Z',
    priority: 0,
    isHidden: false,
    ...overrides,
  }
}

const worldCupFinal = match({
  id: 'world-cup-final',
  status: 'upcoming',
  kickoffIso: '2026-07-19T19:00:00.000Z',
  priority: 80,
})

const oldSemiFinal = match({
  id: 'old-semi-final',
  status: 'final',
  kickoffIso: '2026-07-15T19:00:00.000Z',
  priority: 999,
  isFeatured: true,
})

const latestResult = match({
  id: 'latest-result',
  status: 'final',
  kickoffIso: '2026-07-16T19:00:00.000Z',
  priority: 60,
})

const liveMatch = match({
  id: 'live-match',
  status: 'live',
  kickoffIso: '2026-07-18T08:00:00.000Z',
  priority: 40,
})

assert.equal(
  pickPrimaryMatch([oldSemiFinal, worldCupFinal], undefined, now)?.id,
  'world-cup-final',
  'the next World Cup final should beat older completed semifinal data',
)

assert.equal(
  pickPrimaryMatch([oldSemiFinal, worldCupFinal, liveMatch], undefined, now)?.id,
  'live-match',
  'live matches should still beat upcoming fixtures',
)

assert.equal(
  pickNextUpcoming([oldSemiFinal, worldCupFinal], now)?.id,
  'world-cup-final',
  'next upcoming should return the soonest future fixture',
)

assert.equal(
  pickLatestResult([oldSemiFinal, latestResult], now)?.id,
  'latest-result',
  'latest result should remain the newest final when the UI needs the result pulse',
)

assert.deepEqual(
  sortMatchesForBoard([oldSemiFinal, latestResult, worldCupFinal, liveMatch], now).map((item) => item.id),
  ['live-match', 'world-cup-final', 'latest-result', 'old-semi-final'],
  'board ordering should be live, upcoming, then latest results',
)

console.log('Home match selection check passed.')
