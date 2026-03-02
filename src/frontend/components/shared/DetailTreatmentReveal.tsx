'use client'

import {
  TreatmentRevealBase,
  type TreatmentRevealBaseProps,
  type TreatmentRevealPanelContent,
} from './TreatmentRevealBase'

export type DetailTreatmentPanelContent = TreatmentRevealPanelContent

export type DetailTreatmentRevealProps = TreatmentRevealBaseProps

export function DetailTreatmentReveal(props: DetailTreatmentRevealProps) {
  return <TreatmentRevealBase {...props} />
}
