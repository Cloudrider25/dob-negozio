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
    <div className="w-full h-1 bg-paper rounded-full overflow-hidden">
      <div
        className={`h-full bg-accent-cyan transition-all duration-500 ease-out ${styles.progressFill}`}
        style={progressStyle}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--text-primary)_30%,transparent)] to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
