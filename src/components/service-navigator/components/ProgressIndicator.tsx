'use client'

import type { Step } from "@/components/service-navigator/types/navigator";

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

  return (
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
