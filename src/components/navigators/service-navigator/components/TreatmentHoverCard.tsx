'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { HoverCardBase } from '@/components/navigators/core/HoverCardBase'
import styles from '@/components/navigators/service-navigator/components/TreatmentHoverCard.module.css'

export interface TreatmentDetails {
  id: string
  title: string
  slug?: string
  subtitle?: string
  description: string
  imageUrl?: string
  features: string[]
  descriptionBullets?: string[]
}

interface TreatmentHoverCardProps {
  treatment: TreatmentDetails | null
  shouldSlideOut?: boolean
  onAnimationComplete?: () => void
}

export function TreatmentHoverCard({
  treatment,
  shouldSlideOut = false,
  onAnimationComplete,
}: TreatmentHoverCardProps) {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? 'it'

  return (
    <HoverCardBase
      item={treatment}
      shouldSlideOut={shouldSlideOut}
      onAnimationComplete={onAnimationComplete}
      classNames={{
        wrapper: styles.wrapper,
        card: styles.card,
        actions: styles.actions,
        pill: styles.pill,
        divider: styles.divider,
      }}
      href={(currentTreatment) =>
        currentTreatment.slug ? `/${locale}/services/treatment/${currentTreatment.slug}` : '#'
      }
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ x: 600, opacity: 0 }}
    >
      {(currentTreatment) => {
        return (
          <>
            <div className={styles.glow}>
              <div className={styles.glowBlob} />
            </div>

            <div className={styles.content}>
              <div className={styles.media}>
                {currentTreatment.imageUrl ? (
                  <Image
                    src={currentTreatment.imageUrl}
                    alt={currentTreatment.title}
                    fill
                    className={styles.mediaImage}
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                ) : (
                  <div className={styles.mediaFallback} />
                )}
                <div className={styles.mediaOverlay} />

                <div className={styles.mediaText}>
                  <h3 className={styles.title}>{currentTreatment.title}</h3>
                  {currentTreatment.subtitle && (
                    <p className={styles.subtitle}>{currentTreatment.subtitle}</p>
                  )}
                </div>
              </div>

              <div className={styles.body}>
                <p className={styles.description}>{currentTreatment.description}</p>

                {currentTreatment.descriptionBullets &&
                  currentTreatment.descriptionBullets.length > 0 && (
                    <div className={styles.bulletList}>
                      {currentTreatment.descriptionBullets.map((bullet, index) => (
                        <div key={index} className={styles.bulletItem}>
                          <div className={styles.bulletDot} />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}

                {currentTreatment.features.length ? (
                  <div className={styles.featureList}>
                    {currentTreatment.features.map((feature, index) => (
                      <div key={index} className={styles.bulletItem}>
                        <div className={styles.bulletDot} />
                        <span>{feature}</span>
                      </div>
                    ))}
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
