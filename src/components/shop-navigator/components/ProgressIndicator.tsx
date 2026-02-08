'use client'

import type { Step } from '@/components/shop-navigator/types/navigator'
import type { CSSProperties } from 'react'
import styles from './ProgressIndicator.module.css'

interface ProgressIndicatorProps {
  currentStep: Step
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const stepOrder: Step[] = ['need', 'texture', 'products']
  const currentIndex = stepOrder.indexOf(currentStep)
  const progress = ((currentIndex + 1) / totalSteps) * 100
  const progressStyle = { width: `${progress}%` } as CSSProperties

  return (
    <div className={styles.wrapper}>
      <div className={styles.fill} style={progressStyle}>
        <div className={styles.shimmer} />
      </div>
    </div>
  )
}
