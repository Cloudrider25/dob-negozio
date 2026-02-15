import { notFound, redirect } from 'next/navigation'

import { AccountDashboardClient } from '@/components/account/AccountDashboardClient'
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { isLocale } from '@/lib/i18n'
import type { Order } from '@/payload-types'

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    redirect(`/${locale}/signin`)
  }

  const payload = await getPayloadClient()
  const ordersResult = await payload.find({
    collection: 'orders',
    overrideAccess: false,
    user,
    depth: 0,
    limit: 20,
    sort: '-createdAt',
    where: {
      customer: {
        equals: user.id,
      },
    },
  })
  const orders = ordersResult.docs as Order[]
  const firstName = user.firstName?.trim() || ''
  const lastName = user.lastName?.trim() || ''

  const initialOrders = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    currency: order.currency,
    createdAt: order.createdAt,
  }))

  const addressMap = new Map<
    string,
    {
      id: string
      fullName: string
      address: string
      postalCode: string
      city: string
      province: string
      country: string
    }
  >()
  for (const order of orders) {
    const shipping = order.shippingAddress
    if (!shipping) continue
    const key = `${shipping.address}|${shipping.postalCode}|${shipping.city}|${shipping.province}|${shipping.country}`
    if (addressMap.has(key)) continue
    addressMap.set(key, {
      id: key,
      fullName: `${order.customerFirstName} ${order.customerLastName}`.trim(),
      address: shipping.address,
      postalCode: shipping.postalCode,
      city: shipping.city,
      province: shipping.province,
      country: shipping.country,
    })
  }
  const initialAddresses = Array.from(addressMap.values())

  return (
    <main className="mx-auto w-full ">
      <AccountDashboardClient
        locale={locale}
        userId={user.id}
        email={user.email}
        firstName={firstName}
        lastName={lastName}
        phone={user.phone?.trim() || ''}
        initialOrders={initialOrders}
        initialAddresses={initialAddresses}
      />
    </main>
  )
}
