import 'dotenv/config'

import { getPayload } from 'payload'

import configPromise from '../src/payload.config'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const parsePrice = (value: string) => {
  const cleaned = value.replace(/[€\s]/g, '').replace(',', '.')
  if (!cleaned || cleaned.toLowerCase() === 'n/d') return null
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const services = [
  {
    category: 'Trattamenti viso di base',
    name: 'Pulizia Viso Personalizzato (idratante, anti age, anti acne, …)',
    duration: '60 min',
    price: '€110,00',
  },
  {
    category: 'Trattamenti viso di base',
    name: 'Pulizia Viso Personalizzato (idratante, anti age, anti acne, …)',
    duration: '90 min',
    price: '€135,00',
  },
  {
    category: 'Trattamenti viso di base',
    name: 'Pulizia viso con Ultrasuoni etc',
    duration: '75 min',
    price: '€120,00',
  },
  {
    category: 'Trattamenti viso di base',
    name: 'Pulizia Viso con Ultrasuoni etc',
    duration: '90 min',
    price: '€135,00',
  },
  {
    category: 'Trattamenti viso di base',
    name: 'Pulizia di viso + 15 min di Thermo active + maschera',
    duration: '90 min',
    price: '€125,00',
  },
  {
    category: 'Trattamenti Viso con macchinari',
    name: 'RF lifting viso',
    duration: '30 min',
    price: '€50,00',
  },
  {
    category: 'Trattamenti Viso con macchinari',
    name: 'Rf lifting collo + decoltee',
    duration: '30 min',
    price: '€60,00',
  },
  {
    category: 'Trattamenti Viso con macchinari',
    name: 'Hydroficial treatment',
    duration: '90 min',
    price: '€170,00',
  },
  {
    category: 'Trattamenti viso con HL',
    name: 'Trat-to Renew Formula anti-fotoinvecchiamento con Thermoacti',
    duration: '75 min',
    price: '€90,00',
  },
  {
    category: 'Laser Donna',
    name: 'Basette',
    duration: '30 min',
    price: '€50,00',
  },
  {
    category: 'Laser Donna',
    name: 'Collo anteriore',
    duration: '30 min',
    price: '€60,00',
  },
  {
    category: 'Laser Donna',
    name: 'Collo posteriore',
    duration: '30 min',
    price: '€60,00',
  },
  {
    category: 'Laser Donna',
    name: 'Fronte Bassa',
    duration: '30 min',
    price: '€50,00',
  },
  {
    category: 'Laser Donna',
    name: 'Guance',
    duration: '30 min',
    price: '€60,00',
  },
  {
    category: 'Laser Donna',
    name: 'Labbra',
    duration: '30 min',
    price: '€40,00',
  },
  {
    category: 'Laser Donna',
    name: 'Mento',
    duration: '30 min',
    price: '€45,00',
  },
  {
    category: 'Laser Donna',
    name: 'Viso totale',
    duration: '45 min',
    price: '€150,00',
  },
  {
    category: 'Laser Donna',
    name: 'Zigomi',
    duration: '30 min',
    price: '€40,00',
  },
  {
    category: 'Laser Donna',
    name: '1/2 gamba',
    duration: '30 min',
    price: '€100,00',
  },
  {
    category: 'Laser Donna',
    name: 'Addome',
    duration: '30 min',
    price: '€120,00',
  },
  {
    category: 'Laser Donna',
    name: 'Ascelle',
    duration: '30 min',
    price: '€60,00',
  },
  {
    category: 'Laser Donna',
    name: 'Avanbraccia',
    duration: '30 min',
    price: '€85,00',
  },
  {
    category: 'Laser Donna',
    name: 'Braccia',
    duration: '30 min',
    price: '€70,00',
  },
  {
    category: 'Laser Donna',
    name: 'Cosce',
    duration: '30 min',
    price: '€145,00',
  },
  {
    category: 'Laser Donna',
    name: 'Decollete',
    duration: '30 min',
    price: '€90,00',
  },
  {
    category: 'Laser Donna',
    name: 'Gambe totali',
    duration: '30 min',
    price: '€230,00',
  },
  {
    category: 'Laser Donna',
    name: 'Glutei',
    duration: '30 min',
    price: '€110,00',
  },
  {
    category: 'Laser Donna',
    name: 'Inguine base',
    duration: '30 min',
    price: '€70,00',
  },
  {
    category: 'Laser Donna',
    name: 'Inguine tot',
    duration: '30 min',
    price: '€110,00',
  },
  {
    category: 'Laser Donna',
    name: 'Linea alba',
    duration: '30 min',
    price: '€45,00',
  },
  {
    category: 'Laser Donna',
    name: 'Mani',
    duration: '30 min',
    price: '€40,00',
  },
  {
    category: 'Laser Donna',
    name: 'Pedi',
    duration: '30 min',
    price: '€40,00',
  },
  {
    category: 'Laser Donna',
    name: 'Schiena Interiore',
    duration: '30 min',
    price: '€90,00',
  },
  {
    category: 'Laser Donna',
    name: 'Schiena superiore',
    duration: '30 min',
    price: '€90,00',
  },
  {
    category: 'Laser Donna',
    name: 'Schiena totale',
    duration: '45 min',
    price: '€160,00',
  },
  {
    category: 'Laser Donna',
    name: 'Seno',
    duration: '30 min',
    price: '€35,00',
  },
  {
    category: 'Laser Donna',
    name: 'Spalle',
    duration: '30 min',
    price: '€75,00',
  },
  {
    category: 'Laser Donna',
    name: 'Sterno',
    duration: '30 min',
    price: '€50,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Viso Seduta singola',
    duration: '45 min',
    price: '€50,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Viso 5 sedute',
    duration: '35 min',
    price: '€220,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Viso 10 sedute',
    duration: '35 min',
    price: '€450,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Corpo base + 1 focus (1 seduta)',
    duration: '40 min',
    price: '€60,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Corpo base + 1 focus (10 sedute)',
    duration: '45 min',
    price: '€540,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Corpo base + 1 focus (15 sedute)',
    duration: '45 min',
    price: '€760,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Corpo base + 1 focus (20 sedute)',
    duration: '45 min',
    price: '€950,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Corpo base + 2 focus seduta singola',
    duration: '40 min',
    price: '€75,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Corpo base + 2 focus (10 sedute)',
    duration: '45 min',
    price: '€670,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Corpo base + 2 focus (15 sedute)',
    duration: '45 min',
    price: '€950,00',
  },
  {
    category: 'Icoon',
    name: 'Icoon Corpo base + 2 focus (20 sedute)',
    duration: '45 min',
    price: '€1190,00',
  },
  {
    category: 'Icoon',
    name: 'Icoone Corpo promo 5',
    duration: '60 min',
    price: '€400,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio Viso Kobido 60 min',
    duration: '60 min',
    price: '€70,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio Viso Kobido 90 min',
    duration: '90 min',
    price: '€100,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio Viso Lifting Express',
    duration: '45 min',
    price: '€50,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio Viso Lifting profondo',
    duration: '60 min',
    price: '€70,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio corpo LimfoDrenante',
    duration: '90 min',
    price: '€70,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio corpo De contrutunante',
    duration: '45 min',
    price: '€50,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio corpo De contrutunante',
    duration: '60 min',
    price: '€65,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio Drenante',
    duration: '60 min',
    price: '€55,00',
  },
  {
    category: 'Massaggi',
    name: 'Massaggio Ayurvedico',
    duration: '90 min',
    price: '€80,00',
  },
  {
    category: 'Skin Analyser',
    name: 'Skin analyser consultation',
    duration: '15 min',
    price: '€0,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Basette',
    duration: '30 min',
    price: '€60,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Collo anteriore',
    duration: '30 min',
    price: '€70,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Collop Posteriore',
    duration: '30 min',
    price: '€70,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Fronte bassa',
    duration: '30 min',
    price: '€60,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Guance',
    duration: '30 min',
    price: '€80,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Labbra',
    duration: '30 min',
    price: '€50,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Mento',
    duration: '30 min',
    price: '€60,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Zigomi',
    duration: '30 min',
    price: '€45,00',
  },
  {
    category: 'Laser Uomo Viso',
    name: 'Viso totale',
    duration: '30 min',
    price: '€170,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: '1/2 Gamba',
    duration: '30 min',
    price: '€120,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Ascelle',
    duration: '30 min',
    price: '€70,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Avanbraccia',
    duration: '30 min',
    price: '€90,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Braccia',
    duration: '30 min',
    price: '€75,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Braccia',
    duration: '30 min',
    price: '€75,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Cosce',
    duration: '60 min',
    price: '€170,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Gambe Totale',
    duration: '30 min',
    price: '€260,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Glutei',
    duration: '30 min',
    price: '€130,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Mani',
    duration: '30 min',
    price: '€50,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Pedi',
    duration: '30 min',
    price: '€50,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Schiena inferiore',
    duration: '30 min',
    price: '€120,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Schiena superiore',
    duration: '30 min',
    price: '€150,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Schiena totale',
    duration: '30 min',
    price: '€180,00',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Spalle',
    duration: '30 min',
    price: 'N/D',
  },
  {
    category: 'Laser Uomo Corpo',
    name: 'Torace totale',
    duration: '30 min',
    price: 'N/D',
  },
  {
    category: 'Massaggi pac',
    name: 'Massaggio Drenante - 5 sessione',
    duration: '60 min',
    price: '€275,00',
  },
  {
    category: 'IS Clinical',
    name: 'Red Carpet',
    duration: '90 min',
    price: '€150,00',
  },
  {
    category: 'IS Clinical',
    name: 'Foaming Enzyme Treatment',
    duration: '90 min',
    price: '€140,00',
  },
]

const run = async () => {
  const payload = await getPayload({ config: await configPromise })
  const slugCounts: Record<string, number> = {}
  const categoryMap = new Map<string, string | number>()

  for (const service of services) {
    const price = parsePrice(service.price)
    const baseSlug = slugify(`${service.category} ${service.name} ${service.duration}`)
    const count = slugCounts[baseSlug] ?? 0
    slugCounts[baseSlug] = count + 1
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`
    let categoryId = categoryMap.get(service.category)

    if (!categoryId) {
      const categorySlug = slugify(service.category)
      const existingCategory = await payload.find({
        collection: 'treatments',
        overrideAccess: true,
        limit: 1,
        where: {
          slug: {
            equals: categorySlug,
          },
        },
      })

      if (existingCategory.docs.length) {
        categoryId = existingCategory.docs[0].id
      } else {
        const createdCategory = await payload.create({
          collection: 'treatments',
          overrideAccess: true,
          locale: 'it',
          data: {
            boxName: service.category,
            cardName: service.category,
            slug: categorySlug,
            active: true,
          },
        })
        categoryId = createdCategory.id
      }

      categoryMap.set(service.category, categoryId)
    }

    const isPackage = /sedute|sessione|pacchetto|promo|x\s*\d/i.test(
      service.name.toLowerCase(),
    )
    const serviceType: 'single' | 'package' = isPackage ? 'package' : 'single'

    const dataPayload = {
      name: service.name,
      category: Number(categoryId),
      treatments: [Number(categoryId)],
      duration: service.duration,
      price: price ?? 0,
      active: true,
      slug,
      serviceType,
    }

    const existing = await payload.find({
      collection: 'services',
      overrideAccess: true,
      limit: 1,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    if (existing.docs.length) {
      await payload.update({
        collection: 'services',
        id: existing.docs[0].id,
        overrideAccess: true,
        locale: 'it',
        draft: false,
        data: dataPayload,
      })
    } else {
      await payload.create({
        collection: 'services',
        overrideAccess: true,
        locale: 'it',
        draft: false,
        data: dataPayload,
      })
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Inseriti ${services.length} servizi.`)
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
