import React, { useState, useEffect } from 'react'
import {
  Search,
  X,
  Check,
  ChevronDown,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface ExpenseSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  categoryFilter: string
  onCategoryChange: (val: string) => void
  categories?: Array<{ id: number | string; name: string }>
  statusFilter: string
  onStatusChange: (val: string) => void
  timeframeFilter?: string
  onTimeframeChange?: (val: string) => void
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
  selectedCount?: number
  onBulkDelete?: () => void
}

/**
 * ExpenseSearchBar Component
 * Unified filter toolbar for Expense Management matching the ProductSearchBar standard.
 * Provides instant controlled search input, category/status/timeframe dropdowns,
 * distinct Apply & Reset buttons, Bulk Delete action, and Column Settings Popover.
 */
export const ExpenseSearchBar: React.FC<ExpenseSearchBarProps> = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories = [],
  statusFilter,
  onStatusChange,
  timeframeFilter = 'all',
  onTimeframeChange,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
  selectedCount = 0,
  onBulkDelete,
}) => {
  const { t } = useTranslation(['finance', 'common', 'buttons', 'tables'])

  const [searchDraft, setSearchDraft] = useState(search)
  const [categoryDraft, setCategoryDraft] = useState(categoryFilter)
  const [statusDraft, setStatusDraft] = useState(statusFilter)
  const [timeframeDraft, setTimeframeDraft] = useState(timeframeFilter)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setCategoryDraft(categoryFilter)
  }, [categoryFilter])

  useEffect(() => {
    setStatusDraft(statusFilter)
  }, [statusFilter])

  useEffect(() => {
    setTimeframeDraft(timeframeFilter)
  }, [timeframeFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onCategoryChange(categoryDraft)
    onStatusChange(statusDraft)
    onTimeframeChange?.(timeframeDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setCategoryDraft('')
    setStatusDraft('')
    setTimeframeDraft('all')
    onReset()
  }

  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <div className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden">
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* ─── 1. Search input ─── */}
        <div className={`relative w-full sm:w-72 md:w-80 lg:w-96 max-w-sm shrink-0 ${controlHeightCls}`}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t(
              'finance.search_claim_placeholder',
              'Search claim title, ref #, merchant, employee...'
            )}
            className={`w-full ${controlHeightCls} pl-9 pr-8 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 placeholder:text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs`}
          />
          {searchDraft && (
            <button
              type="button"
              onClick={() => setSearchDraft('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              title={t('common.clearSearch', 'Clear search')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ─── 2. All Categories Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={categoryDraft}
            onChange={(e) => setCategoryDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('finance.all_categories_filter', 'All Categories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. All Status Dropdown ─── */}
        <div className={`relative flex-1 min-w-[125px] sm:min-w-[140px] xl:w-[155px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('finance.all_status_filter', 'All Status')}</option>
            <option value="pending">{t('finance.status_pending_approval', 'Pending Approval')}</option>
            <option value="approved">{t('finance.status_approved_claims', 'Approved Claims')}</option>
            <option value="rejected">{t('finance.status_policy_exceptions', 'Policy Exceptions')}</option>
            <option value="paid">{t('finance.status_reimbursed_settled', 'Reimbursed Total')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 4. Timeframe Dropdown ─── */}
        {onTimeframeChange && (
          <div className={`relative flex-1 min-w-[120px] sm:min-w-[130px] xl:w-[145px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={timeframeDraft}
              onChange={(e) => setTimeframeDraft(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('finance.all_time', 'All Time')}</option>
              <option value="today">{t('finance.time_today', 'Today')}</option>
              <option value="month">{t('finance.time_this_month', 'This Month')}</option>
              <option value="quarter">{t('finance.time_this_quarter', 'This Quarter')}</option>
              <option value="30d">{t('finance.time_last_30_days', 'Last 30 Days')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 5. Apply Button ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 6. Reset Button ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'Reset')}</span>
        </button>

        {/* ─── 7. Bulk Delete Action ─── */}
        {selectedCount > 0 && onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className={`${controlHeightCls} px-3 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs`}
          >
            <Trash2 size={14} />
            <span>
              {t('finance.delete_selected', 'Delete Selected')} ({selectedCount})
            </span>
          </button>
        )}

        {/* ─── 8. Column Settings Popover ─── */}
        {columns.length > 0 && onColumnChange && (
          <div className="ml-auto shrink-0">
            <ColumnSettingsPopover
              columns={columns}
              visibleColumns={visibleColumns}
              defaultVisibleColumns={defaultVisibleColumns}
              onChange={onColumnChange}
              size="md"
              label={t('tables.manageTable', 'Manage Table')}
              buttonClassName="border-slate-300 dark:border-slate-700 shadow-2xs"
              title={columnSettingsTitle}
            />
          </div>
        )}
      </form>
    </div>
  )
}

export default ExpenseSearchBar
