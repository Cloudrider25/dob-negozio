'use client'

import {
  TreatmentRevealBase,
  type TreatmentRevealBaseProps,
  type TreatmentRevealPanelContent,
} from '@/components/shared/TreatmentRevealBase'

export type ServicesTreatmentPanelContent = TreatmentRevealPanelContent

export type ServicesTreatmentRevealProps = TreatmentRevealBaseProps

export function ServicesTreatmentReveal(props: ServicesTreatmentRevealProps) {
  return <TreatmentRevealBase {...props} />
}
