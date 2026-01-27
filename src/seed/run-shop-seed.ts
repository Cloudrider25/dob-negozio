import { getPayload } from 'payload'
import config from '../payload.config'

import { seedShopTaxonomies } from './shop-seed'

const payload = await getPayload({ config })
await seedShopTaxonomies(payload)
console.log('Shop seed completed')
