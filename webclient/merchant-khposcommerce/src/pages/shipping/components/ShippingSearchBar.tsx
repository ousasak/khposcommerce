import React, { useState, useEffect } from 'react'
import { Search, X, Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ColumnSettingsPopover, type ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'
import type { Tab } from '../types/shipping.types'

export interface ShippingSearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  activeTab: Tab
  statusFilter: string
  onStatusChange: (val: string) => void
  courierFilter?: string
  onCourierChange?: (val: string) => void
  methodFilter?: string
  onMethodChange?: (val: string) => void
  zoneFilter?: string
  onZoneChange?: (val: string) => void
  methodsList?: any[]
  zonesList?: any[]
  onApply?: () => void
  onReset: () => void
  columns?: ColumnOption[]
  visibleColumns?: Record<string, boolean>
  defaultVisibleColumns?: Record<string, boolean>
  onColumnChange?: (updated: Record<string, boolean>) => void
  columnSettingsTitle?: string
}

/**
 * ShippingSearchBar Component
 * Unified standard filter toolbar matching Banners, Coupons, and Products pages.
 * Features:
 * - Controlled Search input with clear button (X)
 * - Tab-specific inline filter dropdowns (Courier, Status, Method, Zone) defaulting to 'all'
 * - Standard Apply (អនុវត្ត) & Reset (កំណត់ឡើងវិញ) buttons
 * - View Mode Toggle (Grid Cards vs Table)
 * - Column Settings Popover (គ្រប់គ្រងតារាង)
 */
