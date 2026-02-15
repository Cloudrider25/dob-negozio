"use client"

import { useEffect } from "react"

const storageKey = "dob-theme"

type Theme = "light" | "dark"

export const ThemeHydrator = () => {
  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const next: Theme =
      stored === "light" || stored === "dark" ? stored : systemPrefersDark ? "dark" : "light"
    document.body.dataset.theme = next
    document.documentElement.dataset.theme = next
  }, [])

  return null
}
