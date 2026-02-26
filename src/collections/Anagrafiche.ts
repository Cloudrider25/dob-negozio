import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Anagrafiche: CollectionConfig = {
  slug: 'anagrafiche',
  admin: {
    useAsTitle: 'recordLabel',
    group: 'CRM',
    defaultColumns: ['recordLabel', 'customer', 'updatedAt'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const firstName = typeof data.firstName === 'string' ? data.firstName.trim() : ''
        const lastName = typeof data.lastName === 'string' ? data.lastName.trim() : ''
        const label = [firstName, lastName].filter(Boolean).join(' ').trim()
        if (label) {
          data.recordLabel = label
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req, context }) => {
        if (!data || context?.skipUserWriteThrough) return data

        const customerValue = data.customer ?? originalDoc?.customer
        const customerId =
          typeof customerValue === 'number'
            ? customerValue
            : customerValue && typeof customerValue === 'object' && 'id' in customerValue
              ? Number((customerValue as { id?: unknown }).id)
              : typeof customerValue === 'string'
                ? Number(customerValue)
                : NaN

        if (!Number.isFinite(customerId)) return data

        const normalizeAddresses = (value: unknown) =>
          Array.isArray(value)
            ? value.map((raw, index) => {
                const a = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
                return {
                  firstName: typeof a.firstName === 'string' ? a.firstName : undefined,
                  lastName: typeof a.lastName === 'string' ? a.lastName : undefined,
                  company: typeof a.company === 'string' ? a.company : undefined,
                  streetAddress: typeof a.streetAddress === 'string' ? a.streetAddress : undefined,
                  apartment: typeof a.apartment === 'string' ? a.apartment : undefined,
                  city: typeof a.city === 'string' ? a.city : undefined,
                  province: typeof a.province === 'string' ? a.province : undefined,
                  postalCode: typeof a.postalCode === 'string' ? a.postalCode : undefined,
                  country: typeof a.country === 'string' ? a.country : 'Italy',
                  phone: typeof a.phone === 'string' ? a.phone : undefined,
                  isDefault:
                    typeof a.isDefault === 'boolean'
                      ? a.isDefault
                      : index === 0,
                }
              })
            : undefined

        const userPatch: Record<string, unknown> = {}
        if ('firstName' in data) userPatch.firstName = typeof data.firstName === 'string' ? data.firstName : null
        if ('lastName' in data) userPatch.lastName = typeof data.lastName === 'string' ? data.lastName : null
        if ('email' in data) userPatch.email = typeof data.email === 'string' ? data.email : null
        if ('phone' in data) userPatch.phone = typeof data.phone === 'string' ? data.phone : null
        if ('addresses' in data) userPatch.addresses = normalizeAddresses(data.addresses) ?? []

        if (Object.keys(userPatch).length === 0) return data

        await req.payload.update({
          collection: 'users',
          id: customerId,
          overrideAccess: true,
          req,
          context: { skipAnagraficaSync: true },
          data: userPatch,
        })

        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Anag. generale',
          fields: [
            {
              name: 'recordLabel',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Label interno generato da nome e cognome.',
              },
            },
            {
              name: 'customer',
              type: 'relationship',
              relationTo: 'users',
              required: true,
              unique: true,
              filterOptions: {
                roles: {
                  contains: 'customer',
                },
              },
              admin: {
                description: 'Seleziona un utente con ruolo customer.',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'firstName', type: 'text', label: 'Nome' },
                { name: 'lastName', type: 'text', label: 'Cognome' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', label: 'Email' },
                { name: 'phone', type: 'text', label: 'Telefono' },
              ],
            },
            {
              name: 'addresses',
              type: 'array',
              label: 'Indirizzi',
              labels: {
                singular: 'Indirizzo',
                plural: 'Indirizzi',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'firstName', type: 'text', label: 'Nome' },
                    { name: 'lastName', type: 'text', label: 'Cognome' },
                    { name: 'company', type: 'text', label: 'Azienda' },
                  ],
                },
                { name: 'streetAddress', type: 'text', label: 'Indirizzo' },
                { name: 'apartment', type: 'text', label: 'Appartamento / Scala / Interno' },
                {
                  type: 'row',
                  fields: [
                    { name: 'postalCode', type: 'text', label: 'CAP' },
                    { name: 'city', type: 'text', label: 'Città' },
                    { name: 'province', type: 'text', label: 'Provincia' },
                    { name: 'country', type: 'text', label: 'Paese', defaultValue: 'Italy' },
                  ],
                },
                { name: 'phone', type: 'text', label: 'Telefono' },
                { name: 'isDefault', type: 'checkbox', label: 'Indirizzo predefinito' },
              ],
            },
            {
              name: 'generalNotes',
              type: 'textarea',
              label: 'Note anagrafiche',
            },
          ],
        },
        {
          label: 'Anag. Prodotti',
          fields: [
            {
              name: 'anagProductsPanel',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/admin/AnagProductsPurchasesList',
                },
              },
            },
          ],
        },
        {
          label: 'Anag. Servizi',
          fields: [
            {
              name: 'anagServicesPanel',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/admin/AnagServicesPurchasesList',
                },
              },
            },
          ],
        },
        {
          label: 'Anag. Cartella',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'lastAssessmentDate',
                  type: 'date',
                  label: 'Ultima valutazione',
                  admin: { date: { pickerAppearance: 'dayOnly' } },
                },
                {
                  name: 'skinType',
                  type: 'select',
                  label: 'Tipo di pelle',
                  options: [
                    { label: 'Normale', value: 'normal' },
                    { label: 'Secca', value: 'dry' },
                    { label: 'Grassa', value: 'oily' },
                    { label: 'Mista', value: 'combination' },
                    { label: 'Sensibile', value: 'sensitive' },
                  ],
                },
                {
                  name: 'skinSensitivity',
                  type: 'select',
                  label: 'Sensibilità',
                  options: [
                    { label: 'Bassa', value: 'low' },
                    { label: 'Media', value: 'medium' },
                    { label: 'Alta', value: 'high' },
                  ],
                },
                {
                  name: 'fitzpatrick',
                  type: 'select',
                  label: 'Fototipo (Fitzpatrick)',
                  options: ['I', 'II', 'III', 'IV', 'V', 'VI'].map((v) => ({ label: v, value: v })),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'hydrationLevel', type: 'number', label: 'Idratazione %', min: 0, max: 100 },
                { name: 'sebumLevel', type: 'number', label: 'Sebum %', min: 0, max: 100 },
                { name: 'elasticityLevel', type: 'number', label: 'Elasticità %', min: 0, max: 100 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'acneTendency', type: 'checkbox', label: 'Tendenza acneica' },
                { name: 'rosaceaTendency', type: 'checkbox', label: 'Tendenza rosacea' },
                {
                  name: 'hyperpigmentationTendency',
                  type: 'checkbox',
                  label: 'Tendenza iperpigmentazione',
                },
              ],
            },
            { name: 'allergies', type: 'textarea', label: 'Allergie note' },
            {
              name: 'contraindications',
              type: 'textarea',
              label: 'Controindicazioni / condizioni cliniche',
            },
            { name: 'medications', type: 'textarea', label: 'Farmaci / integratori rilevanti' },
            {
              name: 'pregnancyOrBreastfeeding',
              type: 'select',
              label: 'Gravidanza / allattamento',
              options: [
                { label: 'No', value: 'no' },
                { label: 'Gravidanza', value: 'pregnancy' },
                { label: 'Allattamento', value: 'breastfeeding' },
              ],
            },
            { name: 'homeCareRoutine', type: 'textarea', label: 'Routine domiciliare' },
            { name: 'treatmentGoals', type: 'textarea', label: 'Obiettivi trattamento' },
            { name: 'estheticianNotes', type: 'textarea', label: 'Note estetista' },
            { name: 'serviceRecommendations', type: 'textarea', label: 'Servizi consigliati' },
            { name: 'productRecommendations', type: 'textarea', label: 'Prodotti consigliati' },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
