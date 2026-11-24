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
import { formatShiftName } from '@/utils/shiftFormatters'
import type { Shift } from './WeeklyShiftRosterTab'

export interface RosterSearchBarProps {
  selectedDate: string
  onDateChange: (date: string) => void
  search: string
  onSearchChange: (val: string) => void
  departmentFilter: string
  onDepartmentChange: (val: string) => void
  departmentsList: string[]
  branchFilter: string
  onBranchChange: (val: string) => void
  branchesList: any[]
  shiftFilter: string
  onShiftChange: (val: string) => void
  shiftsList: Shift[]
  scheduleStatusFilter: string
  onScheduleStatusChange: (val: string) => void
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

/**
 * RosterSearchBar Component
 * Unified filter toolbar for Weekly Shift Roster matching the ProductSearchBar standard.
 * Provides week selection, controlled search input, department/branch/shift/status dropdowns,
 * distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const RosterSearchBar: React.FC<RosterSearchBarProps> = ({
  selectedDate,
  onDateChange,
  search,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  departmentsList = [],
  branchFilter,
  onBranchChange,
  branchesList = [],
  shiftFilter,
  onShiftChange,
  shiftsList = [],
  scheduleStatusFilter,
  onScheduleStatusChange,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common', 'buttons', 'tables'])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  const [dateDraft, setDateDraft] = useState(selectedDate)
  const [searchDraft, setSearchDraft] = useState(search)
  const [deptDraft, setDeptDraft] = useState(departmentFilter)
  const [branchDraft, setBranchDraft] = useState(branchFilter)
  const [shiftDraft, setShiftDraft] = useState(shiftFilter)
  const [statusDraft, setStatusDraft] = useState(scheduleStatusFilter)

  useEffect(() => {
    setDateDraft(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setDeptDraft(departmentFilter)
  }, [departmentFilter])

  useEffect(() => {
    setBranchDraft(branchFilter)
  }, [branchFilter])

  useEffect(() => {
    setShiftDraft(shiftFilter)
  }, [shiftFilter])

  useEffect(() => {
    setStatusDraft(scheduleStatusFilter)
  }, [scheduleStatusFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onDateChange(dateDraft)
    onSearchChange(searchDraft.trim())
    onDepartmentChange(deptDraft)
    onBranchChange(branchDraft)
    onShiftChange(shiftDraft)
    onScheduleStatusChange(statusDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const today = `${year}-${month}-${day}`
    setDateDraft(today)
    setSearchDraft('')
    setDeptDraft('all')
    setBranchDraft('all')
    setShiftDraft('all')
    setStatusDraft('all')
    onReset()
  }

  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <div className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden">
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* ─── 1. Week Reference Date Picker ─── */}
        <div className={`relative w-full sm:w-44 md:w-48 shrink-0 ${controlHeightCls}`}>
          <Calendar
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="date"
            value={dateDraft}
            onChange={(e) => setDateDraft(e.target.value)}
            title={t('employees.select_week_date', 'Select Week Date')}
            className={`w-full ${controlHeightCls} pl-8 pr-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none shadow-2xs`}
          />
        </div>

        {/* ─── 2. Search input ─── */}
        <div className={`relative w-full sm:w-64 md:w-72 lg:w-80 max-w-sm shrink-0 ${controlHeightCls}`}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t('employees.search_roster_placeholder', 'Search employee name, ID...')}
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

        {/* ─── 3. All Departments Dropdown ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[135px] xl:w-[150px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={deptDraft}
            onChange={(e) => setDeptDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('employees.all_departments', 'All Departments')}</option>
            {departmentsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 4. All Branches Dropdown ─── */}
        {branchesList.length > 0 && (
          <div className={`relative flex-1 min-w-[115px] sm:min-w-[125px] xl:w-[135px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={branchDraft}
              onChange={(e) => setBranchDraft(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('employees.all_branches', 'All Branches')}</option>
              {branchesList.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 5. All Shifts Dropdown ─── */}
        <div className={`relative flex-1 min-w-[115px] sm:min-w-[125px] xl:w-[135px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={shiftDraft}
            onChange={(e) => setShiftDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('employees.all_shifts', 'All Shifts')}</option>
            {shiftsList.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {formatShiftName(s.name, isKm)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 6. Schedule Status Dropdown ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[130px] xl:w-[145px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('employees.all_status', 'All Status')}</option>
            <option value="scheduled">{t('employees.has_scheduled_shift', 'Has Shift')}</option>
            <option value="off">{t('employees.has_off_day', 'Has Off Day')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

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

export default RosterSearchBar

