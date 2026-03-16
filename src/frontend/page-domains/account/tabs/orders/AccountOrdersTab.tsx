'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon, EyeIcon } from '@heroicons/react/24/outline'

import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'
import { MediaThumb } from '@/frontend/components/shared/MediaThumb'
import {
  emitCartUpdated,
  readCart,
  readWaitlist,
  writeCart,
  writeWaitlist,
} from '@/lib/frontend/cart/storage'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media-core/thumbnail'

import { AccountIconAction, AccountPillButton } from '../../shared/AccountButtons'
import { onEnterOrSpace } from '../../shared/keyboard'
import { AccountListHeader } from '../../shared/AccountListHeader'
import type { AccountWaitlistItem, OrderItem } from '../../types'

type AccountOrdersTabProps = {
  styles: Record<string, string>
  locale: string
  productsStyles: Record<string, string>
  identity: {
    firstName: string
    fallbackCustomer: string
  }
  data: {
    copy: { orders: { empty: string } }
    ordersByDateDesc: OrderItem[]
    waitlistRows: AccountWaitlistItem[]
    nextProductDeliveryRow: OrderItem | null
    latestPurchasedProductRow: OrderItem | null
    productsSortLabel: string
    groupedProductRows: Array<
      | { kind: 'single'; row: OrderItem }
      | {
          kind: 'order-group'
          key: string
          lead: OrderItem
          rows: OrderItem[]
          productsTotal: number
        }
    >
  }
  view: {
    showAllProductPurchases: boolean
    expandedOrderGroups: Record<string, boolean>
  }
  actions: {
    setShowAllProductPurchases: (value: boolean | ((prev: boolean) => boolean)) => void
    setProductsFilterDrawerOpen: (value: boolean) => void
    setExpandedOrderGroups: (
      value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
    ) => void
    setOrderDetails: (order: OrderItem | null) => void
  }
  formatMoney: (amount: number, currency: string) => string
  formatDate: (value: string | Date | null | undefined, fallback?: string) => string
}

