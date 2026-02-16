'use client'

import type { CSSProperties } from 'react'

type StyleMode = 'width' | 'cssVar'

type ProgressIndicatorClassNames = {
  wrapper: string
  fill: string
  shimmer: string
}

type ProgressIndicatorProps<Step extends string> = {
  currentStep: Step
  totalSteps: number
  stepOrder: Step[]
  classNames: ProgressIndicatorClassNames
  styleMode?: StyleMode
}

export function ProgressIndicatorCore<Step extends string>({
  currentStep,
  totalSteps,
  stepOrder,
  classNames,
  styleMode = 'width',
}: ProgressIndicatorProps<Step>) {
  const currentIndex = stepOrder.indexOf(currentStep)
  const normalizedIndex = currentIndex < 0 ? 0 : currentIndex
  const safeTotal = totalSteps > 0 ? totalSteps : stepOrder.length || 1
  const progress = ((normalizedIndex + 1) / safeTotal) * 100
  const fillStyle =
    styleMode === 'cssVar'
      ? ({ '--progress': `${progress}%` } as CSSProperties)
      : ({ width: `${progress}%` } as CSSProperties)

  return (
    <div className={classNames.wrapper}>
      <div className={classNames.fill} style={fillStyle}>
        <div className={classNames.shimmer} />
      </div>
    </div>
  )
}
