import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface InventorySearchBarProps {
  activeTab?: string
  search: string
  onSearchChange: (val: string) => void
  searchPlaceholder?: string
  warehouseFilter?: string
  onWarehouseChange?: (val: string) => void
  warehouses?: Array<{ id: number | string; name: string }>
  statusFilter?: string
  onStatusChange?: (val: string) => void
  categoryFilter?: string
  onCategoryChange?: (val: string) => void
  categories?: Array<{ id: number | string; name: string }>
  brandFilter?: string
  onBrandChange?: (val: string) => void
  brands?: Array<{ id: number | string; name: string }>
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
 * InventorySearchBar Component
 * Unified filter toolbar matching the ProductSearchBar standard 100%.
 * Provides instant 1-click filtering, controlled search input,
 * dynamic warehouse/status/category dropdowns, Apply & Reset buttons,
 * and Column Settings Popover.
 */
export const InventorySearchBar: React.FC<InventorySearchBarProps> = ({
  activeTab = 'levels',
  search,
  onSearchChange,
  searchPlaceholder,
  warehouseFilter = '',
  onWarehouseChange,
  warehouses = [],
  statusFilter = '',
  onStatusChange,
  categoryFilter = '',
  onCategoryChange,
  categories = [],
  brandFilter = '',
  onBrandChange,
  brands = [],
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
  const { t } = useTranslation(['inventory', 'products', 'common', 'buttons', 'tables'])

  // Local draft states for fast typing and 1-click batch application
  const [searchDraft, setSearchDraft] = useState(search)
  const [warehouseDraft, setWarehouseDraft] = useState(warehouseFilter)
  const [statusDraft, setStatusDraft] = useState(statusFilter)
  const [categoryDraft, setCategoryDraft] = useState(categoryFilter)
  const [brandDraft, setBrandDraft] = useState(brandFilter)

  // Synchronize drafts when external props change or reset
  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setWarehouseDraft(warehouseFilter)
  }, [warehouseFilter])

  useEffect(() => {
    setStatusDraft(statusFilter)
  }, [statusFilter])

  useEffect(() => {
    setCategoryDraft(categoryFilter)
  }, [categoryFilter])

  useEffect(() => {
    setBrandDraft(brandFilter)
  }, [brandFilter])

  // Apply Handler
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onWarehouseChange?.(warehouseDraft)
    onStatusChange?.(statusDraft)
    onCategoryChange?.(categoryDraft)
    onBrandChange?.(brandDraft)
    onApply?.()
  }

  // Reset Handler
  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setWarehouseDraft('')
    setStatusDraft('')
    setCategoryDraft('')
    setBrandDraft('')
    onReset()
  }

  // Uniform height and crisp visible borders matching ProductSearchBar
  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  // Status/Type options based on active inventory tab
  const getStatusOptions = () => {
    switch (activeTab) {
      case 'movements':
        return {
          placeholder: t('inventory.allMovementTypes', 'All Movement Types'),
          options: [
            { value: '', label: t('inventory.allMovementTypes', 'All Movement Types') },
            { value: 'in', label: t('inventory.movementTypeIn', 'Stock In') },
            { value: 'out', label: t('inventory.movementTypeOut', 'Stock Out') },
            { value: 'transfer_in', label: t('inventory.transferIn', 'Transfer In') },
            { value: 'transfer_out', label: t('inventory.transferOut', 'Transfer Out') },
            { value: 'adjustment', label: t('inventory.adjustment', 'Adjustment') },
            { value: 'opname', label: t('inventory.opnameAudit', 'Audit / Opname') },
          ],
        }
      case 'transfers':
        return {
          placeholder: t('inventory.allTransferStatuses', 'All Transfer Statuses'),
          options: [
            { value: '', label: t('inventory.allTransferStatuses', 'All Transfer Statuses') },
            { value: 'pending', label: t('inventory.statusPending', 'Pending') },
            { value: 'in_transit', label: t('inventory.statusInTransit', 'In Transit') },
            { value: 'completed', label: t('inventory.statusCompleted', 'Completed') },
            { value: 'cancelled', label: t('inventory.statusCancelled', 'Cancelled') },
          ],
        }
      case 'adjustments':
        return {
          placeholder: t('inventory.allAdjustmentStatuses', 'All Adjustment Statuses'),
          options: [
            { value: '', label: t('inventory.allAdjustmentStatuses', 'All Adjustment Statuses') },
            { value: 'pending', label: t('inventory.statusPending', 'Pending') },
            { value: 'approved', label: t('inventory.statusApproved', 'Approved') },
            { value: 'rejected', label: t('inventory.statusRejected', 'Rejected') },
          ],
        }
      case 'opnames':
        return {
          placeholder: t('inventory.allAuditStatuses', 'All Audit Statuses'),
          options: [
            { value: '', label: t('inventory.allAuditStatuses', 'All Audit Statuses') },
            { value: 'draft', label: t('inventory.statusDraft', 'Draft') },
            { value: 'in_progress', label: t('inventory.statusInProgress', 'In Progress') },
            { value: 'completed', label: t('inventory.statusCompleted', 'Completed') },
            { value: 'cancelled', label: t('inventory.statusCancelled', 'Cancelled') },
          ],
        }
      case 'levels':
      default:
        return {
          placeholder: t('inventory.allStockLevels', 'All Stock Levels'),
          options: [
            { value: '', label: t('inventory.allStockLevels', 'All Stock Levels') },
            { value: 'in_stock', label: t('inventory.inStockHealthy', 'In Stock (Healthy)') },
            { value: 'low_stock', label: t('inventory.lowStockAlert', 'Low Stock (Alert)') },
            { value: 'out_of_stock', label: t('inventory.outOfStockZero', 'Out of Stock (Zero)') },
            { value: 'overstock', label: t('inventory.overstock', 'Overstock (>100)') },
          ],
        }
    }
  }

  const statusConfig = getStatusOptions()

  const defaultPlaceholder =
    activeTab === 'movements'
      ? t('inventory.searchMovementsPlaceholder', 'Search ref, item name, barcode...')
      : activeTab === 'transfers'
      ? t('inventory.searchTransfersPlaceholder', 'Search transfer number, notes...')
      : activeTab === 'adjustments'
      ? t('inventory.searchAdjustmentsPlaceholder', 'Search adjustment number, notes...')
      : activeTab === 'opnames'
      ? t('inventory.searchOpnamesPlaceholder', 'Search opname number, title...')
      : t('inventory.searchLevelsPlaceholder', 'Search SKU, item name, barcode...')

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
            placeholder={searchPlaceholder || defaultPlaceholder}
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

        {/* ─── 2. Warehouse Dropdown ─── */}
        {onWarehouseChange && (
          <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={warehouseDraft}
              onChange={(e) => setWarehouseDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">{t('inventory.allWarehouses', 'All Warehouses')}</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 3. Dynamic Status Dropdown ─── */}
        {onStatusChange && (
          <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[165px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className={selectCls}
            >
              {statusConfig.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 4. Category Dropdown (Only for levels tab) ─── */}
        {activeTab === 'levels' && onCategoryChange && (
          <div className={`relative flex-1 min-w-[125px] sm:min-w-[140px] xl:w-[155px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={categoryDraft}
              onChange={(e) => setCategoryDraft(e.target.value)}
              className={selectCls}
            >
              <option value="">{t('inventory.allCategories', 'All Categories')}</option>
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

        {/* ─── 5. Brand Dropdown (If available for levels) ─── */}
        {activeTab === 'levels' && brands.length > 0 && onBrandChange && (
          <div className={`relative flex-1 min-w-[120px] sm:min-w-[135px] xl:w-[145px] xl:flex-none ${controlHeightCls}`}>
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
        )}

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

        {/* ─── 8. Bulk Delete Action ─── */}
        {selectedCount > 0 && onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className={`${controlHeightCls} px-3 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs`}
          >
            <Trash2 size={14} />
            <span>
              {t('common.deleteSelected', 'Delete Selected')} ({selectedCount})
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

export default InventorySearchBar

