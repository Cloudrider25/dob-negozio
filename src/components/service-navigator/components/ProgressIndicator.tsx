'use client'

import type { Step } from "@/components/service-navigator/types/navigator";
import type { CSSProperties } from 'react'

import styles from './ProgressIndicator.module.css'

interface ProgressIndicatorProps {
  currentStep: Step;
  totalSteps: number;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const stepOrder: Step[] = ["area", "goal", "treatment", "final"];
  const currentIndex = stepOrder.indexOf(currentStep);
  const progress = ((currentIndex + 1) / totalSteps) * 100;
  const progressStyle = { '--progress': `${progress}%` } as CSSProperties

  return (
    <div className={styles.bar}>
      <div className={styles.progressFill} style={progressStyle}>
        <div className={styles.shimmer} />
      </div>
    </div>
  );
}
