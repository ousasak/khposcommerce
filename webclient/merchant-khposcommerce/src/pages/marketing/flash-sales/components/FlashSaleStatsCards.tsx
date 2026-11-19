import React from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'
import { RibbonStatsCard, RibbonStatsGrid } from '@/components/common'
import type { FlashSaleAnalytics } from '../types'

interface FlashSaleStatsCardsProps {
  analytics: FlashSaleAnalytics
}

/**
 * FlashSaleStatsCards Component
 * Uses the global RibbonStatsCard & RibbonStatsGrid design standard from @/components/common,
 * matching CouponStatsCards, UsageHistoryStatsCards, and modern enterprise modules.
 */
export const FlashSaleStatsCards: React.FC<FlashSaleStatsCardsProps> = ({ analytics }) => {
  const { t } = useTranslation(['marketing', 'common'])

  return (
    <div className="print:hidden select-none">
      <RibbonStatsGrid columns={4}>
        {/* Card 1: Flash Sale Campaigns */}
        <RibbonStatsCard
          title={t('marketing.totalFlashSales', 'Flash Sale Campaigns')}
          value={analytics.totalSales}
          useCounter={true}
          icon={Zap}
          variant="blue"
          delay={0.05}
          subtitle={
            <span className="flex items-center gap-1.5 justify-end">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {analytics.activeSales} {t('marketing.activeNow', 'active now')}
              </span>
              <span>•</span>
              <span className="text-rose-500 font-semibold">
                {analytics.expiredSales} {t('marketing.statusExpired', 'expired')}
              </span>
            </span>
          }
        />

        {/* Card 2: Orders & Units Sold */}
        <RibbonStatsCard
          title={t('marketing.flashOrders', 'Flash Orders')}
          value={analytics.totalOrders}
          useCounter={true}
          icon={ShoppingBag}
          variant="purple"
          delay={0.1}
          trend={{
            value: `${analytics.conversionRate}% Conv.`,
            isPositive: analytics.conversionRate >= 10,
          }}
          subtitle={
            <span>
              {analytics.totalProductsSold.toLocaleString()} {t('marketing.unitsSold', 'units sold')}
            </span>
          }
        />

        {/* Card 3: Flash Sale Revenue */}
        <RibbonStatsCard
          title={t('marketing.flashRevenue', 'Flash Sale Revenue')}
          value={analytics.totalRevenue}
          prefix="$"
          decimals={2}
          useCounter={true}
          icon={DollarSign}
          variant="emerald"
          delay={0.15}
          trend={{
            value: `+$${analytics.profitGenerated.toFixed(0)}`,
            isPositive: true,
          }}
          subtitle={
            <span>
              {t('marketing.discountsGiven', 'Discounts:')} ${analytics.totalDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          }
        />

        {/* Card 4: Average Order Value & Velocity */}
        <RibbonStatsCard
          title={t('marketing.flashPerformance', 'Flash Performance (AOV)')}
          value={analytics.aov}
          prefix="$"
          decimals={2}
          useCounter={true}
          icon={TrendingUp}
          variant="amber"
          delay={0.2}
          subtitle={
            <span className="flex items-center gap-1.5 justify-end">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ${analytics.revenueTodayVal.toFixed(2)} {t('marketing.todayLabel', 'today')}
              </span>
              <span>•</span>
              <span className={analytics.endingSoonCount > 0 ? 'text-amber-500 font-bold' : ''}>
                {analytics.endingSoonCount} {t('marketing.endingSoon', 'ending soon')}
              </span>
            </span>
          }
        />
      </RibbonStatsGrid>
    </div>
  )
}

export default FlashSaleStatsCards
