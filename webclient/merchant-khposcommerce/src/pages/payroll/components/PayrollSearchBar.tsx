import React, { useState, useEffect } from 'react'
import {
  Search,
  X,
  Check,
  ChevronDown,
  Trash2,
  Calendar,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface PayrollSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  departmentFilter: string
  onDepartmentChange: (val: string) => void
  departments?: Array<{ id: number | string; name: string }>
  currencyFilter: string
  onCurrencyChange: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  monthFilter: string
  onMonthChange: (val: string) => void
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
 * PayrollSearchBar Component
 * Unified filter toolbar for Global Payroll Control Center matching the ProductSearchBar standard.
 * Provides instant controlled search input, department/currency/status dropdowns,
 * distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const PayrollSearchBar: React.FC<PayrollSearchBarProps> = ({
  search,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  departments = [],
  currencyFilter,
  onCurrencyChange,
  statusFilter,
  onStatusChange,
  monthFilter,
  onMonthChange,
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
  const { t } = useTranslation(['employees', 'common', 'buttons', 'tables'])

  const [searchDraft, setSearchDraft] = useState(search)
  const [departmentDraft, setDepartmentDraft] = useState(departmentFilter)
  const [currencyDraft, setCurrencyDraft] = useState(currencyFilter)
  const [statusDraft, setStatusDraft] = useState(statusFilter)
  const [monthDraft, setMonthDraft] = useState(monthFilter)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setDepartmentDraft(departmentFilter)
  }, [departmentFilter])

  useEffect(() => {
    setCurrencyDraft(currencyFilter)
  }, [currencyFilter])

  useEffect(() => {
    setStatusDraft(statusFilter)
  }, [statusFilter])

  useEffect(() => {
    setMonthDraft(monthFilter)
  }, [monthFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onDepartmentChange(departmentDraft)
    onCurrencyChange(currencyDraft)
    onStatusChange(statusDraft)
    onMonthChange(monthDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setDepartmentDraft('')
    setCurrencyDraft('')
    setStatusDraft('')
    setMonthDraft('')
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
              'employees.search_payroll_placeholder',
              'Search employee name, ID, department...'
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

        {/* ─── 2. All Departments Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={departmentDraft}
            onChange={(e) => setDepartmentDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('employees.all_departments', 'All Departments')}</option>
            {departments.map((dept) => (
              <option key={dept.id} value={String(dept.id)}>
                {dept.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. All Currencies Dropdown ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[135px] xl:w-[150px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={currencyDraft}
            onChange={(e) => setCurrencyDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('employees.all_currencies', 'All Currencies')}</option>
            <option value="USD">🇺🇸 USD ($)</option>
            <option value="KHR">🇰🇭 KHR (៛)</option>
            <option value="CAD">🇨🇦 CAD (CA$)</option>
            <option value="GBP">🇬🇧 GBP (£)</option>
            <option value="EUR">🇪🇺 EUR (€)</option>
            <option value="AUD">🇦🇺 AUD (A$)</option>
            <option value="SGD">🇸🇬 SGD (S$)</option>
            <option value="JPY">🇯🇵 JPY (¥)</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 4. All Status Dropdown ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[135px] xl:w-[145px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('employees.all_status', 'All Status')}</option>
            <option value="paid">{t('employees.status_processed', 'Processed / Settled')}</option>
            <option value="approved">{t('employees.status_approved', 'Approved')}</option>
            <option value="pending">{t('employees.status_pending', 'Pending Approval')}</option>
            <option value="draft">{t('employees.status_on_hold', 'Draft / On Hold')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 5. Month / Period Selector ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[140px] xl:w-[150px] xl:flex-none ${controlHeightCls}`}>
          <Calendar
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="month"
            value={monthDraft}
            onChange={(e) => setMonthDraft(e.target.value)}
            title={t('employees.select_period_month', 'Select Month')}
            className={`w-full ${controlHeightCls} pl-8 pr-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none shadow-2xs`}
          />
        </div>

        {/* ─── 6. Apply Button ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 7. Reset Button ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'Reset')}</span>
        </button>

        {/* ─── 8. Bulk Delete Button (Appears when rows selected) ─── */}
        {selectedCount > 0 && onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className={`${controlHeightCls} px-3 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs`}
          >
            <Trash2 size={14} />
            <span>
              {t('employees.deleteSelected', { count: selectedCount, defaultValue: `Delete Selected (${selectedCount})` })}
            </span>
          </button>
        )}

        {/* ─── 9. Manage Column Table (ColumnSettingsPopover) ─── */}
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

export default PayrollSearchBar
