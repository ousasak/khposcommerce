import React from 'react'
import { motion } from 'framer-motion'
import { Calculator, CheckCircle2, ShieldCheck, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'

export interface PayrollSettlementCycleBannerProps {
  periodMonth?: string
  totalEmployees?: number
  processedEmployees?: number
  pendingCount?: number
  settlementDate?: string
  status?: string
}

/**
 * PayrollSettlementCycleBanner Component
 * Exact clone of SmartHR Global Payroll Control Center settlement cycle banner:
 * https://smarthr.dreamstechnologies.com/fsm/react/payroll
 */
export const PayrollSettlementCycleBanner: React.FC<PayrollSettlementCycleBannerProps> = ({
  periodMonth = '2026-09',
  totalEmployees = 248,
  processedEmployees = 248,
  pendingCount = 0,
  settlementDate,
  status = 'settled',
}) => {
  const { t } = useTranslation(['employees', 'common'])

  // Format month name: e.g. "2026-09" -> "September 2026"
  const formattedMonth = React.useMemo(() => {
    try {
      const [year, month] = periodMonth.split('-').map(Number)
      const date = new Date(year, (month || 1) - 1, 1)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } catch {
      return periodMonth
    }
  }, [periodMonth])

  // Settlement date formatting: e.g. "Wednesday, Sep 30, 2026"
  const formattedSettlementDate = React.useMemo(() => {
    if (settlementDate) return settlementDate
    try {
      const [year, month] = periodMonth.split('-').map(Number)
      const lastDay = new Date(year, month || 1, 0)
      return lastDay.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return 'Sep 30, 2026'
    }
  }, [settlementDate, periodMonth])

  const shortSettlementDate = React.useMemo(() => {
    try {
      const [year, month] = periodMonth.split('-').map(Number)
      const lastDay = new Date(year, month || 1, 0)
      return lastDay.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return 'Sep 30, 2026'
    }
  }, [periodMonth])

  const completionPercent =
    totalEmployees > 0
      ? Math.min(100, Math.round((processedEmployees / totalEmployees) * 100))
      : 100

  const isFullySettled = status === 'settled' || completionPercent === 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-card dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 print:hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Icon & Settlement Title */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-500/10 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-2xs">
            <Calculator size={20} className="stroke-[2.2]" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                {t('employees.settlement_cycle_title', {
                  month: formattedMonth,
                  defaultValue: `${formattedMonth} Settlement Cycle`,
                })}
              </h2>
              <span className="inline-flex items-center font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-muted-foreground border border-slate-200/80 dark:border-slate-700/60">
                {t('employees.batch_code', {
                  period: periodMonth,
                  defaultValue: `Batch #PR-${periodMonth}`,
                })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
              {t('employees.settlement_cycle_subtitle', {
                date: formattedSettlementDate,
                defaultValue: `Standard monthly disbursement scheduled for ${formattedSettlementDate}`,
              })}
            </p>
          </div>
        </div>

        {/* Right: Settled & Disbursed Status Pill Badge */}
        <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              isFullySettled
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
            }`}
          >
            {isFullySettled ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>{t('employees.settled_and_disbursed', 'Settled & Disbursed')}</span>
              </>
            ) : (
              <>
                <Clock size={13} className="text-amber-600 dark:text-amber-400 stroke-[2.5]" />
                <span>{t('employees.active_processing', 'Active Processing')}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 4 Metric Columns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* 1. Employees Processed */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.employees_processed', 'Employees Processed')}
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-foreground">
              {processedEmployees} / {totalEmployees}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {completionPercent}%
            </span>
          </div>
        </div>

        {/* 2. Awaiting Approval */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.awaiting_approval', 'Awaiting Approval')}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('employees.staff_fallback', 'staff')}
            </span>
          </div>
        </div>

        {/* 3. Settlement Date */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.settlement_date', 'Settlement Date')}
          </span>
          <div className="text-sm sm:text-base font-extrabold text-foreground">
            {shortSettlementDate}
          </div>
        </div>

        {/* 4. Compliance Status */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.compliance_status', 'Compliance Status')}
          </span>
          <div className="flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('employees.audit_ready', 'Audit Ready')}</span>
          </div>
        </div>
      </div>

      {/* Global Fund Allocation Progress Bar */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground text-[11px]">
            {t('employees.global_fund_allocation_progress', 'Global Fund Allocation Progress')}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {completionPercent}% {t('employees.processed_label', 'Completed')}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#0f766e] via-teal-500 to-emerald-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default PayrollSettlementCycleBanner

