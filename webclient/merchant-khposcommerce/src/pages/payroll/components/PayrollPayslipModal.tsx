import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Printer,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Landmark,
  ShieldCheck,
  User,
  ExternalLink,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { EnterpriseModal, LoadingSpinner } from '@/components/common'
import { formatCurrency } from '@/utils/formatters'

interface PayrollPayslipModalProps {
  isOpen: boolean
  onClose: () => void
  payrollId: number | null
}

export const PayrollPayslipModal: React.FC<PayrollPayslipModalProps> = ({
  isOpen,
  onClose,
  payrollId,
}) => {
  const { t } = useTranslation(['employees', 'common'])

  const { data: payslip, isLoading } = useQuery({
    queryKey: ['payslip-detail', payrollId],
    queryFn: () => (payrollId ? employeeService.getPayslip(payrollId) : null),
    enabled: isOpen && !!payrollId,
  })

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('employees.view_payslip', 'Official Salary Pay Slip')}
      subtitle={payslip?.payslip_number || t('employees.official_salary_doc', 'Official Salary Document')}
      icon={<FileText size={20} />}
      iconVariant="teal"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {t('employees.currency_label', 'Currency')}:{' '}
              <span className="font-bold text-foreground">USD ($) & KHR (៛)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              {t('common.close', 'Close')}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>{t('employees.print_payslip', 'Print Payslip')}</span>
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-xs text-muted-foreground gap-3">
          <LoadingSpinner size="md" />
          <span>{t('employees.loading_payslip', 'Loading official payslip details...')}</span>
        </div>
      ) : !payslip ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          {t('employees.payslip_not_found', 'Payslip information could not be found.')}
        </div>
      ) : (
        <div className="payslip-container p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-6 text-foreground font-sans print:border-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                NT
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  {payslip.company?.name || 'NexTech Cambodia (HQ)'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {payslip.company?.address || 'Monivong Blvd, Phnom Penh, Cambodia'}
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold font-mono border border-teal-200/60 dark:border-teal-800/60">
                {payslip.payslip_number}
              </span>
              <p className="text-xs text-muted-foreground mt-1.5">
                {t('employees.period', 'Cycle Period')}:{' '}
                <span className="font-semibold text-foreground font-mono">{payslip.period_month}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('employees.issue_date', 'Issue Date')}: {payslip.issue_date}
              </p>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">{t('employees.employee_name', 'Employee Name')}</p>
              <p className="font-bold text-foreground text-sm mt-0.5">{payslip.employee?.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{payslip.employee?.employee_number}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">{t('employees.department_and_role', 'Department & Role')}</p>
              <p className="font-semibold text-foreground mt-0.5">{payslip.employee?.department}</p>
              <p className="text-[11px] text-muted-foreground">{payslip.employee?.position}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">{t('employees.branch_and_nssf', 'Branch & NSSF ID')}</p>
              <p className="font-semibold text-foreground mt-0.5">{payslip.employee?.branch}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{payslip.employee?.nssf_number || t('common.none', 'N/A')}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">{t('employees.bank_details', 'Disbursement Channel')}</p>
              <p className="font-semibold text-foreground mt-0.5">{payslip.employee?.bank_name || 'ABA Bank Corporate'}</p>
              <p className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-bold">{payslip.employee?.bank_account_no || '-'}</p>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EARNINGS */}
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {t('employees.earnings', 'Earnings & Allowances')}
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {t('employees.amount_usd', 'Amount ($)')}
                </span>
              </div>
              <div className="p-3.5 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.basic_salary_item', 'Basic Monthly Salary')}</span>
                  <span className="font-semibold text-foreground font-mono">{formatCurrency(payslip.earnings?.basic_salary, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.allowances_item', 'Allowances & Benefits')}</span>
                  <span className="font-semibold text-foreground font-mono">{formatCurrency(payslip.earnings?.allowances, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.overtime_item', 'Overtime Compensation')}</span>
                  <span className="font-semibold text-foreground font-mono">{formatCurrency(payslip.earnings?.overtime_pay, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.sales_commission_item', 'Performance / Sales Commission')}</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
                    {formatCurrency(payslip.earnings?.sales_commission, 'USD')}
                  </span>
                </div>
                {payslip.earnings?.seniority_pay > 0 && (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">{t('employees.seniority_item', 'Seniority Indemnity Payment')}</span>
                    <span className="font-semibold text-foreground font-mono">{formatCurrency(payslip.earnings?.seniority_pay, 'USD')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{t('employees.gross_earnings', 'Gross Earnings Sum')}</span>
                  <span className="font-mono">{formatCurrency(payslip.earnings?.total_earnings, 'USD')}</span>
                </div>
              </div>
            </div>

            {/* DEDUCTIONS */}
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  {t('employees.deductions_label', 'Statutory Deductions')}
                </span>
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                  {t('employees.amount_usd', 'Amount ($)')}
                </span>
              </div>
              <div className="p-3.5 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.nssf_cambodia_item', 'NSSF Statutory Contribution')}</span>
                  <span className="font-semibold text-foreground font-mono">{formatCurrency(payslip.deductions?.nssf_deduction, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.salary_tax_item', 'Salary Withholding Tax')}</span>
                  <span className="font-semibold text-foreground font-mono">{formatCurrency(payslip.deductions?.tax_deduction, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.other_deductions', 'Other Deductions / Penalties')}</span>
                  <span className="font-semibold text-foreground font-mono">{formatCurrency(payslip.deductions?.other_deductions, 'USD')}</span>
                </div>
                <div className="flex justify-between pt-2.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                  <span>{t('employees.total_deductions', 'Total Deductions Sum')}</span>
                  <span className="font-mono">{formatCurrency(payslip.deductions?.total_deductions, 'USD')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Net Payout Box */}
          <div className="p-5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-teal-800 dark:text-teal-200 tracking-wider">
                  {t('employees.net_salary_payout', 'TOTAL NET SALARY DISBURSEMENT')}
                </p>
                <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                  {payslip.status ? payslip.status.toUpperCase() : 'SETTLED'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t('employees.exchange_rate', 'National Bank of Cambodia Rate')}: 1 USD ={' '}
                <span className="font-mono font-semibold text-foreground">
                  {payslip.exchange_rate ? payslip.exchange_rate.toLocaleString() : '4,100'} KHR
                </span>
              </p>
            </div>
            <div className="text-right sm:text-right">
              <p className="text-3xl font-black text-teal-700 dark:text-teal-300 font-mono tracking-tight">
                {formatCurrency(payslip.net_salary, 'USD')}
              </p>
              <p className="text-xs font-bold text-muted-foreground font-mono mt-0.5">
                ≈ {formatCurrency(payslip.net_salary_khr, 'KHR')}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs text-muted-foreground border-t border-border/60">
            <div>
              <div className="h-12 border-b border-dashed border-border/80 mb-2"></div>
              <p className="font-semibold text-foreground">{t('employees.employer_signature', 'Authorized Employer Signature')}</p>
              <p className="text-[11px]">{t('employees.hr_finance_dept', 'Finance & Payroll Officer')}</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-border/80 mb-2"></div>
              <p className="font-semibold text-foreground">{t('employees.employee_signature', 'Employee Signature / Confirmation')}</p>
              <p className="text-[11px] font-medium">{payslip.employee?.name}</p>
            </div>
          </div>
        </div>
      )}
    </EnterpriseModal>
  )
}

export default PayrollPayslipModal

