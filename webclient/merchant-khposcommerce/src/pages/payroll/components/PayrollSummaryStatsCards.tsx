import React from 'react'
import { motion } from 'framer-motion'
import { Globe, DollarSign, Percent, ShieldCheck, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface PayrollSummaryStatsCardsProps {
  countryCount?: number
  currencyGroupCount?: number
  avgTaxPercent?: number
  benefitsPercent?: number
  overtimeStaffCount?: number
  auditExceptionsCount?: number
}

/**
 * PayrollSummaryStatsCards Component
 * Exact clone of SmartHR 6 Summary Metric Cards:
 * 1. Disbursement Volume (e.g. 28 Countries, +3.4% vs last run)
 * 2. Active Currencies (e.g. 9 Groups, USD · GBP · EUR · JPY)
 * 3. Tax Withholdings (Highlighted card: 14.2% Avg, Statutory compliance)
 * 4. Benefits & Perks (e.g. 6.8% Avg, Pension & Health)
 * 5. Overtime Claims (e.g. 38 Staff, Shift allocations)
 * 6. Audit Exceptions (e.g. 5 Flags, Action required)
 */
export const PayrollSummaryStatsCards: React.FC<PayrollSummaryStatsCardsProps> = ({
  countryCount = 28,
  currencyGroupCount = 9,
  avgTaxPercent = 14.2,
  benefitsPercent = 6.8,
  overtimeStaffCount = 38,
  auditExceptionsCount = 5,
}) => {
  const { t } = useTranslation(['employees', 'common'])

  const cards = [
    {
      id: 'disbursement_volume',
      title: t('employees.disbursement_volume', 'Disbursement Volume'),
      value: `${countryCount} Countries`,
      subText: (
        <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight size={12} className="stroke-[2.5]" />
          <span>+3.4% {t('employees.vs_last_run', 'vs last run')}</span>
        </span>
      ),
      isFeatured: false,
      borderCls: 'border-slate-200/90 dark:border-slate-800',
    },
    {
      id: 'active_currencies',
      title: t('employees.active_currencies', 'Active Currencies'),
      value: `${currencyGroupCount} Groups`,
      subText: <span className="text-muted-foreground font-mono">USD · GBP · EUR · JPY · KHR</span>,
      isFeatured: false,
      borderCls: 'border-slate-200/90 dark:border-slate-800',
    },
    {
      id: 'tax_withholdings',
      title: t('employees.tax_withholdings', 'Tax Withholdings'),
      value: `${avgTaxPercent}% Avg`,
      subText: <span className="text-muted-foreground">{t('employees.statutory_compliance', 'Statutory compliance')}</span>,
      isFeatured: true, // Highlighted card in SmartHR screenshot with teal border and soft ring
      borderCls: 'border-teal-500/40 dark:border-teal-500/30 ring-1 ring-teal-500/20 shadow-xs',
    },
    {
      id: 'benefits_perks',
      title: t('employees.benefits_and_perks', 'Benefits & Perks'),
      value: `${benefitsPercent}% Avg`,
      subText: <span className="text-amber-600 dark:text-amber-400 font-medium">{t('employees.pension_and_health', 'Pension & Health')}</span>,
      isFeatured: false,
      borderCls: 'border-slate-200/90 dark:border-slate-800',
    },
    {
      id: 'overtime_claims',
      title: t('employees.overtime_claims', 'Overtime Claims'),
      value: `${overtimeStaffCount} Staff`,
      subText: <span className="text-blue-600 dark:text-blue-400 font-medium">{t('employees.shift_allocations', 'Shift allocations')}</span>,
      isFeatured: false,
      borderCls: 'border-slate-200/90 dark:border-slate-800',
    },
    {
      id: 'audit_exceptions',
      title: t('employees.audit_exceptions', 'Audit Exceptions'),
      value: `${auditExceptionsCount} Flags`,
      subText: <span className="text-rose-600 dark:text-rose-400 font-semibold">{t('employees.action_required', 'Action required')}</span>,
      isFeatured: false,
      borderCls: 'border-slate-200/90 dark:border-slate-800',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
      {cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.03 }}
          className={`bg-card dark:bg-slate-900 border ${card.borderCls} rounded-2xl p-4 shadow-2xs transition-all flex flex-col justify-between select-none cursor-default`}
        >
          {/* Card Title */}
          <span className="text-xs font-medium text-muted-foreground block truncate mb-1">
            {card.title}
          </span>

          {/* Big Metric Value */}
          <div className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground my-1 truncate">
            {card.value}
          </div>

          {/* Subtext info */}
          <div className="text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800/80 truncate">
            {card.subText}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default PayrollSummaryStatsCards

