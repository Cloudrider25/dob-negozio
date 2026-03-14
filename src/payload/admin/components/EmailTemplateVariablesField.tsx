'use client'

import { useFormFields } from '@payloadcms/ui'

import {
  EMAIL_CHANNEL_OPTIONS,
  EMAIL_EVENT_OPTIONS,
  EMAIL_EVENT_META,
  type EmailChannel,
  type EmailEventKey,
} from '@/lib/server/email/events'
import { locales, type Locale } from '@/lib/i18n/core'

const isEmailEventKey = (value: unknown): value is EmailEventKey =>
  typeof value === 'string' && EMAIL_EVENT_OPTIONS.some((option) => option.value === value)

const isEmailChannel = (value: unknown): value is EmailChannel =>
  typeof value === 'string' && EMAIL_CHANNEL_OPTIONS.some((option) => option.value === value)

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && locales.includes(value as Locale)

export default function EmailTemplateVariablesField() {
  const values = useFormFields(([fields]) => ({
    eventKey: fields.eventKey?.value,
    locale: fields.locale?.value,
    channel: fields.channel?.value,
  }))

  const eventKey = isEmailEventKey(values.eventKey) ? values.eventKey : null
  const locale = isLocale(values.locale) ? values.locale : null
  const channel = isEmailChannel(values.channel) ? values.channel : null

  if (!eventKey) {
    return (
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-m)',
          padding: '16px',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-text)',
        }}
      >
        Seleziona prima un evento per vedere le variabili disponibili.
      </div>
    )
  }

  const meta = EMAIL_EVENT_META[eventKey]
  const localeSupported = locale ? meta.supportedLocales.includes(locale) : true
  const channelSupported = channel ? meta.supportedChannels.includes(channel) : true

  return (
    <div
      style={{
        display: 'grid',
        gap: '12px',
      }}
    >
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-m)',
          padding: '16px',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-text)',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          Available Variables
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {meta.availableVariables.map((variable) => (
            <code
              key={variable}
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'var(--theme-elevation-100)',
                border: '1px solid var(--theme-elevation-150)',
                color: 'var(--theme-text)',
              }}
            >
              {variable}
            </code>
          ))}
        </div>
      </div>

      {(!localeSupported || !channelSupported) && (
        <div
          style={{
            border: '1px solid var(--theme-elevation-300)',
            borderRadius: 'var(--style-radius-m)',
            padding: '16px',
            background: 'var(--theme-elevation-50)',
            color: 'var(--theme-text)',
          }}
        >
          {!channelSupported && channel && (
            <div>
              Il canale <strong>{channel}</strong> non e supportato per l&apos;evento{' '}
              <strong>{eventKey}</strong>.
            </div>
          )}
          {!localeSupported && locale && (
            <div>
              La locale <strong>{locale}</strong> non e supportata per l&apos;evento{' '}
              <strong>{eventKey}</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
