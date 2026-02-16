'use client'

import { ConsultationForm } from '@/components/navigators/core/ConsultationForm'
import styles from '@/components/navigators/core/ConsultationForm.module.css'

export function ConsulenzaForm({
  phoneLink,
  whatsappLink,
  phoneDisplay,
  whatsappDisplay,
}: {
  phoneLink: string
  whatsappLink: string
  phoneDisplay: string
  whatsappDisplay: string
}) {
  return (
    <ConsultationForm
      phoneLink={phoneLink}
      whatsappLink={whatsappLink}
      phoneDisplay={phoneDisplay}
      whatsappDisplay={whatsappDisplay}
      styles={styles}
      contactStyleVariant="plain"
    />
  )
}
