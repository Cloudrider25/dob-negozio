import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const getPrimaryLocalizedText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, unknown>
    if (typeof localized.it === 'string' && localized.it.trim()) return localized.it
    const first = Object.values(localized).find(
      (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
    )
    if (first) return first
  }
  return ''
}

const getRelationId = (value: unknown): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return id
  }
  return null
}

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'serviceType', 'price', 'durationMinutes', 'active'],
    group: 'Servizi',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data || data.slug) return data
        const rawName = data.name
        let nameValue = ''
        if (typeof rawName === 'string') {
          nameValue = rawName
        } else if (rawName && typeof rawName === 'object') {
          const localized = rawName as Record<string, unknown>
          const preferredLocale = req.locale || 'it'
          const preferred = localized[preferredLocale]
          if (typeof preferred === 'string') {
            nameValue = preferred
          } else {
            const first = Object.values(localized).find((value) => typeof value === 'string')
            if (typeof first === 'string') nameValue = first
          }
        }
        if (!nameValue) return data
        const slug = slugify(nameValue)
        if (slug) {
          data.slug = slug
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data

        const currentPrice =
          typeof data.price === 'number'
            ? data.price
            : typeof originalDoc?.price === 'number'
              ? originalDoc.price
              : null

        const incomingPackages = Array.isArray(data.pacchetti) ? data.pacchetti : null
        const existingPackages = Array.isArray(originalDoc?.pacchetti) ? originalDoc.pacchetti : null
        const sourcePackages = incomingPackages ?? existingPackages

        if (!sourcePackages) return data

        const serviceName =
          getPrimaryLocalizedText(data.name) ||
          getPrimaryLocalizedText(originalDoc?.name) ||
          'Servizio'
        const defaultVariableName =
          (typeof data.nomeVariabile === 'string' && data.nomeVariabile.trim()) ||
          (typeof originalDoc?.nomeVariabile === 'string' && originalDoc.nomeVariabile.trim()) ||
          'Default'
        const variabiliSource = Array.isArray(data.variabili)
          ? data.variabili
          : Array.isArray(originalDoc?.variabili)
            ? originalDoc.variabili
            : []

        const seenLabels = new Map<string, number>()

        data.pacchetti = sourcePackages.map((item: unknown) => {
          const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
          const linkedTo =
            typeof record.collegaAVariabile === 'string' && record.collegaAVariabile.trim()
              ? record.collegaAVariabile.trim()
              : 'default'
          const sessions =
            typeof record.numeroSedute === 'number' && Number.isFinite(record.numeroSedute)
              ? Math.max(0, record.numeroSedute)
              : 0

          let sourcePrice = currentPrice
          let variantLabel = defaultVariableName

          const variantMatch = linkedTo.match(/^variabile:(\d+)$/)
          if (variantMatch) {
            const variantIndex = Number(variantMatch[1])
            const variant =
              Number.isFinite(variantIndex) && variantIndex >= 0
                ? (variabiliSource[variantIndex] as Record<string, unknown> | undefined)
                : undefined
            if (variant && typeof variant.varPrice === 'number' && Number.isFinite(variant.varPrice)) {
              sourcePrice = variant.varPrice
            }
            if (variant && typeof variant.varNome === 'string' && variant.varNome.trim()) {
              variantLabel = variant.varNome.trim()
            } else {
              variantLabel = `Variabile ${Number.isFinite(variantIndex) ? variantIndex + 1 : ''}`.trim()
            }
          }

          const computedValue =
            typeof sourcePrice === 'number' && Number.isFinite(sourcePrice)
              ? Math.max(0, sourcePrice) * sessions
              : typeof record.valorePacchetto === 'number'
                ? record.valorePacchetto
                : 0

          const baseLabel = `Pacchetto ${serviceName} ${variantLabel} ${sessions} sedute`.trim()
          const nextCount = (seenLabels.get(baseLabel) ?? 0) + 1
          seenLabels.set(baseLabel, nextCount)
          const uniqueLabel = nextCount > 1 ? `${baseLabel} (${nextCount})` : baseLabel

          return {
            ...record,
            valorePacchetto: computedValue,
            nomePacchetto: uniqueLabel,
          }
        })

        const modalitySource = 'modality' in data ? data.modality : originalDoc?.modality
        if (!modalitySource) {
          data.modalityCode = null
          return data
        }

        let modalityCode: string | null = null
        if (typeof modalitySource === 'object' && modalitySource && 'code' in modalitySource) {
          const code = (modalitySource as { code?: unknown }).code
          if (typeof code === 'string' && code.trim()) {
            modalityCode = code
          }
        }

        if (!modalityCode) {
          const modalityId = getRelationId(modalitySource)
          if (modalityId) {
            try {
              const modalityDoc = await req.payload.findByID({
                collection: 'service-modalities',
                id: String(modalityId),
                depth: 0,
                overrideAccess: false,
                req,
              })
              if (modalityDoc && typeof modalityDoc.code === 'string' && modalityDoc.code.trim()) {
                modalityCode = modalityDoc.code
              }
            } catch {
              modalityCode = null
            }
          }
        }

        data.modalityCode = modalityCode

        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'legacyName',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'modalityCode',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Serv. Generali',
          fields: [
            {
              name: 'defaultLabel',
              type: 'ui',
              label: 'Default',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'nomeVariabile',
                  type: 'text',
                  label: 'Default nome',
                },
                {
                  name: 'durationMinutes',
                  type: 'number',
                  label: 'Default duration minutes',
                  min: 0,
                },
                {
                  name: 'price',
                  type: 'number',
                  label: 'Default price',
                  min: 0,
                  required: true,
                },
              ],
            },
            {
              name: 'variabili',
              type: 'array',
              label: 'Variabili',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'varNome',
                      type: 'text',
                      label: 'Nome variabile',
                    },
                    {
                      name: 'varDurationMinutes',
                      type: 'number',
                      label: 'Duration minutes',
                      min: 0,
                    },
                    {
                      name: 'varPrice',
                      type: 'number',
                      label: 'Price',
                      min: 0,
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'pacchetti',
              type: 'array',
              label: 'Pacchetti',
              labels: {
                singular: 'Pacchetto',
                plural: 'Pacchetti',
              },
              admin: {
                components: {
                  RowLabel: '/components/admin/ServicePackageRowLabel',
                },
              },
              fields: [
                {
                  name: 'nomePacchetto',
                  type: 'text',
                  label: 'Nome pacchetto',
                  admin: {
                    readOnly: true,
                    hidden: true,
                  },
                },
                {
                  name: 'collegaAVariabile',
                  label: 'Collega a',
                  type: 'text',
                  defaultValue: 'default',
                  required: true,
                  admin: {
                    components: {
                      Field: '/components/admin/PackageVariableSelect',
                    },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'numeroSedute',
                      type: 'number',
                      label: 'Numero sedute',
                      min: 1,
                      required: true,
                    },
                    {
                      name: 'valorePacchetto',
                      type: 'number',
                      label: 'Valore pacchetto',
                      min: 0,
                      admin: {
                        readOnly: true,
                        description: 'Calcolato automaticamente: Price * Numero sedute',
                        components: {
                          Field: '/components/admin/PackageValueField',
                        },
                      },
                    },
                    {
                      name: 'prezzoPacchetto',
                      type: 'number',
                      label: 'Prezzo pacchetto',
                      min: 0,
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Serv. Info',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'tagline', type: 'text', localized: true },
                {
                  name: 'badge',
                  type: 'relationship',
                  relationTo: 'badges',
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'serviceType',
                  type: 'select',
                  required: true,
                  defaultValue: 'single',
                  options: [
                    { label: 'Singolo', value: 'single' },
                    { label: 'Pacchetto', value: 'package' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'gender',
                  type: 'select',
                  options: [
                    { label: 'Unisex', value: 'unisex' },
                    { label: 'Donna', value: 'female' },
                    { label: 'Uomo', value: 'male' },
                  ],
                },
                {
                  name: 'modality',
                  type: 'relationship',
                  relationTo: 'service-modalities',
                },
              ],
            },
          ],
        },
        {
          label: 'Serv. Gallery',
          fields: [
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'isCover',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'mediaType',
                      type: 'select',
                      options: [
                        { label: 'Image', value: 'image' },
                        { label: 'Video', value: 'video' },
                      ],
                      defaultValue: 'image',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Serv. Accordion',
          fields: [
            {
              name: 'heroAccordionTitle',
              type: 'ui',
              label: 'Hero + Accordion',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'results',
              type: 'richText',
              localized: true,
              label: 'Benefits / Results',
            },
            {
              name: 'indications',
              type: 'richText',
              localized: true,
              label: 'Areas & Use Cases',
            },
            {
              name: 'techProtocolShort',
              type: 'richText',
              localized: true,
            },
            {
              name: 'downtime',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Serv. Video',
          fields: [
            {
              name: 'videoSectionTitle',
              type: 'ui',
              label: 'Video',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'videoEmbedUrl',
              type: 'text',
              admin: {
                description: 'URL embed (YouTube/Vimeo)',
              },
            },
            {
              name: 'videoUpload',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'videoPoster',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Serv. Included',
          fields: [
            {
              name: 'includedSectionTitle',
              type: 'ui',
              label: 'What’s included',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'includedMedia',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: ({ siblingData }) => {
                const gallery = (siblingData as { gallery?: unknown })?.gallery
                if (!Array.isArray(gallery)) return false
                const ids = gallery
                  .map((item) => item?.media)
                  .map((media) => {
                    if (typeof media === 'string' || typeof media === 'number') return media
                    if (media && typeof media === 'object' && 'id' in media) {
                      return (media as { id?: string | number }).id
                    }
                    return null
                  })
                  .filter(Boolean)
                if (!ids.length) return false
                return { id: { in: ids } }
              },
              admin: {
                description: 'Seleziona un media dalla gallery del servizio.',
              },
            },
            {
              name: 'includedDescription',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Serv. FAQ',
          fields: [
            {
              name: 'faqSectionTitle',
              type: 'ui',
              label: 'FAQ',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'faqMedia',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: ({ siblingData }) => {
                const gallery = (siblingData as { gallery?: unknown })?.gallery
                if (!Array.isArray(gallery)) return false
                const ids = gallery
                  .map((item) => item?.media)
                  .map((media) => {
                    if (typeof media === 'string' || typeof media === 'number') return media
                    if (media && typeof media === 'object' && 'id' in media) {
                      return (media as { id?: string | number }).id
                    }
                    return null
                  })
                  .filter(Boolean)
                if (!ids.length) return false
                return { id: { in: ids } }
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'faqTitle', type: 'text', localized: true },
                { name: 'faqSubtitle', type: 'text', localized: true },
              ],
            },
            {
              name: 'faqItems',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'q', type: 'text', localized: true },
                    { name: 'a', type: 'textarea', localized: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Relazioni',
          fields: [
            {
              name: 'treatments',
              type: 'relationship',
              relationTo: 'treatments',
              hasMany: true,
              required: true,
            },
            {
              name: 'objective',
              type: 'relationship',
              relationTo: 'objectives',
            },
            {
              name: 'area',
              type: 'relationship',
              relationTo: 'areas',
            },
            {
              name: 'intent',
              type: 'relationship',
              relationTo: 'intents',
            },
            {
              name: 'zone',
              type: 'relationship',
              relationTo: 'zones',
            },
          ],
        },
        {
          label: 'Metadata',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'intentCode', type: 'text' },
                { name: 'zoneCode', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
