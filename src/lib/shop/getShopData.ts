import { cache } from 'react'

import { getPayloadClient } from '@/lib/getPayloadClient'
import type { Locale } from '@/lib/i18n'

export const getShopPageConfig = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'pages',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      pageKey: {
        equals: 'shop',
      },
    },
  })
})

export const getShopBaseData = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()

  const [
    productsResult,
    brandsResult,
    brandLinesResult,
    needsResult,
    productAreasResult,
    timingProductsResult,
    skinTypesResult,
    texturesResult,
    siteSettings,
  ] = await Promise.all([
    payload.find({
      collection: 'products',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 500,
      sort: '-createdAt',
      where: {
        active: { equals: true },
      },
      select: {
        title: true,
        description: true,
        slug: true,
        price: true,
        brand: true,
        brandLine: true,
        coverImage: true,
        images: true,
        needs: true,
        textures: true,
        productAreas: true,
        timingProducts: true,
        skinTypePrimary: true,
        skinTypeSecondary: true,
        createdAt: true,
      },
    }),
    payload.find({
      collection: 'brands',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 200,
      sort: 'sortOrder',
      where: {
        active: { equals: true },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    payload.find({
      collection: 'brand-lines',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 500,
      sort: 'sortOrder',
      where: {
        active: { equals: true },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
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
        productArea: true,
      },
    }),
    payload.find({
      collection: 'product-areas',
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
      collection: 'timing-products',
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
      collection: 'skin-types',
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
        order: true,
        boxTagline: true,
        cardTitle: true,
        cardTagline: true,
        cardMedia: true,
        productArea: true,
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
    payload.findGlobal({
      slug: 'site-settings',
      locale,
      overrideAccess: false,
      select: {
        phone: true,
        whatsapp: true,
        address: true,
      },
    }),
  ])

  return {
    productsResult,
    brandsResult,
    brandLinesResult,
    needsResult,
    productAreasResult,
    timingProductsResult,
    skinTypesResult,
    texturesResult,
    siteSettings,
  }
})

export const getShopRoutineData = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()

  const [
    routineTemplatesResult,
    routineTemplateStepsResult,
    routineTemplateStepProductsResult,
    routineStepsResult,
    routineStepRulesResult,
  ] = await Promise.all([
    payload.find({
      collection: 'routine-templates',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      sort: 'sortOrder',
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        productArea: true,
        timing: true,
        need: true,
        isMultibrand: true,
        brand: true,
      },
    }),
    payload.find({
      collection: 'routine-template-steps',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 5000,
      sort: 'stepOrder',
      select: {
        id: true,
        routineTemplate: true,
        routineStep: true,
        stepOrder: true,
        required: true,
      },
    }),
    payload.find({
      collection: 'routine-template-step-products',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 10000,
      select: {
        id: true,
        routineTemplate: true,
        routineStep: true,
        product: true,
        rank: true,
      },
    }),
    payload.find({
      collection: 'routine-steps',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 500,
      sort: 'stepOrderDefault',
      select: {
        id: true,
        name: true,
        slug: true,
        productArea: true,
        stepOrderDefault: true,
        isOptionalDefault: true,
      },
    }),
    payload.find({
      collection: 'routine-step-rules',
      locale,
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      select: {
        id: true,
        routineStep: true,
        timing: true,
        skinType: true,
        ruleType: true,
      },
    }),
  ])

  return {
    routineTemplatesResult,
    routineTemplateStepsResult,
    routineTemplateStepProductsResult,
    routineStepsResult,
    routineStepRulesResult,
  }
})
