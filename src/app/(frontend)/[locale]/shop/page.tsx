import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { ShopNavigatorSection } from '@/components/shop-navigator/ShopNavigatorSection'
import type { ShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import type {
  CategoryData,
  LineData,
  NeedData,
  ProductCard,
  RoutineStepData,
  TextureData,
} from '@/components/shop-navigator/types/navigator'

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{
    q?: string
    brand?: string
    sort?: string
    perPage?: string
    page?: string
    view?: string
  }>
}) {
  const { locale } = await params
  const query = (await searchParams)?.q?.trim() || ''
  const brand = (await searchParams)?.brand?.trim() || ''
  const sort = (await searchParams)?.sort?.trim() || 'recent'
  const perPageRaw = (await searchParams)?.perPage?.trim() || '12'
  const perPage = Number.parseInt(perPageRaw, 10)
  const pageRaw = (await searchParams)?.page?.trim() || '1'
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1)
  const view = (await searchParams)?.view?.trim() || 'grid'

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const [productsResult, needsResult, categoriesResult, routineStepsResult, linesResult, texturesResult] =
    await Promise.all([
      payload.find({
        collection: 'products',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 500,
        sort: '-createdAt',
        where: {
          active: { equals: true },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          currency: true,
          brand: true,
          coverImage: true,
          images: true,
          needs: true,
          categories: true,
          routineSteps: true,
          lines: true,
          textures: true,
          createdAt: true,
        },
      }),
      payload.find({
        collection: 'needs',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
        },
      }),
      payload.find({
        collection: 'categories',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 500,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          parent: true,
          isMakeupRoot: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
        },
      }),
      payload.find({
        collection: 'routine-steps',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
        },
      }),
      payload.find({
        collection: 'lines',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
        },
      }),
      payload.find({
        collection: 'textures',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
        },
      }),
    ])

  const resolveMedia = (media: unknown) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || null, mimeType: typed.mimeType || null }
  }

  const toIdArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value
      .map((item) => {
        if (item && typeof item === 'object' && 'id' in item) return String(item.id)
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        return ''
      })
      .filter(Boolean)
  }

  const toId = (value: unknown): string | undefined => {
    if (value && typeof value === 'object' && 'id' in value) return String(value.id)
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    return undefined
  }

  const needs: NeedData[] = needsResult.docs.map((need) => ({
    id: String(need.id),
    label: need.name || '',
    description: need.description || undefined,
    slug: need.slug || undefined,
    order: need.order ?? 0,
    boxTagline: need.boxTagline || undefined,
    cardTitle: need.cardTitle || undefined,
    cardTagline: need.cardTagline || undefined,
    cardMedia: resolveMedia(need.cardMedia),
  }))

  const categories: CategoryData[] = categoriesResult.docs.map((category) => ({
    id: String(category.id),
    label: category.name || '',
    description: category.description || undefined,
    slug: category.slug || undefined,
    parentId: toId(category.parent),
    isMakeupRoot: Boolean(category.isMakeupRoot),
    order: category.order ?? 0,
    boxTagline: category.boxTagline || undefined,
    cardTitle: category.cardTitle || undefined,
    cardTagline: category.cardTagline || undefined,
    cardMedia: resolveMedia(category.cardMedia),
  }))

  const routineSteps: RoutineStepData[] = routineStepsResult.docs.map((step) => ({
    id: String(step.id),
    label: step.name || '',
    description: step.description || undefined,
    slug: step.slug || undefined,
    order: step.order ?? 0,
    boxTagline: step.boxTagline || undefined,
    cardTitle: step.cardTitle || undefined,
    cardTagline: step.cardTagline || undefined,
    cardMedia: resolveMedia(step.cardMedia),
  }))

  const lines: LineData[] = linesResult.docs.map((line) => ({
    id: String(line.id),
    label: line.name || '',
    description: line.description || undefined,
    slug: line.slug || undefined,
    order: line.order ?? 0,
    boxTagline: line.boxTagline || undefined,
    cardTitle: line.cardTitle || undefined,
    cardTagline: line.cardTagline || undefined,
    cardMedia: resolveMedia(line.cardMedia),
  }))

  const textures: TextureData[] = texturesResult.docs.map((texture) => ({
    id: String(texture.id),
    label: texture.name || '',
    description: texture.description || undefined,
    slug: texture.slug || undefined,
    order: texture.order ?? 0,
    boxTagline: texture.boxTagline || undefined,
    cardTitle: texture.cardTitle || undefined,
    cardTagline: texture.cardTagline || undefined,
    cardMedia: resolveMedia(texture.cardMedia),
  }))

  const products: ProductCard[] = productsResult.docs.map((product) => ({
    id: String(product.id),
    title: product.title || '',
    slug: product.slug || undefined,
    price: product.price ?? undefined,
    currency: product.currency || undefined,
    brand: product.brand || undefined,
    coverImage: resolveMedia(product.coverImage),
    images: Array.isArray(product.images)
      ? product.images
          .map((media) => resolveMedia(media))
          .filter((media): media is NonNullable<ReturnType<typeof resolveMedia>> => Boolean(media))
      : [],
    needIds: toIdArray(product.needs),
    categoryIds: toIdArray(product.categories),
    routineStepIds: toIdArray(product.routineSteps),
    lineIds: toIdArray(product.lines),
    textureIds: toIdArray(product.textures),
    createdAt: typeof product.createdAt === 'string' ? product.createdAt : undefined,
  }))

  const navigatorData: ShopNavigatorData = {
    needs,
    categories,
    routineSteps,
    lines,
    textures,
    products,
  }

  return (
    <div className="min-h-screen flex flex-col gap-[var(--s32)] px-[8vw]">
      <section className="grid grid-cols-[1fr_auto_1fr] items-center pt-4 max-[1100px]:grid-cols-1 max-[1100px]:gap-4 max-[1100px]:text-center">
        <div className="flex gap-2 text-[0.8rem] uppercase tracking-[0.2em] max-[1100px]:justify-center">
          <span>Home</span>
          <span>/</span>
          <span>Negozio</span>
        </div>
        <div className="text-center">
          <h1 className="text-[2.4rem]">{t.shop.title}</h1>
        </div>
      </section>
      <ShopNavigatorSection
        data={navigatorData}
        initialClassicParams={{
          query,
          brand,
          sort,
          perPage,
          page,
          view,
        }}
        productBasePath={`/${locale}/shop`}
      />
    </div>
  )
}
