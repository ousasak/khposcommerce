import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { StatusBadge, EmptyState } from '@/components/common'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface PagesPoliciesTableProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: any) => void
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
}

export const PagesPoliciesTable: React.FC<PagesPoliciesTableProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditModal,
  confirmDelete,
  selectedRows = [],
  onToggleSelectAll,
  onToggleSelectRow,
  sortBy = 'id',
  sortOrder = 'desc',
  onSort,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const isAllSelected = records.length > 0 && selectedRows.length === records.length

  const isPolicyPage = (slug: string, title: string) => {
    const text = (slug + ' ' + title).toLowerCase()
    return (
      text.includes('policy') ||
      text.includes('term') ||
      text.includes('warranty') ||
      text.includes('shipping') ||
      text.includes('return') ||
      text.includes('privacy') ||
      text.includes('គោលការណ៍')
    )
  }

  const renderSortIcon = (columnKey: string) => {
    if (!onSort) return null
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={13} className="text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowDown size={13} className="text-primary shrink-0 transition-transform" />
      )
    }
    return (
      <ArrowUpDown
        size={13}
        className="opacity-0 group-hover:opacity-60 text-muted-foreground shrink-0 transition-opacity"
      />
    )
  }

  const colsCount = 1 + Object.values(visibleColumns).filter(Boolean).length

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 select-none">
              <tr>
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                    aria-label="Select all"
                  />
                </th>
                {visibleColumns.title && (
                  <th
                    onClick={() => onSort?.('title')}
                    className={`text-left font-bold text-xs px-4 py-3.5 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colPageTitle', 'Page Title')}</span>
                      {renderSortIcon('title')}
                    </div>
                  </th>
                )}
                {visibleColumns.slug && (
                  <th
                    onClick={() => onSort?.('slug')}
                    className={`text-left font-bold text-xs w-56 px-4 py-3.5 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colSlug', 'Slug')}</span>
                      {renderSortIcon('slug')}
                    </div>
                  </th>
                )}
                {visibleColumns.category && (
                  <th className="text-left font-bold text-xs w-44 px-4 py-3.5">
                    {t('cms.colPageType', 'Type')}
                  </th>
                )}
                {visibleColumns.status && (
                  <th
                    onClick={() => onSort?.('status')}
                    className={`text-center font-bold text-xs w-32 px-4 py-3.5 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t('cms.colStatus', 'Status')}</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="text-right font-bold text-xs w-20 px-4 py-3.5">
                    {t('cms.colActions', 'Actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <LoadingSkeleton cols={colsCount} rows={6} />
              ) : records.length === 0 ? (
                <EmptyState cols={colsCount} message={t('cms.noPages', 'No pages found')} />
              ) : (
                records.map((r) => {
                  const isSelected = selectedRows.includes(r.id)
                  const isPolicy = isPolicyPage(r.slug || '', r.title || '')
                  const cleanDesc = r.description || r.meta_description || ''

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-muted/40 transition-colors group ${
                        isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-12 px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectRow?.(r.id)}
                          className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                          aria-label={`Select page ${r.id}`}
                        />
                      </td>

                      {/* Clean Page Title */}
                      {visibleColumns.title && (
                        <td className="px-4 py-3.5">
                          <div className="min-w-0">
                            <span
                              onClick={() => openEditModal(r)}
                              className="font-semibold text-foreground hover:text-primary cursor-pointer text-sm block leading-snug transition-colors"
                            >
                              {r.title}
                            </span>
                            {cleanDesc && cleanDesc !== r.title && (
                              <p
                                className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-md font-normal"
                                title={cleanDesc}
                              >
                                {cleanDesc}
                              </p>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Clean Slug */}
                      {visibleColumns.slug && (
                        <td className="px-4 py-3.5">
                          <span
                            className="font-mono text-xs text-muted-foreground bg-muted/60 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-border/70 inline-block max-w-[200px] truncate select-all tracking-tight"
                            title={r.slug}
                          >
                            /{r.slug}
                          </span>
                        </td>
                      )}

                      {/* Clean Type Badge (No Icon Spammed) */}
                      {visibleColumns.category && (
                        <td className="px-4 py-3.5">
                          {isPolicy ? (
                            <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {t('cms.storePolicyBadge', 'Store Policy')}
                            </span>
                          ) : (
                            <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              {t('cms.landingPageBadge', 'Landing Page')}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex justify-center">
                            <StatusBadge status={(r.status || 'published').toLowerCase()} />
                          </div>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            onEdit={() => openEditModal(r)}
                            onDelete={() => confirmDelete(r.id)}
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

export { PagesPoliciesTable as PagesTab, PagesPoliciesTable as PagesTable }
export default PagesPoliciesTable
