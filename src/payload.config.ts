import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { AuthAuditEvents } from './collections/AuthAuditEvents'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Needs } from './collections/Needs'
import { Textures } from './collections/Textures'
import { ProductAreas } from './collections/ProductAreas'
import { TimingProducts } from './collections/TimingProducts'
import { SkinTypes } from './collections/SkinTypes'
import { Brands } from './collections/Brands'
import { BrandLines } from './collections/BrandLines'
import { RoutineSteps } from './collections/RoutineSteps'
import { RoutineStepRules } from './collections/RoutineStepRules'
import { BrandLineNeedsPriority } from './collections/BrandLineNeedsPriority'
import { Attributes } from './collections/Attributes'
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
import { ServiceModalities } from './collections/ServiceModalities'
import { Badges } from './collections/Badges'
import { Promotions } from './collections/Promotions'
import { Programs } from './collections/Programs'
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { Orders } from './collections/Orders'
import { OrderItems } from './collections/OrderItems'
import { OrderServiceItems } from './collections/OrderServiceItems'
import { OrderServiceSessions } from './collections/OrderServiceSessions'
import { ShopWebhookEvents } from './collections/ShopWebhookEvents'
import { ShopInventoryLocks } from './collections/ShopInventoryLocks'
import { ConsultationLeads } from './collections/ConsultationLeads'
import { Anagrafiche } from './collections/Anagrafiche'
import { SiteSettings } from './globals/SiteSettings'
import { InstagramSettings } from './globals/InstagramSettings'
import { siteSettingsSMTPAdapter } from './lib/email/siteSettingsSMTPAdapter'
import { seedShopTaxonomies } from './seed/shop-seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      graphics: {
        Logo: '/components/admin/AdminSidebarLogo',
      },
      beforeNavLinks: ['/components/admin/AdminSidebarHeader'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Orders,
    OrderItems,
    OrderServiceItems,
    OrderServiceSessions,
    ShopWebhookEvents,
    ShopInventoryLocks,
    Services,
    Treatments,
    Areas,
    Objectives,
    Intents,
    Zones,
    ServiceModalities,
    Programs,
    Products,
    Brands,
    BrandLines,
    Badges,
    Textures,
    Attributes,
    Needs,
    SkinTypes,
    ProductAreas,
    TimingProducts,
    Promotions,
    RoutineTemplates,
    RoutineTemplateSteps,
    RoutineTemplateStepProducts,
    RoutineSteps,
    RoutineStepRules,
    BrandLineNeedsPriority,
    Boosts,
    Exclusions,
    Pages,
    Posts,
    Media,
    Users,
    Anagrafiche,
    AuthAuditEvents,
    ConsultationLeads,
  ],
  globals: [SiteSettings, InstagramSettings],
  localization: {
    locales: ['it', 'en', 'ru'],
    defaultLocale: 'it',
    fallback: true,
  },
  editor: lexicalEditor(),
  email: siteSettingsSMTPAdapter(),
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
  hooks: {
    afterError: [
      async ({ collection, error, req }) => {
        if (collection?.slug === 'auth-audit-events') return
        const url = req.url || ''
        const eventType = url.includes('/api/users/login')
          ? 'login_failed'
          : url.includes('/api/users/forgot-password')
            ? 'forgot_password'
            : url.includes('/api/users/reset-password')
              ? 'reset_password'
              : null
        if (!eventType) return

        try {
          await req.payload.create({
            collection: 'auth-audit-events',
            overrideAccess: true,
            req,
            data: {
              eventType,
              success: false,
              email:
                typeof req.data === 'object' &&
                req.data &&
                'email' in req.data &&
                typeof req.data.email === 'string'
                  ? req.data.email
                  : undefined,
              user:
                req.user && typeof req.user === 'object' && typeof req.user.id === 'number'
                  ? req.user.id
                  : undefined,
              ip:
                req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                req.headers.get('x-real-ip')?.trim() ||
                undefined,
              userAgent: req.headers.get('user-agent') || undefined,
              message: error?.message || 'Authentication endpoint error.',
              meta: {
                path: url,
              },
            },
          })
        } catch (auditError) {
          req.payload.logger.error({
            err: auditError,
            msg: 'Failed to write auth audit event.',
          })
        }
      },
    ],
  },
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
