type ContactSettings = {
  phone?: string | null
  whatsapp?: string | null
  address?: string | null
}

const normalizePhone = (value?: string | null) => {
  if (!value) return ''
  return value.replace(/[^\d+]/g, '').trim()
}

const normalizeWhatsapp = (value?: string | null) => {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

export const buildContactLinks = (settings?: ContactSettings | null) => {
  const phoneDisplay = settings?.phone || '+39 XXX XXX XXXX'
  const whatsappDisplay = settings?.whatsapp || '+39 XXX XXX XXXX'
  const addressDisplay = settings?.address || 'Via Giovanni Rasori 9, Milano'

  const phoneRaw = normalizePhone(settings?.phone)
  const whatsappRaw = normalizeWhatsapp(settings?.whatsapp)

  return {
    phoneDisplay,
    whatsappDisplay,
    addressDisplay,
    phoneLink: phoneRaw ? `tel:${phoneRaw}` : 'tel:+39XXXXXXXXXX',
    whatsappLink: whatsappRaw ? `https://wa.me/${whatsappRaw}` : 'https://wa.me/39XXXXXXXXXX',
  }
}
