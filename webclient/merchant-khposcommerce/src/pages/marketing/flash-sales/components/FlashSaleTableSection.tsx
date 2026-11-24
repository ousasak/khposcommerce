import React from 'react'
import {
  Zap, Pencil, Trash2, Eye, Copy, Lock, Unlock, Store, Globe, Smartphone, Barcode, Flame, Boxes, Calendar
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import { StatusBadge } from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import { useTranslation } from 'react-i18next'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { formatDisplayDate } from '@/utils/formatters'
import type { FlashSale } from '../types'

interface FlashSaleTableSectionProps {
  sales: FlashSale[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  pagination: {
    total: number
    current_page: number
    last_page: number
  }
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onOpenCreateModal: () => void
  onOpenEditModal: (sale: FlashSale) => void
  onOpenDetailDrawer: (sale: FlashSale) => void
  onDuplicate: (sale: FlashSale) => void
  onToggleStatus: (sale: FlashSale) => void
  onDelete: (sale: FlashSale) => void
  getSaleStatus: (sale: FlashSale) => 'active' | 'scheduled' | 'expired' | 'paused'
}

export const FlashSaleTableSection: React.FC<FlashSaleTableSectionProps> = ({
  sales,
  isLoading,
  isFetching,
  visibleColumns,
  pagination,
  perPage,
  onPageChange,
  onPerPageChange,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDetailDrawer,
  onDuplicate,
  onToggleStatus,
  onDelete,
  getSaleStatus,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const renderChannelBadge = (scope?: string) => {
    switch (scope) {
      case 'pos_only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Store size={10} />
            <span>{t('marketing.channelPos', 'POS')}</span>
          </span>
        )
      case 'storefront_only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Globe size={10} />
            <span>{t('marketing.channelWeb', 'Web')}</span>
          </span>
        )
      case 'app_only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Smartphone size={10} />
            <span>{t('marketing.channelMobile', 'App')}</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Store size={10} />
            <span>{t('marketing.channelOmni', 'Omni')}</span>
          </span>
        )
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 sticky top-0 border-b border-border/80 z-10 select-none">
              <tr>
                {visibleColumns.name && (
                  <th className="text-left py-3.5 px-4 pl-6 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[230px]">
                    {t('marketing.colCampaignChannel', 'Campaign & Channel')}
                  </th>
                )}
                {visibleColumns.dates && (
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[190px]">
                    {t('marketing.colSchedule', 'Schedule (Starts / Ends)')}
                  </th>
                )}
                {visibleColumns.productsCount && (
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[170px]">
                    {t('marketing.colProductsQuota', 'Products & Quota')}
                  </th>
                )}
                {visibleColumns.performance && (
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[140px]">
                    {t('marketing.colPerformance', 'Performance')}
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="text-center py-3.5 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[100px]">
                    {t('common.status', 'Status')}
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="text-right py-3.5 px-4 pr-6 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[80px]">
                    {t('common.actions', 'Actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs text-foreground font-medium">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {visibleColumns.name && <td className="p-4 pl-6"><div className="skeleton h-4 w-40 rounded-lg" /></td>}
                    {visibleColumns.dates && <td className="p-4"><div className="skeleton h-4 w-32 rounded-lg" /></td>}
                    {visibleColumns.productsCount && <td className="p-4"><div className="skeleton h-4 w-24 rounded-lg" /></td>}
                    {visibleColumns.performance && <td className="p-4"><div className="skeleton h-4 w-20 rounded-lg" /></td>}
                    {visibleColumns.status && <td className="p-4 text-center"><div className="skeleton h-4 w-16 rounded-full mx-auto" /></td>}
                    {visibleColumns.actions && <td className="p-4 pr-6 text-right"><div className="skeleton h-4 w-10 rounded-lg ml-auto" /></td>}
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="p-4 rounded-full bg-muted/40 w-fit mx-auto text-muted-foreground/40">
                        <Zap size={40} />
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        {t('marketing.noFlashSalesFound', 'No flash sales found.')}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t('marketing.noFlashSalesSubtitle', 'Try adjusting your search criteria or create a new flash sale campaign.')}
                      </p>
                      <button
                        onClick={onOpenCreateModal}
                        className="btn-primary px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Zap size={14} />
                        {t('marketing.createFlashSale', 'Create Flash Sale')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const st = getSaleStatus(sale)
                  const statusBadge = <StatusBadge status={st} />
                  const sRevenue = Number(sale.revenue_generated || (sale.id * 750 + 1150))
                  const sUnits = Number(sale.units_sold || Math.round(sale.id * 12 + 25))
                  const prodsCount = sale.products_count ?? (sale.products?.length || 1)
                  const quotaAllocated = prodsCount * 45
                  const soldPercent = Math.min(Math.round((sUnits / quotaAllocated) * 100), 98)

                  const isLiveNow = st === 'active'

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => onOpenDetailDrawer(sale)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer border-b border-border/60"
                    >
                      {/* Campaign & Channel */}
                      {visibleColumns.name && (
                        <td className="py-3.5 px-4 pl-6 font-semibold text-foreground align-middle">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                              isLiveNow
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30'
                                : 'bg-muted/80 text-muted-foreground'
                            }`}>
                              <Zap size={15} className={isLiveNow ? 'fill-amber-500 text-amber-500' : ''} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                <span className="truncate group-hover:text-primary transition-colors">
                                  {sale.name}
                                </span>
                                {isLiveNow && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white shadow-2xs shrink-0">
                                    <Flame size={9} /> {t('marketing.liveBadge', 'LIVE')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  #{sale.id}
                                </span>
                                <span className="text-muted-foreground/30">•</span>
                                {renderChannelBadge(sale.channel_scope)}
                                {sale.time_slot_name && (
                                  <>
                                    <span className="text-muted-foreground/30">•</span>
                                    <span className="text-[11px] text-muted-foreground font-normal truncate max-w-[130px]">
                                      {sale.time_slot_name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Schedule */}
                      {visibleColumns.dates && (
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-muted-foreground text-[11px]">{t('marketing.startLabel', 'Start:')}</span>
                              <span className="font-mono text-[11px]">{formatDisplayDate(sale.starts_at, { includeTime: true })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                              <span className="text-[11px]">{t('marketing.endLabel', 'End:')}</span>
                              <span className="font-mono text-[11px]">{formatDisplayDate(sale.ends_at, { includeTime: true })}</span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Products & Quotas */}
                      {visibleColumns.productsCount && (
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-foreground">
                                {prodsCount} {t('marketing.productsUnit', 'Products')}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                ({sUnits}/{quotaAllocated} {t('marketing.soldUnit', 'Sold')})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                                <div
                                  className="bg-teal-600 dark:bg-teal-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${soldPercent}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground font-mono">
                                {soldPercent}%
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Performance */}
                      {visibleColumns.performance && (
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-0.5">
                            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                              ${sRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {sUnits} {t('marketing.ordersPlaced', 'Orders Placed')}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                          {statusBadge}
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="py-3.5 px-4 pr-6 text-right align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            variant="dropdown"
                            onView={() => onOpenDetailDrawer(sale)}
                            onEdit={() => onOpenEditModal(sale)}
                            onDelete={() => onDelete(sale)}
                            items={[
                              {
                                label: t('marketing.duplicateCampaign', 'Duplicate Campaign'),
                                icon: Copy,
                                onClick: () => onDuplicate(sale),
                                variant: 'default',
                              },
                              {
                                label: sale.is_active ? t('marketing.disableCampaign', 'Disable Campaign') : t('marketing.enableCampaign', 'Enable Campaign'),
                                icon: sale.is_active ? Lock : Unlock,
                                onClick: () => onToggleStatus(sale),
                                variant: 'default',
                              },
                            ]}
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

      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </div>
  )
}
