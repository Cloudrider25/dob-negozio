import { getPayload } from 'payload'

import config from '../src/payload/config'

async function run() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    where: {
      pageKey: {
        equals: 'shipping',
      },
    },
  })

  if (existing.docs[0]) {
    console.log(`shipping page already exists: ${existing.docs[0].id}`)
    return
  }

  const created = await payload.create({
    collection: 'pages',
    data: {
      pageKey: 'shipping',
      heroTitleMode: 'fixed',
      heroStyle: 'style1',
    },
    locale: 'it',
    overrideAccess: true,
    draft: false,
  })

  console.log(`created shipping page: ${created.id}`)
}

await run()
