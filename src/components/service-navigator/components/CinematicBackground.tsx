'use client'

import styles from '../ServiceNavigatorSection.module.css'

export function CinematicBackground() {
  return (
    <>
      {/* Base gradient */}
      <div className={`absolute inset-0 ${styles.cinematicBase}`} />

      {/* Vignette effect */}
      <div className={`absolute inset-0 ${styles.cinematicVignette}`} />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'url(\"data:image/svg+xml,%3Csvg viewBox=\"0 0 400 400\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E\")',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Subtle top glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 blur-3xl ${styles.cinematicGlow}`} />
    </>
  )
}
