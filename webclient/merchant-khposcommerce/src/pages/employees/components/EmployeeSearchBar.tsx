import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Check,
  ChevronDown,
  X,
  Trash2,
} from 'lucide-react'
import { sound } from '@/utils/sound'
import ColumnSettingsPopover, {
  type ColumnOption,
} from '@/components/shared/ColumnSettingsPopover'
import type { Tab } from '../types/employee.types'

export interface EmployeeSearchBarProps {
  activeTab?: Tab
  search: string
  onSearchChange: (value: string) => void
  branchesList?: any[]
  deptList?: any[]
  posList?: any[]
  filterBranchId: string
  setFilterBranchId: (val: string) => void
  filterDeptId: string
  setFilterDeptId: (val: string) => void
  filterPosId: string
  setFilterPosId: (val: string) => void
  filterRole: string
  setFilterRole: (val: string) => void
  filterStatus: string
  setFilterStatus: (val: string) => void
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
 * EmployeeSearchBar Component
 * Unified filter toolbar matching the ProductSearchBar standard for Employee Directory & Organization Structure.
 * Provides instant controlled search input, category/dept/pos dropdowns,
 * distinct Apply & Reset buttons, Bulk Delete action, and Column Settings Popover.
 */
export const EmployeeSearchBar: React.FC<EmployeeSearchBarProps> = ({
  activeTab = 'employees',
  search,
  onSearchChange,
  branchesList = [],
  deptList = [],
  posList = [],
  filterBranchId,
  setFilterBranchId,
  filterDeptId,
  setFilterDeptId,
  filterPosId,
  setFilterPosId,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns = {},
  onColumnChange,
  columnSettingsTitle,
  selectedCount = 0,
  onBulkDelete,
}) => {
  const { t } = useTranslation(['employees', 'common', 'buttons', 'tables', 'products'])

  // Draft filter states
  const [searchDraft, setSearchDraft] = useState(search)
  const [branchDraft, setBranchDraft] = useState(filterBranchId)
  const [deptDraft, setDeptDraft] = useState(filterDeptId)
  const [posDraft, setPosDraft] = useState(filterPosId)
  const [roleDraft, setRoleDraft] = useState(filterRole)
  const [statusDraft, setStatusDraft] = useState(filterStatus)

  // Sync external filter changes
  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setBranchDraft(filterBranchId)
  }, [filterBranchId])

  useEffect(() => {
    setDeptDraft(filterDeptId)
  }, [filterDeptId])

  useEffect(() => {
    setPosDraft(filterPosId)
  }, [filterPosId])

  useEffect(() => {
    setRoleDraft(filterRole)
  }, [filterRole])

  useEffect(() => {
    setStatusDraft(filterStatus)
  }, [filterStatus])

  // Apply Handler
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    setFilterBranchId(branchDraft)
    setFilterDeptId(deptDraft)
    setFilterPosId(posDraft)
    setFilterRole(roleDraft)
    setFilterStatus(statusDraft)
    if (onApply) {
      onApply()
    }
  }

  // Reset Handler
  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setBranchDraft('')
    setDeptDraft('')
    setPosDraft('')
    setRoleDraft('')
    setStatusDraft('')
    onReset()
  }

  const isEmployeesTab = activeTab === 'employees'
  const isPayrollsTab = activeTab === 'payrolls'
  const isDeptsTab = activeTab === 'departments'
  const isPositionsTab = activeTab === 'positions'

  // Uniform height and crisp visible borders matching SmartHR/Product design
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
            placeholder={
              isDeptsTab
                ? t('employees.searchDepartmentsPlaceholder', 'Search department name, code...')
                : isPositionsTab
                ? t('employees.searchPositionsPlaceholder', 'Search position title, code...')
                : isEmployeesTab
                ? t('employees.searchEmployeesPlaceholder', 'Search name, title, ID...')
                : t('employees.search_placeholder', 'Search...')
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

        {/* ─── 2. All Branches ─── */}
        {(isEmployeesTab || isPayrollsTab) && (
          <div className={`relative flex-1 min-w-[115px] sm:min-w-[125px] xl:w-[135px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={branchDraft}
              onChange={(e) => setBranchDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">
                {t('employees.allBranches', 'All Branches')}
              </option>
              {branchesList.map((b: any) => (
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

        {/* ─── 3. All Departments (shown for employees, payrolls, and positions) ─── */}
        {(isEmployeesTab || isPayrollsTab || isPositionsTab) && (
          <div className={`relative flex-1 min-w-[115px] sm:min-w-[125px] xl:w-[135px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={deptDraft}
              onChange={(e) => setDeptDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">
                {t('employees.allDepartments', 'All Departments')}
              </option>
              {deptList.map((d: any) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 4. All Positions ─── */}
        {isEmployeesTab && (
          <div className={`relative flex-1 min-w-[115px] sm:min-w-[125px] xl:w-[130px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={posDraft}
              onChange={(e) => setPosDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">
                {t('employees.allPositions', 'All Positions')}
              </option>
              {posList.map((p: any) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 5. All Types / Roles ─── */}
        {isEmployeesTab && (
          <div className={`relative flex-1 min-w-[110px] sm:min-w-[120px] xl:w-[125px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={roleDraft}
              onChange={(e) => setRoleDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">
                {t('employees.allTypes', 'All Types')}
              </option>
              <option value="admin">{t('employees.roleAdmin', 'Admin')}</option>
              <option value="manager">{t('employees.roleManager', 'Manager')}</option>
              <option value="staff">{t('employees.roleStaff', 'Staff')}</option>
              <option value="cashier">{t('employees.roleCashier', 'Cashier')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 6. All Status (Active, Inactive, Resigned, Probation or Active/Inactive for Depts/Positions) ─── */}
        {(isEmployeesTab || isPayrollsTab || isDeptsTab || isPositionsTab) && (
          <div className={`relative flex-1 min-w-[110px] sm:min-w-[120px] xl:w-[125px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">
                {t('common.allStatus', 'All Status')}
              </option>
              <option value="active">{t('employees.statusActive', 'Active')}</option>
              <option value="inactive">{t('employees.statusInactive', 'Inactive')}</option>
              {isEmployeesTab && (
                <>
                  <option value="resigned">{t('employees.statusResigned', 'Resigned')}</option>
                  <option value="probation">{t('employees.statusProbation', 'On Probation')}</option>
                </>
              )}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 7. Apply Button (Dark Teal/Forest Green matching ProductSearchBar) ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 8. Reset Button (Clean SmartHR neutral outline) ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'Reset')}</span>
        </button>

        {/* ─── 9. Bulk Delete Button (Appears when rows selected) ─── */}
        {selectedCount > 0 && onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className={`${controlHeightCls} px-3 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs`}
          >
            <Trash2 size={14} />
            <span>
              {t('employees.deleteSelected', 'Delete Selected')} ({selectedCount})
            </span>
          </button>
        )}

        {/* ─── 10. Manage Column Table (ColumnSettingsPopover) ─── */}
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

export default EmployeeSearchBar
