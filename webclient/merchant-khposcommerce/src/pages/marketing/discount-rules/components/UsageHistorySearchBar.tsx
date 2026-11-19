import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface UsageHistorySearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  channelFilter: string
  onChannelChange: (val: string) => void
  campaignFilter: string
  onCampaignChange: (val: string) => void
  dateFilter: string
  onDateChange: (val: string) => void
  campaigns?: Array<{ id: number; name: string; code: string }>
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

/**
 * UsageHistorySearchBar Component
 * Unified search & filter bar for Promotion Usage History.
 * Designed to align with the PromotionSearchBar, DiscountRulesSearchBar, and ProductSearchBar standards.
 */
export const UsageHistorySearchBar: React.FC<UsageHistorySearchBarProps> = ({
  search,
  onSearchChange,
  channelFilter = 'all',
  onChannelChange,
  campaignFilter = 'all',
  onCampaignChange,
  dateFilter = 'all',
  onDateChange,
  campaigns = [],
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
  const [channelDraft, setChannelDraft] = useState(channelFilter || 'all')
  const [campaignDraft, setCampaignDraft] = useState(campaignFilter || 'all')
  const [dateDraft, setDateDraft] = useState(dateFilter || 'all')

  // Synchronize when external props reset
  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setChannelDraft(channelFilter || 'all')
  }, [channelFilter])

  useEffect(() => {
    setCampaignDraft(campaignFilter || 'all')
  }, [campaignFilter])

  useEffect(() => {
    setDateDraft(dateFilter || 'all')
  }, [dateFilter])

  // Apply Handler
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onChannelChange(channelDraft)
    onCampaignChange(campaignDraft)
    onDateChange(dateDraft)
    onApply?.()
  }

  // Reset Handler
  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setChannelDraft('all')
    setCampaignDraft('all')
    setDateDraft('all')
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
            placeholder={t('marketing.searchUsagePlaceholder', 'Search transaction, campaign, customer, or code...')}
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

        {/* ─── 2. Channels Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[155px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={channelDraft}
            onChange={(e) => setChannelDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('marketing.allChannels', 'All Channels')}</option>
            <option value="pos">{t('marketing.channelPos', 'POS')}</option>
            <option value="web">{t('marketing.channelWeb', 'Web')}</option>
            <option value="mobile">{t('marketing.channelMobile', 'Mobile App')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. Campaigns Dropdown ─── */}
        <div className={`relative flex-1 min-w-[140px] sm:min-w-[160px] xl:w-[185px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={campaignDraft}
            onChange={(e) => setCampaignDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('marketing.allCampaigns', 'All Campaigns')}</option>
            {campaigns.map((camp) => (
              <option key={camp.id} value={String(camp.id)}>
                {camp.name} ({camp.code})
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 4. Date Range Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[155px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={dateDraft}
            onChange={(e) => setDateDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('marketing.allDates', 'All Dates')}</option>
            <option value="today">{t('marketing.dateToday', 'Today')}</option>
            <option value="last_7_days">{t('marketing.dateLast7Days', 'Last 7 Days')}</option>
            <option value="last_30_days">{t('marketing.dateLast30Days', 'Last 30 Days')}</option>
            <option value="this_month">{t('marketing.dateThisMonth', 'This Month')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

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
          className={`${controlHeightCls} px-3 sm:px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset Filters')}
        >
          <RotateCcw size={14} className="text-slate-500 dark:text-slate-400" />
          <span>{t('buttons.reset', 'Reset')}</span>
        </button>

        {/* ─── 7. Column Settings Popover ─── */}
        {columns.length > 0 && onColumnChange && (
          <div className="ml-auto shrink-0">
            <ColumnSettingsPopover
              columns={columns}
              visibleColumns={visibleColumns}
              defaultVisibleColumns={defaultVisibleColumns}
              onChange={onColumnChange}
              title={columnSettingsTitle || t('marketing.columnSettings', 'Column Settings')}
              variant="button"
            />
          </div>
        )}
      </form>
    </div>
  )
}

export default UsageHistorySearchBar
