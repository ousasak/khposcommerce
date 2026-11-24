import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Trash2 } from 'lucide-react'
import { SIZE_PRESET_MAP } from '@/utils/productPresets'
import { COLOR_MAP, getVariantColorHex } from '@/utils/colorResolver'
import type { CustomColorItem } from '../types/productForm.types'
import Pagination from '@/components/shared/Pagination'
import TableActionMenu from '@/components/shared/TableActionMenu'

const POPULAR_COLORS = [
  'Black', 'White', 'Silver', 'Space Gray', 'Natural Titanium',
  'Midnight', 'Starlight', 'Red', 'Blue', 'Gold', 'Green', 'Purple', 'Pink'
]

interface ProductVariantsSectionProps {
  productId: number | null
  form: any
  setField: (field: string, val: any) => void
  productDetail: any
  selectedPresetMode: string
  setSelectedPresetMode: (mode: string) => void
  customSizeCategory: string
  activeCategoryKey: string
  handleSwitchSizeCategory: (catKey: string) => void
  customSelectedSizes: string[]
  setCustomSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>
  customInputSize: string
  setCustomInputSize: (val: string) => void
  userAddedSizes: string[]
  handleAddUserCustomSize: (e?: React.SyntheticEvent) => void
  customSelectedColors: string[]
  setCustomSelectedColors: React.Dispatch<React.SetStateAction<string[]>>
  customInputColor: string
  setCustomInputColor: (val: string) => void
  customColorHex: string
  setCustomColorHex: (val: string) => void
  userAddedColors: CustomColorItem[]
  handleAddUserCustomColor: (e?: React.SyntheticEvent) => void
  isGeneratingVariants: boolean
  matrixProgress: { current: number; total: number } | null
  handleGenerateMatrix: () => void
  variantPage: number
  setVariantPage: (page: number) => void
  variantPageSize: number
  setVariantPageSize: (size: number) => void
  selectedVariantIds: number[]
  setSelectedVariantIds: React.Dispatch<React.SetStateAction<number[]>>
  onOpenEditVariant: (variant: any) => void
  onOpenViewVariant: (variant: any) => void
  onOpenDeleteVariant: (variant: { id: number; name: string }) => void
  onOpenClearAllVariants: () => void
  onOpenBulkDeleteVariants: () => void
  onQuickToggleVariantStatus: (variant: any) => void
}

