'use client'

import { Fragment } from 'react'
import { ChevronDownIcon, EyeIcon } from '@heroicons/react/24/outline'

import { SectionTitle } from '@/components/sections/SectionTitle'
import { MediaThumb } from '@/components/shared/MediaThumb'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media/thumbnail'

import { AccountIconAction, AccountPillButton } from '../../shared/AccountButtons'
import { onEnterOrSpace } from '../../shared/keyboard'
import { AccountListHeader } from '../../shared/AccountListHeader'
import type { OrderItem } from '../../types'

type AccountOrdersTabProps = {
  styles: Record<string, string>
  productsStyles: Record<string, string>
  identity: {
    firstName: string
    fallbackCustomer: string
  }
  data: {
    copy: { orders: { empty: string } }
    ordersByDateDesc: OrderItem[]
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
  productsStyles,
  identity,
  data,
  view,
  actions,
  formatMoney,
  formatDate,
}: AccountOrdersTabProps) {
  if (data.ordersByDateDesc.length === 0) {
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
