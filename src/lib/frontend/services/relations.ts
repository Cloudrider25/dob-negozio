export const resolveServiceRelationLabel = (value: unknown) => {
  if (!value) return null
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const label =
      (typeof record.label === 'string' && record.label) ||
      (typeof record.name === 'string' && record.name)
    if (label) return label
  }
  return null
}

export const resolveServiceTreatmentLabel = (value: unknown) => {
  if (!value) return '—'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const name =
      (typeof record.boxName === 'string' && record.boxName) ||
      (typeof record.cardName === 'string' && record.cardName) ||
      (typeof record.name === 'string' && record.name)
    if (name) return name
    if (typeof record.id === 'string' || typeof record.id === 'number') return String(record.id)
  }
  return '—'
}

export const resolveServiceRelId = (value: unknown) => {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const idValue = (value as { id?: string | number }).id
    return idValue ? String(idValue) : null
  }
  return null
}
