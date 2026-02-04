import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Needs } from './collections/Needs'
import { Categories } from './collections/Categories'
import { Lines } from './collections/Lines'
import { Textures } from './collections/Textures'
import { ProductAreas } from './collections/ProductAreas'
import { TimingProducts } from './collections/TimingProducts'
import { SkinTypes } from './collections/SkinTypes'
import { Brands } from './collections/Brands'
import { BrandLines } from './collections/BrandLines'
import { RoutineSteps } from './collections/RoutineSteps'
import { RoutineStepRules } from './collections/RoutineStepRules'
import { BrandLineObjectivePriority } from './collections/BrandLineObjectivePriority'
import { Attributes } from './collections/Attributes'
import { ProductObjectives } from './collections/ProductObjectives'
import { ProductSkinTypes } from './collections/ProductSkinTypes'
import { ProductTimings } from './collections/ProductTimings'
import { ProductSteps } from './collections/ProductSteps'
import { RoutineTemplates } from './collections/RoutineTemplates'
import { RoutineTemplateSteps } from './collections/RoutineTemplateSteps'
import { RoutineTemplateStepProducts } from './collections/RoutineTemplateStepProducts'
import { Exclusions } from './collections/Exclusions'
import { Boosts } from './collections/Boosts'
import { Services } from './collections/Services'
import { Treatments } from './collections/Treatments'
import { Areas } from './collections/Areas'
import { Objectives } from './collections/Objectives'
import { Intents } from './collections/Intents'
import { Zones } from './collections/Zones'
import { Badges } from './collections/Badges'
import { Promotions } from './collections/Promotions'
import { Programs } from './collections/Programs'
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { InstagramSettings } from './globals/InstagramSettings'
import { seedShopTaxonomies } from './seed/shop-seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    ProductAreas,
    Needs,
    SkinTypes,
    TimingProducts,
    Brands,
    BrandLines,
    BrandLineObjectivePriority,
    RoutineSteps,
    RoutineStepRules,
    Attributes,
    ProductObjectives,
    ProductSkinTypes,
    ProductTimings,
    ProductSteps,
    RoutineTemplates,
    RoutineTemplateSteps,
    RoutineTemplateStepProducts,
    Exclusions,
    Boosts,
    Categories,
    Lines,
    Textures,
    Products,
    Areas,
    Objectives,
    Intents,
    Zones,
    Badges,
    Treatments,
    Services,
    Promotions,
    Programs,
    Posts,
    Pages,
  ],
  globals: [SiteSettings, InstagramSettings],
  localization: {
    locales: ['it', 'en', 'ru'],
    defaultLocale: 'it',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    const pageKeys = [
      'home',
      'services',
      'shop',
      'journal',
      'location',
      'our-story',
      'dob-protocol',
      'contact',
      'checkout',
    ] as const
    const existing = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: pageKeys.length,
    })
    const existingKeys = new Set(
      existing.docs.map((doc) => (typeof doc.pageKey === 'string' ? doc.pageKey : '')),
    )

    for (const key of pageKeys) {
      if (!existingKeys.has(key)) {
        await payload.create({
          collection: 'pages',
          data: {
            pageKey: key,
            heroTitleMode: 'fixed',
            heroStyle: 'style1',
          },
          locale: 'it',
          overrideAccess: true,
          draft: false,
        })
      }
    }

    const disableShopSeed = process.env.PAYLOAD_DISABLE_SHOP_SEED === 'true'
    const isProduction = process.env.NODE_ENV === 'production'
    if (!disableShopSeed && !isProduction) {
      await seedShopTaxonomies(payload)
    }
  },
})
