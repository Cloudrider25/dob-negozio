"use client"

import { useEffect } from "react"

export const HeaderThemeObserver = () => {
  useEffect(() => {
    const isHome = Boolean(document.querySelector(".home-page"))
    const isServicesCategory = Boolean(document.querySelector(".services-category-page"))
    document.body.classList.toggle("page-home", isHome)
    document.body.classList.toggle("page-services-category", isServicesCategory)

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
      observer.disconnect()
      document.body.classList.remove("page-home")
      document.body.classList.remove("page-services-category")
      document.body.classList.remove("header-on-light")
    }
  }, [])

  return null
}
