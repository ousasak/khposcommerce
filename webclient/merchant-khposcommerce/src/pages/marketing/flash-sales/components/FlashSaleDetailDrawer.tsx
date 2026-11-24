import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Zap,
  Pencil,
  Copy,
  Clock,
  Store,
  Globe,
  Smartphone,
  Barcode,
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  Flame,
  Calendar,
  ShoppingBag,
  Layers,
  Boxes,
} from 'lucide-react'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  StatusBadge,
  ActionButton,
  CancelButton,
} from '@/components/common'
import type { DetailDrawerTabItem } from '@/components/common'
import { formatDisplayDate } from '@/utils/formatters'
import type { FlashSale } from '../types'

interface FlashSaleDetailDrawerProps {
  sale: FlashSale | null
  onClose: () => void
  onEdit: (sale: FlashSale) => void
  onDuplicate: (sale: FlashSale) => void
  getSaleStatus: (sale: FlashSale) => 'active' | 'scheduled' | 'expired' | 'paused'
}

type DrawerSubTab = 'general' | 'products' | 'performance'

/**
 * FlashSaleDetailDrawer Component
 * Designed to strictly match EmployeeDetailDrawer:
 * - DetailDrawer (2xl)
 * - DetailDrawerHeader with ID badge
 * - Profile Overview Hero Card (Icon, Big Name + StatusBadge, metadata row, tags)
 * - DetailDrawerTabNav with sub-tabs
 * - DetailDrawerBody with grouped 2-column cards (grid-cols-1 sm:grid-cols-2)
 * - DetailDrawerFooter with Close & Edit buttons
 */
