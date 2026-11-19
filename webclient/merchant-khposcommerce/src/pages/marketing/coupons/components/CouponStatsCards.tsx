import React from 'react'
import { useTranslation } from 'react-i18next'
import { Ticket, Percent, Coins, TrendingUp } from 'lucide-react'
import { RibbonStatsCard, RibbonStatsGrid } from '@/components/common'

interface CouponStatsCardsProps {
  analytics?: {
    totalCoupons?: number
    activeCoupons?: number
    expiredCoupons?: number
    disabledCoupons?: number
    totalRedeemed?: number
    redemptionRate?: number
    unusedCoupons?: number
    avgRedemptionPerCoupon?: number
    totalDiscountGiven?: number
    avgDiscountAmount?: number
    highestDiscount?: number
    todayDiscount?: number
    revenueGenerated?: number
    campaignCost?: number
    campaignProfit?: number
    roi?: number
    aov?: number
    todayCoupons?: number
    couponsUsedToday?: number
    newCustomersCoupons?: number
    returningCustomersCoupons?: number
    pendingCoupons?: number
    expiringSoon?: number
  }
}

export const CouponStatsCards: React.FC<CouponStatsCardsProps> = ({ analytics = {} }) => {
  const { t } = useTranslation(['marketing', 'common'])

  const totalCoupons = analytics?.totalCoupons ?? 0
  const activeCoupons = analytics?.activeCoupons ?? 0
  const expiredCoupons = analytics?.expiredCoupons ?? 0
  const expiringSoon = analytics?.expiringSoon ?? 0
  const redemptionRate = analytics?.redemptionRate ?? 0
  const totalRedeemed = analytics?.totalRedeemed ?? 0
  const couponsUsedToday = analytics?.couponsUsedToday ?? 0
  const totalDiscountGiven = Number(analytics?.totalDiscountGiven ?? 0)
  const revenueGenerated = Number(analytics?.revenueGenerated ?? 0)
  const campaignProfit = Number(analytics?.campaignProfit ?? 0)
  const roi = Number(analytics?.roi ?? 0)

  return (
    <div className="print:hidden select-none">
      <RibbonStatsGrid columns={4}>
        {/* Card 1: Total Coupons */}
        <RibbonStatsCard
          title={t('marketing.totalCoupons', 'ប័ណ្ណបញ្ចុះតម្លៃ')}
          value={totalCoupons}
          useCounter={true}
          icon={Ticket}
          variant="blue"
          delay={0.05}
          subtitle={
            <span className="flex items-center gap-1.5 justify-end">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {activeCoupons} {t('marketing.active', 'សកម្ម')}
              </span>
              <span>•</span>
              <span className="text-rose-500 font-semibold">
                {expiredCoupons} {t('marketing.statusExpired', 'ផុតកំណត់')}
              </span>
            </span>
          }
        />

        {/* Card 2: Redemption Rate */}
        <RibbonStatsCard
          title={t('marketing.redemptionRate', 'អត្រាប្រើប្រាស់')}
          value={redemptionRate}
          suffix="%"
          decimals={1}
          useCounter={true}
          icon={Percent}
          variant="purple"
          delay={0.1}
          subtitle={
            <span>
              {t('marketing.totalRedeemed', 'បានប្រើប្រាស់')}: {totalRedeemed.toLocaleString()}
            </span>
          }
        />

        {/* Card 3: Revenue Generated */}
        <RibbonStatsCard
          title={t('marketing.revenueGenerated', 'ចំណូលបានមកវិញ')}
          value={revenueGenerated}
          prefix="$"
          decimals={2}
          useCounter={true}
          icon={TrendingUp}
          variant="emerald"
          delay={0.15}
          trend={{
            value: `+${roi}% ROI`,
            isPositive: true,
          }}
          subtitle={
            <span className="font-mono">
              ${campaignProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          }
        />

        {/* Card 4: Customer Savings */}
        <RibbonStatsCard
          title={t('marketing.customerSavings', 'ការសន្សំរបស់អតិថិជន')}
          value={totalDiscountGiven}
          prefix="$"
          decimals={2}
          useCounter={true}
          icon={Coins}
          variant="amber"
          delay={0.2}
          subtitle={
            <span className="flex items-center gap-1.5 justify-end">
              <span className="text-blue-600 font-bold">
                {couponsUsedToday} {t('marketing.usedToday', 'ប្រើថ្ងៃនេះ')}
              </span>
              <span>•</span>
              <span className={expiringSoon > 0 ? 'text-amber-500 font-bold' : ''}>
                {expiringSoon} {t('marketing.expiringSoon', 'ជិតផុតកំណត់')}
              </span>
            </span>
          }
        />
      </RibbonStatsGrid>
    </div>
  )
}

export default CouponStatsCards
