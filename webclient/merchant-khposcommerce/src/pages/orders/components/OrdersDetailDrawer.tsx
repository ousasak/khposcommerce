import React, { useState } from 'react'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  Clock,
  DollarSign,
  Printer,
  QrCode,
  Building,
  CreditCard,
  Copy,
  Check,
  AlertCircle,
  ShoppingBag,
  Boxes,
  Layers,
  Receipt,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { useToast } from '@/hooks/useToast'
import {
  StatusBadge,
  ProductThumbnail,
  AvatarImage,
  ActionButton,
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
} from '@/components/common'
import type { DetailDrawerTabItem } from '@/components/common'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'

const KHR_RATE = 4100

export interface OrderItem {
  id: number
  product_id?: number
  product_name?: string
  name?: string
  sku?: string
  barcode?: string
  quantity: number
  unit_price: number
  price?: number
  discount_amount?: number
  tax_amount?: number
  total?: number
  subtotal?: number
  product_image?: string
  image?: string
  variant?: {
    id: number
    name?: string
    sku?: string
    color?: string
    size?: string
    price?: number
  }
  product?: {
    id?: number
    name?: string
    image?: string
    primary_image?: string
    category?: { name?: string }
  }
}

export interface Order {
  id: number
  order_number: string
  customer?: {
    id?: number
    name?: string
    phone?: string
    email?: string
    avatar?: string
    photo?: string
    group?: { name?: string; discount_percent?: number }
  }
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_province?: string
  shipping_postal_code?: string
  carrier?: string
  courier?: string
  tracking_number?: string
  tracking_code?: string
  shipping_method?: any
  shippingMethod?: any
  shipment?: any
  payments?: any[]
  payment_method?: string
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded' | string
  fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled' | string
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded' | string
  subtotal?: number
  grand_total?: number
  total_amount?: number
  discount_amount?: number
  tax_amount?: number
  shipping_cost?: number
  shipping_fee?: number
  notes?: string
  created_at: string
  updated_at?: string
  items?: OrderItem[]
  order_items?: OrderItem[]
  details?: OrderItem[]
  [key: string]: any
}

interface OrdersDetailDrawerProps {
  order: Order | undefined
  isLoading: boolean
  isOpen?: boolean
  onClose: () => void
  onPrintReceipt?: (order: Order) => void
  onPrintWaybill?: (order: Order) => void
}

type OrderTabKey = 'items' | 'logistics'

