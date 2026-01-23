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
      <div className="relative w-full h-full rounded-xl overflow-hidden sn-card-shell backdrop-blur-xl border border-white/10">
        {/* Background gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-red-500/5 pointer-events-none" />

        {/* Subtle glow effect */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
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
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-black/70 to-red-900/40" />
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />

            {/* Title on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-semibold text-white mb-0.5">
                {currentTreatment?.title}
              </h3>
              {currentTreatment?.subtitle && (
                <p className="text-sm text-cyan-400">{currentTreatment.subtitle}</p>
              )}
            </div>
          </div>

          {/* Description section */}
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
            <p
              className="text-sm text-white/70 leading-relaxed"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {currentTreatment?.description}
            </p>

            {currentTreatment?.descriptionBullets &&
              currentTreatment.descriptionBullets.length > 0 && (
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {currentTreatment.descriptionBullets.map((bullet, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-xs text-white/60"
                    >
                      <div className="w-1 h-1 rounded-full bg-cyan-500/60 mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              )}

            {/* Features list */}
            {currentTreatment?.features.length ? (
              <div className="space-y-1.5">
                {currentTreatment.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-white/60">
                    <div className="w-1 h-1 rounded-full bg-cyan-500/60 mt-1.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Subtle bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
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
          className="absolute left-0 top-[40px] w-full h-[calc(100%-40px)] pointer-events-auto z-10"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-[90vw] max-w-3xl h-[80vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 text-sm uppercase tracking-[0.2em] text-white/70 hover:text-white"
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
