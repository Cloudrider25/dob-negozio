'use client'

import { Input } from '@/components/ui/input'

import { AccountIconAction } from '../../shared/AccountButtons'
import { AccountModal, accountModalClassNames } from '../../shared/AccountModal'
import type { OrderItem, ServiceBookingRow } from '../../types'

type ScheduleEditDraft = {
  date: string
  time: string
}

type AccountDashboardModalsProps = {
  styles: Record<string, string>
  productsStyles: Record<string, string>
  serviceDetailsRow: ServiceBookingRow | null
  serviceDetailsIsPackageChild: boolean
  setServiceDetailsRow: (row: ServiceBookingRow | null) => void
  setServiceDetailsIsPackageChild: (value: boolean) => void
  orderDetails: OrderItem | null
  setOrderDetails: (order: OrderItem | null) => void
  scheduleEditRow: ServiceBookingRow | null
  setScheduleEditRow: (row: ServiceBookingRow | null) => void
  scheduleEditDraft: ScheduleEditDraft
  setScheduleEditDraft: React.Dispatch<React.SetStateAction<ScheduleEditDraft>>
  sessionSavingId: string | null
  canEditSchedule: (row: ServiceBookingRow) => boolean
  formatServiceSchedule: (row: ServiceBookingRow) => string
  formatServiceStatus: (row: ServiceBookingRow) => string
  formatDateTime: (value: string | Date | null | undefined, fallback?: string) => string
  formatMoney: (value: number, currency: string) => string
  onSaveScheduleEdit: () => Promise<void>
  onClearScheduleEdit: () => Promise<void>
}

