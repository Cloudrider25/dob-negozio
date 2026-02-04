'use client'

import { useEffect, useState } from 'react'

import type { Area } from '@/components/service-navigator/types/navigator'

import { useNavigatorData } from '@/components/service-navigator/data/navigator-data-context'
import { AreaHoverCard } from './AreaHoverCard'
import styles from '@/components/service-navigator/components/CenterImageDisplay.module.css'

interface CenterImageDisplayProps {
  hoveredArea?: Area;
  onAnimationComplete?: () => void;
  shouldSlideOut?: boolean;
}

export function CenterImageDisplay({
  hoveredArea,
  onAnimationComplete,
  shouldSlideOut = false,
}: CenterImageDisplayProps) {
  const [currentArea, setCurrentArea] = useState<Area | null>(null)
  const { getAreaById } = useNavigatorData()

  useEffect(() => {
    if (hoveredArea && !shouldSlideOut) {
      setCurrentArea(hoveredArea)
    }
  }, [hoveredArea, shouldSlideOut])

  return (
    <div className={styles.wrapper}>
      <AreaHoverCard
        area={
          currentArea
            ? {
                id: currentArea,
                title:
                  getAreaById(currentArea)?.cardTitle ||
                  getAreaById(currentArea)?.label ||
                  currentArea,
                slug: getAreaById(currentArea)?.slug,
                subtitle:
                  getAreaById(currentArea)?.cardTagline ||
                  getAreaById(currentArea)?.subtitle,
                description:
                  getAreaById(currentArea)?.cardDescription ||
                  getAreaById(currentArea)?.description,
                imageUrl: getAreaById(currentArea)?.imageUrl,
                features: getAreaById(currentArea)?.features,
              }
            : null
        }
        shouldSlideOut={shouldSlideOut}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  )
}
