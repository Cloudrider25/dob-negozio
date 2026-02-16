'use client'

import { ConsultationForm } from '@/components/forms/ConsultationForm'
import type { ConsultationFormData } from '@/components/forms/ConsultationForm'
import styles from '@/components/forms/ConsultationForm.module.css'
import { GlassCard } from '@/components/navigators/service-navigator/components/GlassCard'
import { submitConsultationLead } from '@/lib/consultation/submitConsultationLead'

type ContactLinks = {
  phoneLink: string
  whatsappLink: string
  phoneDisplay: string
  whatsappDisplay: string
}

export function ConsulenzaSection({ contactLinks }: { contactLinks: ContactLinks }) {
  const handleSubmit = async (formData: ConsultationFormData) => {
    await submitConsultationLead({
      ...formData,
      source: 'service-navigator',
      pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
      locale:
        typeof document !== 'undefined' ? document.documentElement.lang?.trim() || undefined : undefined,
    })
  }

  return (
    <ConsultationForm
      phoneLink={contactLinks.phoneLink}
      whatsappLink={contactLinks.whatsappLink}
      phoneDisplay={contactLinks.phoneDisplay}
      whatsappDisplay={contactLinks.whatsappDisplay}
      styles={styles}
      contactStyleVariant="glass-card"
      includeButtonBaseClass
      onSubmit={handleSubmit}
      GlassCard={({ paddingClassName, children }) => (
        <GlassCard paddingClassName={paddingClassName}>{children}</GlassCard>
      )}
    />
  )
}
