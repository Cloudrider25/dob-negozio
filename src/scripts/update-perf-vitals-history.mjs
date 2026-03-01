import fs from 'node:fs'
import path from 'node:path'

const HISTORY_LIMIT = 30
const TREND_WINDOW = 10

const args = new Set(process.argv.slice(2))
const enforce = args.has('--enforce')

const currentPath = path.resolve(process.cwd(), 'test-results', 'perf-vitals.json')
const historyPath = path.resolve(process.cwd(), '.ci-data', 'perf-vitals-history.json')
const summaryPath = path.resolve(process.cwd(), 'test-results', 'perf-vitals-summary.md')

const readJsonFile = (filePath, fallbackValue) => {
  if (!fs.existsSync(filePath)) return fallbackValue
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallbackValue
  }
}

const ensureDirForFile = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

const median = (values) => {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

const format = (value, digits = 2) =>
  Number.isFinite(value) ? Number(value).toFixed(digits) : 'n/a'

if (!fs.existsSync(currentPath)) {
  console.error(`[perf] Missing current vitals file: ${currentPath}`)
  process.exit(1)
}

const currentRun = readJsonFile(currentPath, null)
if (!currentRun || !Array.isArray(currentRun.snapshots) || currentRun.snapshots.length === 0) {
  console.error('[perf] Current vitals payload is invalid.')
  process.exit(1)
}

const history = readJsonFile(historyPath, { runs: [] })
if (!history || !Array.isArray(history.runs)) {
  console.error('[perf] Existing history format is invalid.')
  process.exit(1)
}

const normalizedCurrent = {
  generatedAt:
    typeof currentRun.generatedAt === 'string' && currentRun.generatedAt
      ? currentRun.generatedAt
      : new Date().toISOString(),
  snapshots: currentRun.snapshots,
}

const dedupedRuns = history.runs.filter((run) => run?.generatedAt !== normalizedCurrent.generatedAt)
dedupedRuns.push(normalizedCurrent)
dedupedRuns.sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime())
const trimmedRuns = dedupedRuns.slice(-HISTORY_LIMIT)

const previousRuns = trimmedRuns.slice(0, -1)
const regressions = []
const trendRows = []

for (const snapshot of normalizedCurrent.snapshots) {
  const previousSnapshots = previousRuns
    .flatMap((run) => (Array.isArray(run.snapshots) ? run.snapshots : []))
    .filter((item) => item && item.target === snapshot.target)
    .slice(-TREND_WINDOW)

  const prevLcpMedian = median(previousSnapshots.map((item) => Number(item.lcp)).filter(Number.isFinite))
  const prevClsMedian = median(previousSnapshots.map((item) => Number(item.cls)).filter(Number.isFinite))
  const prevHeroVideoReadyMedian = median(
    previousSnapshots
      .map((item) => Number(item.heroVideoReadyState))
      .filter(Number.isFinite),
  )

  const lcpRegression =
    prevLcpMedian !== null &&
    snapshot.lcp > prevLcpMedian * 1.2 &&
    snapshot.lcp - prevLcpMedian > 150

  const clsRegression =
    prevClsMedian !== null &&
    snapshot.cls > prevClsMedian * 1.25 &&
    snapshot.cls - prevClsMedian > 0.02

  if (lcpRegression || clsRegression) {
    regressions.push({
      target: snapshot.target,
      lcp: snapshot.lcp,
      cls: snapshot.cls,
      prevLcpMedian,
      prevClsMedian,
    })
  }

  trendRows.push(
    `| ${snapshot.target} | ${snapshot.resolvedPath} | ${format(snapshot.lcp)} | ${format(snapshot.cls, 4)} | ${prevLcpMedian === null ? 'n/a' : format(prevLcpMedian)} | ${prevClsMedian === null ? 'n/a' : format(prevClsMedian, 4)} | ${snapshot.hasHeroVideo ? 'yes' : 'no'} | ${snapshot.heroVideoPlaybackSignal ? 'yes' : 'no'} | ${snapshot.heroVideoReadyState ?? 'n/a'} | ${prevHeroVideoReadyMedian === null ? 'n/a' : format(prevHeroVideoReadyMedian, 2)} |`,
  )
}

ensureDirForFile(historyPath)
fs.writeFileSync(
  historyPath,
  JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      runs: trimmedRuns,
    },
    null,
    2,
  ),
  'utf8',
)

ensureDirForFile(summaryPath)
const summary = [
  '# Perf Vitals Summary',
  '',
  `- Generated at: ${new Date().toISOString()}`,
  `- History size: ${trimmedRuns.length} runs`,
  `- Trend window: last ${TREND_WINDOW} runs per target (when available)`,
  '',
  '| Target | Resolved Path | Current LCP | Current CLS | Median LCP (trend) | Median CLS (trend) | Hero Video | Playback Signal | Current Video Ready | Median Video Ready (trend) |',
  '| --- | --- | ---: | ---: | ---: | ---: | --- | --- | ---: | ---: |',
  ...trendRows,
  '',
  regressions.length === 0
    ? '- Regression check: PASS'
    : `- Regression check: FAIL (${regressions.length} target(s) over trend threshold)`,
].join('\n')

fs.writeFileSync(summaryPath, summary, 'utf8')

if (regressions.length > 0) {
  console.error('[perf] Regression detected against trend baseline.')
  for (const regression of regressions) {
    console.error(
      `[perf] ${regression.target} lcp=${regression.lcp} (median=${format(regression.prevLcpMedian)}), cls=${regression.cls} (median=${format(regression.prevClsMedian, 4)})`,
    )
  }
  if (enforce) process.exit(1)
}

console.log(`[perf] History updated: ${historyPath}`)
console.log(`[perf] Summary written: ${summaryPath}`)
