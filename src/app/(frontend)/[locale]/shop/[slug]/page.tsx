import type { Metadata } from 'next'

import ProductDetailPage from '@/frontend/page-domains/shop/pages/product-detail/page/ProductDetailPage'
import { isLocale } from '@/lib/i18n/core'
import { buildSeoMetadata } from '@/lib/frontend/seo/metadata'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> => {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const product = result.docs[0]
  const name = product?.title || 'Prodotto estetico professionale'
  const description = product?.description || product?.tagline || `Acquista ${name} nello shop DOB Milano.`

  return buildSeoMetadata({
    locale,
    title: `${name} | Prodotto Estetico | DOB Milano Shop`,
    description,
    path: `/shop/${slug}`,
    seo: {
      title: product?.seo?.title,
      description: product?.seo?.description,
      canonicalPath: product?.seo?.canonicalPath,
      noIndex: product?.seo?.noIndex,
      image: product?.seo?.image,
    },
  })
}

export default ProductDetailPage