export const ShippingSearchBar: React.FC<ShippingSearchBarProps> = ({
  search,
  onSearchChange,
  activeTab,
  statusFilter = 'all',
  onStatusChange,
  courierFilter = 'all',
  onCourierChange,
  methodFilter = 'all',
  onMethodChange,
  zoneFilter = 'all',
  onZoneChange,
  methodsList = [],
  zonesList = [],
  onApply,
  onReset,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
}) => {
  const { t } = useTranslation(['shipping', 'common', 'buttons', 'tables'])

  // Local draft states for fast typing and 1-click batch application
  const [searchDraft, setSearchDraft] = useState(search)
  const [statusDraft, setStatusDraft] = useState(statusFilter || 'all')
  const [courierDraft, setCourierDraft] = useState(courierFilter || 'all')
  const [methodDraft, setMethodDraft] = useState(methodFilter || 'all')
  const [zoneDraft, setZoneDraft] = useState(zoneFilter || 'all')

  // Synchronize when external props reset or tab changes
  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setStatusDraft(statusFilter || 'all')
  }, [statusFilter])

  useEffect(() => {
    setCourierDraft(courierFilter || 'all')
  }, [courierFilter])

  useEffect(() => {
    setMethodDraft(methodFilter || 'all')
  }, [methodFilter])

  useEffect(() => {
    setZoneDraft(zoneFilter || 'all')
  }, [zoneFilter])

  // Apply Handler
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sound.playClick()
    onSearchChange(searchDraft.trim())
    onStatusChange(statusDraft)
    onCourierChange?.(courierDraft)
    onMethodChange?.(methodDraft)
    onZoneChange?.(zoneDraft)
    onApply?.()
  }

  // Reset Handler
  const handleReset = () => {
    sound.playClick()
    setSearchDraft('')
    setStatusDraft('all')
    setCourierDraft('all')
    setMethodDraft('all')
    setZoneDraft('all')
    onReset()
  }

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'shipping-methods':
        return t('shipping.searchMethodsPlaceholder', 'Search method name or identifier code...')
      case 'shipping-zones':
        return t('shipping.searchZonesPlaceholder', 'Search zone name, code, or province/city...')
      case 'shipping-rates':
        return t('shipping.searchRatesPlaceholder', 'Search shipping freight rates...')
      default:
        return t('shipping.searchShipmentsPlaceholder', 'Search tracking number, carrier, or order #...')
    }
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
            placeholder={getSearchPlaceholder()}
            className={`w-full ${controlHeightCls} pl-9 pr-8 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 placeholder:text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs`}
          />
          {searchDraft && (
            <button
              type="button"
              onClick={() => setSearchDraft('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              title={t('common.clearSearch', 'សម្អាតការស្វែងរក')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ─── 2. TAB SPECIFIC DROPDOWNS ─── */}
        {/* TAB 1: SHIPMENTS DROPDOWNS (Courier + Status) */}
        {activeTab === 'shipments' && (
          <>
            {/* Courier Dropdown */}
            <div className={`relative flex-1 min-w-[140px] sm:min-w-[160px] xl:w-[185px] xl:flex-none ${controlHeightCls}`}>
              <select
                value={courierDraft}
                onChange={(e) => setCourierDraft(e.target.value)}
                className={selectCls}
              >
                <option value="all">{t('shipping.allCouriers', 'All Couriers / Carriers')}</option>
                <option value="J&T Express Cambodia">J&T Express Cambodia</option>
                <option value="GrabExpress">GrabExpress</option>
                <option value="Virak Buntham Logistics">Virak Buntham Logistics</option>
                <option value="DHL Express">DHL Express</option>
                <option value="FedEx">FedEx</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Shipment Status Dropdown */}
            <div className={`relative flex-1 min-w-[130px] sm:min-w-[150px] xl:w-[170px] xl:flex-none ${controlHeightCls}`}>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className={selectCls}
              >
                <option value="all">{t('shipping.allStatuses', 'All Statuses')}</option>
                <option value="pending">{t('shipping.statusPending', 'Pending Pickup')}</option>
                <option value="shipped">{t('shipping.statusShipped', 'In Transit / Shipped')}</option>
                <option value="delivered">{t('shipping.statusDelivered', 'Delivered Successfully')}</option>
                <option value="failed">{t('shipping.statusFailed', 'Delivery Failed')}</option>
                <option value="returned">{t('shipping.statusReturned', 'Returned to Sender')}</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </>
        )}

        {/* TAB 2 & 3: METHODS & ZONES (Active / Inactive Status Dropdown) */}
        {(activeTab === 'shipping-methods' || activeTab === 'shipping-zones') && (
          <div className={`relative flex-1 min-w-[120px] sm:min-w-[140px] xl:w-[155px] xl:flex-none ${controlHeightCls}`}>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('common.allStatus', 'គ្រប់ស្ថានភាព')}</option>
              <option value="active">{t('common.active', 'សកម្ម')}</option>
              <option value="inactive">{t('common.inactive', 'អសកម្ម')}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}

        {/* TAB 4: FREIGHT RATES DROPDOWNS (Method + Zone) */}
        {activeTab === 'shipping-rates' && (
          <>
            {/* Method Dropdown */}
            <div className={`relative flex-1 min-w-[140px] sm:min-w-[160px] xl:w-[185px] xl:flex-none ${controlHeightCls}`}>
              <select
                value={methodDraft}
                onChange={(e) => setMethodDraft(e.target.value)}
                className={selectCls}
              >
                <option value="all">{t('shipping.allMethods', 'All Shipping Methods')}</option>
                {methodsList.map((m: any) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Zone Dropdown */}
            <div className={`relative flex-1 min-w-[130px] sm:min-w-[150px] xl:w-[170px] xl:flex-none ${controlHeightCls}`}>
              <select
                value={zoneDraft}
                onChange={(e) => setZoneDraft(e.target.value)}
                className={selectCls}
              >
                <option value="all">{t('shipping.allZones', 'All Delivery Zones')}</option>
                {zonesList.map((z: any) => (
                  <option key={z.id} value={String(z.id)}>
                    {z.name} ({z.code})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </>
        )}

        {/* ─── 3. Apply Button ─── */}
        <button
          type="submit"
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0`}
          title={t('buttons.apply', 'អនុវត្ត')}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{t('buttons.apply', 'អនុវត្ត')}</span>
        </button>

        {/* ─── 4. Reset Button ─── */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={t('buttons.reset', 'កំណត់ឡើងវិញ')}
        >
          <span>{t('buttons.reset', 'កំណត់ឡើងវិញ')}</span>
        </button>

        {/* ─── 5. Column Settings (for table tabs) ─── */}
        {columns.length > 0 && onColumnChange && (activeTab === 'shipments' || activeTab === 'shipping-rates') && (
          <div className="ml-auto shrink-0 flex items-center gap-2">
            <ColumnSettingsPopover
              columns={columns}
              visibleColumns={visibleColumns}
              defaultVisibleColumns={defaultVisibleColumns}
              onChange={onColumnChange}
              size="md"
              label={t('tables.manageTable', 'គ្រប់គ្រងតារាង')}
              buttonClassName="border-slate-300 dark:border-slate-700 shadow-2xs"
              title={columnSettingsTitle}
            />
          </div>
        )}
      </form>
    </div>
  )
}

export default ShippingSearchBar