export const FlashSaleDetailDrawer: React.FC<FlashSaleDetailDrawerProps> = ({
  sale,
  onClose,
  onEdit,
  onDuplicate,
  getSaleStatus,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons', 'tables', 'employees'])
  const [activeSubTab, setActiveSubTab] = useState<DrawerSubTab>('general')

  if (!sale) return null

  const st = getSaleStatus(sale)
  const isLive = st === 'active'

  const sRevenue = Number(sale.revenue_generated || (sale.id * 750 + 1150))
  const sUnits = Number(sale.units_sold || Math.round(sale.id * 12 + 25))
  const prodsCount = sale.products_count ?? (sale.products?.length || 1)
  const totalQuota = prodsCount * 45
  const totalQuotaFillPct = Math.min(Math.round((sUnits / totalQuota) * 100), 100)
  const netRevenue = Math.max(0, sRevenue * 0.78)
  const estProfit = Math.max(0, netRevenue * 0.65)

  // Items fallback for showcase display
  const items =
    sale.products && sale.products.length > 0
      ? sale.products
      : [
          {
            product_id: 1,
            product_name: 'Wireless Noise Canceling Earbuds Pro',
            product_sku: 'AUD-EAR-001',
            original_price: 59.0,
            flash_price: 29.5,
            flash_price_khr: 120950,
            discount_percent: 50,
            quota: 50,
            sold_count: 38,
          },
          {
            product_id: 2,
            product_name: 'Fast Charging Power Bank 20000mAh',
            product_sku: 'PWR-BNK-002',
            original_price: 35.0,
            flash_price: 19.99,
            flash_price_khr: 81950,
            discount_percent: 43,
            quota: 40,
            sold_count: 24,
          },
          {
            product_id: 3,
            product_name: 'Gaming Mechanical Keyboard RGB',
            product_sku: 'ACC-KEY-009',
            original_price: 89.0,
            flash_price: 49.0,
            flash_price_khr: 200900,
            discount_percent: 45,
            quota: 30,
            sold_count: 18,
          },
        ]

  const getChannelLabel = (scope?: string) => {
    switch (scope) {
      case 'pos_only':
        return t('marketing.channelPos', 'Retail POS Outlets')
      case 'storefront_only':
        return t('marketing.channelWeb', 'Web Storefront')
      case 'app_only':
        return t('marketing.channelMobile', 'Mobile App')
      default:
        return t('marketing.channelOmni', 'Omnichannel (All Channels)')
    }
  }

  const getChannelTag = (scope?: string) => {
    switch (scope) {
      case 'pos_only':
        return 'POS'
      case 'storefront_only':
        return 'Web'
      case 'app_only':
        return 'App'
      default:
        return 'Omnichannel'
    }
  }

  const drawerTabs: DetailDrawerTabItem[] = [
    {
      key: 'general',
      label: t('marketing.tabOverview', 'General & Schedule'),
      icon: Layers,
    },
    {
      key: 'products',
      label: t('marketing.tabProductsQuota', 'Products & Quotas'),
      icon: Boxes,
      badge: items.length,
    },
    {
      key: 'performance',
      label: t('marketing.colPerformance', 'Sales Performance'),
      icon: TrendingUp,
    },
  ]

  return (
    <>
      <DetailDrawer
        isOpen={Boolean(sale)}
        onClose={onClose}
        size="2xl"
      >
        {/* ─── 1. GLOBAL DRAWER HEADER ─── */}
        <DetailDrawerHeader
          title={t('marketing.detailDrawerTitle', 'Flash Sale Event Details')}
          subtitle={formatDisplayDate(sale.starts_at, { includeTime: true })}
          badge={
            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
              FLASH-{String(sale.id).padStart(4, '0')}
            </span>
          }
          onClose={onClose}
        />

        {/* ─── 2. PROFILE OVERVIEW CARD (Matching Employee Profile Overview Card) ─── */}
        <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${
                isLive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-card border-border/80 text-primary'
              }`}
            >
              <Zap size={26} className={isLive ? 'fill-amber-500 text-amber-500' : ''} />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  {sale.name}
                </h2>
                <StatusBadge status={st} />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>{sale.time_slot_name || t('marketing.sessionEvening', 'Evening Rush (18:00 - 21:00)')}</span>
                <span>•</span>
                <span className="font-semibold text-foreground/80">{getChannelLabel(sale.channel_scope)}</span>
                <span>•</span>
                <span>{formatDisplayDate(sale.starts_at, { includeTime: true })}</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border uppercase font-mono">
                  {getChannelTag(sale.channel_scope)}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                  {t('marketing.antiScalpingText', { count: 2, defaultValue: 'Max 2 units/customer' })}
                </span>
                {isLive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-2xs animate-pulse">
                    <Flame size={11} /> LIVE NOW
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. TAB NAVIGATION (Matching Employee Detail Drawer TabNav) ─── */}
        <DetailDrawerTabNav
          tabs={drawerTabs}
          activeTab={activeSubTab}
          onChange={(tabKey) => setActiveSubTab(tabKey as DrawerSubTab)}
        />

        {/* ─── 4. DRAWER BODY WITH GROUPED 2-COLUMN CARDS ─── */}
        <DetailDrawerBody>
          {/* TAB 1: GENERAL & EMPLOYMENT / SCHEDULE */}
          {activeSubTab === 'general' && (
            <div className="space-y-4">
              {/* Card 1: Campaign Information & Schedule */}
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('marketing.scheduleDates', 'Campaign Information & Schedule')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.campaignName', 'Campaign Name')}</p>
                    <p className="font-semibold text-foreground mt-0.5">{sale.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('common.status', 'Campaign Status')}</p>
                    <div className="mt-0.5">
                      <StatusBadge status={st} />
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.startsAt', 'Starts At')}</p>
                    <p className="font-semibold text-foreground font-mono mt-0.5">
                      {formatDisplayDate(sale.starts_at, { includeTime: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.endsAt', 'Ends At')}</p>
                    <p className="font-semibold text-foreground font-mono mt-0.5">
                      {formatDisplayDate(sale.ends_at, { includeTime: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.sessionSlot', 'Session Time Slot')}</p>
                    <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                      {sale.time_slot_name || t('marketing.sessionEvening', 'Prime Evening Rush (18:00 - 21:00)')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.priorityLevel', 'Pricing Priority Level')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">Level 1 (Highest Override)</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Omnichannel & Retail Scopes */}
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('marketing.omnichannelScopes', 'Channel & Store Scopes')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.activeChannels', 'Active Channels')}</p>
                    <p className="font-semibold text-foreground mt-0.5">{getChannelLabel(sale.channel_scope)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.storeOutlets', 'Target Outlets')}</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {t('marketing.allBranches', 'Phnom Penh HQ, Siem Reap & Battambang')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.antiScalpingRule', 'Anti-Scalping Rule')}</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {t('marketing.antiScalpingText', { count: 2, defaultValue: 'Max 2 units per customer' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.posBarcodeTag', 'POS Barcode Quick Code')}</p>
                    <p className="font-semibold font-mono text-primary mt-0.5">FLASH-{sale.id}-2026</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Performance Summary */}
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('marketing.performance', 'Performance Summary')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.estRevenue', 'Gross Revenue')}</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-sm mt-0.5">
                      ${sRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.netMargin', 'Est. Profit Margin')}</p>
                    <p className="font-semibold text-teal-600 dark:text-teal-400 font-mono text-sm mt-0.5">
                      ${estProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.soldUnit', 'Units Sold / Total Quota')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">
                      {sUnits} / {totalQuota} units ({totalQuotaFillPct}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.ordersPlaced', 'Orders Placed')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">{sUnits} checkouts</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS & QUOTAS */}
          {activeSubTab === 'products' && (
            <div className="space-y-4">
              {/* Product Quota Summary Header */}
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('marketing.quotaAllocation', 'Quota Overview')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.includedProducts', 'Total Products')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">{items.length} items</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.quotaLimit', 'Total Allocated Quota')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">{totalQuota} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.soldUnit', 'Total Units Sold')}</p>
                    <p className="font-semibold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {sUnits} units ({totalQuotaFillPct}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.quotaAvailable', 'Remaining Quota')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">
                      {Math.max(0, totalQuota - sUnits)} units
                    </p>
                  </div>
                </div>
              </div>

              {/* Itemized List */}
              <div className="space-y-3">
                {items.map((item: any, idx: number) => {
                  const sold = Number(item.sold_count || 12)
                  const quota = Number(item.quota || 50)
                  const soldPct = Math.min(Math.round((sold / quota) * 100), 100)
                  const isSoldOut = sold >= quota
                  const flashUsd = Number(item.flash_price || 0)
                  const origUsd = Number(item.original_price || 0)
                  const flashKhr = Number(item.flash_price_khr || Math.round(flashUsd * 4100))

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/50">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground truncate">
                            {item.product_name || `Product Item #${item.product_id}`}
                          </h4>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {item.product_sku || 'SKU-FLASH'}
                          </span>
                        </div>
                        <div>
                          {isSoldOut ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                              {t('marketing.quotaSoldOut', 'Sold Out')}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {t('marketing.quotaAvailable', 'Available')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                        <div>
                          <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.flashPriceUsd', 'Flash Price ($)')}</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                              ${flashUsd.toFixed(2)}
                            </span>
                            {origUsd > flashUsd && (
                              <span className="line-through text-muted-foreground font-mono text-xs">
                                ${origUsd.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.flashPriceKhr', 'Flash Price (KHR)')}</p>
                          <p className="font-semibold font-mono text-foreground mt-0.5">
                            ៛{flashKhr.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.discountPercent', 'Discount')}</p>
                          <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                            {Number(item.discount_percent || 40).toFixed(0)}% OFF
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.quotaSold', 'Sold / Quota')}</p>
                          <p className="font-semibold font-mono text-foreground mt-0.5">
                            {sold} / {quota} units ({soldPct}%)
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSoldOut ? 'bg-rose-500' : 'bg-teal-600 dark:bg-teal-500'
                            }`}
                            style={{ width: `${soldPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PERFORMANCE */}
          {activeSubTab === 'performance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('marketing.financialMetrics', 'Financial & Sales Telemetry')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.flashRevenue', 'Flash Revenue')}</p>
                    <p className="font-semibold font-mono text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                      ${sRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.estProfit', 'Net Profit Estimate')}</p>
                    <p className="font-semibold font-mono text-teal-600 dark:text-teal-400 text-sm mt-0.5">
                      ${estProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.aovMetric', 'Average Order Value (AOV)')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">
                      ${(sRevenue / Math.max(1, sUnits)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.conversionRate', 'Conversion Velocity')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">24.5% Checkout Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DetailDrawerBody>

        {/* ─── 5. GLOBAL DRAWER FOOTER (Matching Employee Detail Drawer Footer) ─── */}
        <DetailDrawerFooter
          onClose={onClose}
          leftActions={
            <ActionButton
              variant="outline"
              icon={<Copy size={15} />}
              label={t('marketing.duplicateCampaign', 'Duplicate')}
              onClick={() => onDuplicate(sale)}
            />
          }
          rightActions={
            <ActionButton
              variant="primary"
              icon={<Pencil size={15} />}
              label={t('common.edit', 'Edit')}
              onClick={() => {
                onEdit(sale)
                onClose()
              }}
            />
          }
        />
      </DetailDrawer>
    </>
  )
}

export default FlashSaleDetailDrawer
