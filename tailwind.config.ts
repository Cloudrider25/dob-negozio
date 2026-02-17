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
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      fontSize: {
        display: [
          "var(--type-display-size)",
          {
            lineHeight: "var(--type-display-line)",
            letterSpacing: "var(--type-display-track)",
            fontWeight: "400",
          },
        ],
        h1: [
          "var(--type-h1-size)",
          {
            lineHeight: "var(--type-h1-line)",
            letterSpacing: "var(--type-h1-track)",
            fontWeight: "400",
          },
        ],
        h2: [
          "var(--type-h2-size)",
          {
            lineHeight: "var(--type-h2-line)",
            letterSpacing: "var(--type-h2-track)",
            fontWeight: "400",
          },
        ],
        h3: [
          "var(--type-h3-size)",
          {
            lineHeight: "var(--type-h3-line)",
            letterSpacing: "var(--type-h3-track)",
            fontWeight: "400",
          },
        ],
        "body-lg": [
          "var(--type-body-lg-size)",
          {
            lineHeight: "var(--type-body-lg-line)",
            letterSpacing: "var(--type-body-track)",
            fontWeight: "400",
          },
        ],
        body: [
          "var(--type-body-size)",
          {
            lineHeight: "var(--type-body-line)",
            letterSpacing: "var(--type-body-track)",
            fontWeight: "400",
          },
        ],
        small: [
          "var(--type-small-size)",
          {
            lineHeight: "var(--type-small-line)",
            letterSpacing: "var(--type-small-track)",
            fontWeight: "400",
          },
        ],
        caption: [
          "var(--type-caption-size)",
          {
            lineHeight: "var(--type-caption-line)",
            letterSpacing: "var(--type-caption-track)",
            fontWeight: "400",
          },
        ],
      },
    },
  },
  plugins: [],
}

export default config
