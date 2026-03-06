import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
import { AccountAestheticProfiles } from './collections/AccountAestheticProfiles'
import { SiteSettings } from './globals/SiteSettings'
import { InstagramSettings } from './globals/InstagramSettings'
import { siteSettingsSMTPAdapter } from '../lib/server/email/siteSettingsSMTPAdapter'
import { seedShopTaxonomies } from '../seed/shop-seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isPlaceholderToken = (value: string): boolean => {
  const normalized = value.trim().toLowerCase()
  return normalized === 'host' || normalized === 'user' || normalized === 'password' || normalized === 'database'
}

const isUsableDatabaseUrl = (value: string | undefined): value is string => {
  if (!value) return false
  const trimmed = value.trim()
  if (!trimmed) return false

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.trim().toLowerCase()
    const user = parsed.username.trim().toLowerCase()
    const dbName = parsed.pathname.replace('/', '').trim().toLowerCase()

    if (!host || isPlaceholderToken(host)) return false
    if (user && isPlaceholderToken(user)) return false
    if (dbName && isPlaceholderToken(dbName)) return false

    return true
  } catch {
    return false
  }
}

const pickDatabaseUrl = (
  candidates: Array<{ name: string; value: string | undefined }>,
): { name: string; value: string } | null => {
  for (const candidate of candidates) {
    if (isUsableDatabaseUrl(candidate.value)) {
      return { name: candidate.name, value: candidate.value.trim() }
    }
  }

  return null
}

const normalizePrismaSslCompat = (value: string): string => {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.trim().toLowerCase()
    const sslMode = parsed.searchParams.get('sslmode')?.trim().toLowerCase()
    const hasLibpqCompat = parsed.searchParams.has('uselibpqcompat')

    if (host.endsWith('db.prisma.io') && sslMode === 'require' && !hasLibpqCompat) {
      parsed.searchParams.set('uselibpqcompat', 'true')
      return parsed.toString()
    }

    return value
  } catch {
    return value
  }
}

const blobReadWriteToken =
  (process.env.VERCEL_ENV === 'production'
    ? process.env.PROD_READ_WRITE_TOKEN
    : process.env.STG_READ_WRITE_TOKEN) || ''
const hasValidBlobToken = /^vercel_blob_rw_[^_]+_.+/.test(blobReadWriteToken)
// Blob storage must stay enabled in CI as well, otherwise /api/media/file falls back
// to local filesystem and image fetches fail for Blob-backed media.
const enableBlobPlugin = hasValidBlobToken
// Prefer Vercel Postgres runtime URL for `pg` pool (Payload uses `pg`, not Prisma).
// Use NON_POOLING only as a fallback (or for one-off scripts/migrations).
const isVercelProduction = process.env.VERCEL_ENV === 'production'
const isCI = process.env.CI === 'true'
const databaseUrlCandidate = isCI
  ? pickDatabaseUrl([
      { name: 'DATABASE_URL', value: process.env.DATABASE_URL },
      { name: 'POSTGRES_URL', value: process.env.POSTGRES_URL },
      { name: 'POSTGRES_URL_NON_POOLING', value: process.env.POSTGRES_URL_NON_POOLING },
      { name: 'POSTGRES_PRISMA_URL', value: process.env.POSTGRES_PRISMA_URL },
    ])
  : isVercelProduction
  ? pickDatabaseUrl([
      { name: 'PROD_POSTGRES_URL', value: process.env.PROD_POSTGRES_URL },
      { name: 'PROD_DATABASE_URL', value: process.env.PROD_DATABASE_URL },
      { name: 'POSTGRES_URL', value: process.env.POSTGRES_URL },
      { name: 'DATABASE_URL', value: process.env.DATABASE_URL },
      { name: 'PROD_PRISMA_DATABASE_URL', value: process.env.PROD_PRISMA_DATABASE_URL },
      { name: 'POSTGRES_URL_NON_POOLING', value: process.env.POSTGRES_URL_NON_POOLING },
      { name: 'POSTGRES_PRISMA_URL', value: process.env.POSTGRES_PRISMA_URL },
    ])
  : pickDatabaseUrl([
      { name: 'STG_POSTGRES_URL', value: process.env.STG_POSTGRES_URL },
      { name: 'STG_DATABASE_URL', value: process.env.STG_DATABASE_URL },
      { name: 'POSTGRES_URL', value: process.env.POSTGRES_URL },
      { name: 'DATABASE_URL', value: process.env.DATABASE_URL },
      { name: 'STG_PRISMA_DATABASE_URL', value: process.env.STG_PRISMA_DATABASE_URL },
      { name: 'POSTGRES_URL_NON_POOLING', value: process.env.POSTGRES_URL_NON_POOLING },
      { name: 'POSTGRES_PRISMA_URL', value: process.env.POSTGRES_PRISMA_URL },
    ])

