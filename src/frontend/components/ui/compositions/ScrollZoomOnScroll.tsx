'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

type ScrollZoomOnScrollProps = {
  children: ReactNode
  className?: string
  enabled?: boolean
  minScale?: number
  maxScale?: number
  sensitivity?: number
}

export function ScrollZoomOnScroll({
  children,
  className,
  enabled = true,
  minScale = 1,
  maxScale = 1.12,
  sensitivity = 0.0015,
}: ScrollZoomOnScrollProps) {
  const [scale, setScale] = useState(maxScale)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    lastScrollYRef.current = window.scrollY
    let rafId: number | null = null

    const applyFromScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollYRef.current
      lastScrollYRef.current = currentY

      if (delta !== 0) {
        // Scroll down => zoom out, scroll up => zoom in.
        setScale((prev) => Math.max(minScale, Math.min(maxScale, prev - delta * sensitivity)))
      }
      rafId = null
    }

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(applyFromScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [enabled, maxScale, minScale, sensitivity])

  return (
    <div
      className={className}
      style={enabled ? { transform: `scale(${scale})`, willChange: 'transform' } : undefined}
    >
      {children}
    </div>
  )
}
