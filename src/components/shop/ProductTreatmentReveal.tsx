'use client'

import {
  TreatmentRevealBase,
  type TreatmentRevealBaseProps,
  type TreatmentRevealPanelContent,
} from '@/components/shared/TreatmentRevealBase'

export type ProductTreatmentPanelContent = TreatmentRevealPanelContent

export type ProductTreatmentRevealProps = TreatmentRevealBaseProps

export function ProductTreatmentReveal(props: ProductTreatmentRevealProps) {
  return <TreatmentRevealBase {...props} />
}
