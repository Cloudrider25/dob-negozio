'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import type { Area } from '@/components/service-navigator/types/navigator'
import { GlassCard } from '@/components/service-navigator/components/GlassCard'
import styles from '@/components/service-navigator/components/AreaHoverCard.module.css'

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
  const [currentArea, setCurrentArea] = useState<AreaDetails | null>(null)
  const [cardKey, setCardKey] = useState(0)
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? 'it'
  const href = currentArea?.slug ? `/${locale}/services/area/${currentArea.slug}` : '#'

  useEffect(() => {
    if (area && !shouldSlideOut) {
      // Quando c'è una nuova area in hover, aggiorna il contenuto
      // Se cambia area, incrementa la key per animare la transizione
      if (currentArea && currentArea.id !== area.id) {
        setCardKey((prev) => prev + 1)
      }
      setCurrentArea(area)
    }
  }, [area, shouldSlideOut, currentArea])

  useEffect(() => {
    if (shouldSlideOut && currentArea) {
      // Cambia la chiave immediatamente per triggerare l'exit animation
      setCardKey((prev) => prev + 1)
    }
  }, [shouldSlideOut, currentArea])

  const cardContent = (
    <GlassCard
      className={`${styles.card} service-hover-card`}
      paddingClassName=""
    >
      <div className={styles.glow}>
        <div className={styles.glowBlob} />
      </div>

      <div className={styles.content}>
        <div className={styles.media}>
          {currentArea?.imageUrl && (
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
            <h3 className={styles.title}>{currentArea?.title}</h3>
            {currentArea?.subtitle && (
              <p className={styles.subtitle}>{currentArea.subtitle}</p>
            )}
          </div>
        </div>

        <div className={styles.body}>
          {currentArea?.description && (
            <p className={styles.description}>{currentArea.description}</p>
          )}

          {currentArea?.features && currentArea.features.length > 0 && (
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

        <div className={styles.actions}>
          <Link
            href={href}
            className={`glass-pill ${styles.pill}`}
            onClick={(event) => {
              if (!currentArea?.slug) event.preventDefault()
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
      {currentArea && (
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
