import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { expect, test, type BrowserContext } from '@playwright/test'

type VitalsSnapshot = {
  target: string
  resolvedPath: string
  lcp: number
  cls: number
  fcp: number
  ttfb: number
  hasHeroVideo: boolean
  heroVideoReadyState: number | null
  heroVideoCurrentTime: number | null
  heroVideoPaused: boolean | null
  heroVideoPlaybackSignal: boolean
}

const oneYearSeconds = 60 * 60 * 24 * 365

const buildPreferenceCookies = () => [
  {
    name: 'dob_prefs_confirmed',
    value: '1',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_locale',
    value: 'it',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_country',
    value: 'ITA',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_currency',
    value: 'EUR',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
]

const collectVitals = async (context: BrowserContext, target: string): Promise<VitalsSnapshot> => {
  const page = await context.newPage()
  await page.addInitScript(() => {
    const scopedWindow = window as typeof window & {
      __DOB_VITALS__?: { lcp: number; cls: number }
    }

    scopedWindow.__DOB_VITALS__ = { lcp: 0, cls: 0 }

    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (!lastEntry) return
      scopedWindow.__DOB_VITALS__ = {
        ...(scopedWindow.__DOB_VITALS__ ?? { lcp: 0, cls: 0 }),
        lcp: lastEntry.startTime,
      }
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

    const clsObserver = new PerformanceObserver((entryList) => {
      let cls = scopedWindow.__DOB_VITALS__?.cls ?? 0
      for (const entry of entryList.getEntries()) {
        const layoutShift = entry as PerformanceEntry & {
          value?: number
          hadRecentInput?: boolean
        }
        if (layoutShift.hadRecentInput) continue
        cls += layoutShift.value ?? 0
      }
      scopedWindow.__DOB_VITALS__ = {
        ...(scopedWindow.__DOB_VITALS__ ?? { lcp: 0, cls: 0 }),
        cls,
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
  })

  await page.goto(`http://localhost:3000${target}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  if (target === '/it') {
    await page
      .waitForFunction(() => {
        const heroVideo = document.querySelector('[data-hero="true"] video') as HTMLVideoElement | null
        if (!heroVideo) return true
        return heroVideo.readyState >= 2 || heroVideo.currentTime > 0 || heroVideo.paused === false
      }, { timeout: 5000 })
      .catch(() => null)
  }

  const metrics = await page.evaluate(() => {
    const scopedWindow = window as typeof window & {
      __DOB_VITALS__?: { lcp: number; cls: number }
    }
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    const firstContentfulPaint = performance.getEntriesByName(
      'first-contentful-paint',
    )[0] as PerformanceEntry | undefined

    return {
      resolvedPath: `${location.pathname}${location.search}`,
      lcp: scopedWindow.__DOB_VITALS__?.lcp ?? 0,
      cls: scopedWindow.__DOB_VITALS__?.cls ?? 0,
      fcp: firstContentfulPaint?.startTime ?? 0,
      ttfb: nav?.responseStart ?? 0,
      hasHeroVideo: Boolean(document.querySelector('[data-hero=\"true\"] video')),
      heroVideoReadyState:
        (document.querySelector('[data-hero=\"true\"] video') as HTMLVideoElement | null)?.readyState ?? null,
      heroVideoCurrentTime:
        (document.querySelector('[data-hero=\"true\"] video') as HTMLVideoElement | null)?.currentTime ?? null,
      heroVideoPaused:
        (document.querySelector('[data-hero=\"true\"] video') as HTMLVideoElement | null)?.paused ?? null,
    }
  })

  await page.close()

  return {
    target,
    resolvedPath: metrics.resolvedPath,
    lcp: Number(metrics.lcp.toFixed(2)),
    cls: Number(metrics.cls.toFixed(4)),
    fcp: Number(metrics.fcp.toFixed(2)),
    ttfb: Number(metrics.ttfb.toFixed(2)),
    hasHeroVideo: metrics.hasHeroVideo,
    heroVideoReadyState: metrics.heroVideoReadyState,
    heroVideoCurrentTime:
      typeof metrics.heroVideoCurrentTime === 'number'
        ? Number(metrics.heroVideoCurrentTime.toFixed(3))
        : null,
    heroVideoPaused: metrics.heroVideoPaused,
    heroVideoPlaybackSignal:
      metrics.hasHeroVideo &&
      ((typeof metrics.heroVideoReadyState === 'number' && metrics.heroVideoReadyState >= 2) ||
        (typeof metrics.heroVideoCurrentTime === 'number' && metrics.heroVideoCurrentTime > 0) ||
        metrics.heroVideoPaused === false),
  }
}

test.describe('Performance vitals baseline', () => {
  test('@perf homepage + forms + checkout LCP/CLS baseline', async ({ context }) => {
    test.setTimeout(240_000)
    await context.addCookies(buildPreferenceCookies())

    const targets = ['/it', '/it/services?view=consulenza', '/it/checkout']
    const snapshots: VitalsSnapshot[] = []

    for (const target of targets) {
      snapshots.push(await collectVitals(context, target))
    }

    for (const snapshot of snapshots) {
      expect(snapshot.cls, `${snapshot.target} -> ${snapshot.resolvedPath}`).toBeLessThan(0.25)
      expect(snapshot.lcp, `${snapshot.target} -> ${snapshot.resolvedPath}`).toBeLessThan(6000)
      if (snapshot.target === '/it' && snapshot.hasHeroVideo) {
        expect(snapshot.heroVideoPlaybackSignal, `${snapshot.target} -> ${snapshot.resolvedPath} hero video playback`).toBeTruthy()
      }
    }

    const outputDir = path.resolve(process.cwd(), 'test-results')
    mkdirSync(outputDir, { recursive: true })
    writeFileSync(
      path.join(outputDir, 'perf-vitals.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          snapshots,
        },
        null,
        2,
      ),
      'utf8',
    )

    console.log('[perf] vitals baseline', JSON.stringify(snapshots))
  })
})
