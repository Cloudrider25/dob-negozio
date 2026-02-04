'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import type { NeedId } from '@/components/shop-navigator/types/navigator'
import styles from './HoverCard.module.css'

export interface NeedCardDetails {
  id: NeedId
  title: string
  tagline?: string
  description?: string
  imageUrl?: string
}

interface NeedHoverCardProps {
  need: NeedCardDetails | null
  shouldSlideOut?: boolean
  onAnimationComplete?: () => void
}

export function NeedsHoverCard({
  need,
  shouldSlideOut = false,
  onAnimationComplete,
}: NeedHoverCardProps) {
  const [currentNeed, setCurrentNeed] = useState<NeedCardDetails | null>(null)
  const [cardKey, setCardKey] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (need && !shouldSlideOut) {
      if (currentNeed && currentNeed.id !== need.id) {
        setCardKey((prev) => prev + 1)
      }
      setCurrentNeed(need)
    }
  }, [need, shouldSlideOut, currentNeed])

  useEffect(() => {
    if (shouldSlideOut && currentNeed) {
      setCardKey((prev) => prev + 1)
    }
  }, [shouldSlideOut, currentNeed])

  const cardContent = (
    <div className={styles.cardWrap}>
      <div className={styles.cardShell}>
        <div className={styles.glow}>
          <div className={styles.glowSpot} />
        </div>

        <div className={styles.body}>
          <div className={styles.media}>
            {currentNeed?.imageUrl && (
              <Image
                src={currentNeed.imageUrl}
                alt={currentNeed.title}
                fill
                className={styles.mediaImage}
                sizes="(max-width: 1024px) 100vw, 320px"
              />
            )}
            <div className={styles.mediaOverlay} />

            <div className={styles.mediaContent}>
              <h3 className={styles.mediaTitle}>{currentNeed?.title}</h3>
              {currentNeed?.tagline && (
                <p className={styles.mediaTagline}>{currentNeed.tagline}</p>
              )}
            </div>
          </div>

          <div className={styles.textArea}>
            {currentNeed?.description && (
              <p className={styles.description}>{currentNeed.description}</p>
            )}
          </div>

          <div className={styles.bottomLine} />
        </div>
      </div>
    </div>
  )

  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {currentNeed && (
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
          className={styles.motionWrap}
        >
          <button
            type="button"
            className={styles.cardButton}
            onClick={() => setIsOpen(true)}
          >
            {cardContent}
          </button>
        </motion.div>
      )}

      {isOpen && currentNeed && (
        <motion.div
          key="area-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.modal}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={styles.modalPanel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
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
