'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

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
    <div className="relative w-full h-full">
      {/* Card container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden border border-stroke">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Image section */}
          <div className="relative h-72 overflow-hidden">
            {currentTreatment?.imageUrl ? (
              <Image
                src={currentTreatment.imageUrl}
                alt={currentTreatment.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 320px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[color:color-mix(in_srgb,var(--tech-cyan)_35%,transparent)] via-[color:color-mix(in_srgb,var(--obsidian)_70%,transparent)] to-[color:color-mix(in_srgb,var(--obsidian)_80%,transparent)]" />
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color:color-mix(in_srgb,var(--obsidian)_20%,transparent)] to-[color:color-mix(in_srgb,var(--obsidian)_80%,transparent)]" />

            {/* Title on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-0.5">
                {currentTreatment?.title}
              </h3>
              {currentTreatment?.subtitle && (
                <p className="text-sm text-accent-cyan">{currentTreatment.subtitle}</p>
              )}
            </div>
          </div>

          {/* Description section */}
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
            <p className="text-sm text-text-muted leading-relaxed line-clamp-5">
              {currentTreatment?.description}
            </p>

            {currentTreatment?.descriptionBullets &&
              currentTreatment.descriptionBullets.length > 0 && (
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {currentTreatment.descriptionBullets.map((bullet, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-xs text-text-muted"
                    >
                      <div className="w-1 h-1 rounded-full bg-[color:color-mix(in_srgb,var(--tech-cyan)_60%,transparent)] mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              )}

            {/* Features list */}
            {currentTreatment?.features.length ? (
              <div className="space-y-1.5">
                {currentTreatment.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-text-muted">
                    <div className="w-1 h-1 rounded-full bg-[color:color-mix(in_srgb,var(--tech-cyan)_60%,transparent)] mt-1.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Subtle bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--tech-cyan)_20%,transparent)] to-transparent" />
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

      {isOpen && currentTreatment && (
        <motion.div
          key="treatment-modal"
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
