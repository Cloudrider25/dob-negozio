'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type ApiDoc = Record<string, unknown>
type MediaAttachment = {
  id: string
  alt: string
  filename: string
  url: string
  thumbnailURL: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')
const asId = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return ''
}

export default function ContactRequestAttachmentsField() {
  const documentInfo = useDocumentInfo()
  const contactRequestId = documentInfo?.id ? String(documentInfo.id) : ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<MediaAttachment[]>([])

  useEffect(() => {
    if (!contactRequestId) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/contact-requests/${contactRequestId}?depth=1`, {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error(`Attachments load failed: ${response.status}`)
        }

        const doc = (await response.json()) as ApiDoc
        const nextAttachments = Array.isArray(doc.attachments)
          ? doc.attachments
              .map((item) => {
                if (!item || typeof item !== 'object') return null

                const attachment = item as ApiDoc
                return {
                  id: asId(attachment.id),
                  alt: asString(attachment.alt),
                  filename: asString(attachment.filename),
                  url: asString(attachment.url),
                  thumbnailURL: asString(attachment.thumbnailURL),
                }
              })
              .filter((item): item is MediaAttachment => Boolean(item?.id))
          : []

        if (!cancelled) {
          setAttachments(nextAttachments)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Errore caricamento allegati')
          setAttachments([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [contactRequestId])

  if (!contactRequestId) {
    return <div style={{ color: 'var(--theme-text)' }}>Salva la richiesta per vedere gli allegati.</div>
  }

  if (loading) {
    return <div style={{ color: 'var(--theme-text)' }}>Caricamento allegati…</div>
  }

  if (error) {
    return <div style={{ color: 'var(--theme-error-500, #d14343)' }}>{error}</div>
  }

  if (attachments.length === 0) {
    return <div style={{ color: 'var(--theme-text)' }}>Nessun allegato.</div>
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '72px 1fr auto',
            gap: '0.75rem',
            alignItems: 'center',
            padding: '0.75rem',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 10,
          }}
        >
          <a
            href={attachment.url || `/admin/collections/media/${attachment.id}`}
            target="_blank"
            rel="noreferrer"
            style={{
              width: 72,
              height: 72,
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--theme-elevation-50)',
              display: 'block',
            }}
          >
            {attachment.thumbnailURL || attachment.url ? (
              <Image
                src={attachment.thumbnailURL || attachment.url}
                alt={attachment.alt || attachment.filename || 'Attachment'}
                fill
                sizes="72px"
                style={{ objectFit: 'cover' }}
              />
            ) : null}
          </a>

          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>
              {attachment.filename || attachment.alt || `Media #${attachment.id}`}
            </div>
            <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.82rem' }}>
              {attachment.alt || 'Media allegato'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href={`/admin/collections/media/${attachment.id}`}
              style={{ color: 'var(--theme-text)', fontSize: '0.82rem' }}
            >
              Apri media
            </a>
            {attachment.url ? (
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--theme-text)', fontSize: '0.82rem' }}
              >
                Apri file
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
