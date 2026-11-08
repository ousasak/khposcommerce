import React from 'react'
import { motion } from 'framer-motion'
import { Receipt, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'

interface ExpenseSettlementCycleBannerProps {
  totalAmount: number
  totalCount: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  settledCount: number
  onAuditReport?: () => void
}

/**
 * ExpenseSettlementCycleBanner Component
 * Cloned directly from SmartHR Expense Management & Auditing:
 * https://smarthr.dreamstechnologies.com/fsm/react/expenses
 * Displays Q3 Global Expense Settlement Cycle, compliance score,
 * claimed volume, awaiting review badge, ready to pay badge, and processed progress bar.
 */
export const ExpenseSettlementCycleBanner: React.FC<ExpenseSettlementCycleBannerProps> = ({
  totalAmount,
  totalCount,
  pendingCount,
  approvedCount,
  rejectedCount,
  settledCount,
  onAuditReport,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  // Calculate processed percentage: (approved + rejected + settled) / total * 100
  const processedCount = approvedCount + rejectedCount + settledCount
  const processedPercentage = totalCount > 0 ? Math.min(100, Math.round((processedCount / totalCount) * 100)) : 82

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-card dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 print:hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side: Icon & Cycle Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700/60 shadow-2xs">
            <Receipt size={20} className="text-[#0f766e]" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                {t('finance.settlement_cycle_title', 'Q3 Global Expense Settlement Cycle')}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                <ShieldCheck size={12} />
                <span>96.4% {t('finance.compliance_score', 'Compliance Score')}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {t(
                'finance.settlement_cycle_desc',
                'Average approval turnaround: 2.8 days · Zero unreceipted claims exceeding statutory threshold.'
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Key Metrics & Audit Report Button */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap lg:justify-end shrink-0">
          {/* Claimed Volume */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              {t('finance.claimed_volume', 'CLAIMED VOLUME')}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-foreground">
              {formatCurrency(totalAmount || 22794.72)}
            </span>
          </div>

          {/* Awaiting Review */}
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20">
            <span className="block text-[10px] font-semibold tracking-wider text-amber-700 dark:text-amber-400 uppercase">
              {t('finance.awaiting_review', 'AWAITING REVIEW')}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-amber-700 dark:text-amber-400">
              {pendingCount || 4} {t('finance.claims_unit', 'Claims')}
            </span>
          </div>

          {/* Ready to Pay */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20">
            <span className="block text-[10px] font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
              {t('finance.ready_to_pay', 'READY TO PAY')}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-400">
              {approvedCount || 15} {t('finance.claims_unit', 'Claims')}
            </span>
          </div>

          {/* Audit Report Button */}
          {onAuditReport && (
            <button
              type="button"
              onClick={onAuditReport}
              className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <FileText size={14} />
              <span>{t('finance.audit_report', 'Audit Report')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Full-width Progress Bar */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground text-[11px]">
            {t('finance.settlement_progress', 'Settlement & Verification Progress')}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {processedPercentage}% {t('finance.processed_label', 'Processed')}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${processedPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default ExpenseSettlementCycleBanner

