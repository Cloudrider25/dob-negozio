import { getPayload } from 'payload'
import net from 'node:net'
import tls from 'node:tls'

import config from '../payload.config'
import { getSMTPConfig } from '../lib/email/smtpConfig'

const payload = await getPayload({ config })
const smtp = await getSMTPConfig(payload)
const { host, port, secure, user, pass, from } = smtp

console.log('SMTP settings from Payload (masked):')
console.log({
  host,
  port,
  secure,
  user: user ? `${user.slice(0, 2)}***` : '',
  pass: pass ? '***set***' : '',
  from,
})

if (!host) {
  console.error('FAIL: smtp.host is empty in site-settings.')
  process.exit(1)
}

try {
  await new Promise<void>((resolve, reject) => {
    const timeoutMs = 10000
    let done = false

    const onSuccess = () => {
      if (done) return
      done = true
      resolve()
    }

    const onError = (error: Error) => {
      if (done) return
      done = true
      reject(error)
    }

    if (secure) {
      const socket = tls.connect(
        {
          host,
          port,
          servername: host,
          timeout: timeoutMs,
        },
        () => {
          socket.end()
          onSuccess()
        },
      )
      socket.once('error', onError)
      socket.once('timeout', () => onError(new Error('TLS socket timeout')))
      return
    }

    const socket = net.connect({ host, port, timeout: timeoutMs }, () => {
      socket.end()
      onSuccess()
    })
    socket.once('error', onError)
    socket.once('timeout', () => onError(new Error('TCP socket timeout')))
  })
  console.log('OK: SMTP host/port reachable.')
} catch (error) {
  console.error('FAIL: SMTP connection error.')
  console.error(error)
  process.exit(1)
}
