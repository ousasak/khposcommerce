import React, { useState, useEffect } from 'react'
import {
  Search,
  X,
  Check,
  ChevronDown,
  Trash2,
  ShieldCheck,
  Briefcase,
  UserCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'
import { getCustomerGroupDisplayName } from '@/utils/customerGroupFormatters'
import { useThemeStore } from '@/stores/themeStore'

export interface CustomerSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  groupIdFilter: string
  onGroupChange: (val: string) => void
  groups?: Array<{ id: number | string; name: string }>
  rfmFilter?: string
  onRfmChange?: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
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
 * CustomerSearchBar Component
 * Clean SmartHR-style filter toolbar for Customer Accounts management.
 * Matches https://smarthr.dreamstechnologies.com/fsm/react/customers
 * Features:
 * - Search company name, ID, contact, or city...
 * - All SLA Tiers (Customer Groups) dropdown with icon
 * - All Industries (RFM / Segments) dropdown with icon
 * - All Status dropdown with icon
 * - Distinct Apply & Reset Filters buttons
 * - Column Settings Popover (ml-auto)
 */
export const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
  search,
  onSearchChange,
  groupIdFilter,
  onGroupChange,
  groups = [],
  rfmFilter = '',
  onRfmChange,
  statusFilter,
  onStatusChange,
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
  const { t } = useTranslation(['customers', 'common', 'buttons', 'tables'])
  const { language } = useThemeStore()

  const [searchDraft, setSearchDraft] = useState(search)
  const [groupDraft, setGroupDraft] = useState(groupIdFilter)
  const [rfmDraft, setRfmDraft] = useState(rfmFilter)
  const [statusDraft, setStatusDraft] = useState(statusFilter)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setGroupDraft(groupIdFilter)
  }, [groupIdFilter])

  useEffect(() => {
    setRfmDraft(rfmFilter)
  }, [rfmFilter])

  useEffect(() => {
    setStatusDraft(statusFilter)
  }, [statusFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onGroupChange(groupDraft)
    onRfmChange?.(rfmDraft)
    onStatusChange(statusDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setGroupDraft('')
    setRfmDraft('')
    setStatusDraft('all')
    onReset()
  }

  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-8 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <div className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden">
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* ─── 1. Search input (Search company name, ID, contact, or city...) ─── */}
        <div className={`relative w-full sm:w-72 md:w-80 lg:w-96 max-w-sm shrink-0 ${controlHeightCls}`}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t('customers.searchPlaceholder', 'Search company name, ID, contact, or city...')}
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

        {/* ─── 2. All SLA Tiers / Customer Groups Dropdown with Icon ─── */}
        <div className={`relative flex-1 min-w-[135px] sm:min-w-[150px] xl:w-[165px] xl:flex-none ${controlHeightCls}`}>
          <ShieldCheck
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={groupDraft}
            onChange={(e) => setGroupDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('customers.allSlaTiers', 'All SLA Tiers')}</option>
            {groups.map((g) => (
              <option key={g.id} value={String(g.id)}>
                {getCustomerGroupDisplayName(g.name, t, language)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. All Industries / RFM Segments Dropdown with Icon ─── */}
        {onRfmChange && (
          <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
            <Briefcase
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={rfmDraft}
              onChange={(e) => setRfmDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">{t('customers.allIndustries', 'All Industries')}</option>
              <option value="champions">{t('customers.segmentChampions', 'Champions')}</option>
              <option value="loyal">{t('customers.segmentLoyal', 'Loyal Customers')}</option>
              <option value="potential">{t('customers.segmentPotential', 'Potential Loyalists')}</option>
              <option value="at_risk">{t('customers.segmentAtRisk', 'At-Risk Accounts')}</option>
              <option value="new">{t('customers.segmentNew', 'New Accounts')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 4. All Status Dropdown with Icon ─── */}
        <div className={`relative flex-1 min-w-[115px] sm:min-w-[125px] xl:w-[135px] xl:flex-none ${controlHeightCls}`}>
          <UserCheck
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('common.allStatus', 'All Status')}</option>
            <option value="active">{t('common.active', 'Active')}</option>
            <option value="inactive">{t('common.inactive', 'Inactive')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 5. Apply Button (Dark Teal/Forest Green #0f766e matching SmartHR) ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 6. Reset Filters Button (Matches SmartHR 'Reset Filters') ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'Reset Filters')}</span>
        </button>

        {/* ─── 7. Bulk Delete Action (Conditionally displayed when rows are checked) ─── */}
        {selectedCount > 0 && onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className={`${controlHeightCls} px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.98] cursor-pointer shrink-0`}
            title={`${t('customers.deleteSelected', 'Delete Selected')} (${selectedCount})`}
          >
            <Trash2 size={14} />
            <span>
              {t('customers.deleteSelected', 'Delete Selected')} ({selectedCount})
            </span>
          </button>
        )}

        {/* ─── 8. Manage Column Table (Aligned right) ─── */}
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

export default CustomerSearchBar

