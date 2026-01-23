'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import type { Area } from '@/components/service-navigator/types/navigator'

export interface AreaDetails {
  id: Area
  title: string
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
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="relative w-full h-full">
      <div className="relative w-full h-full rounded-xl overflow-hidden sn-card-shell backdrop-blur-xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-red-500/5 pointer-events-none" />

        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
        </div>

        <div className="relative h-full flex flex-col">
          <div className="relative h-60 overflow-hidden">
            {currentArea?.imageUrl && (
              <Image
                src={currentArea.imageUrl}
                alt={currentArea.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 320px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-semibold text-white mb-0.5">{currentArea?.title}</h3>
              {currentArea?.subtitle && (
                <p className="text-sm text-cyan-400">{currentArea.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-3">
            {currentArea?.description && (
              <p className="text-sm text-white/70 leading-relaxed">{currentArea.description}</p>
            )}

            {currentArea?.features && currentArea.features.length > 0 && (
              <div className="space-y-1.5">
                {currentArea.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-white/60">
                    <div className="w-1 h-1 rounded-full bg-cyan-500/60 mt-1.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        </div>
      </div>
    </div>
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
          className="relative w-full h-full mt-[12px]"
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

      {isOpen && currentArea && (
        <motion.div
          key="area-modal"
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
