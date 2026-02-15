'use client'

import { useEffect, useState } from 'react'

import type { NeedId } from '@/components/shop-navigator/types/navigator'

import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { NeedsHoverCard } from './NeedsHoverCard'
import styles from './CenterImageDisplay.module.css'

interface CenterImageDisplayProps {
  hoveredNeed?: NeedId
  onAnimationComplete?: () => void
  shouldSlideOut?: boolean
}

export function CenterImageDisplay({
  hoveredNeed,
  onAnimationComplete,
  shouldSlideOut = false,
}: CenterImageDisplayProps) {
  const [currentNeed, setCurrentNeed] = useState<NeedId | null>(null)
  const { getNeedById } = useShopNavigatorData()

  useEffect(() => {
    if (hoveredNeed && !shouldSlideOut) {
      setCurrentNeed(hoveredNeed)
    }
  }, [hoveredNeed, shouldSlideOut])

  const currentNeedData = currentNeed ? getNeedById(currentNeed) : undefined

  return (
    <div className={styles.wrapper}>
      <NeedsHoverCard
        need={
          currentNeedData
            ? {
                id: currentNeedData.id,
                title: currentNeedData.cardTitle || currentNeedData.label,
                tagline: currentNeedData.cardTagline,
                description: currentNeedData.description,
                imageUrl: currentNeedData.cardMedia?.url,
              }
            : null
        }
        shouldSlideOut={shouldSlideOut}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  )
}
