import { getPayload } from 'payload'

import config from '../payload.config'
import { getSMTPConfig } from '../lib/email/smtpConfig'
import { sendSMTPEmail } from '../lib/email/sendSMTPEmail'

const payload = await getPayload({ config })
const smtp = await getSMTPConfig(payload)
const fromAddress = smtp.from

const now = new Date().toISOString()

console.log('Sending test email with:')
console.log({
  to: 'ale.parisi83@gmail.com',
  fromAddress,
  host: smtp.host,
  port: smtp.port,
  secure: smtp.secure,
})

try {
  const response = await sendSMTPEmail({
    payload,
    to: 'ale.parisi83@gmail.com',
    subject: `DOB SMTP test ${now}`,
    text: `Test email from DOB Milano at ${now}`,
    html: `<p>Test email from <strong>DOB Milano</strong> at ${now}</p>`,
  })

  console.log('OK: Email sent (adapter response below)')
  console.log(response)
} catch (error) {
  console.error('FAIL: Email send failed')
  console.error(error)
  process.exit(1)
}
