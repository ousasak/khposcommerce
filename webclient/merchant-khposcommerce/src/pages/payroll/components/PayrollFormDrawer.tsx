import React, { useState, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Briefcase,
  AlertCircle,
  Save,
  X,
  Calculator,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { FormDrawer, ModernSelect, EnterpriseMonthPicker, LoadingSpinner } from '@/components/common'
import { formatCurrency } from '@/utils/formatters'

interface PayrollFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any | null
}

export const PayrollFormDrawer: React.FC<PayrollFormDrawerProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const qc = useQueryClient()
  const toast = useToast()

  const isEdit = Boolean(initialData?.id)

  // Fetch employees list for dropdown
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees-lookup-for-payroll'],
    queryFn: () => employeeService.employees({ per_page: 100, status: 'active' }),
    enabled: isOpen,
  })

  const employeeOptions = useMemo(() => {
    const list = employeesData?.data || []
    return list.map((emp: any) => ({
      value: String(emp.id),
      label: `${emp.first_name} ${emp.last_name} (${emp.employee_number || emp.id}) - ${emp.department?.name || 'General'}`,
      emp,
    }))
  }, [employeesData])

  // Form State
  const [employeeId, setEmployeeId] = useState<string>('')
  const [periodMonth, setPeriodMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  )
  const [workingDays, setWorkingDays] = useState<number>(26)
  const [presentDays, setPresentDays] = useState<number>(26)
  const [basicSalary, setBasicSalary] = useState<number>(0)
  const [allowances, setAllowances] = useState<number>(0)
  const [overtimePay, setOvertimePay] = useState<number>(0)
  const [deductions, setDeductions] = useState<number>(0)
  const [status, setStatus] = useState<string>('draft')
  const [paidAt, setPaidAt] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // When initialData changes or opened
  useEffect(() => {
    if (initialData) {
      setEmployeeId(String(initialData.employee_id || initialData.employee?.id || ''))
      setPeriodMonth(initialData.period_month || new Date().toISOString().substring(0, 7))
      setWorkingDays(Number(initialData.working_days ?? 26))
      setPresentDays(Number(initialData.present_days ?? 26))
      setBasicSalary(Number(initialData.basic_salary ?? 0))
      setAllowances(Number(initialData.allowances ?? 0))
      setOvertimePay(Number(initialData.overtime_pay ?? 0))
      setDeductions(Number(initialData.deductions ?? 0))
      setStatus(initialData.status || 'draft')
      setPaidAt(initialData.paid_at ? initialData.paid_at.substring(0, 10) : '')
      setNotes(initialData.notes || '')
    } else {
      setEmployeeId('')
      setPeriodMonth(new Date().toISOString().substring(0, 7))
      setWorkingDays(26)
      setPresentDays(26)
      setBasicSalary(0)
      setAllowances(0)
      setOvertimePay(0)
      setDeductions(0)
      setStatus('draft')
      setPaidAt('')
      setNotes('')
    }
  }, [initialData, isOpen])

  // When an employee is chosen in create mode, auto-populate basic salary if available
  const handleEmployeeChange = (val: string) => {
    setEmployeeId(val)
    if (!isEdit) {
      const selected = employeeOptions.find((opt: any) => opt.value === val)?.emp
      if (selected && selected.basic_salary) {
        setBasicSalary(Number(selected.basic_salary))
      }
    }
  }

  // Calculated gross and net
  const grossEarnings = useMemo(() => {
    return Number(basicSalary) + Number(allowances) + Number(overtimePay)
  }, [basicSalary, allowances, overtimePay])

  const calculatedNetSalary = useMemo(() => {
    return Math.max(0, grossEarnings - Number(deductions))
  }, [grossEarnings, deductions])

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit && initialData?.id) {
        return employeeService.updatePayroll(initialData.id, payload)
      }
      return employeeService.createPayroll(payload)
    },
    onSuccess: () => {
      toast.success(
        isEdit
          ? t('employees.payroll_updated_success', 'Payroll record updated successfully!')
          : t('employees.payroll_created_success', 'New payroll record created successfully!')
      )
      qc.invalidateQueries({ queryKey: ['payrolls'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      onClose()
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save payroll record'
      toast.error(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId) {
      toast.error(t('employees.select_employee_req', 'Please select an employee'))
      return
    }
    if (!periodMonth) {
      toast.error(t('employees.select_month_req', 'Please select a payroll month'))
      return
    }

    const payload = {
      employee_id: Number(employeeId),
      period_month: periodMonth,
      working_days: Number(workingDays),
      present_days: Number(presentDays),
      basic_salary: Number(basicSalary),
      allowances: Number(allowances),
      overtime_pay: Number(overtimePay),
      deductions: Number(deductions),
      net_salary: Number(calculatedNetSalary),
      status: status,
      paid_at: status === 'paid' ? (paidAt || new Date().toISOString().substring(0, 10)) : null,
      notes: notes || null,
    }

    saveMutation.mutate(payload)
  }

  return (
    <FormDrawer
      open={isOpen}
      onClose={onClose}
      title={isEdit ? t('employees.edit_payroll_title', 'Edit Payroll Record') : t('employees.create_payroll_title', 'New Payroll Disbursement')}
      subtitle={isEdit ? `${t('employees.payroll_id', 'Payroll ID')}: #${initialData?.id}` : t('employees.create_payroll_sub', 'Manually issue or calibrate single employee salary slip')}
      width="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {saveMutation.isPending ? (
              <LoadingSpinner size="xs" />
            ) : (
              <Save size={14} />
            )}
            <span>{isEdit ? t('common.save_changes', 'Save Changes') : t('employees.issue_payroll', 'Confirm & Issue')}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 dark:bg-teal-400/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Calculator size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-800 dark:text-teal-200">
                {t('employees.calculated_net_salary', 'Calculated Net Disbursement')}
              </p>
              <p className="text-xl font-black text-teal-700 dark:text-teal-300 font-mono">
                {formatCurrency(calculatedNetSalary, 'USD')}
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-muted-foreground block text-[11px]">{t('employees.gross_sum', 'Gross Sum')}</span>
            <span className="font-bold text-foreground font-mono">{formatCurrency(grossEarnings, 'USD')}</span>
          </div>
        </div>

        {/* Employee & Cycle Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
            1. {t('employees.cycle_and_employee_heading', 'Employee & Payroll Cycle')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('employees.select_employee', 'Select Employee')} <span className="text-rose-500">*</span>
              </label>
              <ModernSelect
                value={employeeId}
                onChange={handleEmployeeChange}
                options={[
                  { value: '', label: t('employees.choose_employee', '-- Choose Employee --') },
                  ...employeeOptions,
                ]}
                disabled={isEdit}
                placeholder={t('employees.choose_employee', 'Select employee...')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('employees.payroll_month', 'Payroll Month / Cycle')} <span className="text-rose-500">*</span>
              </label>
              <EnterpriseMonthPicker
                value={periodMonth}
                onChange={setPeriodMonth}
                disabled={isEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {t('employees.working_days', 'Standard Working Days')}
              </label>
              <input
                type="number"
                min={0}
                max={31}
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {t('employees.present_days', 'Actual Present Days')}
              </label>
              <input
                type="number"
                min={0}
                max={31}
                value={presentDays}
                onChange={(e) => setPresentDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Financial Breakdown Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
            2. {t('employees.compensation_breakdown', 'Compensation Breakdown & Deductions')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {t('employees.basic_salary', 'Basic Salary')} ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={basicSalary || ''}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {t('employees.allowances_label', 'Allowances & Benefits')} ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={allowances || ''}
                  onChange={(e) => setAllowances(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {t('employees.overtime_pay', 'Overtime Pay')} ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={overtimePay || ''}
                  onChange={(e) => setOvertimePay(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">
                {t('employees.total_deductions_label', 'Total Deductions (Tax & NSSF)')} ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-rose-500 font-bold">-$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={deductions || ''}
                  onChange={(e) => setDeductions(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-rose-300 dark:border-rose-900 bg-card text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status & Payment Method */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
            3. {t('employees.status_and_notes', 'Disbursement Status & Audit Notes')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                {t('employees.payroll_status', 'Disbursement Status')}
              </label>
              <ModernSelect
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'draft', label: t('employees.status_draft', 'Draft / Under Review') },
                  { value: 'approved', label: t('employees.status_approved', 'Approved / Pending Settlement') },
                  { value: 'paid', label: t('employees.status_paid', 'Settled & Paid') },
                ]}
              />
            </div>

            {status === 'paid' && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  {t('employees.paid_at_date', 'Settlement Date')}
                </label>
                <input
                  type="date"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {t('employees.notes', 'Audit Notes / Ledger Remark')}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('employees.payroll_notes_placeholder', 'Add any relevant settlement context or adjustment reasoning...')}
              className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
            />
          </div>
        </div>
      </form>
    </FormDrawer>
  )
}

export default PayrollFormDrawer
