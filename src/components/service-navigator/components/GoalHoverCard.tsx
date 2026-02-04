'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Target } from '@/components/service-navigator/icons'
import { GlassCard } from '@/components/service-navigator/components/GlassCard'
import type { Goal } from '@/components/service-navigator/types/navigator'
import styles from '@/components/service-navigator/components/GoalHoverCard.module.css'

export interface GoalDetails {
  id: Goal
  title: string
  slug?: string
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
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? 'it'
  const href = currentGoal?.slug ? `/${locale}/services/goal/${currentGoal.slug}` : '#'

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
    <GlassCard
      className={`${styles.card} service-hover-card`}
      paddingClassName=""
    >
      <div className={styles.gradient} />

      <div className={styles.glow}>
        <div className={styles.glowTop} />
        <div className={styles.glowBottom} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Target className={styles.icon} />
          </div>

          <h3 className={styles.title}>{currentGoal?.title}</h3>
          {currentGoal?.subtitle && (
            <p className={styles.subtitle}>{currentGoal.subtitle}</p>
          )}

          <div className={styles.headerDivider} />
        </div>

        <div className={styles.body}>
          {currentGoal?.description && (
            <p className={styles.description}>{currentGoal.description}</p>
          )}

          {currentGoal?.benefits.length ? (
            <div>
              <h4 className={styles.benefitsTitle}>Benefici</h4>
              <div className={styles.benefitsList}>
                {currentGoal.benefits.map((benefit, index) => (
                  <div key={index} className={styles.benefitItem}>
                    <div className={styles.benefitDot} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.actions}>
          <Link
            href={href}
            className={`glass-pill ${styles.pill}`}
            onClick={(event) => {
              if (!currentGoal?.slug) event.preventDefault()
            }}
          >
            Scopri di più
          </Link>
        </div>

        <div className={styles.divider} />
      </div>
    </GlassCard>
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
          className={styles.wrapper}
        >
          {cardContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
