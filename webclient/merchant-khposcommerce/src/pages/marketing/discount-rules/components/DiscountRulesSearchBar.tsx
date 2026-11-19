import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'

export interface DiscountRulesSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  ruleTypeFilter: string
  onRuleTypeChange: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  discountTypeFilter?: string
  onDiscountTypeChange?: (val: string) => void
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

/**
 * DiscountRulesSearchBar Component
 * Unified filter toolbar for Discount Rules matching the ProductSearchBar and PromotionSearchBar standards.
 * Provides instant 1-click filtering, controlled search input,
 * rule type, status, and discount format dropdowns, distinct Apply & Reset buttons,
 * and Column Settings Popover.
 */
export const DiscountRulesSearchBar: React.FC<DiscountRulesSearchBarProps> = ({
  search,
  onSearchChange,
  ruleTypeFilter = 'all',
  onRuleTypeChange,
  statusFilter = 'all',
  onStatusChange,
  discountTypeFilter = 'all',
  onDiscountTypeChange,
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons', 'tables'])

  // Local draft states for fast typing and 1-click batch application
  const [searchDraft, setSearchDraft] = useState(search)
  const [ruleTypeDraft, setRuleTypeDraft] = useState(ruleTypeFilter || 'all')
  const [statusDraft, setStatusDraft] = useState(statusFilter || 'all')
  const [discountTypeDraft, setDiscountTypeDraft] = useState(discountTypeFilter || 'all')

  // Synchronize when external props reset
  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setRuleTypeDraft(ruleTypeFilter || 'all')
  }, [ruleTypeFilter])

  useEffect(() => {
    setStatusDraft(statusFilter || 'all')
  }, [statusFilter])

  useEffect(() => {
    setDiscountTypeDraft(discountTypeFilter || 'all')
  }, [discountTypeFilter])

  // Apply Handler
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onRuleTypeChange(ruleTypeDraft)
    onStatusChange(statusDraft)
    onDiscountTypeChange?.(discountTypeDraft)
    onApply?.()
  }

  // Reset Handler
  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setRuleTypeDraft('all')
    setStatusDraft('all')
    setDiscountTypeDraft('all')
    onReset()
  }

  // Uniform height and crisp visible borders matching SmartHR standard
  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <div className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden">
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* ─── 1. Search input (Search rules by name, campaign, targets...) ─── */}
        <div className={`relative w-full sm:w-72 md:w-80 lg:w-88 max-w-sm shrink-0 ${controlHeightCls}`}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
          />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t('marketing.searchRulesPlaceholder', 'Search rules or campaigns...')}
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

        {/* ─── 2. Rule Type Dropdown ─── */}
        <div className={`relative flex-1 min-w-[135px] sm:min-w-[150px] xl:w-[165px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={ruleTypeDraft}
            onChange={(e) => setRuleTypeDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('marketing.allRuleTypes', 'All Rule Types')}</option>
            <option value="product_discount">{t('marketing.productDiscount', 'Product Discount')}</option>
            <option value="category_discount">{t('marketing.categoryDiscount', 'Category Discount')}</option>
            <option value="brand_discount">{t('marketing.brandDiscount', 'Brand Discount')}</option>
            <option value="cart_discount">{t('marketing.cartDiscount', 'Cart Discount')}</option>
            <option value="buy_x_get_y">{t('marketing.buyXGetY', 'Buy X Get Y (BOGO)')}</option>
            <option value="free_shipping">{t('marketing.freeShipping', 'Free Shipping')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 3. Reward / Discount Type Dropdown ─── */}
        {onDiscountTypeChange && (
          <div className={`relative flex-1 min-w-[130px] sm:min-w-[145px] xl:w-[160px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={discountTypeDraft}
              onChange={(e) => setDiscountTypeDraft(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('marketing.allDiscountTypes', 'All Discount Types')}</option>
              <option value="percentage">{t('marketing.percentageDiscount', '% Percentage')}</option>
              <option value="fixed_amount">{t('marketing.fixedAmountDiscount', '$ Fixed Amount')}</option>
              <option value="bogo">{t('marketing.bogoDiscount', 'BOGO / Free Item')}</option>
              <option value="free_gift">{t('marketing.freeGiftDiscount', 'Free Gift')}</option>
              <option value="free_shipping">{t('marketing.freeShippingDiscount', 'Free Shipping')}</option>
              <option value="bundle">{t('marketing.bundleDiscount', 'Bundle Deal')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* ─── 4. Status Dropdown ─── */}
        <div className={`relative flex-1 min-w-[115px] sm:min-w-[130px] xl:w-[135px] xl:flex-none ${controlHeightCls}`}>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('common.allStatus', 'All Status')}</option>
            <option value="active">{t('marketing.statusActive', 'Active')}</option>
            <option value="inactive">{t('common.inactive', 'Inactive')}</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* ─── 5. Apply Button (Teal matching SmartHR) ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('common.applyFilters', 'Apply Filters')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'Apply')}</span>
        </button>

        {/* ─── 6. Reset Button (Clean SmartHR neutral outline) ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('common.resetFilters', 'Reset all filters')}
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

export default DiscountRulesSearchBar

