import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Layers,
  Eye,
  MousePointerClick,
  TrendingUp,
} from 'lucide-react'
import { FlattenStatCard, FlattenStatsGrid } from '@/components/common'
import type { BannerAnalytics } from '../types'

interface BannerStatsCardsProps {
  analytics: BannerAnalytics
  currentPositionFilter?: string
  onSelectPosition?: (pos: string) => void
}

/**
 * BannerStatsCards Component
 * Uses the global FlattenStatCard & FlattenStatsGrid design standard from @/components/common,
 * matching the signature Employee & Dashboard design standard (solid icon boxes, clean typography,
 * omnichannel placement breakdowns, and responsive grid).
 */
export const BannerStatsCards: React.FC<BannerStatsCardsProps> = ({
  analytics,
  currentPositionFilter = 'all',
  onSelectPosition,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  return (
    <div className="print:hidden select-none">
      <FlattenStatsGrid columns={4}>
        {/* Card 1: Total Banners & Omnichannel Breakdown */}
        <FlattenStatCard
          title={t('marketing.totalBanners', 'ផ្ទាំងបដាសរុប')}
          value={analytics.totalBanners}
          useCounter={true}
          color="teal"
          icon={Layers}
          isActive={currentPositionFilter === 'all'}
          onClick={() => onSelectPosition?.('all')}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {analytics.activeBanners} {t('marketing.active', 'សកម្ម')}
              </span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Web: {analytics.heroBannersCount}
              </span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                POS: {analytics.posCfdBannersCount}
              </span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                App: {analytics.appBannersCount}
              </span>
            </span>
          }
        />

        {/* Card 2: Total Impressions (Views across all screens) */}
        <FlattenStatCard
          title={t('marketing.totalImpressions', 'ចំនួនមើលសរុប (Impressions)')}
          value={analytics.totalImpressions}
          useCounter={true}
          color="blue"
          icon={Eye}
          subtitle={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {analytics.viewsToday.toLocaleString()} {t('marketing.viewsUnit', 'ដង')} {t('marketing.todayLabel', 'ថ្ងៃនេះ')} • គ្រប់អេក្រង់
            </span>
          }
        />

        {/* Card 3: Click-Through Rate & Total User Interactions */}
        <FlattenStatCard
          title={t('marketing.clickThroughRate', 'អត្រាចុចចូលមើល (CTR)')}
          value={analytics.avgCtrPercent}
          suffix="%"
          decimals={1}
          useCounter={true}
          color="purple"
          icon={MousePointerClick}
          subtitle={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {analytics.totalClicks.toLocaleString()} {t('marketing.userClicksUnit', 'ការចុច')} ({analytics.clicksToday} {t('marketing.todayLabel', 'ថ្ងៃនេះ')})
            </span>
          }
        />

        {/* Card 4: Attributed Revenue & Omnichannel ROI */}
        <FlattenStatCard
          title={t('marketing.attributedRevenue', 'ចំណូលបានពីបដា (Revenue)')}
          value={analytics.totalRevenueAttributed}
          prefix="$"
          decimals={2}
          useCounter={true}
          color="emerald"
          icon={TrendingUp}
          subtitle={
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              +ROI {t('marketing.omnichannelConversions', 'ការបំប្លែងគ្រប់បណ្តាញ')}
            </span>
          }
        />
      </FlattenStatsGrid>
    </div>
  )
}

export default BannerStatsCards