export const OrdersDetailDrawer: React.FC<OrdersDetailDrawerProps> = ({
  order,
  isLoading,
  isOpen = true,
  onClose,
  onPrintReceipt,
  onPrintWaybill,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<OrderTabKey>('items')
  const [copiedTracking, setCopiedTracking] = useState(false)
  const [copiedOrderNo, setCopiedOrderNo] = useState(false)

  // Normalize items list across different API payload keys
  const itemsList: OrderItem[] =
    order?.items ||
    order?.order_items ||
    order?.details ||
    []

  // Normalize customer info
  const customerName =
    order?.customer?.name ||
    order?.shipping_name ||
    order?.customer_name ||
    t('orders:walkInCustomer', language === 'km' ? 'អតិថិជនទូទៅ' : 'Walk-in Customer')

  const rawCustomerPhone =
    order?.customer?.phone ||
    order?.customer_phone ||
    order?.shipping_phone

  const customerPhone = rawCustomerPhone ? GlobalFormat.phone(rawCustomerPhone) : '—'

  const rawCustomerEmail =
    order?.customer?.email ||
    order?.customer_email

  const customerEmail = rawCustomerEmail ? GlobalFormat.email(rawCustomerEmail) : '—'

  const customerPhoto =
    order?.customer?.photo ||
    order?.customer?.avatar

  // Normalize shipping destination
  const fullAddress = [
    order?.shipping_address,
    order?.shipping_city,
    order?.shipping_province,
    order?.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(', ')

  // Normalize Courier / Carrier
  const courierName =
    order?.shipping_method?.name ||
    order?.shippingMethod?.name ||
    order?.shipment?.carrier ||
    order?.carrier ||
    order?.courier ||
    (language === 'km' ? 'សេវាដឹកជញ្ជូនរហ័ស' : 'Express Courier')

  const trackingNumber =
    order?.tracking_number ||
    order?.tracking_code ||
    order?.shipment?.tracking_number ||
    (order?.id ? `TRK-${String(order.id).padStart(6, '0')}` : null)

  // Normalize payment method and status
  const extractPaymentName = (): string => {
    if (order?.payments && order.payments.length > 0) {
      const p = order.payments[0]
      if (p.payment_method?.name) return p.payment_method.name
      if (p.name) return p.name
      if (p.method) return p.method
    }
    if (order?.payment_method) return order.payment_method
    return 'Bakong KHQR'
  }

  const rawPaymentMethod = extractPaymentName()
  const paymentMethodLower = rawPaymentMethod.toLowerCase()
  const isPaid = (order?.payment_status || '').toLowerCase() === 'paid'

  let paymentMethodLabel = rawPaymentMethod
  let paymentMethodIcon = <QrCode size={13} className="text-blue-500 shrink-0" />

  if (
    paymentMethodLower.includes('aba') ||
    paymentMethodLower.includes('bakong') ||
    paymentMethodLower.includes('khqr') ||
    paymentMethodLower.includes('qr')
  ) {
    methodIcon: paymentMethodIcon = <QrCode size={13} className="text-blue-500 shrink-0" />
    paymentMethodLabel = t('orders.methodBakong', 'Bakong KHQR')
  } else if (paymentMethodLower.includes('wing')) {
    paymentMethodIcon = <Building size={13} className="text-emerald-500 shrink-0" />
    paymentMethodLabel = t('orders.methodWing', 'Wing Bank')
  } else if (paymentMethodLower.includes('acleda')) {
    paymentMethodIcon = <Building size={13} className="text-blue-600 shrink-0" />
    paymentMethodLabel = t('orders.methodAcleda', 'ACLEDA Mobile')
  } else if (
    paymentMethodLower.includes('card') ||
    paymentMethodLower.includes('credit') ||
    paymentMethodLower.includes('visa') ||
    paymentMethodLower.includes('master')
  ) {
    paymentMethodIcon = <CreditCard size={13} className="text-purple-500 shrink-0" />
    paymentMethodLabel = t('orders.methodCard', language === 'km' ? 'កាតធនាគារ' : 'Credit Card')
  } else if (
    paymentMethodLower.includes('cod') ||
    paymentMethodLower.includes('cash')
  ) {
    paymentMethodIcon = <Truck size={13} className="text-amber-500 shrink-0" />
    paymentMethodLabel = t('orders.methodCod', language === 'km' ? 'ទូទាត់ពេលដឹកដល់ (COD)' : 'Cash on Delivery (COD)')
  }

  // Financial calculations
  const subtotal = Number(order?.subtotal || 0)
  const discountAmount = Number(order?.discount_amount || 0)
  const taxAmount = Number(order?.tax_amount || 0)
  const shippingCost = Number(order?.shipping_cost ?? order?.shipping_fee ?? 0)
  const grandTotal = Number(
    order?.grand_total ?? order?.total_amount ?? (subtotal - discountAmount + taxAmount + shippingCost)
  )
  const grandTotalRiel = Math.round(grandTotal * KHR_RATE)

  // Quantity helper
  const formatQuantity = (qty: any) => {
    return GlobalFormat.number(qty, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  const handleCopy = (text: string, type: 'order' | 'tracking') => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (type === 'order') {
      setCopiedOrderNo(true)
      setTimeout(() => setCopiedOrderNo(false), 2000)
    } else {
      setCopiedTracking(true)
      setTimeout(() => setCopiedTracking(false), 2000)
    }
    toast.success(t('orders:copied', language === 'km' ? 'បានចម្លងជោគជ័យ' : 'Copied to clipboard'))
  }

  // Progression steps state
  const orderStatus = (order?.status || 'pending').toLowerCase()
  const isCancelled = orderStatus === 'cancelled' || orderStatus === 'refunded'
  const isFulfilled =
    (order?.fulfillment_status || '').toLowerCase() === 'fulfilled' ||
    orderStatus === 'shipped' ||
    orderStatus === 'delivered' ||
    orderStatus === 'completed'
  const isDelivered = orderStatus === 'delivered' || orderStatus === 'completed'

  const drawerTabs: DetailDrawerTabItem[] = [
    {
      key: 'items',
      label: t('orders:tabItems', language === 'km' ? 'ទំនិញ & ការទូទាត់' : 'Items & Totals'),
      icon: Boxes,
      badge: itemsList.length > 0 ? itemsList.length : undefined,
    },
    {
      key: 'logistics',
      label: t('orders:tabLogistics', language === 'km' ? 'អតិថិជន & ដឹកជញ្ជូន' : 'Customer & Shipping'),
      icon: Truck,
    },
  ]

  return (
    <DetailDrawer
      isOpen={isOpen && !!order}
      onClose={onClose}
      size="2xl"
    >
      {/* ── 1. DRAWER TOP HEADER ── */}
      <DetailDrawerHeader
        title={t('orders:webOrderDetail', 'Web Order Details')}
        subtitle={
          order?.created_at
            ? new Date(order.created_at).toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '—'
        }
        badge={
          order?.order_number ? (
            <button
              type="button"
              onClick={() => handleCopy(order.order_number, 'order')}
              className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md border border-primary/20 transition-colors cursor-pointer"
              title={t('common:copy', 'Copy')}
            >
              <span>#{order.order_number}</span>
              {copiedOrderNo ? <Check size={12} className="text-emerald-500" /> : <Copy size={11} />}
            </button>
          ) : undefined
        }
        onClose={onClose}
      />

      {/* ── 2. HERO OVERVIEW CARD (MATCHING EMPLOYEE PROFILE BANNER) ── */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0 shadow-xs">
            <ShoppingBag size={26} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                #{order?.order_number || 'Order'}
              </h2>
              {order?.status && <StatusBadge status={order.status} />}
              {order?.payment_status && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    isPaid
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>
                    {isPaid
                      ? t('orders:paymentStatusPaid', 'Paid')
                      : t('orders:paymentStatusUnpaid', 'Unpaid / COD')}
                  </span>
                </span>
              )}
              {order?.fulfillment_status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Truck size={11} />
                  <span>
                    {order.fulfillment_status === 'fulfilled'
                      ? t('orders:fulfilled', 'Fulfilled')
                      : t('orders:unfulfilled', 'Unfulfilled')}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{t('orders:onlineStore', 'Online Web Store')}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/80">{customerName}</span>
              <span>•</span>
              <span className="font-mono text-purple-600 dark:text-purple-300">
                {courierName}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {itemsList.length} {t('orders:itemsCount', 'Items')} ({itemsList.reduce((acc, it) => acc + Number(it.quantity || 1), 0)} pcs)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border inline-flex items-center gap-1">
                {paymentMethodIcon}
                <span>{paymentMethodLabel}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                {formatCurrency(grandTotal, 'USD')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. TAB NAVIGATION ── */}
      <DetailDrawerTabNav
        tabs={drawerTabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as OrderTabKey)}
      />

      {/* ── 4. DRAWER BODY ── */}
      <DetailDrawerBody isLoading={isLoading} className="p-6 space-y-4">
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Table of items */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Boxes size={15} className="text-primary shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {t('orders:purchasedItems', 'Purchased Items')} ({itemsList.length})
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                  {itemsList.reduce((acc, it) => acc + Number(it.quantity || 1), 0)} pcs
                </span>
              </div>

              <div className="border border-border/70 rounded-xl overflow-hidden text-xs bg-card">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">{t('orders:item', 'Item')}</th>
                      <th className="p-3 text-center w-16">{t('orders:qty', 'Qty')}</th>
                      <th className="p-3 text-right">{t('orders:price', 'Price')}</th>
                      <th className="p-3 text-right">{t('orders:total', 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {itemsList.map((item, idx) => {
                      const itemName =
                        item.product_name ||
                        item.name ||
                        item.product?.name ||
                        'Product Item'
                      const itemPhoto =
                        item.product_image ||
                        item.image ||
                        item.product?.primary_image ||
                        item.product?.image
                      const itemQty = formatQuantity(item.quantity)
                      const itemPrice = Number(item.unit_price ?? item.price ?? 0)
                      const itemTotal = Number(
                        item.total ?? item.subtotal ?? (Number(itemQty) * itemPrice)
                      )
                      const itemDiscount = Number(item.discount_amount || 0)

                      return (
                        <tr key={item.id || idx} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <ProductThumbnail
                                name={itemName}
                                primaryImage={item.product?.primary_image}
                                image={itemPhoto}
                                categoryName={item.product?.category?.name}
                                size="sm"
                                className="rounded-xl shadow-2xs shrink-0"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <span className="font-bold text-foreground block truncate max-w-[220px]" title={itemName}>
                                  {itemName}
                                </span>
                                {item.sku && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50 inline-block">
                                    {item.sku}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold font-mono text-foreground">
                            {itemQty}
                          </td>
                          <td className="p-3 text-right font-mono">
                            <div>{formatCurrency(itemPrice, 'USD')}</div>
                            {itemDiscount > 0 && (
                              <div className="text-[10px] text-rose-500 font-semibold">
                                -{formatCurrency(itemDiscount, 'USD')}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right font-bold font-mono text-foreground">
                            {formatCurrency(itemTotal, 'USD')}
                          </td>
                        </tr>
                      )
                    })}

                    {itemsList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs font-medium">
                          {t('orders:noItemsFound', 'No items listed in this order')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider pb-1.5 border-b border-border/60">
                {t('orders:financialSummary', 'Order Payment Summary')}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('orders:subtotal', 'Subtotal')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(subtotal, 'USD')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('orders:discount', 'Discount')}
                  </span>
                  <span className="font-extrabold font-mono text-rose-500 text-sm">
                    -{formatCurrency(discountAmount, 'USD')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('orders:tax', 'Tax (VAT)')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(taxAmount, 'USD')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('orders:shipping', 'Shipping')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(shippingCost, 'USD')}
                  </span>
                </div>
              </div>

              {/* Grand Total Dual Currency */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    {t('orders:grandTotal', 'Grand Total')}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('orders:equivalentRiel', language === 'km' ? 'គិតជាប្រាក់រៀលកម្ពុជា' : 'Equivalent in Cambodian Riel')}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-black text-primary tracking-tight">
                    {formatCurrency(grandTotal, 'USD')}
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">
                    {formatCurrency(grandTotalRiel, 'KHR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="space-y-4">
            {/* Progression Steps Timeline Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} className="text-primary" />
                <span>{t('orders:orderTimeline', 'Order Progression & Fulfillment')}</span>
              </h4>
              {!isCancelled ? (
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs pt-2">
                  <div className="space-y-1.5">
                    <div className="h-2 rounded-full bg-emerald-500 shadow-2xs" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
                      {t('orders:stepPlaced', 'Placed')}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPaid ? 'bg-emerald-500 shadow-2xs' : 'bg-muted border border-border/70'
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
                        isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                      }`}
                    >
                      {t('orders:stepPaid', 'Paid')}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isFulfilled ? 'bg-blue-500 shadow-2xs' : 'bg-muted border border-border/70'
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
                        isFulfilled ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                      }`}
                    >
                      {t('orders:stepShipped', 'Shipped')}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isDelivered ? 'bg-emerald-500 shadow-2xs' : 'bg-muted border border-border/70'
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
                        isDelivered ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                      }`}
                    >
                      {t('orders:stepCompleted', 'Done')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 text-xs font-bold">
                  <AlertCircle size={15} />
                  <span>{t('orders:stepCancelled', 'Order has been cancelled / refunded')}</span>
                </div>
              )}
            </div>

            {/* Customer Details Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('orders:customerInfo', 'Customer Information')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('orders:customer', 'Customer Name')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('orders:group', 'Customer Group')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {order?.customer?.group?.name || t('orders:standardMember', 'Standard Member')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('orders:phone', 'Phone Number')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">{customerPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('orders:email', 'Email Address')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{customerEmail}</p>
                </div>
              </div>
            </div>

            {/* Shipping Destination & Courier Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('orders:shippingInfo', 'Shipping Destination & Carrier')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('orders:courier', 'Courier')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{courierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('orders:trackingNumber', 'Tracking Code')}</p>
                  {trackingNumber ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(trackingNumber, 'tracking')}
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/20 cursor-pointer mt-0.5"
                    >
                      <span>{trackingNumber}</span>
                      {copiedTracking ? <Check size={11} className="text-emerald-500" /> : <Copy size={10} />}
                    </button>
                  ) : (
                    <p className="font-semibold text-muted-foreground mt-0.5">—</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-[11px] font-medium">{t('orders:shippingAddress', 'Delivery Address')}</p>
                  <p className="font-semibold text-foreground mt-0.5 leading-relaxed">
                    {fullAddress || t('orders:noAddressProvided', 'No shipping address provided')}
                  </p>
                </div>
              </div>
            </div>

            {/* Special Notes if Present */}
            {order?.notes && (
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('orders:notes', 'Special Notes')}
                </h4>
                <p className="text-xs text-foreground italic leading-relaxed">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </DetailDrawerBody>

      {/* ── 5. DRAWER FOOTER ACTIONS ── */}
      <DetailDrawerFooter
        onClose={onClose}
        leftActions={
          order && onPrintWaybill ? (
            <ActionButton
              variant="outline"
              icon={<Truck size={15} className="text-purple-600 dark:text-purple-400" />}
              label={t('orders:printWaybill', language === 'km' ? 'បោះពុម្ពប័ណ្ណដឹក' : 'Waybill')}
              onClick={() => onPrintWaybill(order)}
            />
          ) : undefined
        }
        rightActions={
          order && onPrintReceipt ? (
            <ActionButton
              variant="primary"
              icon={<Printer size={15} />}
              label={t('orders:printReceipt', language === 'km' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Receipt')}
              onClick={() => onPrintReceipt(order)}
            />
          ) : undefined
        }
      />
    </DetailDrawer>
  )
}

export default OrdersDetailDrawer
