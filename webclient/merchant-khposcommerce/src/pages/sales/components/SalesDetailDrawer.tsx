import React, { useState } from 'react'
import {
  User,
  ShieldCheck,
  CornerUpLeft,
  DollarSign,
  CreditCard,
  FileText,
  Printer,
  Boxes,
  Store,
  Calendar,
  Clock,
  Copy,
  Check,
  Phone,
  Mail,
  QrCode,
  Building,
  AlertCircle,
  Receipt,
  Layers,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { useToast } from '@/hooks/useToast'
import {
  StatusBadge,
  AvatarImage,
  ProductThumbnail,
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

export interface SaleItem {
  id: number
  product_id: number
  product_name?: string
  name?: string
  sku?: string
  quantity: number
  qty?: number
  unit_price: number
  price?: number
  discount_amount?: number
  tax_amount?: number
  subtotal?: number
  total?: number
  image?: string
  product_image?: string
  product?: {
    name?: string
    image?: string
    primary_image?: string
    category?: { name?: string }
  }
}

export interface Sale {
  id: number
  invoice_number: string
  reference_no?: string
  customer?: {
    id?: number
    name?: string
    phone?: string
    email?: string
    photo?: string
    avatar?: string
    group?: { name?: string; discount_percent?: number }
  }
  cashier?: {
    id?: number
    name?: string
    avatar?: string
    photo?: string
  }
  company?: { name?: string }
  branch?: { name?: string }
  store?: { name?: string }
  warehouse?: { name?: string }
  date?: string
  created_at: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' | string
  payment_status?: string
  payment_method?: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  grand_total: number
  total_amount?: number
  paid_amount?: number
  change_amount?: number
  currency_code?: string
  notes?: string
  items?: SaleItem[]
  sale_items?: SaleItem[]
  details?: SaleItem[]
  [key: string]: any
}

interface SalesDetailDrawerProps {
  sale: Sale | undefined
  isLoading: boolean
  isOpen?: boolean
  onClose: () => void
  onRefund: () => void
  onPrintReceipt?: (sale: Sale) => void
  isRefunding: boolean
  canRefund?: boolean
}

type SaleTabKey = 'items' | 'details'

export const SalesDetailDrawer: React.FC<SalesDetailDrawerProps> = ({
  sale,
  isLoading,
  isOpen = true,
  onClose,
  onRefund,
  onPrintReceipt,
  isRefunding,
  canRefund = true,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['sales', 'common'])
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<SaleTabKey>('items')
  const [copiedInvoice, setCopiedInvoice] = useState(false)

  // Robust items fallback for different API response keys
  const itemsList: SaleItem[] =
    sale?.items ||
    sale?.sale_items ||
    sale?.details ||
    (sale as any)?.saleDetails ||
    []

  // Handle invoice copy
  const handleCopyInvoice = () => {
    if (!sale?.invoice_number) return
    navigator.clipboard.writeText(sale.invoice_number)
    setCopiedInvoice(true)
    setTimeout(() => setCopiedInvoice(false), 2000)
    toast.success(t('copied', language === 'km' ? 'បានចម្លងជោគជ័យ' : 'Copied to clipboard'))
  }

  // Format quantity
  const formatQuantity = (qty: any) => {
    const num = Number(qty || 1)
    return Number.isInteger(num) ? String(num) : num.toFixed(2)
  }

  // Payment method resolver
  const rawMethod = (sale?.payment_method || 'cash').toLowerCase()
  let methodLabel = sale?.payment_method || 'Cash'
  let methodIcon = <DollarSign size={13} className="text-emerald-500 shrink-0" />

  if (
    rawMethod.includes('aba') ||
    rawMethod.includes('khqr') ||
    rawMethod.includes('bakong') ||
    rawMethod.includes('qr')
  ) {
    methodIcon = <QrCode size={13} className="text-blue-500 shrink-0" />
    methodLabel = 'Bakong KHQR'
  } else if (rawMethod.includes('wing')) {
    methodIcon = <Building size={13} className="text-emerald-500 shrink-0" />
    methodLabel = 'Wing Bank'
  } else if (rawMethod.includes('acleda')) {
    methodIcon = <Building size={13} className="text-blue-600 shrink-0" />
    methodLabel = 'ACLEDA Mobile'
  } else if (
    rawMethod.includes('card') ||
    rawMethod.includes('credit') ||
    rawMethod.includes('visa') ||
    rawMethod.includes('master')
  ) {
    methodIcon = <CreditCard size={13} className="text-purple-500 shrink-0" />
    methodLabel = language === 'km' ? 'កាតធនាគារ (Card)' : 'Credit Card'
  } else if (rawMethod.includes('cash')) {
    methodIcon = <DollarSign size={13} className="text-emerald-500 shrink-0" />
    methodLabel = language === 'km' ? 'សាច់ប្រាក់សុទ្ធ (Cash)' : 'Cash'
  }

  // Financial amounts
  const subtotal = Number(sale?.subtotal || 0)
  const discountAmount = Number(sale?.discount_amount || 0)
  const taxAmount = Number(sale?.tax_amount || 0)
  const grandTotal = Number(sale?.grand_total ?? sale?.total_amount ?? (subtotal - discountAmount + taxAmount))
  const grandTotalRiel = Math.round(grandTotal * KHR_RATE)
  const paidAmount = Number(sale?.paid_amount ?? grandTotal)
  const changeAmount = Number(sale?.change_amount ?? 0)

  const isRefunded = sale?.status === 'refunded'
  const isCancelled = sale?.status === 'cancelled'

  const customerName =
    sale?.customer?.name ||
    t('walkInCustomer', language === 'km' ? 'អតិថិជនដើរចូល' : 'Walk-in Customer')
  const customerPhoto = sale?.customer?.photo || sale?.customer?.avatar

  const cashierName = sale?.cashier?.name
    ? sale.cashier.name.replace(/\s*\(system\)/i, '')
    : t('superAdmin', 'Super Admin')

  const drawerTabs: DetailDrawerTabItem[] = [
    {
      key: 'items',
      label: t('purchasedItems', language === 'km' ? 'ទំនិញ & ការគិតប្រាក់' : 'Purchased Items & Totals'),
      icon: Boxes,
      badge: itemsList.length > 0 ? itemsList.length : undefined,
    },
    {
      key: 'details',
      label: t('saleOrderAudit', language === 'km' ? 'អតិថិជន & ប្រភពទូទាត់' : 'Customer & Payment Audit'),
      icon: Receipt,
    },
  ]

  return (
    <DetailDrawer
      isOpen={isOpen && !!sale}
      onClose={onClose}
      size="2xl"
    >
      {/* ── 1. DRAWER TOP HEADER ── */}
      <DetailDrawerHeader
        title={t('saleOrderDetail', language === 'km' ? 'ព័ត៌មានលម្អិតការលក់' : 'Sale Order Details')}
        subtitle={
          sale?.created_at || sale?.date
            ? new Date(sale.created_at || sale.date!).toLocaleString(
                language === 'km' ? 'km-KH' : 'en-US',
                {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }
              )
            : '—'
        }
        badge={
          sale?.invoice_number ? (
            <button
              type="button"
              onClick={handleCopyInvoice}
              className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md border border-primary/20 transition-colors cursor-pointer"
              title={t('common:copy', 'Copy')}
            >
              <span>#{sale.invoice_number}</span>
              {copiedInvoice ? <Check size={12} className="text-emerald-500" /> : <Copy size={11} />}
            </button>
          ) : undefined
        }
        onClose={onClose}
      />

      {/* ── 2. HERO OVERVIEW CARD (MATCHING EMPLOYEE PROFILE BANNER) ── */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0 shadow-xs">
            <FileText size={26} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                #{sale?.invoice_number || 'POS Sale'}
              </h2>
              {sale?.status && <StatusBadge status={sale.status} />}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t('paidInFull', language === 'km' ? 'ទូទាត់រួចរាល់' : 'Paid in Full')}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Store size={12} className="text-primary shrink-0" />
                <span>{sale?.store?.name || sale?.branch?.name || sale?.company?.name || 'Main POS Store'}</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-foreground/80">{cashierName}</span>
              <span>•</span>
              <span className="font-mono">{t('posTerminal', 'POS Terminal')} #1</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {itemsList.length} {t('purchasedItems', language === 'km' ? 'មុខទំនិញ' : 'Items')} ({itemsList.reduce((acc, it) => acc + Number(it.quantity || it.qty || 1), 0)} pcs)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border inline-flex items-center gap-1">
                {methodIcon}
                <span>{methodLabel}</span>
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
        onChange={(key) => setActiveTab(key as SaleTabKey)}
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
                    {t('purchasedItems', language === 'km' ? 'ទំនិញដែលបានទិញ' : 'Purchased Items')} ({itemsList.length})
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                  {itemsList.reduce((acc, it) => acc + Number(it.quantity || it.qty || 1), 0)} pcs
                </span>
              </div>

              <div className="border border-border/70 rounded-xl overflow-hidden text-xs bg-card">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">{t('item', language === 'km' ? 'មុខទំនិញ' : 'Item')}</th>
                      <th className="p-3 text-center w-16">{t('qty', language === 'km' ? 'ចំនួន' : 'Qty')}</th>
                      <th className="p-3 text-right">{t('price', language === 'km' ? 'តម្លៃ' : 'Price')}</th>
                      <th className="p-3 text-right">{t('total', language === 'km' ? 'សរុប' : 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {itemsList.map((item, idx) => {
                      const itemName =
                        item.product_name ||
                        item.name ||
                        item.product?.name ||
                        (language === 'km' ? 'មុខទំនិញ' : 'Product Item')
                      const itemPhoto =
                        item.image ||
                        item.product_image ||
                        item.product?.primary_image ||
                        item.product?.image
                      const itemQty = formatQuantity(item.quantity || item.qty)
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
                          {t('noSalesOrdersFound', language === 'km' ? 'គ្មានទំនិញក្នុងវិក្កយបត្រនេះទេ' : 'No items listed in this receipt')}
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
                {t('financialSummary', language === 'km' ? 'សង្ខេបការទូទាត់ប្រាក់' : 'Payment Summary')}
              </h4>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('subtotal', language === 'km' ? 'សរុបរង' : 'Subtotal')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(subtotal, 'USD')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('discount', language === 'km' ? 'បញ្ចុះតម្លៃ' : 'Discount')}
                  </span>
                  <span className="font-extrabold font-mono text-rose-500 text-sm">
                    -{formatCurrency(discountAmount, 'USD')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                    {t('tax', language === 'km' ? 'ពន្ធ (VAT)' : 'Tax (VAT)')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm">
                    {formatCurrency(taxAmount, 'USD')}
                  </span>
                </div>
              </div>

              {/* Grand Total Dual Currency */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    {t('grandTotal', language === 'km' ? 'សរុបចុងក្រោយ' : 'Grand Total')}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('equivalentRiel', language === 'km' ? 'គិតជាប្រាក់រៀលកម្ពុជា' : 'Equivalent in Cambodian Riel')}
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

        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Customer Information Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('customerInfo', language === 'km' ? 'ព័ត៌មានអតិថិជន' : 'Customer Information')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('customer', 'Customer Name')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('group', 'Customer Group')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {sale?.customer?.group?.name || t('standardGroup', 'Standard Member')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('phone', 'Phone Number')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">
                    {sale?.customer?.phone ? GlobalFormat.phone(sale.customer.phone) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('email', 'Email Address')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {sale?.customer?.email ? GlobalFormat.email(sale.customer.email) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Store & Cashier Details */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('posLocationTerminal', language === 'km' ? 'សាខា និង បុគ្គលិកគិតលុយ' : 'Store Branch & Cashier Terminal')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('branch', 'Store Branch')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {sale?.store?.name || sale?.branch?.name || sale?.company?.name || 'Main POS Store'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('cashier', 'Cashier Name')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{cashierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('posTerminal', 'Terminal ID')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">POS-REGISTER-01</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('orderDate', 'Order Date & Time')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">
                    {sale?.created_at ? GlobalFormat.displayDate(sale.created_at, { includeTime: true }) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Audit Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('paymentMethod', language === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method & Breakdown')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('paymentMethod', 'Method')}</p>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground mt-0.5">
                    {methodIcon}
                    <span>{methodLabel}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('paidAmount', 'Paid Amount')}</p>
                  <p className="font-semibold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(paidAmount, 'USD')}
                  </p>
                </div>
                {changeAmount > 0 && (
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('changeDue', 'Change Due')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">
                      {formatCurrency(changeAmount, 'USD')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('paymentStatus', 'Payment Status')}</p>
                  <p className="font-semibold text-foreground mt-0.5 capitalize">
                    {sale?.payment_status || 'Paid'}
                  </p>
                </div>
              </div>
            </div>

            {/* Special Notes if Present */}
            {sale?.notes && (
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('note', 'Order Notes')}
                </h4>
                <p className="text-xs text-foreground italic leading-relaxed">
                  {sale.notes}
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
          sale && onPrintReceipt ? (
            <ActionButton
              variant="outline"
              icon={<Printer size={15} />}
              label={t('printReceipt', language === 'km' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt')}
              onClick={() => onPrintReceipt(sale)}
            />
          ) : undefined
        }
        rightActions={
          canRefund && !isRefunded && !isCancelled ? (
            <ActionButton
              variant="danger"
              icon={<CornerUpLeft className="w-4 h-4" />}
              loading={isRefunding}
              disabled={isRefunding}
              label={t('processReturnRefund', language === 'km' ? 'សងប្រាក់វិញ' : 'Return & Refund')}
              onClick={onRefund}
            />
          ) : undefined
        }
      />
    </DetailDrawer>
  )
}

export default SalesDetailDrawer
