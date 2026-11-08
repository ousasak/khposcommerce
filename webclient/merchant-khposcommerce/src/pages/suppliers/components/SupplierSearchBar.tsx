import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Check, ChevronDown, X } from 'lucide-react'
import { sound } from '@/utils/sound'
import ColumnSettingsPopover, {
  type ColumnOption,
} from '@/components/shared/ColumnSettingsPopover'

export interface SupplierSearchBarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  countryFilter: string
  setCountryFilter: (val: string) => void
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

export const SupplierSearchBar: React.FC<SupplierSearchBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  countryFilter,
  setCountryFilter,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns = {},
  onColumnChange,
  columnSettingsTitle,
}) => {
  const { t } = useTranslation(['suppliers', 'common', 'buttons', 'tables'])

  // Draft filter states for 1-click apply
  const [searchDraft, setSearchDraft] = useState(search)
  const [statusDraft, setStatusDraft] = useState(statusFilter)
  const [countryDraft, setCountryDraft] = useState(countryFilter)

  // Sync external filter changes
  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setStatusDraft(statusFilter)
  }, [statusFilter])

  useEffect(() => {
    setCountryDraft(countryFilter)
  }, [countryFilter])

  // Apply Handler
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft)
    setStatusFilter(statusDraft)
    setCountryFilter(countryDraft)
    if (onApply) {
      onApply()
    }
  }

  // Reset Handler (neutral, no error state)
  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setStatusDraft('')
    setCountryDraft('')
    onReset()
  }

  // Uniform height and crisp visible borders matching SmartHR design
  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <div className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden">
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* ─── 1. Search input (Search Name, Code, Phone, Email...) ─── */}
        <div className={`relative w-full sm:w-72 md:w-80 lg:w-96 max-w-sm shrink-0 ${controlHeightCls}`}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t('suppliers.searchPlaceholder', 'Search supplier name, code, contact...')}
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

        {/* ─── 2. All Countries (Cambodia, Vietnam, Thailand, China...) ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={countryDraft}
            onChange={(e) => setCountryDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('common.allCountries', 'All Countries')}</option>
            <option value="Cambodia">{t('common.countries.cambodia', 'Cambodia')}</option>
            <option value="Thailand">{t('common.countries.thailand', 'Thailand')}</option>
            <option value="Vietnam">{t('common.countries.vietnam', 'Vietnam')}</option>
            <option value="China">{t('common.countries.china', 'China')}</option>
            <option value="Singapore">{t('common.countries.singapore', 'Singapore')}</option>
            <option value="Malaysia">{t('common.countries.malaysia', 'Malaysia')}</option>
            <option value="United States">{t('common.countries.usa', 'United States')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. All Status (Active / Inactive) ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[135px] xl:w-[145px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('common.allStatus', 'All Status')}</option>
            <option value="active">{t('common.active', 'Active')}</option>
            <option value="inactive">{t('common.inactive', 'Inactive')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 4. Apply Button (Dark Teal/Forest Green matching SmartHR) ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 5. Reset Button (Clean SmartHR neutral outline, no red) ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'Reset')}</span>
        </button>

        {/* ─── 6. Manage Column Table (ColumnSettingsPopover) ─── */}
        {columns.length > 0 && onColumnChange && (
          <div className="ml-auto shrink-0">
            <ColumnSettingsPopover
              columns={columns}
              visibleColumns={visibleColumns}
              defaultVisibleColumns={defaultVisibleColumns}
              onChange={onColumnChange}
              size="md"
              label={t('tables.manageColumns', 'Manage Columns')}
              buttonClassName="border-slate-300 dark:border-slate-700 shadow-2xs"
              title={columnSettingsTitle}
            />
          </div>
        )}
      </form>
    </div>
  )
}

export default SupplierSearchBar

