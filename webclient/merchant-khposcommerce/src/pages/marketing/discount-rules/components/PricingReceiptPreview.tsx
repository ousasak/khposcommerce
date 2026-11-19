import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CartItemInput, PricingEngineResult } from '../../promotions/types'

interface PricingReceiptPreviewProps {
  branchName: string
  channel: 'pos' | 'web' | 'mobile'
  cartItems: CartItemInput[]
  pricingResult?: PricingEngineResult | null
  simulatedAt: string
}

export const PricingReceiptPreview: React.FC<PricingReceiptPreviewProps> = ({
  branchName,
  channel,
  cartItems,
  pricingResult,
  simulatedAt,
}) => {
  const { t } = useTranslation(['marketing', 'common'])
  const [previewMode, setPreviewMode] = useState<'thermal' | 'mobile'>('thermal')

  const summary = pricingResult?.summary
  const items = pricingResult?.items || []
  const currency = pricingResult?.currency
  const exchangeRate = currency?.exchange_rate ?? 4100

  const subtotal = summary?.subtotal ?? cartItems.reduce((acc, it) => acc + it.unit_price * it.quantity, 0)
  const totalDiscount = summary?.total_discount ?? 0
  const taxAmount = summary?.tax_amount ?? 0
  const grandTotal = summary?.grand_total ?? subtotal
  const grandTotalKhr = Math.round(grandTotal * exchangeRate)
  const formattedDate = new Date(simulatedAt || Date.now()).toLocaleDateString()

  return (
    <div className="space-y-3">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {t('marketing.receiptFormat', 'Preview Format')}:
        </span>
        <div className="inline-flex h-8 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setPreviewMode('thermal')}
            className={`h-full px-3 rounded-md transition-all flex items-center justify-center cursor-pointer ${
              previewMode === 'thermal'
                ? 'bg-card text-[#0f766e] dark:text-teal-400 font-bold text-xs shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-foreground font-semibold text-xs'
            }`}
          >
            {t('marketing.posReceiptThermal', 'POS Receipt (80mm)')}
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('mobile')}
            className={`h-full px-3 rounded-md transition-all flex items-center justify-center cursor-pointer ${
              previewMode === 'mobile'
                ? 'bg-card text-[#0f766e] dark:text-teal-400 font-bold text-xs shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-foreground font-semibold text-xs'
            }`}
          >
            {t('marketing.mobileCheckoutSummary', 'Mobile Checkout')}
          </button>
        </div>
      </div>

      {previewMode === 'thermal' ? (
        <div className="bg-white text-zinc-900 p-4 rounded-lg border border-zinc-200 font-mono text-[11px] space-y-2.5 shadow-2xs">
          <div className="text-center border-b border-dashed border-zinc-300 pb-2">
            <p className="font-bold text-xs">{t('marketing.storeReceiptTitle', 'NEXTECH POS COMMERCE')}</p>
            <p className="text-[10px] text-zinc-600">{branchName}</p>
            <p className="text-[9px] text-zinc-500">
              {formattedDate} • {t('marketing.channelLabel', 'Channel')}: {channel.toUpperCase()}
            </p>
          </div>

          <div className="space-y-1 border-b border-dashed border-zinc-300 pb-2 max-h-44 overflow-y-auto">
            {(items.length > 0 ? items : cartItems).map((it: any, idx: number) => {
              const name = it.product_name || it.name
              const qty = it.quantity
              const unitPrice = it.unit_price
              const lineTotal = it.total ?? unitPrice * qty
              const lineDisc = it.discount_amount ?? 0

              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="truncate max-w-[140px]">{name}</span>
                    <span>{qty} × ${unitPrice.toFixed(2)}</span>
                    <span className="font-semibold">${lineTotal.toFixed(2)}</span>
                  </div>
                  {lineDisc > 0 && (
                    <div className="flex justify-between text-[10px] text-emerald-700 pl-2">
                      <span>{t('marketing.discountLine', '↳ Discount')}</span>
                      <span>-${lineDisc.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-1 text-xs pt-0.5">
            <div className="flex justify-between">
              <span>{t('marketing.subtotalReceipt', 'Subtotal')}:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>{t('marketing.totalSavings', 'Discount')}:</span>
                <span>-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between">
                <span>{t('marketing.taxVat', 'Tax / VAT')}:</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-dashed border-zinc-300 pt-1 text-sm">
              <span>{t('marketing.totalUsd', 'TOTAL USD')}:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>{t('marketing.totalKhr', 'TOTAL KHR')}:</span>
              <span>៛ {grandTotalKhr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-bold text-foreground">
              {t('marketing.mobileOrderSummary', 'Mobile App Order Summary')}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {t('marketing.mobileCheckoutBadge', 'App Checkout')}
            </span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {(items.length > 0 ? items : cartItems).map((it: any, idx: number) => {
              const name = it.product_name || it.name
              const qty = it.quantity
              const unitPrice = it.unit_price
              const lineTotal = it.total ?? unitPrice * qty
              const lineDisc = it.discount_amount ?? 0

              return (
                <div key={idx} className="pt-1.5 first:pt-0 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-foreground truncate max-w-[160px]">{name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t('marketing.qtyTimes', 'Qty: {{qty}} × ${{price}}', { qty, price: unitPrice.toFixed(2) })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-foreground">${lineTotal.toFixed(2)}</span>
                    {lineDisc > 0 && (
                      <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 block">
                        -${lineDisc.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{t('marketing.subtotalReceipt', 'Subtotal')}</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-teal-600 dark:text-teal-400 text-xs font-semibold">
                <span>{t('marketing.totalSavings', 'Discounts')}</span>
                <span className="font-mono">-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground text-sm pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>{t('marketing.payable', 'Payable')}</span>
              <span className="font-mono text-[#0f766e] dark:text-teal-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingReceiptPreview
