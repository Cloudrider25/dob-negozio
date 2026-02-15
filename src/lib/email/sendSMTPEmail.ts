import nodemailer from 'nodemailer'
import type { Payload } from 'payload'

import { getSMTPConfig } from '@/lib/email/smtpConfig'

type SendSMTPEmailInput = {
  payload: Payload
  to: string
  subject: string
  text: string
  html: string
  attachments?: Array<{
    filename?: string
    content: Buffer
    contentType?: string
  }>
}

export const sendSMTPEmail = async ({
  payload,
  to,
  subject,
  text,
  html,
  attachments,
}: SendSMTPEmailInput) => {
  const smtp = await getSMTPConfig(payload)

  if (!smtp.host) {
    throw new Error('SMTP host not configured.')
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.user || smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })

  await transporter.verify()

  return transporter.sendMail({
    from: smtp.from,
    to,
    subject,
    text,
    html,
    attachments,
  })
}
