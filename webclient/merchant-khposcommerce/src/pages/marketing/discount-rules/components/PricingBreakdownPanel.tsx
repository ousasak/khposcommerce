import React from 'react'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PricingEngineResult } from '../../promotions/types'

interface PricingBreakdownPanelProps {
  pricingResult?: PricingEngineResult | null
  isLoading?: boolean
  errorMsg?: string | null
}

export const PricingBreakdownPanel: React.FC<PricingBreakdownPanelProps> = ({
  pricingResult,
  isLoading,
  errorMsg,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const summary = pricingResult?.summary
  const currency = pricingResult?.currency
  const margin = pricingResult?.margin
  const exchangeRate = currency?.exchange_rate ?? 4100

  const subtotal = summary?.subtotal ?? 0
  const itemsDiscount = summary?.items_discount ?? 0
  const cartDiscount = summary?.cart_discount ?? 0
  const couponDiscount = summary?.coupon_discount ?? 0
  const totalDiscount = summary?.total_discount ?? 0
  const taxAmount = summary?.tax_amount ?? 0
  const grandTotal = summary?.grand_total ?? 0

  const grandTotalKhr = Math.round(grandTotal * exchangeRate)
  const subtotalKhr = Math.round(subtotal * exchangeRate)

  const isLoss = margin?.is_loss ?? false
  const marginPct = margin?.gross_margin_percentage ?? 0
  const grossProfit = margin?.gross_profit ?? 0

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-3.5 sm:p-4 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('marketing.pricingResults', 'Summary & Totals')}
          </h3>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-teal-600 dark:text-teal-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>{t('marketing.simulating', 'Calculating...')}</span>
            </span>
          )}
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          1 USD = {exchangeRate.toLocaleString()} KHR
        </span>
      </div>

      {errorMsg ? (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
          <AlertCircle size={13} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          {/* Base Subtotal */}
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{t('marketing.subtotal', 'Original Subtotal')}:</span>
            <div className="text-right">
              <span className="font-mono font-semibold text-foreground">${subtotal.toFixed(2)}</span>
              <span className="text-[10px] font-mono text-muted-foreground block">
                ៛ {subtotalKhr.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Line Item Discounts */}
          {itemsDiscount > 0 && (
            <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
              <span>{t('marketing.lineItemDiscount', 'Line Item Discounts')}:</span>
              <span className="font-mono font-semibold">-${itemsDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Cart Discount */}
          {cartDiscount > 0 && (
            <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
              <span>{t('marketing.cartDiscount', 'Cart Subtotal Discount')}:</span>
              <span className="font-mono font-semibold">-${cartDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Coupon Discount */}
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
              <span>{t('marketing.couponDiscount', 'Voucher Promo Discount')}:</span>
              <span className="font-mono font-semibold">-${couponDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Tax */}
          {taxAmount > 0 && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t('marketing.taxVat', 'Tax / VAT')}:</span>
              <span className="font-mono font-semibold text-foreground">${taxAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Total Savings */}
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-teal-600 dark:text-teal-400 font-semibold">
              <span>{t('marketing.totalSavings', 'Total Savings')}:</span>
              <span className="font-mono">-${totalDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total Row */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-800 text-foreground font-bold">
            <span className="text-sm">{t('marketing.finalPayable', 'Final Payable')}:</span>
            <div className="text-right">
              <span className="font-mono text-[#0f766e] dark:text-teal-400 text-base block font-extrabold">
                ${grandTotal.toFixed(2)}
              </span>
              <span className="font-mono text-xs text-muted-foreground block">
                ៛ {grandTotalKhr.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Profit Margin Guard Row */}
          {margin && (
            <div
              className={`mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between ${
                isLoss ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>{t('marketing.estGrossProfit', 'Est. Gross Profit')}:</span>
              <span className="font-mono font-semibold">
                {grossProfit >= 0 ? `+$${grossProfit.toFixed(2)}` : `-$${Math.abs(grossProfit).toFixed(2)}`} (
                {marginPct.toFixed(1)}%)
              </span>
            </div>
          )}

          {isLoss && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
              <AlertCircle size={13} className="shrink-0" />
              <span>{t('marketing.lossWarning', 'Warning: Final price is below cost price!')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PricingBreakdownPanel
