import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Truck,
  Package,
  MapPin,
  Scale,
  Pencil,
  Copy,
  Check,
} from 'lucide-react'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
  StatusBadge,
  ActionButton,
} from '@/components/common'
import { formatDisplayDate } from '@/utils/formatters'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import type { Tab } from '../types/shipping.types'

interface ShippingDetailDrawerProps {
  item: any | null
  activeTab: Tab
  onClose: () => void
  onEdit: (item: any) => void
}

export const ShippingDetailDrawer: React.FC<ShippingDetailDrawerProps> = ({
  item,
  activeTab,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation(['shipping', 'common', 'buttons'])
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  if (!item) return null

  const handleCopy = (text: string) => {
    if (!text) return
    sound.playClick()
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t('common.copiedToClipboard', 'បានចម្លងទៅក្ដារតម្បៀតខ្ទាស់ជោគជ័យ'))
    setTimeout(() => setCopied(false), 2000)
  }

  const titleText = item.tracking_number || item.name || item.code || `ID-#${item.id}`
  const orderNum = item.order_id || item.id
  const carrierName = item.carrier || item.provider || 'J&T Express Cambodia'
  const feeAmount = Number(item.shipping_fee ?? item.price ?? item.base_price ?? item.rate ?? 0)
  const statusStr = (item.status || (item.is_active !== false ? 'active' : 'inactive')).toLowerCase()

  const parseJsonArray = (val: any): string[] => {
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed)) return parsed
      } catch {
        return val.split(',').map((s) => s.trim()).filter(Boolean)
      }
    }
    return []
  }

  const provincesList = parseJsonArray(item.provinces)
  const citiesList = parseJsonArray(item.cities)

  // Drawer Header Config
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'shipping-methods':
        return t('shipping.methodDetailTitle', 'Shipping Method Details')
      case 'shipping-zones':
        return t('shipping.zoneDetailTitle', 'Delivery Zone Details')
      case 'shipping-rates':
        return t('shipping.rateDetailTitle', 'Freight Rate Details')
      default:
        return t('shipping.shipmentDetailTitle', 'Shipment Details')
    }
  }

  const getHeroIcon = () => {
    switch (activeTab) {
      case 'shipping-methods':
        return <Package size={26} className="text-blue-600 dark:text-blue-400" />
      case 'shipping-zones':
        return <MapPin size={26} className="text-purple-600 dark:text-purple-400" />
      case 'shipping-rates':
        return <Scale size={26} className="text-amber-600 dark:text-amber-400" />
      default:
        return <Truck size={26} className="text-emerald-600 dark:text-emerald-400" />
    }
  }

  return (
    <DetailDrawer
      isOpen={Boolean(item)}
      onClose={onClose}
      size="2xl"
    >
      {/* ─── 1. GLOBAL DRAWER HEADER ─── */}
      <DetailDrawerHeader
        title={getHeaderTitle()}
        subtitle={titleText}
        badge={
          <span className="px-2.5 py-1 rounded-md bg-muted dark:bg-slate-800 text-foreground dark:text-slate-200 text-xs font-mono font-bold border border-border/70 dark:border-slate-700">
            #{item.id}
          </span>
        }
        onClose={onClose}
      />

      {/* ─── 2. PROFILE OVERVIEW HERO CARD ─── */}
      <div className="p-5 sm:p-6 bg-muted/20 dark:bg-slate-900/40 border-b border-border/80 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-card dark:bg-slate-800 border border-border/80 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
            {getHeroIcon()}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-slate-100 truncate font-mono">
                {titleText}
              </h2>
              {item.tracking_number && (
                <button
                  type="button"
                  onClick={() => handleCopy(item.tracking_number)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t('common.copy', 'ចម្លង')}
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              )}
              <StatusBadge status={statusStr} />
            </div>

            <p className="text-xs text-muted-foreground dark:text-slate-400 flex items-center gap-2 flex-wrap">
              {item.order_id && (
                <>
                  <span className="font-semibold text-foreground dark:text-slate-200">
                    {t('shipping.orderPrefix', 'បញ្ជាទិញ #')}{orderNum}
                  </span>
                  <span>•</span>
                </>
              )}
              {carrierName && (
                <>
                  <span>{carrierName}</span>
                  <span>•</span>
                </>
              )}
              <span className="font-mono font-bold text-foreground dark:text-slate-200">
                ${feeAmount.toFixed(2)}
              </span>
              {item.created_at && (
                <>
                  <span>•</span>
                  <span>{formatDisplayDate(item.created_at)}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. DRAWER BODY WITH CLEAN GROUPED CARDS ─── */}
      <DetailDrawerBody>
        {/* ======================================================== */}
        {/* TAB 1: SHIPMENTS VIEW (ប័ណ្ណដឹកជញ្ជូន)                     */}
        {/* ======================================================== */}
        {activeTab === 'shipments' && (
          <div className="space-y-4">
            {/* Card 1: ព័ត៌មានការដឹកជញ្ជូន */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 shadow-2xs space-y-3.5">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                {t('shipping.shipmentInfo', 'Shipment Information')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.trackingNumber', 'Tracking Number')}</p>
                  <p className="font-semibold font-mono text-primary text-sm mt-0.5">
                    {item.tracking_number || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.orderId', 'Order ID')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    #{orderNum}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.carrierName', 'Carrier / Courier Name')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">
                    {carrierName}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.colStatus', 'Status')}</p>
                  <div className="mt-0.5">
                    <StatusBadge status={statusStr} />
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.colShippedDate', 'Shipped Date')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    {item.shipped_at ? formatDisplayDate(item.shipped_at) : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.estimatedDelivery', 'Estimated Delivery')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    {item.estimated_delivery_at ? formatDisplayDate(item.estimated_delivery_at) : t('shipping.within1to2Days', 'Within 1-2 Days')}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: គោលដៅ & ព័ត៌មានអ្នកទទួល */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 shadow-2xs space-y-3.5">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                {t('shipping.destinationAndRecipient', 'Destination & Recipient')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.recipientName', 'Recipient Name')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">
                    {item.recipient_name || item.customer_name || t('shipping.generalCustomer', 'General Customer')}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.recipientPhone', 'Phone Number')}</p>
                  <p className="font-semibold font-mono text-primary mt-0.5">
                    {item.recipient_phone || item.customer_phone || '—'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.deliveryAddress', 'Actual Delivery Address')}</p>
                  <p className="font-medium text-foreground dark:text-slate-200 mt-0.5 leading-relaxed">
                    {item.shipping_address || item.address || item.destination || 'Phnom Penh'}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.province', 'Province / City')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">
                    {item.shipping_province || item.province || 'Phnom Penh'}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.city', 'District / Khan')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">
                    {item.shipping_city || item.city || 'Khan Daun Penh'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: ថ្លៃឈ្នួល និងការចំណាយ */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 shadow-2xs space-y-3.5">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                {t('shipping.ratesAndCost', 'Rates & Financials')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.colFreightFee', 'Freight Fee')}</p>
                  <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 text-base">
                    ${feeAmount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.paymentStatus', 'Freight Payment Status')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">
                    {feeAmount === 0 ? t('shipping.freeShipping', 'Free Shipping') : t('shipping.prepaidOrCod', 'Paid / Settled')}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.packageWeight', 'Package Weight')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    {item.weight ?? '1.25'} kg
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('common.createdAt', 'Created At')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    {item.created_at ? formatDisplayDate(item.created_at) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Notes (if available) */}
            {item.notes && (
              <div className="p-4 rounded-2xl bg-muted/20 dark:bg-slate-850 border border-border/70 dark:border-slate-800 space-y-1">
                <p className="text-xs font-bold text-foreground dark:text-slate-200">
                  {t('shipping.shippingNotes', 'Shipping Notes')}
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-400 leading-relaxed">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SHIPPING METHODS VIEW (វិធីសាស្ត្រដឹកជញ្ជូន)         */}
        {/* ======================================================== */}
        {activeTab === 'shipping-methods' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 shadow-2xs space-y-3.5">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                {t('shipping.methodInfo', 'Shipping Method Information')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.methodName', 'Method Name')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">{item.name || '—'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.methodCode', 'Method Code')}</p>
                  <p className="font-semibold font-mono text-primary mt-0.5 uppercase">{item.code || '—'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.carrierName', 'Carrier / Courier Name')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">{carrierName}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('common.status', 'Status')}</p>
                  <div className="mt-0.5">
                    <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.colBasePrice', 'Base Price ($)')}</p>
                  <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 text-base">
                    ${feeAmount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('common.createdAt', 'Created At')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    {item.created_at ? formatDisplayDate(item.created_at) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SHIPPING ZONES VIEW (តំបន់ដឹកជញ្ជូន)                 */}
        {/* ======================================================== */}
        {activeTab === 'shipping-zones' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 shadow-2xs space-y-3.5">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                {t('shipping.zoneInfo', 'Geographic Zone Information')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.zoneName', 'Zone Name')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">{item.name || '—'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.zoneCode', 'Zone Code')}</p>
                  <p className="font-semibold font-mono text-purple-600 dark:text-purple-400 mt-0.5 uppercase">{item.code || (item.id ? `ZONE-${String(item.id).padStart(3, '0')}` : '—')}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('common.status', 'Status')}</p>
                  <div className="mt-0.5">
                    <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('common.createdAt', 'Created At')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    {item.created_at ? formatDisplayDate(item.created_at) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Provinces Coverage Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                {t('shipping.provincesCovered', 'Provinces Covered')}
              </h4>
              {provincesList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {provincesList.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted dark:bg-slate-800 text-foreground dark:text-slate-200 border border-border/70 dark:border-slate-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">{t('shipping.noProvincesConfigured', 'Nationwide / All Provinces')}</p>
              )}
            </div>

            {/* Cities / Districts Coverage Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                {t('shipping.citiesCovered', 'Districts Covered')}
              </h4>
              {citiesList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {citiesList.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted dark:bg-slate-800 text-foreground dark:text-slate-200 border border-border/70 dark:border-slate-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">{t('shipping.allDistrictsCovered', 'All Districts in Zone')}</p>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SHIPPING RATES VIEW (អត្រាតម្លៃដឹកជញ្ជូន)             */}
        {/* ======================================================== */}
        {activeTab === 'shipping-rates' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 shadow-2xs space-y-3.5">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                {t('shipping.rateInfo', 'Freight Rate Information')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.tabMethods', 'Shipping Methods')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">
                    {item.shipping_method?.name || item.method_name || 'Standard Delivery'}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.tabZones', 'Delivery Zones')}</p>
                  <p className="font-semibold text-foreground dark:text-slate-200 mt-0.5">
                    {item.shipping_zone?.name || item.zone_name || 'Phnom Penh Central'}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.colFreightFee', 'Freight Fee')}</p>
                  <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 text-base">
                    ${feeAmount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('shipping.colWeightRange', 'Weight Range (kg)')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    {item.min_weight ?? 0} kg — {item.max_weight ?? 10} kg
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('common.createdAt', 'Created At')}</p>
                  <p className="font-semibold font-mono text-foreground dark:text-slate-200 mt-0.5">
                    {item.created_at ? formatDisplayDate(item.created_at) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawerBody>

      {/* ─── 4. GLOBAL DRAWER FOOTER ─── */}
      <DetailDrawerFooter
        onClose={onClose}
        closeLabel={t('common.close', 'បិទ')}
        rightActions={
          <ActionButton
            variant="primary"
            icon={<Pencil size={14} />}
            label={t('common.edit', 'កែប្រែ')}
            onClick={() => {
              onClose()
              onEdit(item)
            }}
          />
        }
      />
    </DetailDrawer>
  )
}

export default ShippingDetailDrawer
