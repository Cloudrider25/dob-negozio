'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styles from './TreatmentHoverCard.module.css'

export interface TreatmentDetails {
  id: string
  title: string
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
  const [isOpen, setIsOpen] = useState(false)

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
    <div className={styles.cardWrap}>
      <div className={styles.cardShell}>
        <div className={styles.glow}>
          <div className={styles.glowSpot} />
        </div>

        <div className={styles.body}>
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

            <div className={styles.mediaContent}>
              <h3 className={styles.mediaTitle}>{currentTreatment?.title}</h3>
              {currentTreatment?.subtitle && (
                <p className={styles.mediaSubtitle}>{currentTreatment.subtitle}</p>
              )}
            </div>
          </div>

          <div className={styles.textArea}>
            <p className={styles.description}>{currentTreatment?.description}</p>

            {currentTreatment?.descriptionBullets &&
              currentTreatment.descriptionBullets.length > 0 && (
                <div className={styles.bullets}>
                  {currentTreatment.descriptionBullets.map((bullet, index) => (
                    <div key={index} className={styles.bulletItem}>
                      <div className={styles.bulletDot} />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              )}

            {currentTreatment?.features.length ? (
              <div className={styles.bullets}>
                {currentTreatment.features.map((feature, index) => (
                  <div key={index} className={styles.bulletItem}>
                    <div className={styles.bulletDot} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.bottomLine} />
        </div>
      </div>
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

      {isOpen && currentTreatment && (
        <motion.div
          key="treatment-modal"
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
