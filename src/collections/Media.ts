import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

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
    staticDir: path.resolve(dirname, '..', '..', 'media'),
  },
}
