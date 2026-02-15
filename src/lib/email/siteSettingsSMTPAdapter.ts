import nodemailer from 'nodemailer'
import type { EmailAdapter } from 'payload'

import { getSMTPConfig } from '@/lib/email/smtpConfig'

export const siteSettingsSMTPAdapter = (): EmailAdapter => {
  return ({ payload }) => ({
    name: 'site-settings-smtp',
    defaultFromAddress: process.env.SMTP_FROM || 'no-reply@dobmilano.it',
    defaultFromName: 'DOB Milano',
    sendEmail: async (message) => {
      const smtp = await getSMTPConfig(payload)

      if (!smtp.host) {
        payload.logger.warn(
          'SMTP host not configured in site-settings/env. Email not delivered; payload printed to logs.',
        )
        payload.logger.info({
          email: {
            to: message.to,
            cc: message.cc,
            bcc: message.bcc,
            from: message.from || smtp.from,
            subject: message.subject,
            text: message.text,
            html: message.html,
          },
        })
        return
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

      await transporter.sendMail({
        ...message,
        from: message.from || smtp.from,
      })
    },
  })
}
