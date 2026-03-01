'use client'

import { Fragment } from 'react'
import { ChevronDownIcon, MinusIcon } from '@heroicons/react/24/outline'

import { SectionTitle } from '@/components/sections/SectionTitle'

import { AccountPillButton } from '../../shared/AccountButtons'
import { onEnterOrSpace } from '../../shared/keyboard'
import { AccountListHeader } from '../../shared/AccountListHeader'
import type { FormMessage } from '../../forms/types'
import type { ServiceBookingRow } from '../../types'

type AccountServicesTabProps = {
  styles: Record<string, string>
  servicesStyles: Record<string, string>
  identity: {
    firstName: string
    fallbackCustomer: string
  }
  data: {
    serviceRowsState: ServiceBookingRow[]
    nextServiceAppointmentRow: ServiceBookingRow | null
    latestServicePurchasedRow: ServiceBookingRow | null
    servicesCurrentFilterLabel: string
    serviceRowsFiltered: ServiceBookingRow[]
    sessionMessage: FormMessage | null
    groupedServiceTableRows: Array<
      | { kind: 'single'; row: ServiceBookingRow }
      | {
          kind: 'package-group'
          key: string
          lead: ServiceBookingRow
          rows: ServiceBookingRow[]
        }
    >
  }
  view: {
    showAllServicesBookings: boolean
    expandedPackageGroups: Record<string, boolean>
  }
  actions: {
    openScheduleEditModal: (row: ServiceBookingRow) => void
    setShowAllServicesBookings: (value: boolean | ((prev: boolean) => boolean)) => void
    setServicesFilterDrawerOpen: (value: boolean) => void
    setExpandedPackageGroups: (
      value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
    ) => void
    setServiceDetailsIsPackageChild: (value: boolean) => void
    setServiceDetailsRow: (row: ServiceBookingRow | null) => void
  }
  renderServiceDataPill: (row: ServiceBookingRow, interactive?: boolean) => React.ReactNode
}