const databaseUrlSource = databaseUrlCandidate?.name ?? 'none'
export const databaseUrl = databaseUrlCandidate
  ? normalizePrismaSslCompat(databaseUrlCandidate.value)
  : ''
const enableSchemaPush = process.env.NODE_ENV === 'development'
const dbPoolMaxInput = Number(process.env.PAYLOAD_DB_POOL_MAX || '4')
const dbPoolMinInput = Number(process.env.PAYLOAD_DB_POOL_MIN || '0')
const dbPoolConnectTimeoutInput = Number(process.env.PAYLOAD_DB_CONNECT_TIMEOUT_MS || '30000')
const dbPoolIdleTimeoutInput = Number(process.env.PAYLOAD_DB_IDLE_TIMEOUT_MS || '30000')
const dbPoolMax = Number.isFinite(dbPoolMaxInput) && dbPoolMaxInput > 0 ? Math.floor(dbPoolMaxInput) : 4
const dbPoolMin = Number.isFinite(dbPoolMinInput) && dbPoolMinInput >= 0 ? Math.floor(dbPoolMinInput) : 0
const dbPoolConnectTimeout =
  Number.isFinite(dbPoolConnectTimeoutInput) && dbPoolConnectTimeoutInput > 0
    ? Math.floor(dbPoolConnectTimeoutInput)
    : 30_000
const dbPoolIdleTimeout =
  Number.isFinite(dbPoolIdleTimeoutInput) && dbPoolIdleTimeoutInput > 0
    ? Math.floor(dbPoolIdleTimeoutInput)
    : 30_000
const databaseMeta = (() => {
  if (!databaseUrl) return null
  try {
    const parsed = new URL(databaseUrl)
    return {
      host: parsed.hostname || 'n/a',
      database: parsed.pathname.replace('/', '') || 'n/a',
      user: parsed.username || 'n/a',
    }
  } catch {
    return null
  }
})()
export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      graphics: {
        Logo: '/admin/components/AdminSidebarLogo',
      },
      beforeNavLinks: ['/admin/components/AdminSidebarHeader'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    AccountAestheticProfiles,
    Anagrafiche,
    ConsultationLeads,
    Orders,
    OrderServiceSessions,
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
    OrderItems,
    OrderServiceItems,
    ShopWebhookEvents,
    ShopInventoryLocks,
    AuthAuditEvents,
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
    outputFile: path.resolve(dirname, 'generated/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
      // Tunable pool sizing: previous hard-coded max=2 caused admin lock/save timeouts under load.
      max: dbPoolMax,
      min: dbPoolMin,
      connectionTimeoutMillis: dbPoolConnectTimeout,
      idleTimeoutMillis: dbPoolIdleTimeout,
    },
    // Shared environments (CI/staging/prod) must not mutate schema implicitly.
    // Keep automatic schema push only for true local development.
    push: enableSchemaPush,
  }),
  sharp,
  plugins: enableBlobPlugin
    ? [
        vercelBlobStorage({
          collections: {
            media: true,
          },
          token: blobReadWriteToken,
        }),
      ]
    : [],
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
    try {
      if (databaseMeta) {
        payload.logger.info(
          `[db] source=${databaseUrlSource} host=${databaseMeta.host} database=${databaseMeta.database} user=${databaseMeta.user}`,
        )
        payload.logger.info(
          `[db] pool max=${dbPoolMax} min=${dbPoolMin} connectTimeoutMs=${dbPoolConnectTimeout} idleTimeoutMs=${dbPoolIdleTimeout}`,
        )
      }

      const disableShopSeed = process.env.PAYLOAD_DISABLE_SHOP_SEED === 'true'
      const isProduction = process.env.NODE_ENV === 'production'
      if (!isProduction) {
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
          where: {
            pageKey: {
              in: [...pageKeys],
            },
          },
        })
        const existingKeys = new Set(
          existing.docs.map((doc) => (typeof doc.pageKey === 'string' ? doc.pageKey : '')),
        )

        for (const key of pageKeys) {
          if (!existingKeys.has(key)) {
            try {
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
            } catch (createError) {
              const isDuplicateKeyError =
                typeof createError === 'object' &&
                createError !== null &&
                'data' in createError &&
                typeof createError.data === 'object' &&
                createError.data !== null &&
                'errors' in createError.data &&
                Array.isArray(createError.data.errors) &&
                createError.data.errors.some(
                  (error) =>
                    typeof error === 'object' &&
                    error !== null &&
                    'path' in error &&
                    error.path === 'pageKey' &&
                    'message' in error &&
                    error.message === 'Value must be unique',
                )

              if (!isDuplicateKeyError) {
                throw createError
              }
            }
          }
        }
      }

      if (!disableShopSeed && !isProduction) {
        await seedShopTaxonomies(payload)
      }
    } catch (error) {
      payload.logger.warn({
        msg: 'Skipping onInit seeds because database is not ready yet.',
        err: error,
      })
    }
  },
})
