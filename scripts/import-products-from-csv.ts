import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

import configPromise from '../src/payload.config'

type Row = Record<string, string>

const normalizeNumber = (value: string) => {
  const normalized = value.replace(/\s+/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseDate = (value: string) => {
  if (!value) return null
  const [day, month, year] = value.split('/')
  if (!day || !month || !year) return null
  const iso = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  return new Date(`${iso}T00:00:00.000Z`).toISOString()
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const parseCSV = (text: string) => {
  const rows: string[][] = []
  let current = ''
  let inQuotes = false
  let row: string[] = []

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && next === '"') {
      current += '"'
      i += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.length || row.length) {
        row.push(current)
        rows.push(row)
        row = []
        current = ''
      }
      continue
    }

    current += char
  }

  if (current.length || row.length) {
    row.push(current)
    rows.push(row)
  }

  return rows
}

const csvPath = process.argv[2] || 'Giacenze magazzino.csv'

const run = async () => {
  const absolutePath = path.resolve(process.cwd(), csvPath)
  const file = await fs.readFile(absolutePath, 'utf-8')
  const rows = parseCSV(file.trim())

  if (rows.length < 2) {
    throw new Error('CSV vuoto o senza righe dati.')
  }

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, '').trim())
  const data = rows.slice(1)

  const payload = await getPayload({ config: await configPromise })

  const slugCounts: Record<string, number> = {}

  const toRow = (values: string[]): Row =>
    headers.reduce<Row>((acc, header, index) => {
      acc[header] = values[index] ?? ''
      return acc
    }, {})

  const records = data.map(toRow).filter((row) => {
    const name = row['Prodotto']?.trim()
    if (!name) return false
    return !name.toLowerCase().startsWith('cab:')
  })

  await fs.writeFile(
    path.resolve(process.cwd(), 'import-log.txt'),
    `Righe CSV: ${data.length}, prodotti importabili: ${records.length}\\n`,
  )

  for (const row of records) {
    const name = row['Prodotto']?.trim()
    if (!name) {
      continue
    }
    const baseSlug = slugify(name)
    const count = slugCounts[baseSlug] ?? 0
    slugCounts[baseSlug] = count + 1
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`

    const lot = row['Lotto']?.trim() || undefined
    const expiry = parseDate(row['Scadenza']?.trim() || '')
    const stock = normalizeNumber(row['Quantità'] || '0')
    const averageCost = normalizeNumber(row['Costo medio'] || '0')
    const lastCost = normalizeNumber(row['Ultimo costo'] || '0')
    const residualTotal = normalizeNumber(row['Totale residuo'] || '0')
    const total = normalizeNumber(row['Totale'] || '0')
    const price = lastCost || averageCost || 0

    const existing = await payload.find({
      collection: 'products',
      overrideAccess: true,
      limit: 1,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    const dataPayload = {
      title: name,
      slug,
      price,
      currency: 'EUR' as const,
      stock,
      lot,
      expiryDate: expiry ?? undefined,
      averageCost,
      lastCost,
      residualTotal,
      total,
      active: true,
    }

    if (existing.docs.length) {
      await payload.update({
        collection: 'products',
        id: existing.docs[0].id,
        overrideAccess: true,
        locale: 'it',
        data: dataPayload,
      })
    } else {
      await payload.create({
        collection: 'products',
        overrideAccess: true,
        locale: 'it',
        data: dataPayload,
      })
    }
  }

  await fs.appendFile(
    path.resolve(process.cwd(), 'import-log.txt'),
    `Importati ${records.length} prodotti (esclusi Cab:).\\n`,
  )
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
