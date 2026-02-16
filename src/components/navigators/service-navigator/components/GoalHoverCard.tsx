'use client'

import { useParams } from 'next/navigation'
import { Flag } from '@/components/ui/icons'
import { HoverCardBase } from '@/components/navigators/core/HoverCardBase'
import type { Goal } from '@/components/navigators/service-navigator/types/navigator'
import styles from '@/components/navigators/service-navigator/components/GoalHoverCard.module.css'

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
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? 'it'

  return (
    <HoverCardBase
      item={goal}
      shouldSlideOut={shouldSlideOut}
      onAnimationComplete={onAnimationComplete}
      classNames={{
        wrapper: styles.wrapper,
        card: styles.card,
        actions: styles.actions,
        pill: styles.pill,
        divider: styles.divider,
      }}
      href={(currentGoal) => (currentGoal.slug ? `/${locale}/services/goal/${currentGoal.slug}` : '#')}
    >
      {(currentGoal) => {
        return (
          <>
            <div className={styles.gradient} />

            <div className={styles.glow}>
              <div className={styles.glowTop} />
              <div className={styles.glowBottom} />
            </div>

            <div className={styles.content}>
              <div className={styles.header}>
                <div className={styles.iconWrap}>
                  <Flag className={styles.icon} />
                </div>

                <h3 className={styles.title}>{currentGoal.title}</h3>
                {currentGoal.subtitle && <p className={styles.subtitle}>{currentGoal.subtitle}</p>}

                <div className={styles.headerDivider} />
              </div>

              <div className={styles.body}>
                {currentGoal.description && <p className={styles.description}>{currentGoal.description}</p>}

                {currentGoal.benefits.length ? (
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

            </div>
          </>
        )
      }}
    </HoverCardBase>
  )
}
