import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'

const formatPrice = (value: number) => `€${value.toFixed(2)}`

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
  const perPageOptions = [12, 24, 48, 96]

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const baseWhere = {
    active: {
      equals: true,
    },
  }

  const sortMap: Record<string, string> = {
    recent: '-createdAt',
    oldest: 'createdAt',
    priceAsc: 'price',
    priceDesc: '-price',
    alphaAsc: 'title',
    alphaDesc: '-title',
  }

  const products = await payload.find({
    collection: 'products',
    locale,
    overrideAccess: false,
    limit: perPageOptions.includes(perPage) ? perPage : 12,
    page,
    sort: sortMap[sort] || '-createdAt',
    depth: 1,
    where: baseWhere,
  })

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const matchesQuery = (product: (typeof products.docs)[number]) => {
    if (!query) return true
    const haystack = [
      product.title,
      product.description,
      product.slug,
      product.sku,
      product.lot,
      product.brand,
      product.price?.toString(),
      product.stock?.toString(),
      product.averageCost?.toString(),
      product.lastCost?.toString(),
      product.residualTotal?.toString(),
      product.total?.toString(),
    ]
      .filter(Boolean)
      .join(' ')

    const hay = normalize(haystack)
    const tokens = normalize(query).split(' ').filter(Boolean)
    return tokens.every((token) => hay.includes(token))
  }

  const matchesBrand = (product: (typeof products.docs)[number]) => {
    if (!brand) return true
    return (product.brand || '').toLowerCase() === brand.toLowerCase()
  }

  const filteredProducts = products.docs.filter((product) => {
    return matchesBrand(product) && matchesQuery(product)
  })

  const brandOptions = Array.from(
    new Set(
      products.docs
        .map((product) => product.brand)
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const buildQuery = (next: { page?: number; sort?: string; perPage?: number; view?: string }) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (brand) params.set('brand', brand)
    if (sort) params.set('sort', next.sort || sort)
    if (perPage) params.set('perPage', String(next.perPage || perPage))
    if (view) params.set('view', next.view || view)
    if (next.page && next.page > 1) params.set('page', String(next.page))
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }

  const totalPages = products.totalPages || 1
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const isListView = view === 'list'

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
      <section className="grid grid-cols-[300px_1fr] gap-10 max-[1100px]:grid-cols-1">
        <aside className="text-[0.85rem] uppercase tracking-[0.18em]">
          <h3>Filtra per:</h3>
          <div className="border-t pb-6 pt-5">
            <h4>Brand</h4>
            {brandOptions.length ? (
              brandOptions.map((option) => (
                <a
                  key={option}
                  className="flex items-center gap-2 text-[0.75rem] tracking-[0.12em]"
                  href={`?brand=${encodeURIComponent(option)}`}
                >
                  <span
                    className={`relative inline-flex h-[14px] w-[14px] items-center justify-center rounded-full border ${ option === brand ? 'before:absolute before:h-[6px] before:w-[6px] before:rounded-full before:' : '' }`}
                  />
                  <span>{option}</span>
                </a>
              ))
            ) : (
              <span className="mt-3 block text-[0.75rem] tracking-[0.12em]">
                Nessun brand disponibile
              </span>
            )}
            {brand && (
              <a
                className="mt-2 inline-flex text-[0.7rem] uppercase tracking-[0.12em]"
                href={query ? `?q=${encodeURIComponent(query)}` : '?'}
              >
                Rimuovi filtro
              </a>
            )}
          </div>
          <div className="border-t pb-6 pt-5">
            <h4>Prezzo</h4>
            <div className="relative h-6">
              <div className="mt-2 h-1 rounded-full" />
              <div className="absolute left-0 right-0 top-0 flex justify-between">
                <span className="h-4 w-4 rounded border" />
                <span className="h-4 w-4 rounded border" />
              </div>
            </div>
            <span className="mt-3 block text-[0.75rem] tracking-[0.12em]">
              € 0 - 200
            </span>
          </div>
          <div className="border-t pb-6 pt-5">
            <h4>Esigenze</h4>
            {[
              ['Age Care', 12],
              ['Skin Longevity', 12],
              ['Abbronzanti', 4],
              ['Antiage', 23],
              ['Azione Urto Globale', 3],
              ['Benessere', 1],
              ['Cellulite', 7],
              ['Doposole', 4],
            ].map(([label, count]) => (
              <label
                key={label}
                className="flex items-center gap-2 text-[0.75rem] tracking-[0.12em]"
              >
                <input type="checkbox" className="h-4 w-4" />
                <span>{label}</span>
                <span className="">({count})</span>
              </label>
            ))}
          </div>
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <details className="relative">
                <summary className="list-none cursor-pointer border px-3 py-2 text-[0.75rem] uppercase tracking-[0.18em]">
                  Ordinamento
                </summary>
                <div className="absolute left-0 top-[calc(100%+6px)] z-10 flex min-w-[240px] flex-col border">
                  <a
                    className="border-b px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em]"
                    href={buildQuery({ sort: 'recent', page: 1 })}
                  >
                    Prodotti - dal più recente
                  </a>
                  <a
                    className="border-b px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em]"
                    href={buildQuery({ sort: 'oldest', page: 1 })}
                  >
                    Prodotti - dal meno recente
                  </a>
                  <a
                    className="border-b px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em]"
                    href={buildQuery({ sort: 'priceAsc', page: 1 })}
                  >
                    Prezzo - dal più basso
                  </a>
                  <a
                    className="border-b px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em]"
                    href={buildQuery({ sort: 'priceDesc', page: 1 })}
                  >
                    Prezzo - dal più alto
                  </a>
                  <a
                    className="border-b px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em]"
                    href={buildQuery({ sort: 'alphaAsc', page: 1 })}
                  >
                    Ordine alfabetico A-Z
                  </a>
                  <a
                    className="px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em]"
                    href={buildQuery({ sort: 'alphaDesc', page: 1 })}
                  >
                    Ordine alfabetico Z-A
                  </a>
                </div>
              </details>
              <details className="relative">
                <summary className="list-none cursor-pointer border px-3 py-2 text-[0.75rem] uppercase tracking-[0.18em]">
                  Prodotti per pagina
                </summary>
                <div className="absolute left-0 top-[calc(100%+6px)] z-10 flex min-w-[240px] flex-col border">
                  {perPageOptions.map((option) => (
                    <a
                      key={option}
                      className="border-b px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em] last:border-b-0"
                      href={buildQuery({ perPage: option, page: 1 })}
                    >
                      {option}
                    </a>
                  ))}
                </div>
              </details>
              <details className="relative">
                <summary className="list-none cursor-pointer border px-3 py-2 text-[0.75rem] uppercase tracking-[0.18em]">
                  Visualizza
                </summary>
                <div className="absolute left-0 top-[calc(100%+6px)] z-10 flex min-w-[240px] flex-col border">
                  <a
                    className="border-b px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em]"
                    href={buildQuery({ view: 'grid', page: 1 })}
                  >
                    Griglia
                  </a>
                  <a
                    className="px-4 py-2 text-[0.75rem] uppercase tracking-[0.12em]"
                    href={buildQuery({ view: 'list', page: 1 })}
                  >
                    Lista
                  </a>
                </div>
              </details>
              <div className="flex gap-2 text-[0.8rem]">
                {page > 1 && <a href={buildQuery({ page: page - 1 })}>‹</a>}
                {pageNumbers.map((pageNumber) => (
                  <a
                    key={pageNumber}
                    href={buildQuery({ page: pageNumber })}
                    className={`border px-2 py-1 ${ pageNumber === page ? '' : '' }`}
                  >
                    {pageNumber}
                  </a>
                ))}
                {page < totalPages && <a href={buildQuery({ page: page + 1 })}>›</a>}
              </div>
            </div>
            <div className="ml-auto">
              <form
                method="get"
                className="flex flex-row text-[0.7rem] uppercase tracking-[0.18em]"
              >
                <input
                  id="shop-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Cerca..."
                  className="min-w-[220px] border px-3 py-2 text-[0.8rem]"
                />
              </form>
            </div>
          </div>
          <div
            className={
              isListView
                ? 'grid gap-2'
                : 'grid grid-cols-3 gap-3 max-[1200px]:grid-cols-2 max-[700px]:grid-cols-1'
            }
          >
            {filteredProducts.map((product) => {
              const image = product.coverImage ?? product.images?.[0]
              const imageData =
                image && typeof image === 'object' && 'url' in image
                  ? {
                      url: image.url || '',
                      alt: image.alt || product.title || 'Product image',
                      mimeType: image.mimeType || null,
                    }
                  : null
              return (
                <div
                  className={`flex w-full max-w-[320px] flex-col justify-self-center border /50 ${ isListView ? 'max-w-none flex-row items-center gap-6 p-4' : '' }`}
                  key={product.id}
                >
                  <div
                    className={`relative grid place-items-center overflow-hidden border-b /50 ${ isListView ? 'h-[160px] w-[160px] border-b-0' : 'h-[220px]' }`}
                  >
                    {imageData?.url ? (
                      imageData.mimeType?.startsWith('video/') ? (
                        <video
                          className="h-full w-full object-contain p-4"
                          src={imageData.url}
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <Image
                          className="object-contain p-4"
                          src={imageData.url}
                          alt={imageData.alt}
                          fill
                          sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )
                    ) : (
                      <div className="h-[70%] w-[70%] border" />
                    )}
                  </div>
                  <div className={`flex-1 p-5 text-center ${isListView ? 'p-0 text-left' : ''}`}>
                    <h3>{product.title || t.placeholders.productName}</h3>
                    <p className="font-semibold">
                      {formatPrice(product.price || 0)}
                    </p>
                  </div>
                  <button
                    className={`border-0 px-4 py-3 text-[0.7rem] uppercase tracking-[0.16em] ${ isListView ? 'ml-auto self-stretch' : '' }`}
                    type="button"
                  >
                    Aggiungi al carrello
                  </button>
                </div>
              )
            })}
          </div>
          {!filteredProducts.length && (
            <p className="text-[0.9rem]">{t.shop.note}</p>
          )}
        </div>
      </section>
    </div>
  )
}
