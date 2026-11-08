import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface ReturnPolicySearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  typeFilter: string
  onTypeChange: (val: string) => void
  categoryFilter?: string
  onCategoryChange?: (val: string) => void
  categories?: Array<{ id: number | string; name: string }>
  returnableFilter?: string
  onReturnableChange?: (val: string) => void
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

/**
 * ReturnPolicySearchBar Component
 * Unified filter toolbar for Return Policies matching the ProductSearchBar standard.
 * Provides instant controlled search input, policy scope/type, category,
 * distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const ReturnPolicySearchBar: React.FC<ReturnPolicySearchBarProps> = ({
  search,
  onSearchChange,
  typeFilter = 'all',
  onTypeChange,
  categoryFilter = 'all',
  onCategoryChange,
  categories = [],
  returnableFilter = 'all',
  onReturnableChange,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
}) => {
  const { t } = useTranslation(['policies', 'common', 'buttons', 'tables'])

  const [searchDraft, setSearchDraft] = useState(search)
  const [typeDraft, setTypeDraft] = useState(typeFilter || 'all')
  const [categoryDraft, setCategoryDraft] = useState(categoryFilter || 'all')
  const [returnableDraft, setReturnableDraft] = useState(returnableFilter || 'all')

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setTypeDraft(typeFilter || 'all')
  }, [typeFilter])

  useEffect(() => {
    setCategoryDraft(categoryFilter || 'all')
  }, [categoryFilter])

  useEffect(() => {
    setReturnableDraft(returnableFilter || 'all')
  }, [returnableFilter])

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onTypeChange(typeDraft)
    onCategoryChange?.(categoryDraft)
    onReturnableChange?.(returnableDraft)
    onApply?.()
  }

  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setTypeDraft('all')
    setCategoryDraft('all')
    setReturnableDraft('all')
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
            placeholder={t('policies.searchPolicies', 'Search policies by name or category...')}
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

        {/* ─── 2. Policy Scope / Type Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[170px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={typeDraft}
            onChange={(e) => setTypeDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('policies.allPolicyScopes', 'All Policy Scopes')}</option>
            <option value="storewide">{t('policies.scopeStorewide', 'Store-Wide')}</option>
            <option value="category">{t('policies.scopeCategory', 'Category-Specific')}</option>
            <option value="final_sale">{t('policies.scopeFinalSale', 'Non-Returnable')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. Categories Dropdown (Optional / Category Filter) ─── */}
        {categories.length > 0 && onCategoryChange && (
          <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={categoryDraft}
              onChange={(e) => setCategoryDraft(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('policies.allCategories', 'All Categories')}</option>
              <option value="storewide">{t('policies.storewideDefault', 'Store-Wide (Default)')}</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 4. Returnable Condition Dropdown ─── */}
        {onReturnableChange && (
          <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={returnableDraft}
              onChange={(e) => setReturnableDraft(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('policies.allReturnConditions', 'All Return Conditions')}</option>
              <option value="returnable">{t('policies.conditionReturnable', 'Returnable')}</option>
              <option value="final_sale">{t('policies.conditionFinalSale', 'Final Sale Only')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 5. Apply Button ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('buttons.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 6. Reset Button ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('buttons.resetAllFilters', 'Reset all filters')}
        >
          <span>{t('buttons.reset', 'Reset')}</span>
        </button>

        {/* ─── 7. Manage Column Table (ColumnSettingsPopover) ─── */}
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

export default ReturnPolicySearchBar

