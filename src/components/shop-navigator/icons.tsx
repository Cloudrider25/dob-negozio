'use client'

import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

const IconBase = ({ size = 24, children, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
)

export const ChevronLeft = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M15 18l-6-6 6-6" />
  </IconBase>
)

export const ChevronRight = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M9 18l6-6-6-6" />
  </IconBase>
)

export const X = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </IconBase>
)

export const Plus = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </IconBase>
)

export const Minus = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M5 12h14" />
  </IconBase>
)

export const ShoppingBag = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </IconBase>
)

export const Trash = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
  </IconBase>
)

export const Sparkles = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 3l1.2 3.2L16 7.5l-2.8 1.3L12 12l-1.2-3.2L8 7.5l2.8-1.3L12 3Z" />
    <path d="M19 12l0.8 2 2 0.8-2 0.8-0.8 2-0.8-2-2-0.8 2-0.8 0.8-2Z" />
    <path d="M4 14l0.7 1.7 1.7 0.7-1.7 0.7L4 19l-0.7-1.7-1.7-0.7 1.7-0.7L4 14Z" />
  </IconBase>
)

export const Target = (props: IconProps) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </IconBase>
)
