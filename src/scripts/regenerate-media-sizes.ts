import fs from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../payload.config'

type MediaDoc = {
  id: number | string
  filename?: string | null
  mimeType?: string | null
  alt?: string | null
  sizes?: {
    heroDesktop?: unknown
    heroMobile?: unknown
    cardLarge?: unknown
    thumb?: unknown
  } | null
}

const MEDIA_DIR = path.resolve(process.cwd(), 'media')
const BATCH_SIZE = Number(process.env.MEDIA_REGEN_BATCH || 50)
const LIMIT = Number(process.env.MEDIA_REGEN_LIMIT || 0)
const DRY_RUN = process.env.MEDIA_REGEN_DRY_RUN === '1'
const FORCE = process.env.MEDIA_REGEN_FORCE === '1'

const hasGeneratedSizes = (doc: MediaDoc) =>
  Boolean(
    doc.sizes?.heroDesktop &&
      doc.sizes?.heroMobile &&
      doc.sizes?.cardLarge &&
      doc.sizes?.thumb,
  )

const main = async () => {
  const payload = await getPayload({ config: await config })

  let page = 1
  let processed = 0
  let updated = 0
  let skipped = 0
  let failed = 0

  while (true) {
    const result = await payload.find({
      collection: 'media',
      overrideAccess: true,
      depth: 0,
      page,
      limit: BATCH_SIZE,
      sort: 'id',
      select: {
        id: true,
        filename: true,
        mimeType: true,
        alt: true,
        sizes: true,
      },
    })

    if (result.docs.length === 0) break

    for (const rawDoc of result.docs as MediaDoc[]) {
      if (LIMIT > 0 && processed >= LIMIT) break
      processed += 1

      const id = Number(rawDoc.id)
      const filename = rawDoc.filename
      const mimeType = rawDoc.mimeType || ''

      if (!Number.isFinite(id) || !filename) {
        skipped += 1
        console.log(`[skip] media ${rawDoc.id}: missing numeric id or filename`)
        continue
      }

      if (!mimeType.startsWith('image/')) {
        skipped += 1
        console.log(`[skip] media ${id}: not an image (${mimeType || 'unknown'})`)
        continue
      }

      if (!FORCE && hasGeneratedSizes(rawDoc)) {
        skipped += 1
        console.log(`[skip] media ${id}: sizes already present`)
        continue
      }

      const filePath = path.join(MEDIA_DIR, filename)
      if (!fs.existsSync(filePath)) {
        skipped += 1
        console.log(`[skip] media ${id}: file not found ${filePath}`)
        continue
      }

      if (DRY_RUN) {
        updated += 1
        console.log(`[dry-run] media ${id}: would regenerate sizes from ${filename}`)
        continue
      }

      try {
        await payload.update({
          collection: 'media',
          id,
          overrideAccess: true,
          filePath,
          data: {
            alt: rawDoc.alt || filename.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
          },
        })
        updated += 1
        console.log(`[ok] media ${id}: regenerated sizes`)
      } catch (error) {
        failed += 1
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[fail] media ${id}: ${message}`)
      }
    }

    if (LIMIT > 0 && processed >= LIMIT) break
    if (page >= result.totalPages) break
    page += 1
  }

  console.log('\nMedia regeneration summary')
  console.log({
    processed,
    updated,
    skipped,
    failed,
    dryRun: DRY_RUN,
    force: FORCE,
    batchSize: BATCH_SIZE,
    limit: LIMIT || null,
  })
}

await main()
