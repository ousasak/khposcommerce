import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface BranchSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  searchPlaceholder?: string
  statusFilter?: string
  onStatusChange?: (val: string) => void
  provinceFilter?: string
  onProvinceChange?: (val: string) => void
  typeFilter?: string
  onTypeChange?: (val: string) => void
  typeOptions?: Array<{ label: string; value: string }>
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
  rightAction?: React.ReactNode
}

/**
 * BranchSearchBar Component
 * SmartHR-style filter toolbar for Branches / Stores / Warehouses management.
 * Provides instant 1-click filtering, controlled search input,
 * distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const BranchSearchBar: React.FC<BranchSearchBarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder,
  statusFilter = '',
  onStatusChange,
  provinceFilter = '',
  onProvinceChange,
  typeFilter = '',
  onTypeChange,
  typeOptions,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
  rightAction,
}) => {
  const { t } = useTranslation(['common', 'buttons', 'tables'])

  const [searchDraft, setSearchDraft] = useState(search)
  const [statusDraft, setStatusDraft] = useState(statusFilter)
  const [provinceDraft, setProvinceDraft] = useState(provinceFilter)
  const [typeDraft, setTypeDraft] = useState(typeFilter)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setStatusDraft(statusFilter)
  }, [statusFilter])

  useEffect(() => {
    setProvinceDraft(provinceFilter)
  }, [provinceFilter])

  useEffect(() => {
    setTypeDraft(typeFilter)
  }, [typeFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onStatusChange?.(statusDraft)
    onProvinceChange?.(provinceDraft)
    onTypeChange?.(typeDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setStatusDraft('')
    setProvinceDraft('')
    setTypeDraft('')
    onReset()
  }

  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <div className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden">
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        ─── 1. Search input ───
        <div className={`relative w-full sm:w-72 md:w-80 lg:w-96 max-w-sm shrink-0 ${controlHeightCls}`}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={
              searchPlaceholder ||
              t('common.searchNameCodePhone', 'Search name, code, phone...')
            }
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

        {/* ─── 2. Province / Location Dropdown ─── */}
        {onProvinceChange && (
          <div className={`relative flex-1 min-w-[125px] sm:min-w-[140px] xl:w-[155px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={provinceDraft}
              onChange={(e) => setProvinceDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">{t('common.allLocations', 'All Locations')}</option>
              <option value="Phnom Penh">{t('common.provinces.phnomPenh', 'Phnom Penh')}</option>
              <option value="Siem Reap">{t('common.provinces.siemReap', 'Siem Reap')}</option>
              <option value="Battambang">{t('common.provinces.battambang', 'Battambang')}</option>
              <option value="Sihanoukville">{t('common.provinces.sihanoukville', 'Sihanoukville')}</option>
              <option value="Kampot">{t('common.provinces.kampot', 'Kampot')}</option>
              <option value="Kandal">{t('common.provinces.kandal', 'Kandal')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 3. Type Dropdown ─── */}
        {onTypeChange && (
          <div className={`relative flex-1 min-w-[120px] sm:min-w-[130px] xl:w-[140px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={typeDraft}
              onChange={(e) => setTypeDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">{t('common.allTypes', 'All Types')}</option>
              {typeOptions ? (
                typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="main">{t('common.mainHq', 'Main HQ')}</option>
                  <option value="sub">{t('common.subBranch', 'Sub Branch')}</option>
                </>
              )}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 4. Status Dropdown ─── */}
        {onStatusChange && (
          <div className={`relative flex-1 min-w-[115px] sm:min-w-[125px] xl:w-[135px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">{t('common.allStatus', 'All Status')}</option>
              <option value="active">{t('common.status.active', 'Active')}</option>
              <option value="inactive">{t('common.status.inactive', 'Inactive')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 5. Apply Button (Dark Teal/Forest Green #0f766e matching SmartHR) ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('buttons.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 6. Reset Button (Clean SmartHR neutral outline) ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('buttons.resetAllFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'Reset')}</span>
        </button>

        {/* ─── 7. Right Action if passed (e.g. Add button on tab) ─── */}
        {rightAction && (
          <div className="shrink-0">{rightAction}</div>
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

export default BranchSearchBar
