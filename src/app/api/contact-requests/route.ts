import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const allowedReasons = ['general', 'booking', 'order-support', 'partnership'] as const
type ContactReason = (typeof allowedReasons)[number]
const MAX_ATTACHMENTS = 10
const MAX_TOTAL_BYTES = 50 * 1024 * 1024
const isAllowedMimeType = (mimeType: string) => mimeType.startsWith('image/')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const firstName = asString(formData.get('firstName'))
    const lastName = asString(formData.get('lastName'))
    const email = asString(formData.get('email')).toLowerCase()
    const contactReason = asString(formData.get('contactReason'))
    const topic = asString(formData.get('topic'))
    const message = asString(formData.get('message'))
    const attachmentFiles = formData
      .getAll('attachments')
      .filter((value): value is File => value instanceof File && value.size > 0)

    if (!firstName || !lastName || !email || !contactReason || !topic || !message) {
      return NextResponse.json({ ok: false, error: 'Missing required fields.' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Invalid email address.' }, { status: 400 })
    }

    if (!allowedReasons.includes(contactReason as ContactReason)) {
      return NextResponse.json({ ok: false, error: 'Invalid contact reason.' }, { status: 400 })
    }

    if (attachmentFiles.length > MAX_ATTACHMENTS) {
      return NextResponse.json(
        { ok: false, error: 'Too many attachments. Maximum 10 files.' },
        { status: 400 },
      )
    }

    const totalBytes = attachmentFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Total attachment size must be less than 50MB.' },
        { status: 400 },
      )
    }

    if (attachmentFiles.some((file) => !isAllowedMimeType(file.type))) {
      return NextResponse.json(
        { ok: false, error: 'Only image attachments are allowed.' },
        { status: 400 },
      )
    }

    const payload = await getPayloadClient()
    const attachments = await Promise.all(
      attachmentFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const createdMedia = await payload.create({
          collection: 'media',
          overrideAccess: true,
          data: {
            alt: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Contact attachment',
          },
          file: {
            data: buffer,
            mimetype: file.type || 'application/octet-stream',
            name: file.name || 'attachment',
            size: file.size,
          },
        })

        return createdMedia.id
      }),
    )

    await payload.create({
      collection: 'contact-requests',
      overrideAccess: true,
      data: {
        firstName,
        lastName,
        email,
        contactReason: contactReason as ContactReason,
        topic,
        message,
        attachments: attachments.length ? attachments : undefined,
        status: 'new',
      },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const payload = await getPayloadClient()
    payload.logger.error({
      err: error,
      msg: 'Failed to persist contact request.',
    })

    return NextResponse.json(
      { ok: false, error: 'Unable to submit contact request.' },
      { status: 500 },
    )
  }
}
