"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/cn"
import { Moon, Sun } from "@/components/ui/icons"
import { LabelText } from "@/components/ui/label"
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
        {theme === "dark" ? <Moon /> : <Sun />}
      </span>
      <LabelText className={styles.label} variant="section">
        {theme === "dark" ? "Dark Mode" : "Light Mode"}
      </LabelText>
    </button>
  )
}
