'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type TransitionState = {
  x?: number
  opacity?: number
}

type HoverCardTransitionProps<T extends { id: string | number }> = {
  value: T | null
  shouldSlideOut?: boolean
  onAnimationComplete?: () => void
  className?: string
  initial?: TransitionState
  animate?: TransitionState
  exit?: TransitionState
  children: (current: T) => ReactNode
}

export function HoverCardTransition<T extends { id: string | number }>({
  value,
  shouldSlideOut = false,
  onAnimationComplete,
  className,
  initial = { x: 0, opacity: 1 },
  animate = { x: 0, opacity: 1 },
  exit = { x: 600, opacity: 0 },
  children,
}: HoverCardTransitionProps<T>) {
  const [current, setCurrent] = useState<T | null>(null)
  const [cardKey, setCardKey] = useState(0)

  useEffect(() => {
    if (value && !shouldSlideOut) {
      if (current && current.id !== value.id) {
        setCardKey((prev) => prev + 1)
      }
      setCurrent(value)
    }
  }, [value, shouldSlideOut, current])

  useEffect(() => {
    if (shouldSlideOut && current) {
      setCardKey((prev) => prev + 1)
    }
  }, [shouldSlideOut, current])

  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {current && (
        <motion.div
          key={cardKey}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          onAnimationComplete={(definition: unknown) => {
            if (
              onAnimationComplete &&
              definition &&
              typeof definition === 'object' &&
              'opacity' in definition &&
              (definition as { opacity?: number }).opacity === 0
            ) {
              onAnimationComplete()
            }
          }}
          className={className}
        >
          {children(current)}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
