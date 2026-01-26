"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/cn"
import styles from "./ThemeToggle.module.css"

const storageKey = "dob-theme"

type Theme = "light" | "dark"

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const next = stored === "light" || stored === "dark" ? stored : systemPrefersDark ? "dark" : "light"
    setTheme(next)
    document.body.dataset.theme = next
    document.documentElement.dataset.theme = next
  }, [])

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    window.localStorage.setItem(storageKey, next)
    document.body.dataset.theme = next
    document.documentElement.dataset.theme = next
  }

  return (
    <button
      className={cn(styles.toggle, theme === "dark" && styles.toggleDark)}
      type="button"
      onClick={toggleTheme}
      aria-label="Cambia tema"
      aria-pressed={theme === "dark"}
    >
      <span className={cn(styles.icon, theme === "dark" && styles.iconDark)} aria-hidden="true">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15.5A8.5 8.5 0 0 1 8.5 3a7 7 0 1 0 12.5 12.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M16.5 6.5l.6 1.8 1.9.2-1.5 1.1.5 1.8-1.5-1-1.5 1 .5-1.8-1.5-1.1 1.9-.2.6-1.8Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2.1 2.1M17.4 17.4l2.1 2.1M4.5 19.5l2.1-2.1M17.4 6.6l2.1-2.1"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      <span className={styles.label}>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  )
}
