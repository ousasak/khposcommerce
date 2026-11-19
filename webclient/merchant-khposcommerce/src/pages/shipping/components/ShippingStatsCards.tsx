import React from 'react'
import { useTranslation } from 'react-i18next'
import { Truck, Clock, TrendingUp, DollarSign } from 'lucide-react'
import { FlattenStatCard, FlattenStatsGrid } from '@/components/common'

interface ShippingStatsCardsProps {
  analytics: {
    totalShipments: number
    deliveredCount: number
    pendingCount: number
    returnedCount: number
    failedCount: number
    onTimeRate: number
    avgDeliveryTimeDays: number
    totalShippingRevenue: number
    avgShippingFee: number
    freeShippingOrders: number
    totalShippingCost: number
    shippingProfit: number
    profitMargin: number
    todaysShipments: number
    todaysDelivered: number
    activeCouriersCount: number
    pendingPickupCount: number
    customerComplaints: number
  }
}

export const ShippingStatsCards: React.FC<ShippingStatsCardsProps> = ({ analytics }) => {
  const { t } = useTranslation(['shipping', 'common'])

  return (
    <div className="print:hidden select-none">
      <FlattenStatsGrid columns={4}>
        {/* Card 1: Logistics Shipments Volume */}
        <FlattenStatCard
          title={t('shipping.totalShipments', 'ប័ណ្ណដឹកជញ្ជូនសរុប')}
          value={analytics.totalShipments}
          useCounter={true}
          color="teal"
          icon={Truck}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {analytics.deliveredCount} {t('shipping.delivered', 'បានដឹកជញ្ជូន')}
              </span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {analytics.pendingCount} {t('shipping.inTransit', 'កំពុងធ្វើដំណើរ')}
              </span>
              <span>•</span>
              <span>
                +{analytics.todaysShipments} {t('shipping.today', 'ថ្ងៃនេះ')}
              </span>
            </span>
          }
        />

        {/* Card 2: In Transit & Active Couriers */}
        <FlattenStatCard
          title={t('shipping.inTransit', 'កំពុងធ្វើដំណើរ')}
          value={analytics.pendingCount}
          useCounter={true}
          color="blue"
          icon={Clock}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {analytics.activeCouriersCount} {t('shipping.activeCouriers', 'អ្នកដឹកជញ្ជូនសកម្ម')}
              </span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {t('shipping.pendingPickup', 'រង់ចាំទទួល')}: {analytics.pendingPickupCount}
              </span>
            </span>
          }
        />

        {/* Card 3: On-Time SLA Delivery Rate */}
        <FlattenStatCard
          title={t('shipping.onTimeDelivery', 'អត្រាដឹកទាន់ពេល SLA')}
          value={analytics.onTimeRate}
          suffix="%"
          decimals={1}
          useCounter={true}
          color="purple"
          icon={TrendingUp}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span>
                {t('shipping.avgSla', 'រយៈពេលមធ្យម')}: {analytics.avgDeliveryTimeDays} {t('shipping.days', 'ថ្ងៃ')}
              </span>
              <span>•</span>
              <span className={analytics.customerComplaints > 0 ? 'text-rose-500 font-semibold' : 'text-emerald-500'}>
                {analytics.customerComplaints} {t('shipping.issues', 'យឺតយ៉ាវ/បញ្ហា')}
              </span>
            </span>
          }
        />

        {/* Card 4: Total Revenue & Margin */}
        <FlattenStatCard
          title={t('shipping.shippingRevenue', 'ចំណូលថ្លៃដឹកជញ្ជូន')}
          value={analytics.totalShippingRevenue}
          prefix="$"
          decimals={2}
          useCounter={true}
          color="emerald"
          icon={DollarSign}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                +${analytics.shippingProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (+{analytics.profitMargin}%)
              </span>
              <span>{t('shipping.netProfit', 'ចំណេញសុទ្ធ')}</span>
            </span>
          }
        />
      </FlattenStatsGrid>
    </div>
  )
}

export default ShippingStatsCards
