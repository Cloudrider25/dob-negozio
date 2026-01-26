'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { Target } from '@/components/service-navigator/icons'
import type { Goal } from '@/components/service-navigator/types/navigator'

export interface GoalDetails {
  id: Goal
  title: string
  subtitle?: string
  description?: string
  benefits: string[]
  icon?: string
}

interface GoalHoverCardProps {
  goal: GoalDetails | null
  shouldSlideOut?: boolean
  onAnimationComplete?: () => void
}

export function GoalHoverCard({
  goal,
  shouldSlideOut = false,
  onAnimationComplete,
}: GoalHoverCardProps) {
  const [currentGoal, setCurrentGoal] = useState<GoalDetails | null>(null)
  const [cardKey, setCardKey] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (goal && !shouldSlideOut) {
      if (currentGoal && currentGoal.id !== goal.id) {
        setCardKey((prev) => prev + 1)
      }
      setCurrentGoal(goal)
    }
  }, [goal, shouldSlideOut, currentGoal])

  useEffect(() => {
    if (shouldSlideOut && currentGoal) {
      setCardKey((prev) => prev + 1)
    }
  }, [shouldSlideOut, currentGoal])

  const cardContent = (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-stroke">
      <div className="absolute inset-0 bg-gradient-to-br from-[color:color-mix(in_srgb,var(--tech-cyan)_5%,transparent)] via-transparent to-[color:color-mix(in_srgb,var(--tech-cyan)_5%,transparent)] pointer-events-none" />

      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[color:color-mix(in_srgb,var(--tech-cyan)_20%,transparent)] blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[color:color-mix(in_srgb,var(--tech-cyan)_10%,transparent)] blur-3xl rounded-full" />
      </div>

      <div className="relative h-full flex flex-col">
        <div className="relative px-6 pt-8 pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[color:color-mix(in_srgb,var(--tech-cyan)_20%,transparent)] to-[color:color-mix(in_srgb,var(--tech-cyan)_35%,transparent)] border border-[color:color-mix(in_srgb,var(--tech-cyan)_30%,transparent)] mb-4">
            <Target className="w-8 h-8 text-accent-cyan" />
          </div>

          <h3 className="text-xl font-semibold text-text-primary mb-1">
            {currentGoal?.title}
          </h3>
          {currentGoal?.subtitle && (
            <p className="text-sm text-accent-cyan">{currentGoal.subtitle}</p>
          )}

          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--tech-cyan)_30%,transparent)] to-transparent" />
        </div>

        <div className="flex-1 px-6 py-4 flex flex-col gap-4">
          {currentGoal?.description && (
            <p className="text-sm text-text-muted leading-relaxed">
              {currentGoal.description}
            </p>
          )}

          {currentGoal?.benefits.length ? (
            <div>
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                Benefici
              </h4>
              <div className="space-y-2">
                {currentGoal.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 text-sm text-text-muted"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[color:color-mix(in_srgb,var(--tech-cyan)_70%,transparent)] mt-1.5 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--tech-cyan)_20%,transparent)] to-transparent" />
      </div>
    </div>
  )

  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {currentGoal && (
        <motion.div
          key={cardKey}
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 600, opacity: 0 }}
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
          className="relative w-full h-full"
        >
          <button
            type="button"
            className="w-full h-full text-left"
            onClick={() => setIsOpen(true)}
          >
            {cardContent}
          </button>
        </motion.div>
      )}

      {isOpen && currentGoal && (
        <motion.div
          key="goal-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--obsidian)_70%,transparent)] backdrop-blur"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-[90vw] max-w-3xl h-[80vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 text-sm uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary"
            >
              Chiudi
            </button>
            {cardContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
