import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, CheckCircle2, Star, MapPin } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface BranchStatsCardsProps {
  branches?: any[]
  total?: number
  isLoading?: boolean
}

export const BranchStatsCards: React.FC<BranchStatsCardsProps> = ({
  branches = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['company', 'settings', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : branches.length
    const activeCount = branches.filter((b: any) => Boolean(b.is_active ?? true)).length
    const mainBranches = branches.filter((b: any) => Boolean(b.is_main)).length
    const citiesCount = new Set(branches.map((b: any) => b.city).filter(Boolean)).size
    const activeRate = totalCount > 0 ? `${Math.round((activeCount / (branches.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      activeCount,
      mainBranches,
      citiesCount,
      activeRate,
    }
  }, [branches, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('company.statsTotalBranches', 'Total Branches')}
        value={stats.totalCount}
        suffix={` ${t('company.unitBranches', 'branches')}`}
        useCounter={true}
        icon={Building2}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('company.statsActiveBranches', 'Active Branches')}
        value={stats.activeCount}
        suffix={` ${t('company.unitActive', 'active')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.activeRate,
          trend: 'up',
          label: t('company.unitRatio', 'ratio'),
        }}
      />
      <StatCard
        title={t('company.statsMainHQ', 'Main Headquarters')}
        value={stats.mainBranches}
        suffix={` ${t('company.unitHQ', 'HQ')}`}
        useCounter={true}
        icon={Star}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('company.statsCoveredCities', 'Covered Cities / Areas')}
        value={stats.citiesCount}
        suffix={` ${t('company.unitCities', 'cities')}`}
        useCounter={true}
        icon={MapPin}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default BranchStatsCards
