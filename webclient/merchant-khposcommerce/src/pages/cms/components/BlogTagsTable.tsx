import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface BlogTagsTableProps {
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

export const BlogTagsTable: React.FC<BlogTagsTableProps> = ({
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
                    onClick={() => onSort?.('name')}
                    className={`text-left font-bold text-xs px-4 py-3.5 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colTagName', 'Tag Name')}</span>
                      {renderSortIcon('name')}
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
                {visibleColumns.posts && (
                  <th
                    onClick={() => onSort?.('posts_count')}
                    className={`text-center font-bold text-xs w-36 px-4 py-3.5 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t('cms.cardLinkedArticles', 'Posts Count')}</span>
                      {renderSortIcon('posts_count')}
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
                <EmptyState cols={colsCount} message={t('cms.noTags', 'No tags found')} />
              ) : (
                records.map((r) => {
                  const isSelected = selectedRows.includes(r.id)
                  const postCount = Number(r.posts_count ?? r.blogs_count ?? 0)

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
                          aria-label={`Select tag ${r.id}`}
                        />
                      </td>

                      {/* Clean Tag Name (No icon box) */}
                      {visibleColumns.title && (
                        <td className="px-4 py-3.5">
                          <span
                            onClick={() => openEditModal(r)}
                            className="font-semibold text-foreground hover:text-primary cursor-pointer text-sm block leading-snug transition-colors"
                          >
                            {r.name || r.title}
                          </span>
                        </td>
                      )}

                      {/* Clean Slug */}
                      {visibleColumns.slug && (
                        <td className="px-4 py-3.5">
                          <span
                            className="font-mono text-xs text-muted-foreground bg-muted/60 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-border/70 inline-block max-w-[200px] truncate select-all tracking-tight"
                            title={r.slug}
                          >
                            #{r.slug}
                          </span>
                        </td>
                      )}

                      {/* Clean Posts Count */}
                      {visibleColumns.posts && (
                        <td className="px-4 py-3.5 text-center">
                          {postCount > 0 ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                              {postCount} {t('cms.articlesUnit', 'អត្ថបទ')}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium">
                              0 {t('cms.articlesUnit', 'អត្ថបទ')}
                            </span>
                          )}
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

export { BlogTagsTable as BlogTagsTab }
export default BlogTagsTable
