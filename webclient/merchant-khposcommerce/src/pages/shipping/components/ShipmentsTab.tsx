import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Copy,
  Check,
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { StatusBadge, EmptyState } from '@/components/common'
import { formatDisplayDate } from '@/utils/formatters'

interface ShipmentsTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: any) => void
  setDeleteId: (id: number) => void
  setConfirmOpen: (val: boolean) => void
  setDetailDrawerItem: (item: any) => void
}

export const ShipmentsTab: React.FC<ShipmentsTabProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditModal,
  setDeleteId,
  setConfirmOpen,
  setDetailDrawerItem,
}) => {
  const { t, i18n } = useTranslation(['shipping', 'common'])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const renderCarrierBadge = (carrierName?: string) => {
    const name = (carrierName || 'J&T Express Cambodia').trim()
    const lower = name.toLowerCase()

    if (lower.includes('j&t') || lower.includes('jt')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          {name}
        </span>
      )
    }

    if (lower.includes('grab')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {name}
        </span>
      )
    }

    if (lower.includes('virak') || lower.includes('vrl') || lower.includes('buntham')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          {name}
        </span>
      )
    }

    if (lower.includes('dhl') || lower.includes('fedex') || lower.includes('ups')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {name}
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-muted text-foreground border border-border/60">
        <Truck size={12} className="text-muted-foreground" />
        {name}
      </span>
    )
  }

  const getDestinationLabel = (r: any) => {
    if (r.destination_city) return r.destination_city
    if (r.destination) return r.destination
    const isKm = i18n.language === 'km' || i18n.language === 'kh'
    const defaultCities = isKm
      ? ['រាជធានីភ្នំពេញ', 'ខេត្តសៀមរាប', 'ខេត្តបាត់ដំបង', 'ខេត្តកណ្តាល', 'ខេត្តព្រះសីហនុ']
      : ['Phnom Penh', 'Siem Reap', 'Battambang', 'Kandal', 'Preah Sihanouk']
    return defaultCities[r.id % defaultCities.length]
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                {visibleColumns.id !== false && (
                  <th className="py-3.5 px-4 text-left min-w-[200px]">
                    {t('shipping.colTrackingOrder', 'លេខកូដតាមដាន / បញ្ជាទិញ')}
                  </th>
                )}
                {visibleColumns.carrier !== false && (
                  <th className="py-3.5 px-4 text-left min-w-[180px]">
                    {t('shipping.colCarrier', 'ក្រុមហ៊ុន / ដៃគូដឹកជញ្ជូន')}
                  </th>
                )}
                {visibleColumns.destination !== false && (
                  <th className="py-3.5 px-4 text-left min-w-[160px]">
                    {t('shipping.destination', 'ទិសដៅ / អ្នកទទួល')}
                  </th>
                )}
                {visibleColumns.cost !== false && (
                  <th className="py-3.5 px-4 text-left min-w-[120px]">
                    {t('shipping.colFreightFee', 'ថ្លៃដឹកជញ្ជូន')}
                  </th>
                )}
                {visibleColumns.status !== false && (
                  <th className="py-3.5 px-4 text-center min-w-[130px]">
                    {t('shipping.colStatus', 'ស្ថានភាព')}
                  </th>
                )}
                {visibleColumns.date !== false && (
                  <th className="py-3.5 px-4 text-left min-w-[140px]">
                    {t('common.date', 'កាលបរិច្ឆេទ')}
                  </th>
                )}
                {visibleColumns.actions !== false && (
                  <th className="py-3.5 px-4 text-right min-w-[120px]">
                    {t('shipping.colActions', 'សកម្មភាព')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {isLoading ? (
                <LoadingSkeleton cols={7} rows={6} />
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <EmptyState message={t('shipping.noShipmentsFound', 'រកមិនឃើញទិន្នន័យដឹកជញ្ជូនដែលត្រូវគ្នានឹងការស្វែងរកទេ។')} />
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const st = (r.status || 'pending').toLowerCase()
                  const trackingNum = r.tracking_number || `TRK-A-${String(r.id).padStart(8, '0')}`
                  const orderNum = r.order_id || r.id
                  const fee = Number(r.shipping_fee ?? r.shipping_cost ?? r.price ?? 0)
                  const isCopied = copiedId === trackingNum

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setDetailDrawerItem(r)}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      {/* Tracking Number & Order ID */}
                      {visibleColumns.id !== false && (
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1 bg-muted/60 hover:bg-muted px-2 py-0.5 rounded-lg border border-border/60"
                                title={trackingNum}
                              >
                                <Truck size={12} className="text-primary/70 shrink-0" />
                                {trackingNum}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopy(trackingNum, e)}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title={t('shipping.copyTracking', 'Copy Tracking No.')}
                              >
                                {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                              <Package size={11} className="shrink-0 text-muted-foreground/70" />
                              <span>{t('shipping.orderPrefix', 'Order #')}</span>
                              <span className="font-semibold text-foreground/80">{orderNum}</span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Carrier */}
                      {visibleColumns.carrier !== false && (
                        <td className="py-3.5 px-4 align-middle">
                          {renderCarrierBadge(r.carrier || r.provider)}
                        </td>
                      )}

                      {/* Destination / Recipient */}
                      {visibleColumns.destination !== false && (
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                              <MapPin size={12} className="text-primary shrink-0" />
                              <span>{getDestinationLabel(r)}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground pl-4">
                              {r.recipient_name || t('shipping.standardDelivery', 'Standard Delivery')}
                            </p>
                          </div>
                        </td>
                      )}

                      {/* Freight Fee */}
                      {visibleColumns.cost !== false && (
                        <td className="py-3.5 px-4 align-middle">
                          {fee > 0 ? (
                            <span className="font-mono text-xs font-bold text-foreground">
                              ${fee.toFixed(2)}
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              {t('shipping.freeShipping', 'Free Shipping')}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status !== false && (
                        <td className="py-3.5 px-4 text-center align-middle">
                          <StatusBadge status={st} />
                        </td>
                      )}

                      {/* Date */}
                      {visibleColumns.date !== false && (
                        <td className="py-3.5 px-4 align-middle font-mono text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-muted-foreground/70 shrink-0" />
                            <span>{r.shipped_at || r.created_at ? formatDisplayDate(r.shipped_at || r.created_at) : '—'}</span>
                          </div>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions !== false && (
                        <td className="py-3.5 px-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            variant="inline"
                            onView={() => setDetailDrawerItem(r)}
                            onEdit={() => openEditModal(r)}
                            onDelete={() => {
                              setDeleteId(r.id)
                              setConfirmOpen(true)
                            }}
                            viewLabel={t('common.viewDetails', 'មើលលម្អិត')}
                            editLabel={t('common.edit', 'កែប្រែ')}
                            deleteLabel={t('common.delete', 'លុប')}
                          />
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default ShipmentsTab
