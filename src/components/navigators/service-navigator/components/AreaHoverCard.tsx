'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'

import type { Area } from '@/components/navigators/service-navigator/types/navigator'
import { HoverCardBase } from '@/components/navigators/core/HoverCardBase'
import styles from '@/components/navigators/service-navigator/components/AreaHoverCard.module.css'

export interface AreaDetails {
  id: Area
  title: string
  slug?: string
  subtitle?: string
  description?: string
  imageUrl?: string
  features?: string[]
}

interface AreaHoverCardProps {
  area: AreaDetails | null
  shouldSlideOut?: boolean
  onAnimationComplete?: () => void
}

export function AreaHoverCard({
  area,
  shouldSlideOut = false,
  onAnimationComplete,
}: AreaHoverCardProps) {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? 'it'

  return (
    <HoverCardBase
      item={area}
      shouldSlideOut={shouldSlideOut}
      onAnimationComplete={onAnimationComplete}
      classNames={{
        wrapper: styles.wrapper,
        card: styles.card,
        actions: styles.actions,
        pill: styles.pill,
        divider: styles.divider,
      }}
      href={(currentArea) => (currentArea.slug ? `/${locale}/services/area/${currentArea.slug}` : '#')}
    >
      {(currentArea) => {
        return (
          <>
            <div className={styles.glow}>
              <div className={styles.glowBlob} />
            </div>

            <div className={styles.content}>
              <div className={styles.media}>
                {currentArea.imageUrl && (
                  <Image
                    src={currentArea.imageUrl}
                    alt={currentArea.title}
                    fill
                    className={styles.mediaImage}
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                )}
                <div className={styles.mediaOverlay} />

                <div className={styles.mediaText}>
                  <h3 className={styles.title}>{currentArea.title}</h3>
                  {currentArea.subtitle && <p className={styles.subtitle}>{currentArea.subtitle}</p>}
                </div>
              </div>

              <div className={styles.body}>
                {currentArea.description && <p className={styles.description}>{currentArea.description}</p>}

                {currentArea.features && currentArea.features.length > 0 && (
                  <div className={styles.featureList}>
                    {currentArea.features.map((feature, index) => (
                      <div key={index} className={styles.featureItem}>
                        <div className={styles.featureDot} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )
      }}
    </HoverCardBase>
  )
}
