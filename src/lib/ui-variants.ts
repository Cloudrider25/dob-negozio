import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-pill border text-sm uppercase tracking-[0.14em] transition hover:-translate-y-0.5 after:absolute after:left-5 after:right-5 after:bottom-2 after:h-[2px] after:bg-[var(--ui-accent)] after:opacity-0 after:transition",
  {
    variants: {
      variant: {
        primary:
          "border-stroke bg-transparent text-text-primary hover:shadow-soft hover:after:opacity-100",
        outline:
          "border-stroke bg-transparent text-text-primary hover:after:opacity-100",
        secondary: "border-stroke text-text-primary",
        ghost: "border-transparent text-text-primary hover:after:opacity-100",
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
  "relative rounded-[20px] overflow-hidden border border-stroke bg-paper shadow-soft",
  {
    variants: {
      variant: {
        paper: "bg-paper",
        pearl:
          "bg-[var(--pearl-grad)] border-stroke shadow-lux before:pointer-events-none before:absolute before:inset-0 before:bg-[var(--pearl-highlight)] before:opacity-100 before:content-[''] before:mix-blend-screen",
        glass: "bg-panel/70 border-stroke backdrop-blur",
        solid: "bg-panel border-stroke",
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
  "relative inline-flex items-center rounded-pill border px-4 py-2 text-xs uppercase tracking-[0.2em] after:absolute after:left-3 after:right-3 after:bottom-1 after:h-[2px] after:bg-[var(--ui-accent)] after:opacity-0 after:transition",
  {
    variants: {
      state: {
        default:
          "border-stroke bg-paper text-text-secondary",
        active:
          "border-stroke bg-paper text-text-primary after:opacity-100",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
)
