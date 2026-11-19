import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface CouponSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  typeFilter: string
  onTypeChange: (val: string) => void
  channelFilter?: string
  onChannelChange?: (val: string) => void
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
 * CouponSearchBar Component
 * SmartHR-style unified filter toolbar for Coupons matching the ProductSearchBar standard.
 * Provides instant 1-click filtering, controlled search input,
 * status, type & channel dropdowns, distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const CouponSearchBar: React.FC<CouponSearchBarProps> = ({
  search,
  onSearchChange,
  statusFilter = 'all',
  onStatusChange,
  typeFilter = 'all',
  onTypeChange,
  channelFilter = 'all',
  onChannelChange,
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
  const { t } = useTranslation(['marketing', 'products', 'common', 'buttons', 'tables'])

  // Local draft states for fast typing and 1-click batch application
  const [searchDraft, setSearchDraft] = useState(search)
  const [statusDraft, setStatusDraft] = useState(statusFilter || 'all')
  const [typeDraft, setTypeDraft] = useState(typeFilter || 'all')
  const [channelDraft, setChannelDraft] = useState(channelFilter || 'all')

  // Synchronize when external props reset
  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setStatusDraft(statusFilter || 'all')
  }, [statusFilter])

  useEffect(() => {
    setTypeDraft(typeFilter || 'all')
  }, [typeFilter])

  useEffect(() => {
    setChannelDraft(channelFilter || 'all')
  }, [channelFilter])

  // Apply Handler
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onStatusChange(statusDraft)
    onTypeChange(typeDraft)
    onChannelChange?.(channelDraft)
    onApply?.()
  }

  // Reset Handler
  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setStatusDraft('all')
    setTypeDraft('all')
    setChannelDraft('all')
    onReset()
  }

  // Uniform height and crisp visible borders matching ProductSearchBar standard
  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <div className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden">
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* ─── 1. Search input (Search coupon name, code...) ─── */}
        <div className={`relative w-full sm:w-72 md:w-80 lg:w-96 max-w-sm shrink-0 ${controlHeightCls}`}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t('marketing.searchPlaceholder', 'ស្វែងរកឈ្មោះ ឬកូដប័ណ្ណ...')}
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

        {/* ─── 2. All Status Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[155px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('products.allStatus', 'គ្រប់ស្ថានភាព')}</option>
            <option value="active">{t('common.active', 'សកម្ម')}</option>
            <option value="expiring_soon">{t('marketing.expiringSoon', 'ជិតផុតកំណត់')}</option>
            <option value="expired">{t('marketing.statusExpired', 'ផុតកំណត់')}</option>
            <option value="disabled">{t('common.inactive', 'អសកម្ម')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. All Types Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={typeDraft}
            onChange={(e) => setTypeDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('common.allTypes', 'គ្រប់ប្រភេទ')}</option>
            <option value="percentage">{t('marketing.percentageDiscount', 'ភាគរយ (%)')}</option>
            <option value="fixed">{t('marketing.fixedDiscount', 'ចំនួនទឹកប្រាក់ ($)')}</option>
            <option value="free_shipping">{t('marketing.freeShipping', 'ដឹកជញ្ជូនឥតគិតថ្លៃ')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 4. Channel Scope Dropdown ─── */}
        {onChannelChange && (
          <div className={`relative flex-1 min-w-[125px] sm:min-w-[135px] xl:w-[145px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={channelDraft}
              onChange={(e) => setChannelDraft(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('common.allChannels', 'គ្រប់បណ្តាញ')}</option>
              <option value="all_channels">Omni-Channel</option>
              <option value="pos_only">POS តាមបញ្ជរ</option>
              <option value="storefront_only">Storefront Web</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 5. Apply Button (Dark Teal/Forest Green matching ProductSearchBar) ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'អនុវត្ត')}</span>
        </button>

        {/* ─── 6. Reset Button (Clean neutral outline matching ProductSearchBar) ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'កំណត់ឡើងវិញ')}</span>
        </button>

        {/* ─── 7. Bulk Delete Button (Appears when rows selected) ─── */}
        {selectedCount > 0 && onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className={`${controlHeightCls} px-3 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs`}
          >
            <Trash2 size={14} />
            <span>
              {t('common.deleteSelected', 'លុបដែលបានជ្រើស')} ({selectedCount})
            </span>
          </button>
        )}

        {/* ─── 8. Manage Column Table (ColumnSettingsPopover) ─── */}
        {columns.length > 0 && onColumnChange && (
          <div className="ml-auto shrink-0">
            <ColumnSettingsPopover
              columns={columns}
              visibleColumns={visibleColumns}
              defaultVisibleColumns={defaultVisibleColumns}
              onChange={onColumnChange}
              size="md"
              label={t('tables.manageTable', 'គ្រប់គ្រងតារាង')}
              buttonClassName="border-slate-300 dark:border-slate-700 shadow-2xs"
              title={columnSettingsTitle}
            />
          </div>
        )}
      </form>
    </div>
  )
}

export default CouponSearchBar

