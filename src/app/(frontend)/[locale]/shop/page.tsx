import { notFound } from 'next/navigation'

import { getPayload } from 'payload'

import { getDictionary, isLocale } from '@/lib/i18n'
import configPromise from '@/payload.config'

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
  const payload = await getPayload({ config: await configPromise })
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

  const buildQuery = (next: {
    page?: number
    sort?: string
    perPage?: number
    view?: string
  }) => {
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

  return (
    <div className="page shop-page">
      <section className="shop-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span>/</span>
          <span>Negozio</span>
        </div>
        <div className="shop-title">
          <h1>{t.shop.title}</h1>
        </div>
      </section>
      <section className="shop-layout">
        <aside className="shop-filters">
          <h3>Filtra per:</h3>
          <div className="filter-group">
            <h4>Brand</h4>
            {brandOptions.length ? (
              brandOptions.map((option) => (
                <a
                  key={option}
                  className={`filter-option filter-option-link${
                    option === brand ? ' active' : ''
                  }`}
                  href={`?brand=${encodeURIComponent(option)}`}
                >
                  <span className="fake-radio" />
                  <span>{option}</span>
                </a>
              ))
            ) : (
              <span className="filter-note">Nessun brand disponibile</span>
            )}
            {brand && (
              <a className="filter-clear" href={query ? `?q=${encodeURIComponent(query)}` : '?'}>
                Rimuovi filtro
              </a>
            )}
          </div>
          <div className="filter-group">
            <h4>Prezzo</h4>
            <div className="price-range">
              <div className="range-track" />
              <div className="range-handles">
                <span />
                <span />
              </div>
            </div>
            <span className="filter-note">€ 0 - 200</span>
          </div>
          <div className="filter-group">
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
              <label key={label} className="filter-option">
                <input type="checkbox" />
                <span>{label}</span>
                <span className="count">({count})</span>
              </label>
            ))}
          </div>
        </aside>
        <div className="shop-results">
          <div className="shop-toolbar">
            <div className="shop-toolbar-left">
              <details className="sort-dropdown">
                <summary>Ordinamento</summary>
                <div className="sort-options">
                  <a href={buildQuery({ sort: 'recent', page: 1 })}>
                    Prodotti - dal più recente
                  </a>
                  <a href={buildQuery({ sort: 'oldest', page: 1 })}>
                    Prodotti - dal meno recente
                  </a>
                  <a href={buildQuery({ sort: 'priceAsc', page: 1 })}>
                    Prezzo - dal più basso
                  </a>
                  <a href={buildQuery({ sort: 'priceDesc', page: 1 })}>
                    Prezzo - dal più alto
                  </a>
                  <a href={buildQuery({ sort: 'alphaAsc', page: 1 })}>
                    Ordine alfabetico A-Z
                  </a>
                  <a href={buildQuery({ sort: 'alphaDesc', page: 1 })}>
                    Ordine alfabetico Z-A
                  </a>
                </div>
              </details>
              <details className="sort-dropdown">
                <summary>Prodotti per pagina</summary>
                <div className="sort-options">
                  {perPageOptions.map((option) => (
                    <a key={option} href={buildQuery({ perPage: option, page: 1 })}>
                      {option}
                    </a>
                  ))}
                </div>
              </details>
              <details className="sort-dropdown">
                <summary>Visualizza</summary>
                <div className="sort-options">
                  <a href={buildQuery({ view: 'grid', page: 1 })}>Griglia</a>
                  <a href={buildQuery({ view: 'list', page: 1 })}>Lista</a>
                </div>
              </details>
              <div className="pagination">
                {page > 1 && <a href={buildQuery({ page: page - 1 })}>‹</a>}
                {pageNumbers.map((pageNumber) => (
                  <a
                    key={pageNumber}
                    href={buildQuery({ page: pageNumber })}
                    className={pageNumber === page ? 'active' : undefined}
                  >
                    {pageNumber}
                  </a>
                ))}
                {page < totalPages && <a href={buildQuery({ page: page + 1 })}>›</a>}
              </div>
            </div>
            <div className="shop-toolbar-right">
              <form method="get" className="filter-search">
                <input
                  id="shop-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Cerca..."
                />
              </form>
            </div>
          </div>
          <div className={view === 'list' ? 'shop-list' : 'shop-grid'}>
            {filteredProducts.map((product) => {
              const image = product.images?.[0]
              const imageData =
                image && typeof image === 'object' && 'url' in image
                  ? {
                      url: image.url || '',
                      alt: image.alt || product.title || 'Product image',
                    }
                  : null
              return (
                <div className={view === 'list' ? 'shop-card list' : 'shop-card'} key={product.id}>
                  <div className="shop-image">
                    {imageData?.url ? (
                      <img src={imageData.url} alt={imageData.alt} loading="lazy" />
                    ) : (
                      <div className="shop-image-placeholder" />
                    )}
                  </div>
                  <div className="shop-info">
                    <h3>{product.title || t.placeholders.productName}</h3>
                    <p className="price">{formatPrice(product.price || 0)}</p>
                  </div>
                  <button className="shop-cta" type="button">
                    Aggiungi al carrello
                  </button>
                </div>
              )
            })}
          </div>
          {!filteredProducts.length && <p className="note">{t.shop.note}</p>}
        </div>
      </section>
    </div>
  )
}
