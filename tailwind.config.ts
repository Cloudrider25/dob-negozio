import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        panel: "var(--panel)",
        paper: "var(--paper)",
        sand: "var(--sand)",
        stroke: "var(--stroke)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-inverse": "var(--text-inverse)",
        "accent-cyan": "var(--tech-cyan)",
        "accent-red": "var(--neon-red)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        lux: "var(--shadow-lux)",
        soft: "var(--shadow-soft)",
      },
      transitionTimingFunction: {
        lux: "var(--ease-lux)",
      },
    },
  },
  plugins: [],
}

export default config
