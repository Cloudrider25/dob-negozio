'use client'

import type { Step } from '@/components/navigators/service-navigator/types/navigator'
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
      stepOrder={['area', 'goal', 'treatment', 'final']}
      styleMode="cssVar"
      classNames={{
        wrapper: styles.wrapper,
        fill: styles.fill,
        shimmer: styles.shimmer,
      }}
    />
  )
}
