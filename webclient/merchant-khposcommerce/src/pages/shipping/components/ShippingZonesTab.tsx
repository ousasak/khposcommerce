import React from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { StatusBadge, EmptyState } from '@/components/common'

interface ShippingZonesTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: any) => void
  setDeleteId: (id: number) => void
  setConfirmOpen: (val: boolean) => void
  setDetailDrawerItem: (item: any) => void
}

export const ShippingZonesTab: React.FC<ShippingZonesTabProps> = ({
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
                {visibleColumns.name && <th className="py-3 px-4 text-left">{t('shipping.colZoneName', 'Zone Name')}</th>}
                {visibleColumns.carrier && <th className="py-3 px-4 text-left">{t('shipping.colZoneCode', 'Zone Code')}</th>}
                {visibleColumns.status && <th className="py-3 px-4 text-center">{t('shipping.colStatus', 'Status')}</th>}
                {visibleColumns.actions && <th className="py-3 px-4 text-right">{t('shipping.colActions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {isLoading ? (
                <LoadingSkeleton cols={4} />
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <EmptyState message={t('shipping.noZonesFound', 'No delivery zones configured yet.')} />
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
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                            <MapPin size={14} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs">
                              {r.name}
                            </p>
                            {r.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{r.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.carrier && (
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 inline-block">
                          {r.code}
                        </span>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
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

export default ShippingZonesTab
