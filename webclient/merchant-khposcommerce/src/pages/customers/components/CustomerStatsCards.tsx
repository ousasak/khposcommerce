import React from 'react'
import { Users, CheckCircle2, Award, MapPin, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AccentStatCard, AccentStatGrid } from '@/components/common/AccentStatCard'
import type { CustomerAnalytics } from '../types/customer.types'

interface CustomerStatsCardsProps {
  stats: CustomerAnalytics | any | undefined
  totalFallback: number
  selectedRfm?: string
  onSelectRfm?: (segment: string) => void
}

/**
 * CustomerStatsCards — uses global AccentStatCard + AccentStatGrid.
 * 5 overview metrics: Total Clients, Active Contracts, Platinum SLA,
 * Service Sites, Open Work Orders.
 */
export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({
  stats,
  totalFallback,
}) => {
  const { t } = useTranslation(['customers', 'common'])

  const total          = stats?.total_customers        ?? totalFallback ?? 0
  const active         = stats?.active_customers       ?? 0
  const vipCount       = stats?.vip_customers          ?? 0
  const totalWallet    = Number(stats?.total_wallet_balance    ?? 0)
  const totalOutstanding = Number(stats?.total_outstanding_balance ?? 0)

  // Service Sites: prefer address count, fall back to wallet balance formatted
  const serviceSitesValue = stats?.total_addresses != null
    ? stats.total_addresses
    : totalWallet > 0
      ? `$${totalWallet.toLocaleString()}`
      : 0

  // Open Work Orders: prefer outstanding balance, fall back to pending orders
  const workOrdersIsNumber =
    totalOutstanding === 0 && typeof (stats?.pending_orders_count) === 'number'
  const workOrdersValue = totalOutstanding > 0
    ? `$${totalOutstanding.toLocaleString()}`
    : (stats?.pending_orders_count ?? 0)

  return (
    <AccentStatGrid columns={5} className="mb-0 print:hidden">

      {/* 1 — Total Clients */}
      <AccentStatCard
        variant="emerald"
        label={t('customers.statsTotalClients', 'Total Clients')}
        value={total}
        icon={<Users className="w-5 h-5" />}
        useCounter
        delay={0}
      />

      {/* 2 — Active Contracts */}
      <AccentStatCard
        variant="success"
        label={t('customers.statsActiveContracts', 'Active Contracts')}
        value={active}
        icon={<CheckCircle2 className="w-5 h-5" />}
        useCounter
        delay={0.04}
      />

      {/* 3 — Platinum 24/7 SLA */}
      <AccentStatCard
        variant="indigo"
        label={t('customers.statsPlatinumSla', 'Platinum 24/7 SLA')}
        value={vipCount}
        icon={<Award className="w-5 h-5" />}
        useCounter
        delay={0.08}
      />

      {/* 4 — Service Sites */}
      <AccentStatCard
        variant="purple"
        label={t('customers.statsServiceSites', 'Service Sites')}
        value={serviceSitesValue}
        icon={<MapPin className="w-5 h-5" />}
        useCounter={typeof serviceSitesValue === 'number'}
        delay={0.12}
      />

      {/* 5 — Open Work Orders */}
      <AccentStatCard
        variant="amber"
        label={t('customers.statsOpenWorkOrders', 'Open Work Orders')}
        value={workOrdersValue}
        icon={<AlertCircle className="w-5 h-5" />}
        useCounter={workOrdersIsNumber}
        delay={0.16}
      />

    </AccentStatGrid>
  )
}

export default CustomerStatsCards
