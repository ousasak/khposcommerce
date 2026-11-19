import React from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface BlogArticlesSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  statusFilter?: string
  onStatusChange?: (val: string) => void
}

/**
 * BlogArticlesSearchBar Component
 * Ultra-clean, compact, auto-filtering search and status selector.
 * Eliminates bulky apply/reset buttons in favor of instant debounced search.
 */
export const BlogArticlesSearchBar: React.FC<BlogArticlesSearchBarProps> = ({
  search,
  onSearchChange,
  statusFilter = 'all',
  onStatusChange,
}) => {
  const { t } = useTranslation(['cms', 'common'])

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto print:hidden">
      {/* ─── Search input ─── */}
      <div className="relative flex-1 sm:w-56 md:w-64 h-9">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('cms.searchPlaceholder', 'ស្វែងរកចំណងជើង...')}
          className="w-full h-9 pl-8 pr-7 text-xs sm:text-sm font-medium rounded-xl border border-border/80 bg-card dark:bg-slate-900 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
            title={t('common.clearSearch', 'Clear search')}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ─── Status Dropdown ─── */}
      {onStatusChange && (
        <div className="relative w-36 sm:w-40 shrink-0 h-9">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full h-9 pl-3 pr-7 text-xs sm:text-sm font-medium rounded-xl border border-border/80 bg-card dark:bg-slate-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer shadow-2xs"
          >
            <option value="all">{t('cms.allStatuses', 'គ្រប់ស្ថានភាព')}</option>
            <option value="published">{t('cms.published', 'បានផ្សព្វផ្សាយ')}</option>
            <option value="draft">{t('cms.drafts', 'ព្រាងទុក')}</option>
            <option value="archived">{t('cms.archived', 'ប័ណ្ណសារ')}</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
      )}
    </div>
  )
}

export default BlogArticlesSearchBar
