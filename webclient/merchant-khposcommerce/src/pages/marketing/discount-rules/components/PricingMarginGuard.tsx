import React from 'react'
import { ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, DollarSign, Percent } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PricingEngineMargin } from '../../promotions/types'

interface PricingMarginGuardProps {
  margin?: PricingEngineMargin | null
  isLoading?: boolean
}

export const PricingMarginGuard: React.FC<PricingMarginGuardProps> = ({ margin, isLoading }) => {
  const { t } = useTranslation(['marketing', 'common'])

  if (!margin && !isLoading) {
    return null
  }

  const isLoss = margin?.is_loss ?? false
  const marginPct = margin?.gross_margin_percentage ?? 0
  const grossProfit = margin?.gross_profit ?? 0
  const totalCost = margin?.total_cost ?? 0
  const itemsBelowCost = margin?.items_below_cost_count ?? 0

  return (
    <div className={`p-3.5 rounded-2xl border transition-all ${
      isLoss
        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
        : 'bg-card border-border/80 text-foreground'
    }`}>
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          {isLoss ? (
            <ShieldAlert size={14} className="text-rose-600 animate-pulse" />
          ) : (
            <ShieldCheck size={14} className="text-emerald-500" />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {t('marketing.marginGuardTitle', 'Profit Margin Guard')}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isLoss
            ? 'bg-rose-500/20 text-rose-600 border-rose-500/30'
            : marginPct > 15
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        }`}>
          {isLoss ? 'LOSS RISK' : marginPct > 15 ? 'HEALTHY' : 'LOW MARGIN'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2.5 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block">{t('marketing.totalCost', 'Total Cost')}</span>
          <span className="font-mono font-bold text-foreground">
            ${totalCost.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-muted-foreground block">{t('marketing.grossProfit', 'Gross Profit')}</span>
          <span className={`font-mono font-bold ${isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {grossProfit >= 0 ? `+$${grossProfit.toFixed(2)}` : `-$${Math.abs(grossProfit).toFixed(2)}`}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-muted-foreground block">{t('marketing.grossMargin', 'Margin')}</span>
          <span className={`font-mono font-bold ${isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
            {marginPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {isLoss && (
        <div className="mt-2.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span>
            {t(
              'marketing.lossWarning',
              'Negative Margin Warning: Cart total is discounted below total product cost! Adjust promotion rules to prevent loss.'
            )}
          </span>
        </div>
      )}

      {!isLoss && itemsBelowCost > 0 && (
        <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle size={11} />
          <span>{itemsBelowCost} {t('marketing.itemBelowCostWarning', 'item(s) discounted below individual cost price.')}</span>
        </div>
      )}
    </div>
  )
}