export default function AccountServicesTab({
  styles,
  servicesStyles,
  identity,
  data,
  view,
  actions,
  renderServiceDataPill,
}: AccountServicesTabProps) {
  return (
    <>
      <SectionTitle as="h2" size="h2" className={styles.title}>
        Servizi, {identity.firstName || identity.fallbackCustomer}
      </SectionTitle>
      <hr className={styles.sectionDivider} />
      {data.serviceRowsState.length > 0 ? (
        <div className={styles.accountSummarySection}>
          <p className={`${styles.accountSummaryLabel} typo-caption-upper`}>
            {data.nextServiceAppointmentRow ? 'Prossimo appuntamento' : 'Ultimo servizio acquistato'}
          </p>
          <div
            className={styles.accountSummaryCard}
            role="button"
            tabIndex={0}
            onClick={() => {
              const row = (data.nextServiceAppointmentRow ?? data.latestServicePurchasedRow)!
              actions.openScheduleEditModal(row)
            }}
            onKeyDown={(event) =>
              onEnterOrSpace(event, () => {
                const row = (data.nextServiceAppointmentRow ?? data.latestServicePurchasedRow)!
                actions.openScheduleEditModal(row)
              })
            }
          >
            {(() => {
              const row = data.nextServiceAppointmentRow ?? data.latestServicePurchasedRow
              if (!row) return null
              return (
                <>
                  <div className={servicesStyles.accountSummaryServiceMeta}>
                    <p className={`${styles.orderNumber} typo-body-lg`}>{row.serviceTitle}</p>
                    <p className={`${styles.orderMeta} typo-caption`}>
                      {row.itemKind === 'package' ? row.sessionLabel : 'Servizio singolo'}
                    </p>
                  </div>
                  <div className={servicesStyles.accountSummaryServicePillWrap}>
                    {renderServiceDataPill(row, false)}
                  </div>
                </>
              )
            })()}
          </div>
          <AccountPillButton
            type="button"
            className={`${styles.accountSummaryToggle} typo-caption-upper`}
            onClick={() => actions.setShowAllServicesBookings((prev) => !prev)}
          >
            {view.showAllServicesBookings ? 'Nascondi servizi prenotati' : 'Tutti i servizi prenotati'}
          </AccountPillButton>
        </div>
      ) : null}

      {view.showAllServicesBookings ? (
        <div className={styles.filtersTriggerRow}>
          <p className={`${styles.filtersTriggerLabel} typo-body-lg`}>Filtri:</p>
          <button
            type="button"
            className={`${styles.filtersTriggerButton} typo-small-upper`}
            onClick={() => actions.setServicesFilterDrawerOpen(true)}
            aria-label="Apri filtro servizi"
          >
            <span>{data.servicesCurrentFilterLabel}</span>
            <ChevronDownIcon width={16} height={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {view.showAllServicesBookings && data.serviceRowsFiltered.length === 0 ? (
        <div className={styles.block}>
          <p className={`${styles.value} typo-body-lg`}>Nessuna prenotazione servizio in questo filtro.</p>
        </div>
      ) : view.showAllServicesBookings ? (
        <>
          {data.sessionMessage ? (
            <p className={`${data.sessionMessage.type === 'success' ? styles.successText : styles.errorText} typo-caption`}>
              {data.sessionMessage.text}
            </p>
          ) : null}
          <div className={servicesStyles.servicesList}>
            <AccountListHeader variant="services" columns={['Servizio', 'Data']} />
            {data.groupedServiceTableRows.map((entry) => {
              if (entry.kind === 'single') {
                const row = entry.row
                return (
                  <div
                    key={row.id}
                    className={servicesStyles.servicesListRow}
                    role="button"
                    tabIndex={0}
                    onClick={() => actions.openScheduleEditModal(row)}
                    onKeyDown={(event) => onEnterOrSpace(event, () => actions.openScheduleEditModal(row))}
                  >
                    <div className={servicesStyles.servicesListCell}>
                      <span className={servicesStyles.servicesListLabel}>Servizio</span>
                      <div className={styles.serviceCellTitle}>{row.serviceTitle}</div>
                    </div>
                    <div className={servicesStyles.servicesListCell}>
                      <span className={servicesStyles.servicesListLabel}>Data</span>
                      {renderServiceDataPill(row, false)}
                    </div>
                  </div>
                )
              }

              const isExpanded = Boolean(view.expandedPackageGroups[entry.key])
              return (
                <Fragment key={`frag-${entry.key}`}>
                  <div
                    className={`${servicesStyles.servicesListRow} ${servicesStyles.packageGroupRow}`}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      actions.setExpandedPackageGroups((prev) => ({
                        ...prev,
                        [entry.key]: !prev[entry.key],
                      }))
                    }
                    onKeyDown={(event) =>
                      onEnterOrSpace(event, () =>
                        actions.setExpandedPackageGroups((prev) => ({
                          ...prev,
                          [entry.key]: !prev[entry.key],
                        })),
                      )
                    }
                  >
                    <div className={servicesStyles.servicesListCell}>
                      <span className={servicesStyles.servicesListLabel}>Servizio</span>
                      <div className={styles.serviceCellTitle}>{entry.lead.serviceTitle}</div>
                    </div>
                    <div className={servicesStyles.servicesListCell}>
                      <span className={servicesStyles.servicesListLabel}>Data</span>
                      <span
                        className={`${servicesStyles.inlineDataPill} ${servicesStyles.packageTogglePill} typo-small-upper`}
                        aria-label={isExpanded ? 'Collassa pacchetto' : 'Espandi pacchetto'}
                        aria-expanded={isExpanded}
                        title={isExpanded ? 'Collassa pacchetto' : 'Espandi pacchetto'}
                      >
                        <span className={`${servicesStyles.inlineStatusIcon} ${servicesStyles.statusIconEmpty}`}>
                          <MinusIcon width={18} height={18} aria-hidden="true" />
                        </span>
                        <span className={servicesStyles.inlineDataDivider} aria-hidden="true" />
                        <span className={servicesStyles.inlineDataText}>Pacchetto</span>
                        <span className={servicesStyles.inlineDataDivider} aria-hidden="true" />
                        <span className={servicesStyles.inlinePillIconButton} aria-hidden="true">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </span>
                    </div>
                  </div>
                  {isExpanded
                    ? [
                        <div
                          key={`${entry.key}-order-cta`}
                          className={`${servicesStyles.servicesListRow} ${servicesStyles.packageOrderCtaRow}`}
                        >
                          <div className={servicesStyles.servicesListCell}>
                            <span className={servicesStyles.servicesListLabel}>Servizio</span>
                            <AccountPillButton
                              type="button"
                              className={`${servicesStyles.packageOrderCta} typo-small-upper`}
                              onClick={() => {
                                actions.setServiceDetailsIsPackageChild(false)
                                actions.setServiceDetailsRow(entry.lead)
                              }}
                            >
                              Dettaglio ordine pacchetto
                            </AccountPillButton>
                          </div>
                        </div>,
                        ...entry.rows.map((row) => (
                          <div
                            key={row.id}
                            className={`${servicesStyles.servicesListRow} ${servicesStyles.packageSessionRow}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => actions.openScheduleEditModal(row)}
                            onKeyDown={(event) =>
                              onEnterOrSpace(event, () => actions.openScheduleEditModal(row))
                            }
                          >
                            <div className={servicesStyles.servicesListCell}>
                              <span className={servicesStyles.servicesListLabel}>Servizio</span>
                              <div className={servicesStyles.packageSessionCell}>
                                Seduta {row.sessionIndex}/{row.sessionsTotal}
                              </div>
                            </div>
                            <div className={servicesStyles.servicesListCell}>
                              <span className={servicesStyles.servicesListLabel}>Data</span>
                              {renderServiceDataPill(row, false)}
                            </div>
                          </div>
                        )),
                      ]
                    : null}
                </Fragment>
              )
            })}
          </div>
        </>
      ) : null}
    </>
  )
}
