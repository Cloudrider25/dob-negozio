"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import type { AnchorHTMLAttributes } from "react"
import type { CSSProperties } from "react"
import type { MouseEvent as ReactMouseEvent } from "react"
import type { VariantProps } from "class-variance-authority"
import { useReducedMotion } from "framer-motion"

import { cn } from "@/lib/cn"
import { buttonVariants } from "@/lib/ui-variants"
import {
  getButtonBasePalette,
  getButtonStatePalette,
  getInteractivePalette,
  resolveButtonKind,
} from "@/components/ui/button-theme"

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof buttonVariants> & {
    href: string
    external?: boolean
    interactive?: boolean
  }

type Direction = "left" | "right" | "top" | "bottom"

const getDirectionFromEvent = (
  event: ReactMouseEvent<HTMLElement>,
): Direction => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const distances = {
    left: x,
    right: rect.width - x,
    top: y,
    bottom: rect.height - y,
  }

  return (Object.keys(distances) as Direction[]).reduce((closest, side) =>
    distances[side] < distances[closest] ? side : closest,
  "left")
}

const enterVariantByDirection: Record<Direction, { x?: string; y?: string }> = {
  left: { x: "-110%", y: "0%" },
  right: { x: "110%", y: "0%" },
  top: { x: "0%", y: "-110%" },
  bottom: { x: "0%", y: "110%" },
}

export const ButtonLink = ({
  className,
  kind,
  size,
  href,
  external,
  interactive = false,
  children,
  style,
  ...props
}: ButtonLinkProps) => {
  const [phase, setPhase] = useState<"idle" | "enter" | "exit">("idle")
  const [direction, setDirection] = useState<Direction>("left")
  const prefersReducedMotion = useReducedMotion()
  const motionEnabled = interactive && !prefersReducedMotion
  const resolvedKind = resolveButtonKind(kind)
  const hasOverlay = motionEnabled && (phase === "enter" || phase === "exit")
  const basePalette = getButtonBasePalette(resolvedKind)
  const statePalette = getButtonStatePalette(resolvedKind)
  const interactivePalette = getInteractivePalette(resolvedKind)
  const classes = cn(buttonVariants({ kind: resolvedKind, size }), motionEnabled && "overflow-hidden isolate", className)
  const buttonStyle: CSSProperties = {
    "--btn-bg": basePalette.bg,
    "--btn-text": hasOverlay ? interactivePalette.text : basePalette.text,
    "--btn-border": basePalette.border,
    "--btn-hover-bg": statePalette.hoverBg,
    "--btn-hover-text": statePalette.hoverText,
    "--btn-hover-border": statePalette.hoverBorder,
    "--btn-active-bg": statePalette.activeBg,
    "--btn-active-text": statePalette.activeText,
    "--btn-active-border": statePalette.activeBorder,
    "--btn-focus-ring": statePalette.focusRing,
    "--btn-focus-offset": statePalette.focusOffset,
    ...(style ?? {}),
  } as CSSProperties
  const overlay = motionEnabled ? (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{ background: interactivePalette.overlay }}
      animate={{
        ...(phase === "enter"
          ? { x: "0%", y: "0%", opacity: 1 }
          : phase === "exit"
            ? { ...enterVariantByDirection[direction], opacity: 0 }
            : { ...enterVariantByDirection[direction], opacity: 0 }),
      }}
      initial={enterVariantByDirection[direction]}
      transition={{ duration: 0.26, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (phase === "exit") setPhase("idle")
      }}
    />
  ) : null
  const motionHandlers = {
    onMouseEnter: (event: ReactMouseEvent<HTMLElement>) => {
      if (!motionEnabled) return
      setDirection(getDirectionFromEvent(event))
      setPhase("enter")
    },
    onMouseLeave: (event: ReactMouseEvent<HTMLElement>) => {
      if (!motionEnabled) return
      setDirection(getDirectionFromEvent(event))
      setPhase("exit")
    },
  }

  if (external) {
    return (
      <a
        className={classes}
        href={href}
        style={buttonStyle}
        {...motionHandlers}
        {...props}
      >
        <span className={cn(motionEnabled && "relative z-[1]")}>{children}</span>
        {overlay}
      </a>
    )
  }

  return (
    <Link
      className={classes}
      href={href}
      style={buttonStyle}
      {...motionHandlers}
      {...props}
    >
      <span className={cn(motionEnabled && "relative z-[1]")}>{children}</span>
      {overlay}
    </Link>
  )
}
