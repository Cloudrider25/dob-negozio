'use client'

import type { Step } from '@/components/navigators/shop-navigator/types/navigator'
import { ProgressIndicatorCore } from '@/components/navigators/core/ProgressIndicator'
import styles from '@/components/navigators/core/ProgressIndicator.module.css'

interface ProgressIndicatorProps {
  currentStep: Step
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <ProgressIndicatorCore
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepOrder={['need', 'texture', 'products']}
      styleMode="width"
      classNames={{
        wrapper: styles.wrapper,
        fill: styles.fill,
        shimmer: styles.shimmer,
      }}
    />
  )
}
