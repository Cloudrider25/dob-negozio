'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { GlassCard } from '@/components/service-navigator/components/GlassCard'
import styles from '@/components/service-navigator/components/TreatmentHoverCard.module.css'

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
  const [currentTreatment, setCurrentTreatment] = useState<TreatmentDetails | null>(null)
  const [cardKey, setCardKey] = useState(0)
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? 'it'
  const href = currentTreatment?.slug ? `/${locale}/services/treatment/${currentTreatment.slug}` : '#'

  useEffect(() => {
    if (treatment && !shouldSlideOut) {
      // Quando c'è un nuovo trattamento in hover, aggiorna il contenuto
      // Se cambia trattamento, incrementa la key per animare la transizione
      if (currentTreatment && currentTreatment.id !== treatment.id) {
        setCardKey((prev) => prev + 1)
      }
      setCurrentTreatment(treatment)
    }
  }, [treatment, shouldSlideOut, currentTreatment])

  useEffect(() => {
    if (shouldSlideOut && currentTreatment) {
      // Cambia la chiave immediatamente per triggerare l'exit animation
      setCardKey((prev) => prev + 1)
    }
  }, [shouldSlideOut, currentTreatment])

  const cardContent = (
    <div className={styles.wrapper}>
      <GlassCard className={`${styles.card} service-hover-card`} paddingClassName="">
        <div className={styles.glow}>
          <div className={styles.glowBlob} />
        </div>

        <div className={styles.content}>
          <div className={styles.media}>
            {currentTreatment?.imageUrl ? (
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
              <h3 className={styles.title}>{currentTreatment?.title}</h3>
              {currentTreatment?.subtitle && (
                <p className={styles.subtitle}>{currentTreatment.subtitle}</p>
              )}
            </div>
          </div>

          <div className={styles.body}>
            <p className={styles.description}>{currentTreatment?.description}</p>

            {currentTreatment?.descriptionBullets &&
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

            {currentTreatment?.features.length ? (
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

          <div className={styles.actions}>
            <Link
              href={href}
              className={`glass-pill ${styles.pill}`}
              onClick={(event) => {
                if (!currentTreatment?.slug) event.preventDefault()
              }}
            >
              Scopri di più
            </Link>
          </div>

          <div className={styles.divider} />
        </div>
      </GlassCard>
    </div>
  )

  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {currentTreatment && (
        <motion.div
          key={cardKey}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
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
