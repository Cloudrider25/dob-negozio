'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styles from './HoverCard.module.css'

export interface CategoryCardDetails {
  id: string
  title: string
  tagline?: string
  description?: string
  imageUrl?: string
}

interface CategoryHoverCardProps {
  item: CategoryCardDetails | null
  shouldSlideOut?: boolean
  onAnimationComplete?: () => void
}

export function CategoryHoverCard({
  item,
  shouldSlideOut = false,
  onAnimationComplete,
}: CategoryHoverCardProps) {
  const [currentItem, setCurrentItem] = useState<CategoryCardDetails | null>(null)
  const [cardKey, setCardKey] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (item && !shouldSlideOut) {
      if (currentItem && currentItem.id !== item.id) {
        setCardKey((prev) => prev + 1)
      }
      setCurrentItem(item)
    }
  }, [item, shouldSlideOut, currentItem])

  useEffect(() => {
    if (shouldSlideOut && currentItem) {
      setCardKey((prev) => prev + 1)
    }
  }, [shouldSlideOut, currentItem])

  const cardContent = (
    <div className={styles.cardWrap}>
      <div className={styles.cardShell}>
        <div className={styles.glow}>
          <div className={styles.glowSpot} />
        </div>

        <div className={styles.body}>
          <div className={styles.media}>
            {currentItem?.imageUrl && (
              <Image
                src={currentItem.imageUrl}
                alt={currentItem.title}
                fill
                className={styles.mediaImage}
                sizes="(max-width: 1024px) 100vw, 320px"
              />
            )}
            <div className={styles.mediaOverlay} />

            <div className={styles.mediaContent}>
              <h3 className={styles.mediaTitle}>{currentItem?.title}</h3>
              {currentItem?.tagline && (
                <p className={styles.mediaTagline}>{currentItem.tagline}</p>
              )}
            </div>
          </div>

          <div className={styles.textArea}>
            {currentItem?.description && (
              <p className={styles.description}>{currentItem.description}</p>
            )}
          </div>

          <div className={styles.bottomLine} />
        </div>
      </div>
    </div>
  )

  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {currentItem && (
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

      {isOpen && currentItem && (
        <motion.div
          key="item-modal"
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
