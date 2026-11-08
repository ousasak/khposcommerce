import React, { useState, useEffect } from 'react'
import {
  Search,
  X,
  Check,
  ChevronDown,
  Calendar,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface LeaveSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  leaveTypeFilter: string
  onLeaveTypeChange: (val: string) => void
  timeframeFilter: string
  onTimeframeChange: (val: string) => void
  startDateFilter?: string
  onStartDateChange?: (val: string) => void
  endDateFilter?: string
  onEndDateChange?: (val: string) => void
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

/**
 * LeaveSearchBar Component
 * Unified filter toolbar for Leave Management matching the ProductSearchBar standard.
 * Provides instant controlled search input, leave type/status/timeframe dropdowns,
 * distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const LeaveSearchBar: React.FC<LeaveSearchBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  leaveTypeFilter,
  onLeaveTypeChange,
  timeframeFilter,
  onTimeframeChange,
  startDateFilter = '',
  onStartDateChange,
  endDateFilter = '',
  onEndDateChange,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
}) => {
  const { t } = useTranslation(['employees', 'common', 'buttons', 'tables'])

  const [searchDraft, setSearchDraft] = useState(search)
  const [statusDraft, setStatusDraft] = useState(statusFilter)
  const [typeDraft, setTypeDraft] = useState(leaveTypeFilter)
  const [timeframeDraft, setTimeframeDraft] = useState(timeframeFilter)
  const [startDateDraft, setStartDateDraft] = useState(startDateFilter)
  const [endDateDraft, setEndDateDraft] = useState(endDateFilter)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setStatusDraft(statusFilter)
  }, [statusFilter])

  useEffect(() => {
    setTypeDraft(leaveTypeFilter)
  }, [leaveTypeFilter])

  useEffect(() => {
    setTimeframeDraft(timeframeFilter)
  }, [timeframeFilter])

  useEffect(() => {
    setStartDateDraft(startDateFilter)
  }, [startDateFilter])

  useEffect(() => {
    setEndDateDraft(endDateFilter)
  }, [endDateFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onStatusChange(statusDraft)
    onLeaveTypeChange(typeDraft)
    onTimeframeChange(timeframeDraft)
    onStartDateChange?.(startDateDraft)
    onEndDateChange?.(endDateDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setStatusDraft('')
    setTypeDraft('')
    setTimeframeDraft('all')
    setStartDateDraft('')
    setEndDateDraft('')
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
            placeholder={t('employees.search_leaves_placeholder', 'Search employee, code, reason...')}
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

        {/* ─── 2. All Leave Types Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[155px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={typeDraft}
            onChange={(e) => setTypeDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('employees.all_leave_types', 'All Leave Types')}</option>
            <option value="annual">{t('employees.annual_leave', 'Annual Leave')}</option>
            <option value="sick">{t('employees.sick_leave', 'Medical Leave')}</option>
            <option value="special">{t('employees.special_leave', 'Casual Leave')}</option>
            <option value="maternity">{t('employees.maternity_leave', 'Maternity')}</option>
            <option value="unpaid">{t('employees.unpaid_leave', 'Unpaid Leave')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. All Status Dropdown ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[130px] xl:w-[140px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('employees.all_status', 'All Status')}</option>
            <option value="pending">{t('employees.pending', 'Pending')}</option>
            <option value="approved">{t('employees.approved', 'Approved')}</option>
            <option value="rejected">{t('employees.rejected', 'Rejected')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 4. Timeframe Dropdown ─── */}
        <div className={`relative flex-1 min-w-[125px] sm:min-w-[135px] xl:w-[145px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={timeframeDraft}
            onChange={(e) => {
              const val = e.target.value
              setTimeframeDraft(val)
              if (val !== 'custom') {
                setStartDateDraft('')
                setEndDateDraft('')
              }
            }}
            className={selectCls}
          >
            <option value="all">{t('employees.all_time', 'All Time')}</option>
            <option value="7days">{t('employees.last_7_days', 'Last 7 Days')}</option>
            <option value="month">{t('employees.this_month', 'This Month')}</option>
            <option value="year">{t('employees.this_year', 'This Year')}</option>
            <option value="custom">{t('employees.custom_range', 'Custom Range')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 5. From Date (Only when custom range is selected or dates present) ─── */}
        {(timeframeDraft === 'custom' || Boolean(startDateDraft || endDateDraft)) && onStartDateChange && (
          <div className={`relative flex-1 min-w-[130px] sm:min-w-[135px] xl:w-[145px] xl:flex-none ${controlHeightCls} animate-in fade-in duration-150`}>
            <Calendar
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
            />
            <input
              type="date"
              value={startDateDraft}
              onChange={(e) => {
                setStartDateDraft(e.target.value)
                if (timeframeDraft !== 'custom') setTimeframeDraft('custom')
              }}
              title={t('employees.from_date', 'From Date')}
              className={`w-full ${controlHeightCls} pl-8 pr-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none shadow-2xs`}
            />
          </div>
        )}

        {/* ─── 6. To Date (Only when custom range is selected or dates present) ─── */}
        {(timeframeDraft === 'custom' || Boolean(startDateDraft || endDateDraft)) && onEndDateChange && (
          <div className={`relative flex-1 min-w-[130px] sm:min-w-[135px] xl:w-[145px] xl:flex-none ${controlHeightCls} animate-in fade-in duration-150`}>
            <Calendar
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
            />
            <input
              type="date"
              value={endDateDraft}
              onChange={(e) => {
                setEndDateDraft(e.target.value)
                if (timeframeDraft !== 'custom') setTimeframeDraft('custom')
              }}
              title={t('employees.to_date', 'To Date')}
              className={`w-full ${controlHeightCls} pl-8 pr-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none shadow-2xs`}
            />
          </div>
        )}

        {/* ─── 7. Apply Button ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 8. Reset Button ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'Reset')}</span>
        </button>

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

export default LeaveSearchBar

