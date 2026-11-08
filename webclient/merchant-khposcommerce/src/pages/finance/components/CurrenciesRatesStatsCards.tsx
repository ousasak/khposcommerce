import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Coins, CheckCircle2, ArrowRightLeft, Landmark } from 'lucide-react'
import type { CurrencyItem } from '../types/currency.types'

export interface CurrenciesRatesStatsCardsProps {
  currencies?: CurrencyItem[]
  isLoading?: boolean
}

export const CurrenciesRatesStatsCards: React.FC<CurrenciesRatesStatsCardsProps> = ({
  currencies = [],
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const isKhmer = i18n.language === 'km'

  const stats = useMemo(() => {
    const totalCount = currencies.length
    const activeCount = currencies.filter((c) => c.is_active).length

    const baseCurrency =
      currencies.find((c) => c.is_default) ||
      currencies.find((c) => (c.code || '').toUpperCase() === 'USD') ||
      currencies[0] || { code: 'USD', symbol: '$', name: 'US Dollar', exchange_rate: 1 }

    const khrCurrency = currencies.find((c) => (c.code || '').toUpperCase() === 'KHR')
    const khrNumericRate = Number(khrCurrency?.exchange_rate || 4100)
    const khrRateFormatted = khrNumericRate.toLocaleString('en-US')
    const inverse10k = (10000 / khrNumericRate).toFixed(2)

    return {
      totalCount,
      activeCount,
      baseCode: (baseCurrency.code || 'USD').toUpperCase(),
      baseSymbol: baseCurrency.symbol || '$',
      khrRateFormatted,
      inverse10k,
    }
  }, [currencies])

  const cards = [
    {
      id: 'total',
      title: isKhmer ? 'ចំនួនរូបិយប័ណ្ណសរុប' : t('finance.total_currencies', 'Total Currencies'),
      value: isLoading ? '—' : stats.totalCount,
      suffix: isKhmer ? 'ប្រភេទ' : 'Currencies',
      subtitle: isKhmer ? 'កំណត់ទុកក្នុងប្រព័ន្ធ' : 'Configured in system',
      icon: Coins,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'active',
      title: isKhmer ? 'រូបិយប័ណ្ណសកម្ម' : t('finance.active_currencies', 'Active Currencies'),
      value: isLoading ? '—' : stats.activeCount,
      suffix: isKhmer ? 'សកម្ម' : 'Active',
      subtitle: isKhmer ? 'រួចរាល់សម្រាប់ប្រតិបត្តិការ POS' : 'Ready for POS checkout',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'base',
      title: isKhmer ? 'រូបិយប័ណ្ណគោល' : t('finance.base_currency_title', 'Base Currency'),
      value: `${stats.baseCode} (${stats.baseSymbol})`,
      subtitle: isKhmer ? 'អត្រាគោលមិនប្រែប្រួល: 1.0000' : 'Fixed Base Rate: 1.0000',
      icon: Landmark,
      iconColor: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      id: 'rate',
      title: isKhmer ? 'អត្រាប្តូរប្រាក់បច្ចុប្បន្ន' : t('finance.khr_exchange_rate', 'Exchange Rate (USD ➔ KHR)'),
      value: `1 $ = ${stats.khrRateFormatted} ៛`,
      subtitle: isKhmer ? `អត្រាអាប់: 10,000 ៛ ≈ $${stats.inverse10k}` : `Change Rate: 10,000 ៛ ≈ $${stats.inverse10k}`,
      icon: ArrowRightLeft,
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 print:hidden">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <div
            key={card.id}
            className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs hover:border-border transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${card.iconBg} ${card.iconColor}`}
              >
                <IconComponent size={16} />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                  {card.value}
                </span>
                {card.suffix && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {card.suffix}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { CurrenciesRatesStatsCards as CurrencyStatsCards }
export default CurrenciesRatesStatsCards
