type RichTextSummary = {
  text: string
  bullets: string[]
}

const extractText = (node: unknown, acc: string[]) => {
  if (!node || typeof node !== 'object') return
  const record = node as { text?: string; children?: unknown[] }
  if (typeof record.text === 'string') {
    acc.push(record.text)
  }
  if (Array.isArray(record.children)) {
    record.children.forEach((child) => extractText(child, acc))
  }
}

const extractBullets = (node: unknown, acc: string[]) => {
  if (!node || typeof node !== 'object') return
  const record = node as { type?: string; children?: unknown[] }
  if (record.type === 'list' && Array.isArray(record.children)) {
    record.children.forEach((child) => {
      const parts: string[] = []
      extractText(child, parts)
      const text = parts.join(' ').replace(/\s+/g, ' ').trim()
      if (text) acc.push(text)
    })
  }
  if (Array.isArray(record.children)) {
    record.children.forEach((child) => extractBullets(child, acc))
  }
}

export const normalizeRichText = (value: unknown): RichTextSummary => {
  if (!value || typeof value !== 'object') return { text: '', bullets: [] }
  const root = (value as { root?: unknown }).root
  if (!root) return { text: '', bullets: [] }
  const textParts: string[] = []
  const bullets: string[] = []
  extractText(root, textParts)
  extractBullets(root, bullets)
  return {
    text: textParts.join(' ').replace(/\s+/g, ' ').trim(),
    bullets,
  }
}

export const getPlainTextFromRichText = (value: unknown): string => normalizeRichText(value).text
