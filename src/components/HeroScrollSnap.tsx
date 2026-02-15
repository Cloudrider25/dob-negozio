'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const LOCK_DURATION_MS = 700
const WHEEL_THRESHOLD = 18

const getHeaderOffset = () => {
  const header = document.querySelector('header')
  if (!header) return 0
  return header.getBoundingClientRect().height
}

const scrollToTarget = (target: HTMLElement) => {
  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset())
  window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

const heroIsVisible = (hero: HTMLElement) => {
  const rect = hero.getBoundingClientRect()
  const viewportHeight = window.innerHeight || 1
  return rect.bottom > 0 && rect.top < viewportHeight
}

const heroIsFullyVisible = (hero: HTMLElement) => {
  const rect = hero.getBoundingClientRect()
  return rect.top >= 0 && rect.bottom <= window.innerHeight
}

const nextIsFullyVisible = (next: HTMLElement) => {
  const rect = next.getBoundingClientRect()
  return rect.top >= 0 && rect.bottom <= window.innerHeight
}

export const HeroScrollSnap = () => {
  const pathname = usePathname()

  useEffect(() => {
    const heroes = Array.from(document.querySelectorAll<HTMLElement>('[data-hero="true"]'))
    if (!heroes.length) return

    const cleanups: Array<() => void> = []

    heroes.forEach((hero) => {
      let locked = false
      let lockTimeout: number | null = null
      let lastScrollY = window.scrollY
      let rafId: number | null = null

      const releaseLock = () => {
        locked = false
        if (lockTimeout) {
          window.clearTimeout(lockTimeout)
          lockTimeout = null
        }
      }

      const triggerLock = () => {
        locked = true
        if (lockTimeout) window.clearTimeout(lockTimeout)
        lockTimeout = window.setTimeout(releaseLock, LOCK_DURATION_MS)
      }

      const getNextTarget = () => {
        const next = hero.nextElementSibling
        if (!next || !(next instanceof HTMLElement)) return null
        return next
      }

      const getTargets = () => {
        const next = getNextTarget()
        if (!next) return null
        return { next }
      }

      const isEventInsideHero = (event: WheelEvent) => {
        const path = event.composedPath?.() ?? []
        if (path.includes(hero)) return true
        const targets = getTargets()
        if (targets?.next && path.includes(targets.next)) return true
        const el = document.elementFromPoint(event.clientX, event.clientY)
        if (el && hero.contains(el)) return true
        if (el && targets?.next && targets.next.contains(el)) return true
        return false
      }

      const enforceFullSnap = (direction: number) => {
        const targets = getTargets()
        if (!targets) return
        if (!heroIsVisible(hero)) return
        if (direction > 0 && !nextIsFullyVisible(targets.next)) {
          triggerLock()
          scrollToTarget(targets.next)
        }
        if (direction < 0 && !heroIsFullyVisible(hero)) {
          triggerLock()
          scrollToTarget(hero)
        }
      }

      const handleScroll = () => {
        if (locked) return
        const current = window.scrollY
        const direction = current > lastScrollY ? 1 : -1
        lastScrollY = current

        if (rafId) window.cancelAnimationFrame(rafId)
        rafId = window.requestAnimationFrame(() => {
          enforceFullSnap(direction)
        })
      }

      const handleWheel = (event: WheelEvent) => {
        if (event.ctrlKey) return
        if (!isEventInsideHero(event)) return
        if (locked) {
          event.preventDefault()
          return
        }
        if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return

        const direction = event.deltaY > 0 ? 1 : -1
        const targets = getTargets()
        if (!targets) return
        const target = direction > 0 ? targets.next : hero

        if (!target) return

        event.preventDefault()
        triggerLock()
        scrollToTarget(target)
      }

      window.addEventListener('wheel', handleWheel, { passive: false })
      window.addEventListener('scroll', handleScroll, { passive: true })

      cleanups.push(() => {
        window.removeEventListener('wheel', handleWheel)
        window.removeEventListener('scroll', handleScroll)
        if (rafId) window.cancelAnimationFrame(rafId)
        releaseLock()
      })
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [pathname])

  return null
}
