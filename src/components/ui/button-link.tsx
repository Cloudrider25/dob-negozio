"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import type { AnchorHTMLAttributes } from "react"
import type { MouseEvent as ReactMouseEvent } from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/cn"
import { buttonVariants } from "@/lib/ui-variants"
import { getInteractivePalette, resolveButtonKind } from "@/components/ui/button-theme"

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
  ...props
}: ButtonLinkProps) => {
  const [phase, setPhase] = useState<"idle" | "enter" | "exit">("idle")
  const [direction, setDirection] = useState<Direction>("left")
  const resolvedKind = resolveButtonKind(kind)
  const isActive = interactive && phase === "enter"
  const interactivePalette = getInteractivePalette(resolvedKind)
  const classes = cn(buttonVariants({ kind: resolvedKind, size }), interactive && "overflow-hidden isolate", className)
  const overlay = interactive ? (
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
    />
  ) : null
  const motionHandlers = {
    onMouseEnter: (event: ReactMouseEvent<HTMLElement>) => {
      if (!interactive) return
      setDirection(getDirectionFromEvent(event))
      setPhase("enter")
    },
    onMouseLeave: (event: ReactMouseEvent<HTMLElement>) => {
      if (!interactive) return
      setDirection(getDirectionFromEvent(event))
      setPhase("exit")
    },
  }

  if (external) {
    return (
      <a
        className={classes}
        href={href}
        style={
          isActive
            ? {
                color: interactivePalette.text,
              }
            : undefined
        }
        {...motionHandlers}
        {...props}
      >
        <span className={cn(interactive && "relative z-[1]")}>{children}</span>
        {overlay}
      </a>
    )
  }

  return (
    <Link
      className={classes}
      href={href}
      style={
        isActive
          ? {
              color: interactivePalette.text,
            }
          : undefined
      }
      {...motionHandlers}
      {...props}
    >
      <span className={cn(interactive && "relative z-[1]")}>{children}</span>
      {overlay}
    </Link>
  )
}
