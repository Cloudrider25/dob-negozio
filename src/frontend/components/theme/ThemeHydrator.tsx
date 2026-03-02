"use client"

import { useEffect } from "react"

const storageKey = "dob-theme"

type Theme = "light" | "dark"
type ThemePreference = Theme | "auto"

const resolveTheme = (preference: ThemePreference): Theme => {
  if (preference === "light" || preference === "dark") return preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const applyTheme = (next: Theme) => {
  document.body.dataset.theme = next
  document.documentElement.dataset.theme = next
}

export const ThemeHydrator = () => {
  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    const initialPreference: ThemePreference =
      stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto"
    applyTheme(resolveTheme(initialPreference))

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemThemeChange = () => {
      const currentStored = window.localStorage.getItem(storageKey)
      const currentPreference: ThemePreference =
        currentStored === "light" || currentStored === "dark" || currentStored === "auto"
          ? currentStored
          : "auto"
      if (currentPreference !== "auto") return
      applyTheme(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", onSystemThemeChange)
    return () => mediaQuery.removeEventListener("change", onSystemThemeChange)
  }, [])

  return null
}
