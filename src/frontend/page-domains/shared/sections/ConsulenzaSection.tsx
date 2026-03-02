'use client'

import { ConsultationForm } from '@/frontend/components/forms'
import type { ConsultationFormData } from '@/frontend/components/forms'
import { submitConsultationLead } from '@/lib/frontend/consultation/submitConsultationLead'

type ContactLinks = {
  phoneLink: string
  whatsappLink: string
  phoneDisplay: string
  whatsappDisplay: string
}

type ConsulenzaSectionProps = {
  contactLinks: ContactLinks
  source?: string
}

export function ConsulenzaSection({ contactLinks, source = 'service-navigator' }: ConsulenzaSectionProps) {
  const handleSubmit = async (formData: ConsultationFormData) => {
    await submitConsultationLead({
      ...formData,
      source,
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
      onSubmit={handleSubmit}
    />
  )
}