export function AccountDashboardModals({
  styles,
  productsStyles,
  serviceDetailsRow,
  serviceDetailsIsPackageChild,
  setServiceDetailsRow,
  setServiceDetailsIsPackageChild,
  orderDetails,
  setOrderDetails,
  scheduleEditRow,
  setScheduleEditRow,
  scheduleEditDraft,
  setScheduleEditDraft,
  sessionSavingId,
  canEditSchedule,
  formatServiceSchedule,
  formatServiceStatus,
  formatDateTime,
  formatMoney,
  onSaveScheduleEdit,
  onClearScheduleEdit,
}: AccountDashboardModalsProps) {
  return (
    <>
      {serviceDetailsRow ? (
        <AccountModal
          open={Boolean(serviceDetailsRow)}
          titleId="service-details-title"
          title="Dettagli prenotazione"
          onClose={() => {
            setServiceDetailsRow(null)
            setServiceDetailsIsPackageChild(false)
          }}
        >
          <div className={accountModalClassNames.grid}>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Servizio</p>
              <p className={`${styles.value} typo-body-lg`}>{serviceDetailsRow.serviceTitle}</p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ordine</p>
              <p className={`${styles.value} typo-body-lg`}>{serviceDetailsRow.orderNumber}</p>
            </div>
            {!serviceDetailsIsPackageChild ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data ordine</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {formatDateTime(serviceDetailsRow.orderCreatedAt)}
                </p>
              </div>
            ) : null}
            {!serviceDetailsIsPackageChild ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Pagamento</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {serviceDetailsRow.orderStatus} · {serviceDetailsRow.paymentStatus}
                </p>
              </div>
            ) : null}
            {!serviceDetailsIsPackageChild ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prezzo</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {formatMoney(
                    serviceDetailsRow.itemKind === 'package'
                      ? serviceDetailsRow.rowPrice * Math.max(serviceDetailsRow.sessionsTotal || 1, 1)
                      : serviceDetailsRow.rowPrice,
                    serviceDetailsRow.currency,
                  )}
                </p>
              </div>
            ) : null}
          </div>
        </AccountModal>
      ) : null}

      {orderDetails ? (
        <AccountModal
          open={Boolean(orderDetails)}
          titleId="order-details-title"
          title="Dettagli ordine"
          onClose={() => setOrderDetails(null)}
        >
          <div className={accountModalClassNames.grid}>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ordine</p>
              <p className={`${styles.value} typo-body-lg`}>{orderDetails.orderNumber}</p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prodotto</p>
              <div className={productsStyles.orderPurchaseCell}>
                <span className={productsStyles.orderThumb}>
                  {orderDetails.purchaseThumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={orderDetails.purchaseThumb} alt="" />
                  ) : (
                    <span className={productsStyles.orderThumbFallback} aria-hidden="true" />
                  )}
                </span>
                <div className={productsStyles.orderPurchaseMeta}>
                  <p className={`${styles.value} typo-body-lg`}>{orderDetails.purchaseTitle}</p>
                  {orderDetails.otherItemsCount > 0 ? (
                    <p className={`${styles.orderMeta} typo-caption`}>
                      + {orderDetails.otherItemsCount} altri prodotti nello stesso ordine
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data acquisto</p>
              <p className={`${styles.value} typo-body-lg`}>
                {formatDateTime(orderDetails.createdAt)}
              </p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Pagamento</p>
              <p className={`${styles.value} typo-body-lg`}>
                {orderDetails.status} · {orderDetails.paymentStatus}
              </p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Fulfillment</p>
              <p className={`${styles.value} typo-body-lg`}>
                {orderDetails.productFulfillmentMode === 'pickup'
                  ? 'Ritiro in negozio'
                  : 'Spedizione'}
              </p>
            </div>
            {orderDetails.productFulfillmentMode === 'shipping' ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Stato consegna</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {orderDetails.deliveryStatus || 'In preparazione'}
                </p>
              </div>
            ) : null}
            {orderDetails.productFulfillmentMode === 'shipping' ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Tracking</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {orderDetails.trackingNumber ? (
                    orderDetails.trackingUrl ? (
                      <a
                        href={orderDetails.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.inlineLink}
                      >
                        {orderDetails.trackingNumber}
                      </a>
                    ) : (
                      orderDetails.trackingNumber
                    )
                  ) : (
                    'Non disponibile'
                  )}
                </p>
              </div>
            ) : null}
            {orderDetails.productFulfillmentMode === 'shipping' && orderDetails.deliveryUpdatedAt ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>
                  Ultimo aggiornamento spedizione
                </p>
                <p className={`${styles.value} typo-body-lg`}>
                  {formatDateTime(orderDetails.deliveryUpdatedAt)}
                </p>
              </div>
            ) : null}
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Quantità</p>
              <p className={`${styles.value} typo-body-lg`}>{orderDetails.quantity}</p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prezzo unitario</p>
              <p className={`${styles.value} typo-body-lg`}>
                {formatMoney(orderDetails.unitPrice, orderDetails.currency)}
              </p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Totale riga</p>
              <p className={`${styles.value} typo-body-lg`}>
                {formatMoney(orderDetails.total, orderDetails.currency)}
              </p>
            </div>
          </div>
        </AccountModal>
      ) : null}

      {scheduleEditRow ? (
        <AccountModal
          open={Boolean(scheduleEditRow)}
          titleId="schedule-edit-title"
          title="Dettagli appuntamento"
          onClose={() => setScheduleEditRow(null)}
        >
          {(() => {
            const isPackageSession = scheduleEditRow.itemKind === 'package'
            return (
              <>
                <p className={`${styles.value} typo-body-lg`}>
                  {scheduleEditRow.serviceTitle}
                  {scheduleEditRow.itemKind === 'package' ? ` · ${scheduleEditRow.sessionLabel}` : ''}
                </p>
                <div className={accountModalClassNames.grid}>
                  {!isPackageSession ? (
                    <>
                      <div>
                        <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ordine</p>
                        <p className={`${styles.value} typo-body-lg`}>
                          {scheduleEditRow.orderNumber}
                        </p>
                      </div>
                      <div>
                        <p className={`${styles.serviceCellTitle} typo-caption-upper`}>
                          Data ordine
                        </p>
                        <p className={`${styles.value} typo-body-lg`}>
                          {formatDateTime(scheduleEditRow.orderCreatedAt)}
                        </p>
                      </div>
                      <div>
                        <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Status</p>
                        <p className={`${styles.value} typo-body-lg`}>
                          {formatServiceStatus(scheduleEditRow)}
                        </p>
                      </div>
                      <div>
                        <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prezzo</p>
                        <p className={`${styles.value} typo-body-lg`}>
                          {formatMoney(scheduleEditRow.rowPrice, scheduleEditRow.currency)}
                        </p>
                      </div>
                    </>
                  ) : null}
                  {isPackageSession ? (
                    <div>
                      <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Seduta</p>
                      <p className={`${styles.value} typo-body-lg`}>{scheduleEditRow.sessionLabel}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data attuale</p>
                    <p className={`${styles.value} typo-body-lg`}>
                      {formatServiceSchedule(scheduleEditRow)}
                    </p>
                  </div>
                  <div>
                    <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data</p>
                    <Input
                      size="compact"
                      className={accountModalClassNames.input}
                      type="date"
                      value={scheduleEditDraft.date}
                      onChange={(e) =>
                        setScheduleEditDraft((prev) => ({ ...prev, date: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ora</p>
                    <Input
                      size="compact"
                      className={accountModalClassNames.input}
                      type="time"
                      value={scheduleEditDraft.time}
                      onChange={(e) =>
                        setScheduleEditDraft((prev) => ({ ...prev, time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                {scheduleEditRow && !canEditSchedule(scheduleEditRow) ? (
                  <p className={`${styles.errorText} typo-caption`}>
                    Questa data è già gestita dal team e non è modificabile dal tuo account.
                  </p>
                ) : null}
                <div className={accountModalClassNames.actions}>
                  <AccountIconAction
                    type="button"
                    className="typo-caption-upper"
                    disabled={
                      sessionSavingId === scheduleEditRow.id || !canEditSchedule(scheduleEditRow)
                    }
                    onClick={() => void onSaveScheduleEdit()}
                  >
                    {sessionSavingId === scheduleEditRow.id ? 'Salvataggio…' : 'Salva data'}
                  </AccountIconAction>
                  <AccountIconAction
                    type="button"
                    className="typo-caption-upper"
                    disabled={
                      sessionSavingId === scheduleEditRow.id || !canEditSchedule(scheduleEditRow)
                    }
                    onClick={() => void onClearScheduleEdit()}
                  >
                    Annulla data
                  </AccountIconAction>
                </div>
              </>
            )
          })()}
        </AccountModal>
      ) : null}
    </>
  )
}
