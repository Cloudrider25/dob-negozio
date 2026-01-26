"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export const HeaderThemeObserver = () => {
  const pathname = usePathname()

  useEffect(() => {
    const updateHeroState = () => {
      const hasHero = Boolean(document.querySelector("[data-hero='true']"))
      document.body.classList.toggle("header-over-hero", hasHero)
    }

    const updateScrollState = () => {
      document.body.classList.toggle("header-scrolled", window.scrollY > 12)
    }

    const raf = window.requestAnimationFrame(() => {
      updateHeroState()
      updateScrollState()
    })

    window.addEventListener("scroll", updateScrollState, { passive: true })

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-header-theme='light']"),
    )
    if (!sections.length) return

    const active = new Set<Element>()

    const update = () => {
      if (active.size > 0) {
        document.body.classList.add("header-on-light")
      } else {
        document.body.classList.remove("header-on-light")
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            active.add(entry.target)
          } else {
            active.delete(entry.target)
          }
        })
        update()
      },
      {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      },
    )

    sections.forEach((section) => observer.observe(section))
    update()

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("scroll", updateScrollState)
      observer.disconnect()
      document.body.classList.remove("header-over-hero")
      document.body.classList.remove("header-scrolled")
      document.body.classList.remove("header-on-light")
    }
  }, [pathname])

  return null
}
