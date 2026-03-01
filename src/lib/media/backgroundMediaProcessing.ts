import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import type { PayloadRequest } from 'payload'
import type { Media } from '@/payload-types'

const execFileAsync = promisify(execFile)

const processingIDs = new Set<string>()
let ffmpegAvailableCache: boolean | null = null
let warnedMissingFfmpeg = false

const hasAllImageSizes = (media: Media) =>
  Boolean(
    media.sizes?.heroDesktop?.url &&
      media.sizes?.heroMobile?.url &&
      media.sizes?.cardLarge?.url &&
      media.sizes?.thumb?.url,
  )

const hasValidFile = (filename?: string | null) => typeof filename === 'string' && filename.length > 0

const checkFfmpeg = async () => {
  if (ffmpegAvailableCache !== null) return ffmpegAvailableCache

  try {
    await execFileAsync('ffmpeg', ['-version'])
    ffmpegAvailableCache = true
    return true
  } catch {
    ffmpegAvailableCache = false
    if (!warnedMissingFfmpeg) {
      warnedMissingFfmpeg = true
      console.warn('[media] ffmpeg not found, video conversion disabled.')
    }
    return false
  }
}

const needsVideoConversion = (media: Media) => {
  const mimeType = media.mimeType || ''
  if (!mimeType.startsWith('video/')) return false
  if (!hasValidFile(media.filename)) return false

  const filename = media.filename!.toLowerCase()
  if (!filename.endsWith('.mp4')) return true

  const fileSize = typeof media.filesize === 'number' ? media.filesize : 0
  const isAlreadyOptimizedName = filename.includes('-optimized')
  return fileSize > 8 * 1024 * 1024 && !isAlreadyOptimizedName
}

const buildMediaPath = (filename: string) => path.resolve(process.cwd(), 'media', filename)

const regenerateImageSizes = async (media: Media, req: PayloadRequest) => {
  if (!hasValidFile(media.filename)) return
  if (!media.mimeType?.startsWith('image/')) return
  if (hasAllImageSizes(media)) return

  const filePath = buildMediaPath(media.filename!)
  try {
    await fs.access(filePath)
  } catch {
    console.warn(`[media] source image not found for regeneration: ${filePath}`)
    return
  }

  await req.payload.update({
    collection: 'media',
    id: media.id,
    overrideAccess: true,
    filePath,
    data: {
      alt: media.alt,
    },
    req,
    context: {
      skipMediaBackgroundProcessing: true,
    },
  })
}

const convertVideo = async (media: Media, req: PayloadRequest) => {
  if (!hasValidFile(media.filename)) return
  if (!media.mimeType?.startsWith('video/')) return
  if (!needsVideoConversion(media)) return

  const ffmpegAvailable = await checkFfmpeg()
  if (!ffmpegAvailable) return

  const inputPath = buildMediaPath(media.filename!)
  try {
    await fs.access(inputPath)
  } catch {
    console.warn(`[media] source video not found for conversion: ${inputPath}`)
    return
  }

  const parsed = path.parse(media.filename!)
  const optimizedName = `${parsed.name}-optimized.mp4`
  const outputPath = path.join(os.tmpdir(), optimizedName)

  await execFileAsync('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-movflags',
    '+faststart',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '28',
    '-maxrate',
    '2500k',
    '-bufsize',
    '5000k',
    '-vf',
    "scale='min(1920,iw)':-2",
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    outputPath,
  ])

  try {
    await req.payload.update({
      collection: 'media',
      id: media.id,
      overrideAccess: true,
      filePath: outputPath,
      data: {
        alt: media.alt,
      },
      req,
      context: {
        skipMediaBackgroundProcessing: true,
      },
    })
  } finally {
    await fs.rm(outputPath, { force: true })
  }
}

const processMedia = async (media: Media, req: PayloadRequest) => {
  await regenerateImageSizes(media, req)
  await convertVideo(media, req)
}

export const scheduleMediaBackgroundProcessing = async ({
  media,
  req,
}: {
  media: Media
  req: PayloadRequest
}) => {
  const id = String(media.id)
  if (processingIDs.has(id)) return
  processingIDs.add(id)

  setTimeout(() => {
    void processMedia(media, req)
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[media] background processing failed for ${id}: ${message}`)
      })
      .finally(() => {
        processingIDs.delete(id)
      })
  }, 0)
}
