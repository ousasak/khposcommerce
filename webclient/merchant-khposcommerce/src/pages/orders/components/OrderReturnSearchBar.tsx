import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface OrderReturnSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  faultFilter: string
  onFaultChange: (val: string) => void
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

/**
 * OrderReturnSearchBar Component
 * Unified filter toolbar for Order Returns & Exchanges matching the ProductSearchBar standard.
 * Provides instant controlled search input, return status, and fault allocation dropdowns,
 * distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const OrderReturnSearchBar: React.FC<OrderReturnSearchBarProps> = ({
  search,
  onSearchChange,
  statusFilter = 'all',
  onStatusChange,
  faultFilter = 'all',
  onFaultChange,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
}) => {
  const { t } = useTranslation(['returns', 'common', 'buttons', 'tables'])

  const [searchDraft, setSearchDraft] = useState(search)
  const [statusDraft, setStatusDraft] = useState(statusFilter || 'all')
  const [faultDraft, setFaultDraft] = useState(faultFilter || 'all')

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setStatusDraft(statusFilter || 'all')
  }, [statusFilter])

  useEffect(() => {
    setFaultDraft(faultFilter || 'all')
  }, [faultFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onStatusChange(statusDraft)
    onFaultChange(faultDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setStatusDraft('all')
    setFaultDraft('all')
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
            placeholder={t('returns.searchPlaceholder', 'Search by RMA number, customer, or order #...')}
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

        {/* ─── 2. Return Status Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[165px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('returns.allStatus', 'All Status')}</option>
            <option value="requested">{t('returns.statusRequested', 'Requested')}</option>
            <option value="approved">{t('returns.statusApproved', 'Approved')}</option>
            <option value="received">{t('returns.statusReceived', 'Received')}</option>
            <option value="inspected">{t('returns.statusInspected', 'Inspected')}</option>
            <option value="refunded">{t('returns.statusRefunded', 'Refunded')}</option>
            <option value="exchanged">{t('returns.statusExchanged', 'Exchanged')}</option>
            <option value="rejected">{t('returns.statusRejected', 'Rejected')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. Fault Allocation Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[170px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={faultDraft}
            onChange={(e) => setFaultDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('returns.allFaults', 'All Faults')}</option>
            <option value="customer">{t('returns.customerFaultOption', 'Customer Fault')}</option>
            <option value="store">{t('returns.storeFaultOption', 'Store Fault')}</option>
            <option value="courier">{t('returns.courierFaultOption', 'Courier Fault')}</option>
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
          title={t('buttons.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 5. Reset Button ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('buttons.resetAllFilters', 'Reset all filters')}
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

export default OrderReturnSearchBar

