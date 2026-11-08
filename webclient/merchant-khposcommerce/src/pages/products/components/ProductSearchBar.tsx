import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface ProductSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  categoryFilter: string
  onCategoryChange: (val: string) => void
  categories: Array<{ id: number | string; name: string }>
  brandFilter: string
  onBrandChange: (val: string) => void
  brands: Array<{ id: number | string; name: string }>
  stockLevelFilter: string
  onStockLevelChange: (val: string) => void
  statusFilter?: string
  onStatusChange?: (val: string) => void
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
 * ProductSearchBar Component
 * SmartHR-style unified filter toolbar for Products management.
 * Provides instant 1-click filtering, controlled search input,
 * distinct Apply & Reset buttons, and Column Settings Popover.
 */
export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories = [],
  brandFilter,
  onBrandChange,
  brands = [],
  stockLevelFilter,
  onStockLevelChange,
  statusFilter = '',
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
  const { t } = useTranslation(['products', 'common', 'buttons', 'tables'])

  // Local draft states for fast typing and 1-click batch application
  const [searchDraft, setSearchDraft] = useState(search)
  const [categoryDraft, setCategoryDraft] = useState(categoryFilter)
  const [brandDraft, setBrandDraft] = useState(brandFilter)
  const [stockDraft, setStockDraft] = useState(stockLevelFilter)
  const [statusDraft, setStatusDraft] = useState(statusFilter)

  // Synchronize when external props reset
  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setCategoryDraft(categoryFilter)
  }, [categoryFilter])

  useEffect(() => {
    setBrandDraft(brandFilter)
  }, [brandFilter])

  useEffect(() => {
    setStockDraft(stockLevelFilter)
  }, [stockLevelFilter])

  useEffect(() => {
    setStatusDraft(statusFilter)
  }, [statusFilter])

  // Apply Handler
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onCategoryChange(categoryDraft)
    onBrandChange(brandDraft)
    onStockLevelChange(stockDraft)
    onStatusChange?.(statusDraft)
    onApply?.()
  }

  // Reset Handler
  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setCategoryDraft('')
    setBrandDraft('')
    setStockDraft('')
    setStatusDraft('')
    onReset()
  }

  // Uniform height and crisp visible borders matching SmartHR design
  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <div className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden">
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* ─── 1. Search input (Search name, SKU, barcode...) ─── */}
        <div className={`relative w-full sm:w-72 md:w-80 lg:w-96 max-w-sm shrink-0 ${controlHeightCls}`}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t('products.searchPlaceholder', 'Search product name, SKU, barcode...')}
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

        {/* ─── 2. All Categories Dropdown ─── */}
        <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={categoryDraft}
            onChange={(e) => setCategoryDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('products.allCategories', 'All Categories')}</option>
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

        {/* ─── 3. All Brands Dropdown ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[135px] xl:w-[150px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={brandDraft}
            onChange={(e) => setBrandDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('products.allBrands', 'All Brands')}</option>
            {brands.map((b) => (
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

        {/* ─── 4. All Stock Levels Dropdown ─── */}
        <div className={`relative flex-1 min-w-[120px] sm:min-w-[135px] xl:w-[145px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={stockDraft}
            onChange={(e) => setStockDraft(e.target.value)}
            className={selectCls}
          >
            <option value="">{t('products.allStockLevels', 'All Stock Levels')}</option>
            <option value="high">{t('products.highStock', 'High stock')}</option>
            <option value="low">{t('products.lowStock', 'Low stock')}</option>
            <option value="out">{t('products.outOfStock', 'Out of stock')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 5. All Status Dropdown ─── */}
        {onStatusChange && (
          <div className={`relative flex-1 min-w-[115px] sm:min-w-[125px] xl:w-[135px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">{t('common.allStatus', 'All Status')}</option>
              <option value="active">{t('common.active', 'Active')}</option>
              <option value="inactive">{t('common.inactive', 'Inactive')}</option>
              <option value="draft">{t('common.draft', 'Draft')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 6. Apply Button (Dark Teal/Forest Green matching SmartHR) ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 7. Reset Button (Clean SmartHR neutral outline) ─── */}
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
              {t('products.deleteSelected', 'Delete Selected')} ({selectedCount})
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

export default ProductSearchBar

