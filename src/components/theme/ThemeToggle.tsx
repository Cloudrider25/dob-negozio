"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/cn"
import { Moon, Sun } from "@/components/ui/icons"
import styles from "./ThemeToggle.module.css"

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

export const ThemeToggle = () => {
  const [preference, setPreference] = useState<ThemePreference>("auto")
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    const nextPreference: ThemePreference =
      stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto"
    const nextTheme = resolveTheme(nextPreference)

    setPreference(nextPreference)
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemThemeChange = () => {
      if (preference !== "auto") return
      const systemTheme = mediaQuery.matches ? "dark" : "light"
      setTheme(systemTheme)
      applyTheme(systemTheme)
    }

    onSystemThemeChange()
    mediaQuery.addEventListener("change", onSystemThemeChange)
    return () => mediaQuery.removeEventListener("change", onSystemThemeChange)
  }, [preference])

  const toggleTheme = () => {
    const nextPreference: ThemePreference =
      preference === "auto" ? "light" : preference === "light" ? "dark" : "auto"
    const nextTheme = resolveTheme(nextPreference)

    setPreference(nextPreference)
    setTheme(nextTheme)
    window.localStorage.setItem(storageKey, nextPreference)
    applyTheme(nextTheme)
  }

  const label =
    preference === "auto" ? "Auto Mode" : theme === "dark" ? "Dark Mode" : "Light Mode"

  return (
    <button
      className={cn(styles.toggle, theme === "dark" && styles.toggleDark)}
      type="button"
      onClick={toggleTheme}
      aria-label="Cambia tema (auto, chiaro, scuro)"
      aria-pressed={preference !== "auto"}
    >
      <span className={cn(styles.icon, theme === "dark" && styles.iconDark)} aria-hidden="true">
        {theme === "dark" ? <Moon /> : <Sun />}
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  )
}
