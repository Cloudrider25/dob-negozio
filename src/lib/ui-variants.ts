import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-pill border text-sm uppercase tracking-[0.14em] transition-colors duration-200 hover:bg-[var(--btn-hover-bg)] hover:text-[color:var(--btn-hover-text)] hover:border-[color:var(--btn-hover-border)] active:bg-[var(--btn-active-bg)] active:text-[color:var(--btn-active-text)] active:border-[color:var(--btn-active-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--btn-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--btn-focus-offset)] disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      kind: {
        main: "bg-[var(--btn-bg)] text-[color:var(--btn-text)] border-[color:var(--btn-border)]",
        card: "bg-[var(--btn-bg)] text-[color:var(--btn-text)] border-[color:var(--btn-border)]",
        hero: "bg-[var(--btn-bg)] text-[color:var(--btn-text)] border-[color:var(--btn-border)]",
      },
      size: {
        sm: "h-10 px-4",
        md: "h-11 px-6",
        lg: "h-14 px-6",
      },
    },
    defaultVariants: {
      kind: "main",
      size: "md",
    },
  },
)
