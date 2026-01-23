import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        ivory: "var(--ivory)",
        paper: "var(--paper)",
        sand: "var(--sand)",
        gold: "var(--gold)",
        tech: "var(--tech-blue)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        lux: "var(--shadow-lux)",
      },
      transitionTimingFunction: {
        lux: "var(--ease-lux)",
      },
    },
  },
  plugins: [],
}

export default config
