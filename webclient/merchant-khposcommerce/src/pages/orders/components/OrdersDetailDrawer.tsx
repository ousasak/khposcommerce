import React, { useState, useEffect } from 'react'
import {
  Printer,
  QrCode,
  Lock,
  FileText,
  Truck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useThemeStore } from '@/stores/themeStore'
import { useToast } from '@/hooks/useToast'
import {
  ProductThumbnail,
  EnterpriseModal,
  CloseButton,
  Input,
  ActionButton,
  UserAvatar,
} from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/formatters'
import { orderService } from '@/services/orderService'
import { cn } from '@/lib/utils'
import type { Order, OrderItem } from '../types/order.types'
export type { Order, OrderItem }

const KHR_RATE = 4100

export interface OrdersDetailDrawerProps {
  order: Order | undefined
  isLoading?: boolean
  isOpen?: boolean
  onClose: () => void
  onPrintReceipt?: (order: Order) => void
  onPrintWaybill?: (order: Order) => void
}

export const OrdersDetailDrawer: React.FC<OrdersDetailDrawerProps> = ({
  order,
  isLoading = false,
  isOpen = true,
  onClose,
  onPrintReceipt,
  onPrintWaybill,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])
  const toast = useToast()
  const queryClient = useQueryClient()

  // Form states
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [carrier, setCarrier] = useState<string>('J&T Express')
  const [linkType, setLinkType] = useState<string>('manual')
  const [trackingCode, setTrackingCode] = useState<string>('')
  const [trackingUrl, setTrackingUrl] = useState<string>('')
  const [shipperName, setShipperName] = useState<string>('')
  const [shipperPhone, setShipperPhone] = useState<string>('')
  const [tgShipperName, setTgShipperName] = useState<string>('')
  const [tgShipperPhone, setTgShipperPhone] = useState<string>('')

  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isSavingShipping, setIsSavingShipping] = useState(false)

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status || 'pending')
      const courier =
        order.shipping_method?.name ||
        order.shippingMethod?.name ||
        order.shipment?.carrier ||
        order.carrier ||
        order.courier ||
        'J&T Express'
      setCarrier(courier)
      setTrackingCode(order.tracking_number || order.tracking_code || order.shipment?.tracking_number || '')
      setTrackingUrl(order.tracking_url || '')
      setShipperName(order.shipper_name || order.shipping_name || '')
      setShipperPhone(order.shipper_phone || order.shipping_phone || '')
    }
  }, [order])

  if (!isOpen || !order) return null

  // Normalize items list across different API payload keys
  const itemsList: OrderItem[] =
    order.items ||
    order.order_items ||
    order.details ||
    []

  // Customer info
  const customerName =
    order.customer?.name ||
    order.shipping_name ||
    order.customer_name ||
    (language === 'km' ? 'អតិថិជនទូទៅ' : 'Walk-in Customer')

  const customerEmail =
    order.customer?.email ||
    order.customer_email ||
    'emily.j@email.com'

  // Total financial calculations
  const subtotal = Number(order.subtotal || 0)
  const discountAmount = Number(order.discount_amount || 0)
  const taxAmount = Number(order.tax_amount || 0)
  const shippingCost = Number(order.shipping_cost ?? order.shipping_fee ?? 0)
  const grandTotal = Number(
    order.grand_total ?? order.total_amount ?? (subtotal - discountAmount + taxAmount + shippingCost)
  )
  const grandTotalRiel = Math.round(grandTotal * KHR_RATE)

  // Payment badge label
  const paymentBadgeText = language === 'km' ? 'ទូទាត់ភ្លាមៗ · KHQR' : 'Instant Payment · KHQR'

  // Status label translation
  const getStatusLabel = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return language === 'km' ? 'រង់ចាំការទូទាត់' : 'Pending Payment'
      case 'processing':
      case 'confirmed':
        return language === 'km' ? 'កំពុងដំណើរការ' : 'Processing'
      case 'shipped':
        return language === 'km' ? 'បានផ្ញើចេញ' : 'Shipped'
      case 'delivered':
        return language === 'km' ? 'បានមកដល់' : 'Delivered'
      case 'completed':
        return language === 'km' ? 'បានទទួលទំនិញ' : 'Completed'
      case 'cancelled':
        return language === 'km' ? 'បានបោះបង់' : 'Cancelled'
      default:
        return status
    }
  }

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'shipped':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      case 'processing':
      case 'confirmed':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      default:
        return 'bg-muted text-muted-foreground border-border/80'
    }
  }

  // Handle saving status
  const handleSaveStatus = async () => {
    if (!order.id) return
    setIsSavingStatus(true)
    try {
      await orderService.updateStatus(order.id, selectedStatus)
      toast.success(language === 'km' ? 'បានកែប្រែស្ថានភាពជោគជ័យ' : 'Status updated successfully')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order-detail', order.id] })
    } catch (err: any) {
      toast.error(err?.message || (language === 'km' ? 'បរាជ័យក្នុងការកែប្រែស្ថានភាព' : 'Failed to update status'))
    } finally {
      setIsSavingStatus(false)
    }
  }

  // Handle saving tracking
  const handleSaveTracking = async () => {
    if (!order.id) return
    setIsSavingShipping(true)
    try {
      await orderService.update(order.id, {
        tracking_number: trackingCode,
        tracking_url: trackingUrl,
        carrier,
        shipper_name: shipperName,
        shipper_phone: shipperPhone,
        status: 'shipped',
      })
      setSelectedStatus('shipped')
      toast.success(language === 'km' ? 'បានរក្សាទុក និងកំណត់ថាបានផ្ញើរួចរាល់' : 'Shipping tracking saved and marked as dispatched')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order-detail', order.id] })
    } catch (err: any) {
      toast.error(err?.message || (language === 'km' ? 'បរាជ័យក្នុងការរក្សាទុកការដឹកជញ្ជូន' : 'Failed to save shipping info'))
    } finally {
      setIsSavingShipping(false)
    }
  }

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Nov 20, 2026, 06:55 AM'

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      className="bg-card text-card-foreground rounded-3xl shadow-2xl border border-border/80"
      bodyClassName="p-0"
      showCloseButton={false}
    >
      {/* ── TOP HEADER (CLEAN & COHESIVE WITH SYSTEM THEME) ── */}
      <div className="flex items-start justify-between px-6 sm:px-8 pt-7 pb-4 border-b border-border/60">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {language === 'km' ? 'ការបញ្ជាទិញ' : 'Order'} #{order.order_number || order.id}
          </h2>
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            {/* Primary Custom Themed KHQR Badge */}
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {paymentBadgeText}
            </Badge>
            {/* Dynamic Status Badge */}
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', getStatusBadgeClass(selectedStatus || order.status))}>
              {getStatusLabel(selectedStatus || order.status)}
            </span>
            <span className="text-muted-foreground font-medium ml-1">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Global Round Close Button */}
        <CloseButton onClose={onClose} size="md" variant="default" />
      </div>

      {/* ── 2-COLUMN MAIN CONTENT (CLEAN RESPONSIVE LAYOUT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 sm:px-8 py-6">
        {/* ── LEFT COLUMN: CUSTOMER, ITEMS, TOTAL, STATUS ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Customer Info */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-foreground">
              {language === 'km' ? 'ព័ត៌មានអតិថិជន' : 'Customer Information'}
            </h4>
            <div className="flex items-center gap-3.5 pt-1">
              <UserAvatar
                name={customerName}
                src={order.customer?.avatar || order.customer?.photo}
                sizeClassName="w-10 h-10"
                className="rounded-xl border border-border/80 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {customerName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {customerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Ordered Items List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">
              {language === 'km' ? 'ទំនិញដែលបានបញ្ជាទិញ' : 'Ordered Items'}
            </h4>
            <div className="space-y-3">
              {itemsList.map((item, idx) => {
                const itemName =
                  item.product_name ||
                  item.name ||
                  item.product?.name ||
                  'Product'
                const itemPhoto =
                  item.product_image ||
                  item.image ||
                  item.product?.primary_image ||
                  item.product?.image
                const qty = item.quantity || 1
                const unitPrice = Number(item.unit_price ?? item.price ?? 0)
                const lineTotal = Number(item.total ?? item.subtotal ?? (Number(qty) * unitPrice))

                return (
                  <div key={item.id || idx} className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductThumbnail
                        name={itemName}
                        primaryImage={item.product?.primary_image}
                        image={itemPhoto}
                        categoryName={item.product?.category?.name}
                        size="md"
                        className="rounded-xl shadow-2xs shrink-0 border border-border/80"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-xs truncate max-w-[200px]" title={itemName}>
                          {itemName}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {language === 'km' ? 'ចំនួន' : 'Qty'}: {qty}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {language === 'km' ? 'តម្លៃរាយ' : 'Unit Price'}: {formatCurrency(unitPrice, 'USD')}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground text-sm font-mono shrink-0">
                      {formatCurrency(lineTotal, 'USD')}
                    </span>
                  </div>
                )
              })}

              {itemsList.length === 0 && (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  {language === 'km' ? 'មិនមានទំនិញក្នុងបញ្ជាទិញនេះទេ' : 'No items found in this order'}
                </div>
              )}
            </div>
          </div>

          {/* 3. Total Amount (Prominent Bold Display) */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-foreground">
                {language === 'km' ? 'ចំនួនទឹកប្រាក់សរុប' : 'Total Amount'}
              </span>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono tabular-nums">
                  {formatCurrency(grandTotal, 'USD')}
                </span>
                <span className="block text-xs font-semibold text-muted-foreground font-mono mt-0.5 tabular-nums">
                  {formatCurrency(grandTotalRiel, 'KHR')}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Update Order Status */}
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-bold text-foreground">
              {language === 'km' ? 'បច្ចុប្បន្នភាពស្ថានភាពបញ្ជាទិញ' : 'Update Order Status'}
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {language === 'km'
                ? 'ផ្លាស់ប្តូរស្ថានភាពការបញ្ជាទិញ និងផ្ញើដំណឹងស្វ័យប្រវត្តិតាម Telegram ទៅកាន់អ្នកដឹកជញ្ជូន។'
                : 'Update the order status and notify the assigned delivery courier via Telegram.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 h-10 px-3.5 rounded-lg border border-input bg-background text-xs font-semibold text-foreground hover:border-accent-foreground/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-2xs"
              >
                <option value="pending">{language === 'km' ? 'រង់ចាំការទូទាត់' : 'Pending Payment'}</option>
                <option value="processing">{language === 'km' ? 'កំពុងដំណើរការ' : 'Processing'}</option>
                <option value="shipped">{language === 'km' ? 'បានផ្ញើចេញ' : 'Shipped'}</option>
                <option value="delivered">{language === 'km' ? 'បានមកដល់' : 'Delivered'}</option>
                <option value="completed">{language === 'km' ? 'បានទទួលទំនិញ / បានបញ្ចប់' : 'Completed'}</option>
                <option value="cancelled">{language === 'km' ? 'បានបោះបង់' : 'Cancelled'}</option>
              </select>
              <ActionButton
                type="button"
                variant="primary"
                onClick={handleSaveStatus}
                loading={isSavingStatus}
                label={language === 'km' ? 'រក្សាទុក' : 'Save'}
                className="px-5 shrink-0"
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: DELIVERY TRACKING & TELEGRAM LOGISTICS ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Delivery Tracking Form */}
          <div className="space-y-3.5">
            <div>
              <h4 className="text-sm font-bold text-foreground">
                {language === 'km' ? 'ការតាមដានការដឹកជញ្ជូន' : 'Shipping Tracking'}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                {language === 'km'
                  ? 'បញ្ចូលលេខកូដតាមដាន ឬតំណភ្ជាប់ពីក្រុមហ៊ុនដឹកជញ្ជូន (J&T, វីរៈប៊ុនថាំ...) ដើម្បីឱ្យអតិថិជនអាចតាមដានកញ្ចប់ទំនិញបាន។'
                  : 'Attach tracking codes or links from J&T, Virak Buntham, etc. so customers can track their parcel.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  {language === 'km' ? 'អ្នកដឹកជញ្ជូន / ប្រភពដឹកជញ្ជូន' : 'Carrier / Delivery Source'}
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-input bg-background text-xs font-semibold text-foreground hover:border-accent-foreground/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-2xs"
                >
                  <option value="J&T Express">J&T Express</option>
                  <option value="Virak Buntham">Virak Buntham (VET)</option>
                  <option value="GrabExpress">GrabExpress</option>
                  <option value="VET Express">VET Express</option>
                  <option value="Internal">{language === 'km' ? 'អ្នកដឹកផ្ទាល់របស់ហាង' : 'Store Internal Delivery'}</option>
                  <option value="Other">{language === 'km' ? 'ផ្សេងៗ' : 'Other Courier'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  {language === 'km' ? 'ទម្រង់តំណភ្ជាប់' : 'Link Format'}
                </label>
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-input bg-background text-xs font-semibold text-foreground hover:border-accent-foreground/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-2xs"
                >
                  <option value="manual">{language === 'km' ? 'URL ដោយដៃ' : 'Manual URL'}</option>
                  <option value="auto">{language === 'km' ? 'តំណស្វ័យប្រវត្តិ' : 'Auto Generated'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                {language === 'km' ? 'លេខកូដតាមដានកញ្ចប់ទំនិញ' : 'Tracking Code'}
              </label>
              <Input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder={language === 'km' ? 'ឧ. JT1234567890' : 'e.g. JT1234567890'}
                size="md"
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                {language === 'km' ? 'តំណភ្ជាប់តាមដានក្រុមហ៊ុនដឹកជញ្ជូន' : 'Carrier Tracking URL'}
              </label>
              <Input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://track.jtexpress.com.kh/..."
                size="md"
                className="font-mono text-xs"
              />
            </div>

            {/* Store internal shipper section */}
            <div className="space-y-2 pt-1">
              <h5 className="text-xs font-bold text-foreground">
                {language === 'km' ? 'អ្នកដឹកជញ្ជូនផ្ទាល់របស់ហាង (In-house Delivery)' : 'Store In-house Delivery'}
              </h5>
              <p className="text-[10px] text-muted-foreground">
                {language === 'km' ? 'កត់ត្រាឈ្មោះ និងលេខទូរស័ព្ទអ្នកដឹករបស់ហាង (បើមាន)' : 'Record store shipper name and phone (if applicable)'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="text"
                  value={shipperName}
                  onChange={(e) => setShipperName(e.target.value)}
                  placeholder={language === 'km' ? 'បញ្ចូលឈ្មោះអ្នកដឹកជញ្ជូន' : 'Shipper Name'}
                  size="md"
                />
                <Input
                  type="tel"
                  value={shipperPhone}
                  onChange={(e) => setShipperPhone(e.target.value)}
                  placeholder={language === 'km' ? 'ឧ. 012 345 678' : 'e.g. 012 345 678'}
                  size="md"
                  className="font-mono"
                />
              </div>
            </div>

            <ActionButton
              type="button"
              variant="primary"
              onClick={handleSaveTracking}
              loading={isSavingShipping}
              icon={<Truck size={15} />}
              label={language === 'km' ? 'រក្សាទុក និងកំណត់ថាបានផ្ញើចេញ' : 'Save and Mark as Dispatched'}
              className="w-full sm:w-auto mt-1"
            />
          </div>

          {/* 2. Telegram QR Driver Tracking Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/70 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <QrCode size={15} className="text-primary" />
                <h5 className="text-xs font-bold text-foreground">
                  {language === 'km' ? 'QR Code តាមដានការដឹកជញ្ជូន (Telegram Driver Tracking)' : 'Driver Telegram Tracking QR'}
                </h5>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground gap-1 px-2 py-0.5 rounded-md">
                <Lock size={10} />
                <span>{language === 'km' ? 'ទាមទារការទទួលយកទំនិញជាមុន' : 'Requires Order Dispatch'}</span>
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {language === 'km'
                ? `អ្នកដឹកជញ្ជូនខាងក្រៅអាចស្កេន QR Code នេះសម្រាប់បញ្ជាទិញ ORD-${order.order_number || order.id} ដើម្បី Update ដំណាក់កាលដឹកជញ្ជូន ដោយមិនចាំបាច់មានគណនីក្នុងប្រព័ន្ធឡើយ។`
                : `External couriers can scan this QR for order ORD-${order.order_number || order.id} to update delivery stages without having a system account.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Input
                type="text"
                value={tgShipperName}
                onChange={(e) => setTgShipperName(e.target.value)}
                placeholder={language === 'km' ? 'ឈ្មោះអ្នកដឹកជញ្ជូន (ស្រេចចិត្ត)' : 'Courier Name (Optional)'}
                size="sm"
              />
              <Input
                type="tel"
                value={tgShipperPhone}
                onChange={(e) => setTgShipperPhone(e.target.value)}
                placeholder={language === 'km' ? 'លេខទូរស័ព្ទ (ស្រេចចិត្ត)' : 'Courier Phone (Optional)'}
                size="sm"
                className="font-mono"
              />
            </div>

            <div className="pt-1 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{language === 'km' ? 'មិនទាន់បានភ្ជាប់ Telegram Bot (Token / Bot Name)' : 'Telegram bot is not configured (token / bot name)'}</span>
              </p>
              <div className="flex items-center gap-2">
                {onPrintWaybill && (
                  <ActionButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPrintWaybill(order)}
                    icon={<FileText size={13} />}
                    label={language === 'km' ? 'ប័ណ្ណដឹកជញ្ជូន' : 'Waybill'}
                  />
                )}
                {onPrintReceipt && (
                  <ActionButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPrintReceipt(order)}
                    icon={<Printer size={13} />}
                    label={language === 'km' ? 'វិក្កយបត្រ' : 'Receipt'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseModal>
  )
}

// ── Backward Compatibility Aliases ──
export const OrdersDetailModal = OrdersDetailDrawer
export default OrdersDetailDrawer