export const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({
  form,
  setField,
  productDetail,
  activeCategoryKey,
  handleSwitchSizeCategory,
  customSelectedSizes,
  setCustomSelectedSizes,
  customInputSize,
  setCustomInputSize,
  userAddedSizes,
  handleAddUserCustomSize,
  customSelectedColors,
  setCustomSelectedColors,
  customInputColor,
  setCustomInputColor,
  customColorHex,
  setCustomColorHex,
  userAddedColors,
  handleAddUserCustomColor,
  isGeneratingVariants,
  matrixProgress,
  handleGenerateMatrix,
  variantPage,
  setVariantPage,
  variantPageSize,
  setVariantPageSize,
  selectedVariantIds,
  setSelectedVariantIds,
  onOpenEditVariant,
  onOpenViewVariant,
  onOpenDeleteVariant,
  onOpenClearAllVariants,
  onOpenBulkDeleteVariants,
  onQuickToggleVariantStatus,
}) => {
  const { t } = useTranslation(['products', 'common', 'pagination'])
  const variants: any[] = productDetail?.variants || []

  // Pagination calculation
  const totalVariants = variants.length
  const totalPages = Math.ceil(totalVariants / variantPageSize) || 1
  const paginatedVariants = variants.slice((variantPage - 1) * variantPageSize, variantPage * variantPageSize)

  const activePresetObj = SIZE_PRESET_MAP[activeCategoryKey] || SIZE_PRESET_MAP.smartphones

  // Collapsible state: if variants already exist, collapse by default to prioritize the variants table
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(variants.length === 0)
  const showGenerator = isGeneratorOpen || variants.length === 0 || isGeneratingVariants

  return (
    <div className="space-y-5">
      {/* Variants Enable Toggle Card */}
      <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-xs sm:text-sm text-foreground">
            {t('products.enableVariants', 'Multi-Dimensional Variants')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('products.enableVariantsSub', 'Generate color, storage, size, or material matrix for this product')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.has_variants}
            onChange={e => setField('has_variants', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {form.has_variants && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Variant Matrix Generator (Collapsible Card) */}
          <AnimatePresence initial={false}>
            {showGenerator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 space-y-4">
                  {/* Generator Header & Category Presets Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                        {t('products.smartPresetBuilder', 'Auto Variant Generator')}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t('products.smartPresetSub', 'Select sizes and colors to generate variant matrix')}
                      </p>
                    </div>

                    {/* Clean Category Preset Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <label htmlFor="category-preset-select" className="text-xs text-muted-foreground whitespace-nowrap">
                        {t('products.categoryPreset', 'Preset:')}
                      </label>
                      <div className="relative flex items-center">
                        <select
                          id="category-preset-select"
                          value={activeCategoryKey}
                          onChange={e => handleSwitchSizeCategory(e.target.value)}
                          className="h-8 pl-3 pr-8 bg-background hover:bg-muted/50 border border-border rounded-lg text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary appearance-none transition-colors"
                        >
                          {Object.entries(SIZE_PRESET_MAP).map(([key, config]) => (
                            <option key={key} value={key} className="bg-popover text-foreground">
                              {config.label || key}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Responsive Matrix Grid: Sizes vs Colors */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column: Sizes & Specs */}
                    <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">
                              {t('products.selectSpecsOrSizes', 'Sizes / Specifications')}
                            </span>
                            {customSelectedSizes.length > 0 && (
                              <span className="text-xs text-muted-foreground font-normal">
                                ({customSelectedSizes.length})
                              </span>
                            )}
                          </div>
                          {activePresetObj.options.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const allCodes = activePresetObj.options.map(o => o.code)
                                const isAllSelected = allCodes.every(c => customSelectedSizes.includes(c))
                                if (isAllSelected) {
                                  setCustomSelectedSizes(prev => prev.filter(c => !allCodes.includes(c)))
                                } else {
                                  setCustomSelectedSizes(prev => Array.from(new Set([...prev, ...allCodes])))
                                }
                              }}
                              className="text-xs text-primary hover:underline font-medium cursor-pointer"
                            >
                              {activePresetObj.options.every(o => customSelectedSizes.includes(o.code))
                                ? t('common.deselectAll', 'Deselect All')
                                : t('common.selectAll', 'Select All')}
                            </button>
                          )}
                        </div>

                        {/* Preset Size Options */}
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                          {activePresetObj.options.map(opt => {
                            const isSelected = customSelectedSizes.includes(opt.code)
                            return (
                              <button
                                key={opt.code}
                                type="button"
                                onClick={() => {
                                  setCustomSelectedSizes(prev =>
                                    isSelected ? prev.filter(s => s !== opt.code) : [...prev, opt.code]
                                  )
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border border-primary'
                                    : 'bg-background hover:bg-muted text-foreground border border-border'
                                }`}
                              >
                                <span>{opt.code}</span>
                                {opt.badge && <span className="text-[10px] opacity-75 font-normal ml-1">({opt.badge})</span>}
                              </button>
                            )
                          })}

                          {userAddedSizes.map(s => {
                            const isSelected = customSelectedSizes.includes(s)
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setCustomSelectedSizes(prev =>
                                    isSelected ? prev.filter(x => x !== s) : [...prev, s]
                                  )
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border border-primary'
                                    : 'bg-background hover:bg-muted text-foreground border border-border'
                                }`}
                              >
                                <span>{s}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Custom Size Adder Input */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-border/40">
                        <input
                          type="text"
                          value={customInputSize ?? ''}
                          onChange={e => setCustomInputSize(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAddUserCustomSize(e)
                            }
                          }}
                          placeholder={t('products.addCustomSizePlaceholder', 'Add size (e.g. 2TB, XXL)...')}
                          className="w-full h-8 px-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddUserCustomSize}
                          className="h-8 px-3 bg-background hover:bg-muted border border-border text-foreground rounded-lg text-xs font-medium flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                        >
                          {t('common.add', 'Add')}
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Colors */}
                    <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">
                              {t('products.selectColors', 'Colors')}
                            </span>
                            {customSelectedColors.length > 0 && (
                              <span className="text-xs text-muted-foreground font-normal">
                                ({customSelectedColors.length})
                              </span>
                            )}
                          </div>
                          {customSelectedColors.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setCustomSelectedColors([])}
                              className="text-xs text-muted-foreground hover:text-foreground hover:underline font-medium cursor-pointer"
                            >
                              {t('common.clear', 'Clear')}
                            </button>
                          )}
                        </div>

                        {/* Color Swatch Options */}
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                          {POPULAR_COLORS.map(c => {
                            const isSelected = customSelectedColors.includes(c)
                            const hex = COLOR_MAP[c.toLowerCase()] || '#6b7280'
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCustomSelectedColors(prev =>
                                    isSelected ? prev.filter(x => x !== c) : [...prev, c]
                                  )
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border border-primary'
                                    : 'bg-background hover:bg-muted text-foreground border border-border'
                                }`}
                              >
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: hex }} />
                                <span>{c}</span>
                              </button>
                            )
                          })}

                          {userAddedColors.map(c => {
                            const isSelected = customSelectedColors.includes(c.key)
                            return (
                              <button
                                key={c.key}
                                type="button"
                                onClick={() => {
                                  setCustomSelectedColors(prev =>
                                    isSelected ? prev.filter(x => x !== c.key) : [...prev, c.key]
                                  )
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border border-primary'
                                    : 'bg-background hover:bg-muted text-foreground border border-border'
                                }`}
                              >
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: c.hex }} />
                                <span>{c.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Custom Color Adder */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-border/40">
                        <input
                          type="color"
                          value={customColorHex ?? '#6366f1'}
                          onChange={e => setCustomColorHex(e.target.value)}
                          className="w-8 h-8 p-0.5 rounded-lg cursor-pointer border border-border bg-background shrink-0"
                          title={t('products.pickColor', 'Pick Color')}
                        />
                        <input
                          type="text"
                          value={customInputColor ?? ''}
                          onChange={e => setCustomInputColor(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAddUserCustomColor(e)
                            }
                          }}
                          placeholder={t('products.addCustomColorPlaceholder', 'Add color (e.g. Cobalt Blue)...')}
                          className="w-full h-8 px-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddUserCustomColor}
                          className="h-8 px-3 bg-background hover:bg-muted border border-border text-foreground rounded-lg text-xs font-medium flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                        >
                          {t('common.add', 'Add')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Matrix Generation Action Bar */}
                  <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {customSelectedSizes.length} sizes × {customSelectedColors.length} colors ={' '}
                        <strong className="text-foreground font-semibold">
                          {customSelectedSizes.length * customSelectedColors.length} variants
                        </strong>
                      </span>
                      {(customSelectedSizes.length > 0 || customSelectedColors.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomSelectedSizes([])
                            setCustomSelectedColors([])
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer ml-1 transition-colors"
                        >
                          {t('common.reset', 'Reset')}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {variants.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsGeneratorOpen(false)}
                          className="h-8 px-3 rounded-lg border border-border hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        >
                          {t('common.cancel', 'Close')}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleGenerateMatrix}
                        disabled={isGeneratingVariants || customSelectedSizes.length === 0 || customSelectedColors.length === 0}
                        className="h-8 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-none transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isGeneratingVariants ? t('products.generating', 'Generating...') : t('products.generateMatrix', 'Generate Matrix')}
                      </button>
                    </div>
                  </div>

                  {/* Generation Progress Bar */}
                  {matrixProgress && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-primary">
                        <span>{isGeneratingVariants ? t('products.generating', 'Generating...') : t('products.generateMatrix', 'Generate Matrix')}</span>
                        <span>{matrixProgress.current} / {matrixProgress.total}</span>
                      </div>
                      <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${(matrixProgress.current / matrixProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Variants Table */}
          {variants.length > 0 ? (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground">
                      {t('products.existingVariants', 'Existing Product Variants')}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {variants.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('products.variantsTableSub', 'Individual SKU codes, barcodes, price overrides and POS status')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Button for Auto Matrix Generator */}
                  <button
                    type="button"
                    onClick={() => setIsGeneratorOpen(prev => !prev)}
                    className="h-8 px-3 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>{isGeneratorOpen ? t('products.hideMatrixGenerator', 'Hide Generator') : t('products.openMatrixGenerator', 'Auto Matrix Generator')}</span>
                    <ChevronDown size={13} className={`transition-transform duration-200 ${isGeneratorOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {selectedVariantIds.length > 0 && (
                    <button
                      type="button"
                      onClick={onOpenBulkDeleteVariants}
                      className="h-8 px-3 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>{t('products.deleteSelected', t('common.deleteSelected', 'Delete Selected'))} ({selectedVariantIds.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenClearAllVariants}
                    className="h-8 px-3 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg font-medium cursor-pointer transition-colors"
                  >
                    {t('products.clearAllVariants', 'Clear All')}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-medium uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedVariantIds.length === variants.length && variants.length > 0}
                          onChange={e => {
                            if (e.target.checked) setSelectedVariantIds(variants.map(v => v.id))
                            else setSelectedVariantIds([])
                          }}
                          className="w-4 h-4 rounded text-primary focus:ring-primary/30 cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5">{t('products.variant', 'Variant')}</th>
                      <th className="p-3.5 font-mono">{t('products.sku', 'SKU')}</th>
                      <th className="p-3.5">{t('products.colPrice', 'Selling Price')}</th>
                      <th className="p-3.5">{t('products.colCostPrice', 'Cost Price')}</th>
                      <th className="p-3.5">{t('products.colStock', 'Stock')}</th>
                      <th className="p-3.5 text-center">{t('products.colStatus', 'Status')}</th>
                      <th className="p-3.5 text-right">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedVariants.map((v: any) => {
                      const hex = getVariantColorHex(v)
                      const isSelected = selectedVariantIds.includes(v.id)
                      return (
                        <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) setSelectedVariantIds(prev => [...prev, v.id])
                                else setSelectedVariantIds(prev => prev.filter(x => x !== v.id))
                              }}
                              className="w-4 h-4 rounded text-primary focus:ring-primary/30 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5 font-medium text-foreground flex items-center gap-2">
                            {hex && (
                              <span className="w-3 h-3 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: hex }} />
                            )}
                            <span className="truncate max-w-[200px] font-medium">{v.name}</span>
                          </td>
                          <td className="p-3.5 font-mono text-muted-foreground">{v.sku || '—'}</td>
                          <td className="p-3.5 font-semibold text-primary font-mono">${Number(v.selling_price || 0).toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-muted-foreground">${Number(v.cost_price || 0).toFixed(2)}</td>
                          <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{v.stock ?? 0}</td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => onQuickToggleVariantStatus(v)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium cursor-pointer transition-colors ${
                                v.is_active
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                              }`}
                            >
                              {v.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end">
                              <TableActionMenu
                                onView={() => onOpenViewVariant(v)}
                                onEdit={() => onOpenEditVariant(v)}
                                onDelete={() => onOpenDeleteVariant({ id: v.id, name: v.name })}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Global Pagination Component */}
                {totalVariants > 0 && (
                  <Pagination
                    currentPage={variantPage}
                    lastPage={totalPages}
                    total={totalVariants}
                    perPage={variantPageSize}
                    onPageChange={setVariantPage}
                    onPerPageChange={setVariantPageSize}
                    perPageOptions={[5, 10, 15, 20, 50]}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Empty State when no variants exist */
            !showGenerator && (
              <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    {t('products.noVariantsYet', 'No Variants Generated Yet')}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {t('products.noVariantsDesc', 'Click the button below to open the generator and create sizes, colors, and SKU combinations.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(true)}
                  className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-medium inline-flex items-center cursor-pointer transition-colors"
                >
                  {t('products.openMatrixGenerator', 'Auto Matrix Generator')}
                </button>
              </div>
            )
          )}
        </motion.div>
      )}
    </div>
  )
}

export default ProductVariantsSection
