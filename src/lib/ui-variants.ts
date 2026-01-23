import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-pill border text-sm uppercase tracking-[0.14em] transition hover:-translate-y-0.5 after:absolute after:left-5 after:right-5 after:bottom-2 after:h-[2px] after:bg-[var(--neon-red)] after:opacity-0 after:transition",
  {
    variants: {
      variant: {
        primary:
          "border-[color:var(--stroke)] bg-transparent text-[color:var(--text-primary)] hover:shadow-[0_0_18px_rgba(255,45,45,0.18)] hover:after:opacity-100",
        outline:
          "border-[color:var(--stroke)] bg-transparent text-[color:var(--text-primary)] hover:after:opacity-100",
        secondary: "border-[color:var(--stroke)] text-[color:var(--text-primary)]",
        ghost: "border-transparent text-[color:var(--text-primary)] hover:after:opacity-100",
      },
      size: {
        sm: "h-10 px-4",
        md: "h-11 px-6",
        lg: "h-14 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export const cardVariants = cva(
  "relative rounded-[20px] overflow-hidden border bg-[var(--pearl-1)] shadow-[0_18px_60px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        paper: "bg-paper border-[rgba(0,0,0,0.06)]",
        pearl:
          "bg-[var(--pearl-grad)] border-[rgba(0,0,0,0.12)] shadow-[0_22px_90px_rgba(0,0,0,0.18)] before:pointer-events-none before:absolute before:inset-0 before:bg-[var(--pearl-highlight)] before:opacity-100 before:content-[''] before:mix-blend-screen",
        glass: "bg-panel/70 border-[rgba(255,255,255,0.1)] backdrop-blur",
        solid: "bg-panel border-[rgba(255,255,255,0.1)]",
      },
      padding: {
        sm: "p-6",
        md: "p-8",
      },
    },
    defaultVariants: {
      variant: "paper",
      padding: "md",
    },
  },
)

export const tabsVariants = cva(
  "relative inline-flex items-center rounded-pill border px-4 py-2 text-xs uppercase tracking-[0.2em] after:absolute after:left-3 after:right-3 after:bottom-1 after:h-[2px] after:bg-[var(--neon-red)] after:opacity-0 after:transition",
  {
    variants: {
      state: {
        default:
          "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[color:var(--text-secondary)]",
        active:
          "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[color:var(--text-primary)] after:opacity-100",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
)
