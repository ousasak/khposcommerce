import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { History, CheckCircle2, Ticket, TrendingUp } from 'lucide-react'
import { RibbonStatsCard, RibbonStatsGrid } from '@/components/common'

export interface UsageHistoryStatsCardsProps {
  campaigns?: any[]
  usages?: any[]
  isLoading?: boolean
}

/**
 * UsageHistoryStatsCards Component
 * Uses the global RibbonStatsCard & RibbonStatsGrid design standard from @/components/common,
 * matching CouponStatsCards and OrderReturnsPage.
 */
export const UsageHistoryStatsCards: React.FC<UsageHistoryStatsCardsProps> = ({
  campaigns = [],
  usages = [],
  isLoading = false,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const stats = useMemo(() => {
    let totalRedemptions = 0
    let totalCap = 0
    let activeCampaigns = 0

    campaigns.forEach((c: any) => {
      if (c.is_active) activeCampaigns++
      const redemptions = Number(c.usage_count || c.usages_count || 0)
      totalRedemptions += redemptions
      if (c.usage_limit) totalCap += Number(c.usage_limit)
    })

    // If usages array is provided and totalRedemptions is 0, use usages length
    if (totalRedemptions === 0 && usages.length > 0) {
      totalRedemptions = usages.length
    }

    const avgRedemptions = campaigns.length > 0 ? Math.round(totalRedemptions / campaigns.length) : 0

    return {
      totalRedemptions,
      totalCap,
      activeCampaigns,
      avgRedemptions,
    }
  }, [campaigns, usages])

  const timesSuffix = ` ${t('marketing.timesUnit', t('timesUnit', 'times'))}`
  const campaignsSuffix = ` ${t('marketing.campaignsUnit', t('campaignsUnit', 'campaigns'))}`
  const quotaSuffix = ` ${t('marketing.quotaUnit', t('quotaUnit', 'quota'))}`
  const unlimitedText = t('marketing.unlimitedQuota', t('unlimitedQuota', 'Unlimited'))

  return (
    <div className="print:hidden select-none">
      <RibbonStatsGrid columns={4}>
        {/* Card 1: Total Redemptions */}
        <RibbonStatsCard
          title={t('marketing.statsTotalRedemptions', t('statsTotalRedemptions', 'Total Redemptions'))}
          value={stats.totalRedemptions}
          suffix={timesSuffix}
          useCounter={true}
          icon={History}
          variant="blue"
          delay={0.05}
          subtitle={
            <span className="text-[11px] text-muted-foreground font-medium">
              {t('marketing.allChannels', 'All Channels')}
            </span>
          }
        />

        {/* Card 2: Active Campaigns */}
        <RibbonStatsCard
          title={t('marketing.statsActiveCampaigns', t('statsActiveCampaigns', 'Active Campaigns'))}
          value={stats.activeCampaigns}
          suffix={campaignsSuffix}
          useCounter={true}
          icon={CheckCircle2}
          variant="emerald"
          delay={0.1}
          subtitle={
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {campaigns.length} {t('marketing.allCampaigns', 'Campaigns')}
            </span>
          }
        />

        {/* Card 3: Average per Campaign */}
        <RibbonStatsCard
          title={t('marketing.statsAvgRedemption', t('statsAvgRedemption', 'Avg per Campaign'))}
          value={stats.avgRedemptions}
          suffix={timesSuffix}
          useCounter={true}
          icon={TrendingUp}
          variant="purple"
          delay={0.15}
          subtitle={
            <span className="text-[11px] text-muted-foreground font-medium">
              {t('marketing.colDiscountSaved', 'Discount Saved')}
            </span>
          }
        />

        {/* Card 4: Total Allocated Limit */}
        <RibbonStatsCard
          title={t('marketing.statsAllocatedLimit', t('statsAllocatedLimit', 'Total Allocated Limit'))}
          value={stats.totalCap > 0 ? stats.totalCap : unlimitedText}
          suffix={stats.totalCap > 0 ? quotaSuffix : ''}
          useCounter={typeof stats.totalCap === 'number' && stats.totalCap > 0}
          icon={Ticket}
          variant="amber"
          delay={0.2}
          subtitle={
            <span className="text-[11px] text-muted-foreground font-medium">
              {stats.totalCap > 0 ? `${stats.totalCap - stats.totalRedemptions} quota left` : unlimitedText}
            </span>
          }
        />
      </RibbonStatsGrid>
    </div>
  )
}

export default UsageHistoryStatsCards
