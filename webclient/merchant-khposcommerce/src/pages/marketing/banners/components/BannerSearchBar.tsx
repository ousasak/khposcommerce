import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface BannerSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  positionFilter: string
  onPositionChange: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

/**
 * BannerSearchBar Component
 * Unified standard filter toolbar for Banners matching FlashSaleSearchBar and CouponSearchBar.
 * Features search input with clear button, position & status dropdowns,
 * distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const BannerSearchBar: React.FC<BannerSearchBarProps> = ({
  search,
  onSearchChange,
  positionFilter = 'all',
  onPositionChange,
  statusFilter = 'all',
  onStatusChange,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons', 'tables'])

  // Local draft states for fast typing and 1-click batch application
  const [searchDraft, setSearchDraft] = useState(search)
  const [positionDraft, setPositionDraft] = useState(positionFilter || 'all')
  const [statusDraft, setStatusDraft] = useState(statusFilter || 'all')

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setPositionDraft(positionFilter || 'all')
  }, [positionFilter])

  useEffect(() => {
    setStatusDraft(statusFilter || 'all')
  }, [statusFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onPositionChange(positionDraft)
    onStatusChange(statusDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setPositionDraft('all')
    setStatusDraft('all')
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
            placeholder={t('marketing.searchBannersPlaceholder', 'ស្វែងរកកូដបដា, ឈ្មោះ, ទីតាំង...')}
            className={`w-full ${controlHeightCls} pl-9 pr-8 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 placeholder:text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs`}
          />
          {searchDraft && (
            <button
              type="button"
              onClick={() => setSearchDraft('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              title={t('common.clearSearch', 'សម្អាតការស្វែងរក')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ─── 2. Placement Dropdown ─── */}
        <div className={`relative flex-1 min-w-[140px] sm:min-w-[160px] xl:w-[185px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={positionDraft}
            onChange={(e) => setPositionDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('marketing.allPositions', 'គ្រប់ទីតាំងទាំងអស់')}</option>
            <option value="hero">{t('marketing.placementHero', 'ស្លាយទំព័រដើម (Hero)')}</option>
            <option value="pos_cfd">{t('marketing.placementPosCfd', 'អេក្រង់អតិថិជន POS (CFD)')}</option>
            <option value="app_splash">{t('marketing.placementMobileApp', 'កម្មវិធីទូរស័ព្ទដៃ (App)')}</option>
            <option value="sidebar">{t('marketing.placementSidebar', 'ចំហៀងទំព័រ (Sidebar)')}</option>
            <option value="popup">{t('marketing.placementPopup', 'ផ្ទាំងផុសផ្សព្វផ្សាយ (Popup)')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. All Status Dropdown ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[140px] xl:w-[150px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('common.allStatus', 'គ្រប់ស្ថានភាព')}</option>
            <option value="active">{t('marketing.active', 'សកម្ម')}</option>
            <option value="inactive">{t('marketing.inactive', 'អសកម្ម')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 4. Apply Button ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('buttons.apply', 'អនុវត្ត')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'អនុវត្ត')}</span>
        </button>

        {/* ─── 5. Reset Button ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('buttons.reset', 'កំណត់ឡើងវិញ')}
        >
          <span>{t('buttons.reset', 'កំណត់ឡើងវិញ')}</span>
        </button>

        {/* ─── 6. Manage Column Table ─── */}
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

export default BannerSearchBar
