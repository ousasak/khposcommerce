import React, { useState } from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { StatusBadge, EmptyState } from '@/components/common'
import { Star, Building2, Sparkles, Quote, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TestimonialItem } from '../types/cms.types'

const getInitials = (fullName: string): string => {
  if (!fullName) return 'U'
  const trimmed = fullName.trim()
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    const firstChar = words[0].charAt(0)
    const secondChar = words[1].charAt(0)
    if (/^[A-Za-z]/.test(firstChar)) {
      return (firstChar + secondChar).toUpperCase()
    }
    return firstChar
  }
  return trimmed.charAt(0)
}

const getAvatarGradient = (name: string): string => {
  const gradients = [
    'from-emerald-500 to-teal-700 text-white shadow-emerald-500/20',
    'from-blue-600 to-indigo-700 text-white shadow-blue-500/20',
    'from-violet-600 to-purple-700 text-white shadow-purple-500/20',
    'from-amber-500 to-orange-600 text-white shadow-amber-500/20',
    'from-rose-500 to-pink-600 text-white shadow-rose-500/20',
    'from-teal-500 to-cyan-700 text-white shadow-teal-500/20',
    'from-indigo-500 to-blue-700 text-white shadow-indigo-500/20',
  ]
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

const truncateComment = (comment: string, maxLength = 80): string => {
  if (!comment) return ''
  const trimmed = comment.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trim()}...`
}

const AuthorAvatar: React.FC<{ name: string; avatarUrl?: string | null }> = ({ name, avatarUrl }) => {
  const [hasImgError, setHasImgError] = useState(false)
  const initial = getInitials(name)
  const gradientCls = getAvatarGradient(name)

  const isDummyPath = avatarUrl && (avatarUrl.includes('/images/users/user-') || avatarUrl.includes('avatar_'))
  const showImage = Boolean(avatarUrl) && !hasImgError && !isDummyPath

  if (showImage) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border shadow-xs shrink-0 bg-muted/60 relative">
        <img
          src={avatarUrl!}
          alt={name}
          onError={() => setHasImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-sm select-none border-2 border-white/30 dark:border-slate-800 shadow-xs shrink-0 ${gradientCls}`}
      title={name}
      aria-label={name}
    >
      <span className="leading-none drop-shadow-xs">{initial}</span>
    </div>
  )
}

export interface TestimonialsTableProps {
  records: TestimonialItem[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: TestimonialItem) => void
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
}

export type TestimonialsTabProps = TestimonialsTableProps

export const TestimonialsTable: React.FC<TestimonialsTableProps> = ({
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}
          />
        ))}
      </div>
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
                <th className="w-10 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                    aria-label="Select all"
                  />
                </th>
                {visibleColumns.author && (
                  <th
                    onClick={() => onSort?.('author_name')}
                    className={`text-left font-bold text-xs ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colAuthor', 'Customer')}</span>
                      {renderSortIcon('author_name')}
                    </div>
                  </th>
                )}
                {visibleColumns.feedback && (
                  <th className="text-left font-bold text-xs">{t('cms.colFeedback', 'Feedback')}</th>
                )}
                {visibleColumns.rating && (
                  <th
                    onClick={() => onSort?.('rating')}
                    className={`text-left font-bold text-xs w-28 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colRating', 'Rating')}</span>
                      {renderSortIcon('rating')}
                    </div>
                  </th>
                )}
                {visibleColumns.featured && (
                  <th
                    onClick={() => onSort?.('is_featured')}
                    className={`text-center font-bold text-xs w-28 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t('cms.colFeatured', 'Homepage')}</span>
                      {renderSortIcon('is_featured')}
                    </div>
                  </th>
                )}
                {visibleColumns.status && (
                  <th
                    onClick={() => onSort?.('status')}
                    className={`text-left font-bold text-xs w-24 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colStatus', 'Status')}</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="text-right font-bold text-xs w-20">{t('cms.colActions', 'Actions')}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <LoadingSkeleton cols={colsCount} />
              ) : records.length === 0 ? (
                <EmptyState cols={colsCount} message={t('cms.noTestimonials', 'No testimonials found')} />
              ) : (
                records.map((r) => {
                  const isSelected = selectedRows.includes(r.id)
                  const isActive = r.is_active !== false

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-muted/40 transition-colors group ${
                        isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      <td className="w-10 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectRow?.(r.id)}
                          className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                          aria-label={`Select testimonial ${r.id}`}
                        />
                      </td>
                      {visibleColumns.author && (
                        <td>
                          <div className="flex items-center gap-3 py-1">
                            <AuthorAvatar name={r.author_name} avatarUrl={r.avatar} />
                            <div className="min-w-0">
                              <p
                                onClick={() => openEditModal(r)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer text-sm group-hover:text-primary transition-colors truncate"
                              >
                                {r.author_name}
                              </p>
                              {(r.role || r.company) && (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                  <Building2 size={11} className="text-muted-foreground/70" />
                                  <span>{[r.role, r.company].filter(Boolean).join(' • ')}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.feedback && (
                        <td className="max-w-md xl:max-w-xl">
                          <div
                            className="flex items-start gap-2 py-1 cursor-help group/comment"
                            title={r.comment}
                          >
                            <Quote size={13} className="text-primary shrink-0 mt-0.5 opacity-60" />
                            <p className="text-xs text-foreground/90 italic line-clamp-1 break-words">
                              "{truncateComment(r.comment, 80)}"
                            </p>
                          </div>
                        </td>
                      )}
                      {visibleColumns.rating && (
                        <td>
                          {renderStars(r.rating || 5)}
                        </td>
                      )}
                      {visibleColumns.featured && (
                        <td className="text-center">
                          {r.is_featured ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Sparkles size={11} />
                              <span>{t('cms.featuredOnHome', 'Featured on Home')}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <StatusBadge status={isActive ? 'active' : 'inactive'} />
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
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

export { TestimonialsTable as TestimonialsTab }
export default TestimonialsTable
