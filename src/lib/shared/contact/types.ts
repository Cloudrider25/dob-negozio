export type ContactRequestInput = {
  firstName: string
  lastName: string
  email: string
  contactReason: 'general' | 'booking' | 'order-support' | 'partnership'
  topic: string
  message: string
  attachments?: File[]
}
