import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

import type { Media as MediaType } from '@/payload-types'
import { scheduleMediaBackgroundProcessing } from '@/lib/media/backgroundMediaProcessing'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const toAltFromFilename = (filenameValue?: string | null) => {
  if (!filenameValue) return ''
  const base = filenameValue.replace(/\.[^/.]+$/, '')
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Contenuti',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || data.alt) return data
        const filenameValue = typeof data.filename === 'string' ? data.filename : ''
        const generated = toAltFromFilename(filenameValue)
        if (generated) {
          data.alt = generated
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, context }) => {
        if (context?.skipMediaBackgroundProcessing) return doc
        if (!req) return doc

        await scheduleMediaBackgroundProcessing({
          media: doc as MediaType,
          req,
        })

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    adminThumbnail: 'thumb',
    imageSizes: [
      {
        name: 'heroDesktop',
        width: 1600,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 68,
          },
        },
      },
      {
        name: 'heroMobile',
        width: 900,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 66,
          },
        },
      },
      {
        name: 'cardLarge',
        width: 960,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 70,
          },
        },
      },
      {
        name: 'thumb',
        width: 480,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 64,
          },
        },
      },
    ],
    staticDir: path.resolve(dirname, '..', '..', 'media'),
  },
}
