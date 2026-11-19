import React from 'react'
import { useTranslation } from 'react-i18next'
import { Scale } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface ShippingRatesTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: any) => void
  setDeleteId: (id: number) => void
  setConfirmOpen: (val: boolean) => void
  setDetailDrawerItem: (item: any) => void
}

export const ShippingRatesTab: React.FC<ShippingRatesTabProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditModal,
  setDeleteId,
  setConfirmOpen,
  setDetailDrawerItem,
}) => {
  const { t } = useTranslation(['shipping', 'common'])

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                {visibleColumns.name && <th className="py-3 px-4 text-left">{t('shipping.colWeightRange', 'Weight Range (kg)')}</th>}
                {visibleColumns.cost && <th className="py-3 px-4 text-left">{t('shipping.colRate', 'Rate ($)')}</th>}
                {visibleColumns.actions && <th className="py-3 px-4 text-right">{t('shipping.colActions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {isLoading ? (
                <LoadingSkeleton cols={3} />
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <EmptyState message={t('shipping.noRatesFound', 'No freight rates configured yet.')} />
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setDetailDrawerItem(r)}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    {visibleColumns.name && (
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                            <Scale size={14} />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                              {r.min_weight ?? 0} kg — {r.max_weight ?? 10} kg
                            </span>
                            {r.method_name && (
                              <p className="text-[11px] text-muted-foreground">{r.method_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.cost && (
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ${Number(r.price ?? r.rate ?? 0).toFixed(2)}
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default ShippingRatesTab
