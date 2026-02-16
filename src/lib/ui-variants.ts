import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-pill border text-sm uppercase tracking-[0.14em] transition-colors duration-200",
  {
    variants: {
      kind: {
        main: "bg-transparent border-current text-text-primary",
        card: "bg-[var(--page-bg)] border-transparent text-text-primary",
        hero:
          "bg-transparent text-text-inverse border-[color:color-mix(in_srgb,var(--text-inverse)_55%,transparent)]",
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
