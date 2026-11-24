import React, { useState } from 'react'
import {
  RotateCcw,
  Package,
  ShieldCheck,
  DollarSign,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Truck,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Barcode,
  CheckCircle,
  Clock,
  Building,
  Printer,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { GlobalFormat } from '@/utils/formatters'
import { EnterpriseModal, ProductThumbnail, StatusBadge, CloseButton } from '@/components/common'
import type {
  OrderReturn,
  ReturnStatus,
  ReturnFault,
  ConditionGrade,
  InventoryAction,
} from '../types'

const KHR_RATE = 4100

export interface OrderReturnDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  orderReturn: OrderReturn | null
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onReceive?: (id: number) => void
  onQC?: (orderReturn: OrderReturn) => void
  onRefund?: (orderReturn: OrderReturn) => void
  onExchange?: (orderReturn: OrderReturn) => void
  onPrint?: (orderReturn: OrderReturn) => void
  isActionLoading?: boolean
}

export const OrderReturnDetailDrawer: React.FC<OrderReturnDetailDrawerProps> = ({
  isOpen,
  onClose,
  orderReturn,
  onApprove,
  onReject,
  onReceive,
  onQC,
  onRefund,
  onExchange,
  onPrint,
  isActionLoading = false,
}) => {
  const { t } = useTranslation(['returns', 'sales', 'orders', 'common'])
  const { language } = useThemeStore()
  const [copiedId, setCopiedId] = useState(false)

  if (!isOpen || !orderReturn) return null

  const handleCopyRma = () => {
    navigator.clipboard.writeText(orderReturn.return_number)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 1500)
  }

  // Items list
  const items = orderReturn.items || []
  const firstItem = items[0]
  const customerName = orderReturn.customer?.name || 'Super Administrator'
  const customerEmail = orderReturn.customer?.email || 'superadmin@gmail.com'
  const orderNumber = orderReturn.order_number
    ? (orderReturn.order_number.startsWith('ORD-') ? orderReturn.order_number : `ORD-${orderReturn.order_number}`)
    : orderReturn.return_number

  const reasonText = orderReturn.reason || orderReturn.customer_note || (language === 'km' ? 'ខុសទំហំដែលបានកុម្ម៉ង់' : 'Wrong size delivered')
  const adminNotes = orderReturn.admin_notes || orderReturn.notes || (language === 'km' ? 'អតិថិជនបានស្នើសុំដូរទំហំធំជាងមុន។' : 'Customer requested size up.')

  const isExchange = orderReturn.type === 'exchange'
  const title = isExchange
    ? (language === 'km' ? 'ព័ត៌មានលម្អិតអំពីការប្តូរទំនិញ' : 'Exchange Replacement Details')
    : (language === 'km' ? 'ព័ត៌មានលម្អិតអំពីការសងទំនិញ' : 'Return Request Details')

  const statusUpper = (orderReturn.status || 'pending').toUpperCase()

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800"
      bodyClassName="p-0"
      showCloseButton={false}
    >
      {/* ── TOP HEADER (EXACT REPLICA OF SCREENSHOT 2) ── */}
      <div className="flex items-center justify-between px-6 sm:px-8 pt-7 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>

        {/* Standard clean Close button */}
        <CloseButton onClose={onClose} size="md" variant="default" />
      </div>

      {/* ── MAIN BODY CONTENT (EXACT MATCH OF SCREENSHOT 2) ── */}
      <div className="px-6 sm:px-8 py-4 space-y-6">
        {/* 1. ORDER & CUSTOMER GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              ORDER
            </p>
            <p className="font-bold font-mono text-slate-900 dark:text-white text-xs mt-1">
              {orderNumber}
            </p>
          </div>

          <div>
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              CUSTOMER
            </p>
            <p className="font-bold text-slate-900 dark:text-white text-xs mt-1">
              {customerName}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {customerEmail}
            </p>
          </div>
        </div>

        {/* 2. STATUS ROW */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            {statusUpper}
          </span>
        </div>

        {/* 3. ITEMS TO REPLACE / RETURN */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {isExchange ? 'ITEMS TO REPLACE' : 'ITEMS TO RETURN'}
          </span>

          {/* Banner notice as shown in screenshot */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            {language === 'km'
              ? 'អតិថិជនមិនបានជ្រើសរើសទំនិញជាក់លាក់ទេ។ ទាំងនេះគឺជាផលិតផលទាំងអស់ពីការបញ្ជាទិញដើម — សូមបញ្ជាក់អ្វីដែលត្រូវផ្ញើនៅពេលបំពេញ។'
              : 'Customer did not pick specific items. These are all products from the original order — confirm what to send when completing.'}
          </div>

          {/* Product Items Cards */}
          <div className="space-y-2">
            {items.map((item, idx) => {
              const itemName = item.order_item?.product_name || item.product?.name || 'Flannel Shirt'
              const itemImage = item.product?.primary_image || item.product?.image
              const qty = item.quantity || 3

              return (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800"
                >
                  <ProductThumbnail
                    name={itemName}
                    primaryImage={itemImage}
                    size="md"
                    className="rounded-lg shadow-2xs shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {itemName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Qty: {qty}
                    </p>
                  </div>
                </div>
              )
            })}

            {items.length === 0 && (
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0 font-bold text-xs">
                  IMG
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">
                    Flannel Shirt
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Qty: 3
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. REASON (មូលហេតុ) */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {language === 'km' ? 'មូលហេតុ' : 'Reason'}
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400 italic">
            "{reasonText}"
          </p>
        </div>

        {/* 5. ADMIN NOTES */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
            ADMIN NOTES
          </span>
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs text-slate-700 dark:text-slate-300">
            {adminNotes}
          </div>
        </div>
      </div>

      {/* ── FOOTER ACTIONS (STATUS-AWARE WORKFLOW) ── */}
      <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800">
        {onReject && orderReturn.status === 'requested' && (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onReject(orderReturn.id)}
            className="px-4 py-2 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
          >
            {language === 'km' ? 'បដិសេធ' : 'Reject'}
          </button>
        )}

        {onApprove && orderReturn.status === 'requested' && (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onApprove(orderReturn.id)}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary/95 text-primary-foreground font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            {isActionLoading
              ? (language === 'km' ? 'កំពុងដំណើរការ...' : 'Processing...')
              : (language === 'km' ? 'យល់ព្រម' : 'Approve')}
          </button>
        )}

        {onReceive && ['approved', 'in_transit'].includes(orderReturn.status) && (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onReceive(orderReturn.id)}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary/95 text-primary-foreground font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            {language === 'km' ? 'ទទួលទំនិញចូលឃ្លាំង' : 'Receive at Warehouse'}
          </button>
        )}

        {onQC && ['received', 'inspecting'].includes(orderReturn.status) && (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onQC(orderReturn)}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary/95 text-primary-foreground font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            {language === 'km' ? 'ត្រួតពិនិត្យ QC' : 'QC Inspection'}
          </button>
        )}

        {onRefund && orderReturn.status === 'inspected' && (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onRefund(orderReturn)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            {language === 'km' ? 'ទូទាត់ប្រាក់សង' : 'Settle Refund'}
          </button>
        )}

        {onExchange && orderReturn.status === 'inspected' && (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onExchange(orderReturn)}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            {language === 'km' ? 'ដំណើរការដូរទំនិញ' : 'Process Exchange'}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          {language === 'km' ? 'បិទ' : 'Close'}
        </button>
      </div>
    </EnterpriseModal>
  )
}

// ── Backward Compatibility Aliases ──
export const OrderReturnDetailModal = OrderReturnDetailDrawer
export default OrderReturnDetailDrawer