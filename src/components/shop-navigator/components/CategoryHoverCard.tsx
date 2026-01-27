'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

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
    <div className="relative w-full h-full">
      <div className="relative w-full h-full rounded-xl overflow-hidden backdrop-blur-xl border border-stroke shadow-soft">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[color:color-mix(in_srgb,var(--tech-cyan)_10%,transparent)] blur-3xl rounded-full" />
        </div>

        <div className="relative h-full flex flex-col">
          <div className="relative h-60 overflow-hidden">
            {currentItem?.imageUrl && (
              <Image
                src={currentItem.imageUrl}
                alt={currentItem.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 320px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color:color-mix(in_srgb,var(--obsidian)_20%,transparent)] to-[color:color-mix(in_srgb,var(--obsidian)_80%,transparent)]" />

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-0.5">
                {currentItem?.title}
              </h3>
              {currentItem?.tagline && (
                <p className="text-sm text-accent-cyan">{currentItem.tagline}</p>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-3">
            {currentItem?.description && (
              <p className="text-sm text-text-muted leading-relaxed">
                {currentItem.description}
              </p>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--tech-cyan)_20%,transparent)] to-transparent" />
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

      {isOpen && currentItem && (
        <motion.div
          key="item-modal"
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
