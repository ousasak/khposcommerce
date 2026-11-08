import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, CheckCircle2, Store, Globe, Sparkles } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface PaymentMethodsGatewaysStatsCardsProps {
  methods?: any[]
  isLoading?: boolean
}

export type PaymentMethodStatsCardsProps = PaymentMethodsGatewaysStatsCardsProps

export const PaymentMethodsGatewaysStatsCards: React.FC<PaymentMethodsGatewaysStatsCardsProps> = ({
  methods = [],
  isLoading = false,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  const stats = useMemo(() => {
    const totalCount = methods.length
    const activeCount = methods.filter((m: any) => m.is_active).length
    const inactiveCount = totalCount - activeCount
    const posCount = methods.filter((m: any) => m.available_pos).length
    const onlineCount = methods.filter((m: any) => m.available_online).length
    const freeCount = methods.filter(
      (m: any) => Number(m.fee_percent || 0) === 0 && Number(m.fee_fixed || 0) === 0
    ).length

    return {
      totalCount,
      activeCount,
      inactiveCount,
      posCount,
      onlineCount,
      freeCount,
      activeRate: totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}%` : '0%',
    }
  }, [methods])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 print:hidden">
      <StatCard
        title={t('finance.total_payment_methods', 'វិធីសាស្ត្រទូទាត់សរុប')}
        value={stats.totalCount}
        suffix={` ${t('finance.methods_unit', 'វិធី')}`}
        useCounter={true}
        icon={CreditCard}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('finance.active_payment_methods', 'កំពុងដំណើរការ')}
        value={stats.activeCount}
        suffix={` ${t('finance.methods_unit', 'វិធី')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.activeRate,
          trend: 'up',
          label: `${stats.inactiveCount} ${t('finance.status_inactive', 'អសកម្ម')}`,
        }}
      />
      <StatCard
        title={t('finance.fee_free_methods', 'វិធីទូទាត់ឥតកម្រៃ (Free)')}
        value={stats.freeCount}
        suffix={` ${t('finance.methods_unit', 'វិធី')}`}
        useCounter={true}
        icon={Sparkles}
        variant="amber"
        loading={isLoading}
      />
      <StatCard
        title={t('finance.channels_coverage', 'ឆានែល (POS / Online)')}
        value={`${stats.posCount} POS`}
        suffix={` / ${stats.onlineCount} Online`}
        useCounter={false}
        icon={Store}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export { PaymentMethodsGatewaysStatsCards as PaymentMethodStatsCards }
export default PaymentMethodsGatewaysStatsCards