export default function AccountOrdersTab({
  styles,
  locale,
  productsStyles,
  identity,
  data,
  view,
  actions,
  formatMoney,
  formatDate,
}: AccountOrdersTabProps) {
  const router = useRouter()
  const [pendingWaitlistIds, setPendingWaitlistIds] = useState<Record<string, boolean>>({})

  const onCompleteWaitlistPurchase = async (item: AccountWaitlistItem) => {
    setPendingWaitlistIds((prev) => ({ ...prev, [item.id]: true }))

    try {
      const cart = readCart()
      const existing = cart.find((entry) => entry.id === String(item.productId))
      if (existing) {
        existing.quantity += 1
      } else {
        cart.push({
          id: String(item.productId),
          title: item.title,
          slug: item.slug,
          price: item.price,
          currency: item.currency,
          brand: item.brand || undefined,
          format: item.format || undefined,
          coverImage: item.coverImage,
          quantity: 1,
        })
      }
      writeCart(cart)

      const waitlist = readWaitlist().filter((entry) => entry.id !== String(item.productId))
      writeWaitlist(waitlist)
      emitCartUpdated()

      await fetch('/api/shop/waitlist', {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          productId: item.productId,
          locale,
        }),
      })

      router.push(`/${locale}/cart`)
    } finally {
      setPendingWaitlistIds((prev) => ({ ...prev, [item.id]: false }))
    }
  }

  if (data.ordersByDateDesc.length === 0 && data.waitlistRows.length === 0) {
    return (
      <SectionTitle as="h2" size="h2" className={styles.title}>
        {data.copy.orders.empty}
      </SectionTitle>
    )
  }

  return (
    <>
      <SectionTitle as="h2" size="h2" className={styles.title}>
        Prodotti, {identity.firstName || identity.fallbackCustomer}
      </SectionTitle>
      <hr className={styles.sectionDivider} />
      {data.waitlistRows.length > 0 ? (
        <div className={styles.accountSummarySection}>
          <p className={`${styles.accountSummaryLabel} typo-caption-upper`}>Waitlist</p>
          <div className={productsStyles.waitlistStack}>
            {data.waitlistRows.map((item) => {
              const purchaseThumb = normalizeThumbnailSrc(item.coverImage)
              return (
                <article key={item.id} className={productsStyles.waitlistCard}>
                  <div className={productsStyles.orderPurchaseCell}>
                    <MediaThumb
                      src={purchaseThumb}
                      alt=""
                      sizes="(min-width: 1025px) 64px, 96px"
                      className={productsStyles.orderThumb}
                      imageClassName={productsStyles.orderThumbImage}
                      fallback={<span className={productsStyles.orderThumbFallback} aria-hidden="true" />}
                      unoptimized={isRemoteThumbnailSrc(purchaseThumb)}
                    />
                    <div className={productsStyles.waitlistMeta}>
                      <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                        {item.title}
                      </p>
                      {item.brand ? (
                        <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                          {item.brand}
                        </p>
                      ) : null}
                      <p className={`${productsStyles.waitlistStatus} typo-caption`}>
                        {item.availableNow
                          ? 'Disponibile ora. Completa l\'acquisto da qui.'
                          : 'Ti avviseremo di nuovo se il prodotto torna disponibile.'}
                      </p>
                    </div>
                  </div>
                  {item.availableNow ? (
                    <AccountPillButton
                      type="button"
                      className={`${styles.accountSummaryToggle} typo-caption-upper`}
                      disabled={Boolean(pendingWaitlistIds[item.id])}
                      onClick={() => void onCompleteWaitlistPurchase(item)}
                    >
                      {pendingWaitlistIds[item.id] ? 'Aggiunta...' : 'Completa acquisto'}
                    </AccountPillButton>
                  ) : (
                    <div className={`${productsStyles.waitlistBadge} typo-caption-upper`}>
                      In attesa
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      ) : null}
      {Boolean(data.nextProductDeliveryRow ?? data.latestPurchasedProductRow) ? (
        <div className={styles.accountSummarySection}>
          <p className={`${styles.accountSummaryLabel} typo-caption-upper`}>
            {data.nextProductDeliveryRow ? 'Prossima consegna' : 'Ultimo acquisto'}
          </p>
          <div
            className={styles.accountSummaryCard}
            role="button"
            tabIndex={0}
            onClick={() => actions.setOrderDetails((data.nextProductDeliveryRow ?? data.latestPurchasedProductRow)!)}
            onKeyDown={(event) =>
              onEnterOrSpace(event, () =>
                actions.setOrderDetails((data.nextProductDeliveryRow ?? data.latestPurchasedProductRow)!),
              )
            }
          >
            {(() => {
              const order = data.nextProductDeliveryRow ?? data.latestPurchasedProductRow
              if (!order) return null
              const purchaseThumb = normalizeThumbnailSrc(order.purchaseThumb)
              return (
                <div className={productsStyles.orderPurchaseCell}>
                  <MediaThumb
                    src={purchaseThumb}
                    alt=""
                    sizes="(min-width: 1025px) 64px, 96px"
                    className={productsStyles.orderThumb}
                    imageClassName={productsStyles.orderThumbImage}
                    fallback={<span className={productsStyles.orderThumbFallback} aria-hidden="true" />}
                    unoptimized={isRemoteThumbnailSrc(purchaseThumb)}
                  />
                  <div className={productsStyles.orderPurchaseMeta}>
                    <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                      {order.purchaseTitle}
                    </p>
                    <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                      {formatDate(order.createdAt)}
                    </p>
                    <p className={`${productsStyles.orderInlinePrice} typo-caption`}>
                      {formatMoney(order.total, order.currency)}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
          <AccountPillButton
            type="button"
            className={`${styles.accountSummaryToggle} typo-caption-upper`}
            onClick={() => actions.setShowAllProductPurchases((prev) => !prev)}
          >
            {view.showAllProductPurchases ? 'Nascondi acquisti' : 'Tutti gli acquisti'}
          </AccountPillButton>
        </div>
      ) : null}

      {view.showAllProductPurchases ? (
        <>
          <div className={styles.filtersTriggerRow}>
            <p className={`${styles.filtersTriggerLabel} typo-body-lg`}>Filtri:</p>
            <button
              type="button"
              className={`${styles.filtersTriggerButton} typo-small-upper`}
              onClick={() => actions.setProductsFilterDrawerOpen(true)}
              aria-label="Apri filtro prodotti"
            >
              <span>{data.productsSortLabel}</span>
              <ChevronDownIcon width={16} height={16} aria-hidden="true" />
            </button>
          </div>
          <div className={productsStyles.ordersListWrap}>
            <AccountListHeader variant="orders" columns={['Acquisto', 'Dettagli']} />
            <div className={productsStyles.ordersList}>
              {data.groupedProductRows.map((entry) => {
                if (entry.kind === 'single') {
                  const order = entry.row
                  const purchaseThumb = normalizeThumbnailSrc(order.purchaseThumb)
                  return (
                    <article
                      key={order.id}
                      className={productsStyles.ordersListRow}
                      onClick={() => actions.setOrderDetails(order)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => onEnterOrSpace(event, () => actions.setOrderDetails(order))}
                    >
                      <div className={productsStyles.ordersListCell}>
                        <span className={productsStyles.ordersListLabel}>Acquisto</span>
                        <div className={productsStyles.orderPurchaseCell}>
                          <MediaThumb
                            src={purchaseThumb}
                            alt=""
                            sizes="(min-width: 1025px) 64px, 96px"
                            className={productsStyles.orderThumb}
                            imageClassName={productsStyles.orderThumbImage}
                            fallback={<span className={productsStyles.orderThumbFallback} aria-hidden="true" />}
                            unoptimized={isRemoteThumbnailSrc(purchaseThumb)}
                          />
                          <div className={productsStyles.orderPurchaseMeta}>
                            <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                              {formatDate(order.createdAt)}
                            </p>
                            <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                              {order.purchaseTitle}
                            </p>
                            <p className={`${productsStyles.orderInlinePrice} typo-caption`}>
                              {formatMoney(order.total, order.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`${productsStyles.ordersListCell} ${productsStyles.ordersListCellDetails}`}>
                        <span className={productsStyles.ordersListLabel}>Dettagli</span>
                        <div className={productsStyles.actionsStack}>
                          <AccountIconAction
                            type="button"
                            className="typo-caption-upper"
                            compact
                            aria-label="Apri dettagli ordine"
                            title="Apri dettagli ordine"
                            onClick={(event) => {
                              event.stopPropagation()
                              actions.setOrderDetails(order)
                            }}
                          >
                            <EyeIcon width={18} height={18} aria-hidden="true" />
                          </AccountIconAction>
                        </div>
                      </div>
                    </article>
                  )
                }

                const isExpanded = Boolean(view.expandedOrderGroups[entry.key])
                const groupLeadPurchaseThumb = normalizeThumbnailSrc(entry.lead.purchaseThumb)
                return (
                  <Fragment key={`order-group-${entry.key}`}>
                    <article
                      className={`${productsStyles.ordersListRow} ${productsStyles.packageGroupRow}`}
                      onClick={() =>
                        actions.setExpandedOrderGroups((prev) => ({
                          ...prev,
                          [entry.key]: !prev[entry.key],
                        }))
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) =>
                        onEnterOrSpace(event, () =>
                          actions.setExpandedOrderGroups((prev) => ({
                            ...prev,
                            [entry.key]: !prev[entry.key],
                          })),
                        )
                      }
                    >
                      <div className={productsStyles.ordersListCell}>
                        <span className={productsStyles.ordersListLabel}>Acquisto</span>
                        <div className={productsStyles.orderPurchaseCell}>
                          <MediaThumb
                            src={groupLeadPurchaseThumb}
                            alt=""
                            sizes="(min-width: 1025px) 64px, 96px"
                            className={productsStyles.orderThumb}
                            imageClassName={productsStyles.orderThumbImage}
                            fallback={<span className={productsStyles.orderThumbFallback} aria-hidden="true" />}
                            unoptimized={isRemoteThumbnailSrc(groupLeadPurchaseThumb)}
                          />
                          <div className={productsStyles.orderPurchaseMeta}>
                            <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                              {formatDate(entry.lead.createdAt)}
                            </p>
                            <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                              {entry.lead.orderNumber}
                            </p>
                            <p className={`${styles.orderMeta} ${productsStyles.orderMeta} typo-caption`}>
                              {entry.rows.length} prodotti
                            </p>
                            <p className={`${productsStyles.orderInlinePrice} typo-caption`}>
                              {formatMoney(entry.productsTotal, entry.lead.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`${productsStyles.ordersListCell} ${productsStyles.ordersListCellDetails}`}>
                        <span className={productsStyles.ordersListLabel}>Dettagli</span>
                        <div className={productsStyles.actionsStack}>
                          <AccountIconAction
                            type="button"
                            className="typo-caption-upper"
                            compact
                            aria-label={isExpanded ? 'Collassa ordine' : 'Espandi ordine'}
                            aria-expanded={isExpanded}
                            title={isExpanded ? 'Collassa ordine' : 'Espandi ordine'}
                            onClick={(event) => {
                              event.stopPropagation()
                              actions.setExpandedOrderGroups((prev) => ({
                                ...prev,
                                [entry.key]: !prev[entry.key],
                              }))
                            }}
                          >
                            {isExpanded ? '−' : '+'}
                          </AccountIconAction>
                        </div>
                      </div>
                    </article>
                    {isExpanded
                      ? entry.rows.map((order) => {
                          const purchaseThumb = normalizeThumbnailSrc(order.purchaseThumb)
                          return (
                          <article
                            key={order.id}
                            className={`${productsStyles.ordersListRow} ${productsStyles.packageSessionRow}`}
                            onClick={() => actions.setOrderDetails(order)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => onEnterOrSpace(event, () => actions.setOrderDetails(order))}
                          >
                            <div className={productsStyles.ordersListCell}>
                              <span className={productsStyles.ordersListLabel}>Acquisto</span>
                              <div className={productsStyles.orderPurchaseCell}>
                                <MediaThumb
                                  src={purchaseThumb}
                                  alt=""
                                  sizes="(min-width: 1025px) 64px, 96px"
                                  className={productsStyles.orderThumb}
                                  imageClassName={productsStyles.orderThumbImage}
                                  fallback={<span className={productsStyles.orderThumbFallback} aria-hidden="true" />}
                                  unoptimized={isRemoteThumbnailSrc(purchaseThumb)}
                                />
                                <div className={productsStyles.orderPurchaseMeta}>
                                  <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                                    {formatDate(order.createdAt)}
                                  </p>
                                  <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                                    {order.purchaseTitle}
                                  </p>
                                  <p className={`${productsStyles.orderInlinePrice} typo-caption`}>
                                    {formatMoney(order.total, order.currency)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className={`${productsStyles.ordersListCell} ${productsStyles.ordersListCellDetails}`}>
                              <span className={productsStyles.ordersListLabel}>Dettagli</span>
                              <div className={productsStyles.actionsStack}>
                                <AccountIconAction
                                  type="button"
                                  className="typo-caption-upper"
                                  compact
                                  aria-label="Apri dettagli ordine"
                                  title="Apri dettagli ordine"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    actions.setOrderDetails(order)
                                  }}
                                >
                                  <EyeIcon width={18} height={18} aria-hidden="true" />
                                </AccountIconAction>
                              </div>
                            </div>
                          </article>
                          )
                        })
                      : null}
                  </Fragment>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
