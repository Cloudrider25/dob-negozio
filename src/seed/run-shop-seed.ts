import { getPayload } from 'payload'
import config from '../payload.config'

import { seedShopTaxonomies } from './shop-seed'
import { seedRoutineBuilder } from './fill-routine-builder'

const payload = await getPayload({ config })
await seedShopTaxonomies(payload)
await seedRoutineBuilder(payload)
console.log('Shop seed completed')
