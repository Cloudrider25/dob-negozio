'use client'

import { ConsultationForm } from '@/frontend/components/forms'
import type { ConsultationFormData } from '@/frontend/components/forms'
import { trackEvent } from '@/lib/frontend/analytics/gtag'
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
    const pagePath = typeof window !== 'undefined' ? window.location.pathname : undefined
    const pageLocale =
      typeof document !== 'undefined' ? document.documentElement.lang?.trim() || undefined : undefined

    await submitConsultationLead({
      ...formData,
      source,
      pagePath,
      locale: pageLocale,
    })

    trackEvent('generate_lead', {
      currency: 'EUR',
      value: 1,
      lead_source: source,
      page_path: pagePath,
      locale: pageLocale,
      skin_type: formData.skinType,
      concerns_count: Array.isArray(formData.concerns) ? formData.concerns.length : 0,
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
