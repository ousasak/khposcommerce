import React, { useState } from 'react'
import {
  Copy,
  Check,
  Printer,
  Eye,
  FileText,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import {
  EmptyState,
  RowActionGroup,
  RowActionButton,
  ViewRowButton,
  EditRowButton,
  DeleteRowButton,
} from '@/components/common'
import { formatCurrency } from '@/utils/formatters'
import { useToast } from '@/hooks/useToast'

export interface PayrollTableProps {
  payrolls: any[]
  isLoading: boolean
  isFetching?: boolean
  visibleColumns?: Record<string, boolean>
  openEditModal?: (row: any) => void
  handleDelete?: (id: number, name?: string) => void
  renderSortIcon?: (field: string) => React.ReactNode
  handleSort?: (field: string) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  selectedRows?: number[]
  handleSelectRow?: (id: number) => void
  handleSelectAll?: (allIds: number[]) => void
  onViewPayslip: (row: any) => void
  onPrintPayslip?: (row: any) => void
}

export const PayrollTable: React.FC<PayrollTableProps> = ({
  payrolls = [],
  isLoading,
  isFetching = false,
  visibleColumns = {},
  openEditModal,
  handleDelete,
  renderSortIcon,
  handleSort,
  sortBy,
  sortOrder,
  selectedRows = [],
  handleSelectRow,
  handleSelectAll,
  onViewPayslip,
  onPrintPayslip,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const toast = useToast()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const isColVisible = (colKey: string) => {
    if (!visibleColumns) return true
    return visibleColumns[colKey] !== false
  }

  const copyRef = (e: React.MouseEvent, id: number, text: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(t('common.copied', 'Copied to clipboard!'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const allIds = React.useMemo(() => payrolls.map((p) => p.id), [payrolls])
  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedRows.includes(id))
  const isSomeSelected = allIds.some((id) => selectedRows.includes(id)) && !isAllSelected

  const handleToggleAll = () => {
    if (handleSelectAll) {
      if (isAllSelected) {
        handleSelectAll([])
      } else {
        handleSelectAll(allIds)
      }
    }
  }

  const getSortIndicator = (field: string) => {
    if (renderSortIcon) return renderSortIcon(field)
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? (
      <ArrowUp size={13} className="text-teal-600 dark:text-teal-400 stroke-[2.5]" />
    ) : (
      <ArrowDown size={13} className="text-teal-600 dark:text-teal-400 stroke-[2.5]" />
    )
  }

  const getCountryInfo = (item: any) => {
    const branchName = item.employee?.branch?.name || item.branch?.name || ''
    const country = item.country || item.employee?.country || ''
    if (country) {
      if (country.toLowerCase().includes('canada')) return { flag: '🇨🇦', name: 'Canada' }
      if (country.toLowerCase().includes('united states') || country.toLowerCase() === 'us' || country.toLowerCase() === 'usa')
        return { flag: '🇺🇸', name: 'United States' }
      if (country.toLowerCase().includes('cambodia')) return { flag: '🇰🇭', name: 'Cambodia' }
      if (country.toLowerCase().includes('united kingdom') || country.toLowerCase() === 'uk')
        return { flag: '🇬🇧', name: 'United Kingdom' }
      if (country.toLowerCase().includes('australia')) return { flag: '🇦🇺', name: 'Australia' }
      if (country.toLowerCase().includes('singapore')) return { flag: '🇸🇬', name: 'Singapore' }
      if (country.toLowerCase().includes('japan')) return { flag: '🇯🇵', name: 'Japan' }
      return { flag: '🌐', name: country }
    }
    if (branchName.toLowerCase().includes('phnom penh') || branchName.toLowerCase().includes('cambodia') || branchName.toLowerCase().includes('siem reap')) {
      return { flag: '🇰🇭', name: 'Cambodia' }
    }
    return { flag: '🇰🇭', name: 'Cambodia' }
  }

  return (
    <div className="w-full bg-card rounded-2xl border border-border/80 shadow-2xs overflow-hidden transition-all">
      {/* Table Header Details */}
      <div className="px-5 py-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {t('employees.payroll_register_title', 'Global Payroll Register & Audit Ledger')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'employees.payroll_register_sub',
              'Review calculated gross earnings, tax withholdings, and net disbursements per employee'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
            {payrolls.length} {t('employees.records_loaded', 'records displayed')}
          </span>
        </div>
      </div>

      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table border-collapse">
          <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 text-xs font-bold text-muted-foreground">
            <tr>
              {handleSelectRow && (
                <th className="w-10 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected
                    }}
                    onChange={handleToggleAll}
                    className="checkbox h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500/20 cursor-pointer"
                  />
                </th>
              )}

              {/* Employee */}
              {isColVisible('employee') && (
                <th
                  className="cursor-pointer select-none px-4 py-3 text-left"
                  onClick={() => handleSort?.('employee_id')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('employees.employee_name', 'Employee')}</span>
                    {getSortIndicator('employee_id')}
                  </div>
                </th>
              )}

              {/* Country */}
              {isColVisible('country') && (
                <th className="px-4 py-3 text-left">
                  <span>{t('employees.country_col', 'Country')}</span>
                </th>
              )}

              {/* Currency */}
              {isColVisible('currency') && (
                <th className="px-4 py-3 text-left">
                  <span>{t('employees.currency_col', 'Currency')}</span>
                </th>
              )}

              {/* Department */}
              {isColVisible('department') && (
                <th className="px-4 py-3 text-left">
                  <span>{t('employees.departments', 'Department')}</span>
                </th>
              )}

              {/* Basic Salary */}
              {isColVisible('basic_salary') && (
                <th
                  className="cursor-pointer select-none px-4 py-3 text-left"
                  onClick={() => handleSort?.('basic_salary')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('employees.basic_salary_col', 'Basic')}</span>
                    {getSortIndicator('basic_salary')}
                  </div>
                </th>
              )}

              {/* Allowances */}
              {isColVisible('allowances') && (
                <th className="px-4 py-3 text-left">
                  <span>{t('employees.allowances_sum', 'Allowances')}</span>
                </th>
              )}

              {/* Overtime */}
              {isColVisible('overtime') && (
                <th className="px-4 py-3 text-left">
                  <span>{t('employees.overtime_sum', 'Overtime')}</span>
                </th>
              )}

              {/* Deductions */}
              {isColVisible('deductions') && (
                <th className="px-4 py-3 text-left">
                  <span>{t('employees.deductions_sum', 'Deductions')}</span>
                </th>
              )}

              {/* Tax */}
              {isColVisible('tax') && (
                <th className="px-4 py-3 text-left">
                  <span>{t('employees.statutory_tax_sum', 'Tax')}</span>
                </th>
              )}

              {/* Net Salary */}
              {isColVisible('net_salary') && (
                <th
                  className="cursor-pointer select-none px-4 py-3 text-left"
                  onClick={() => handleSort?.('net_salary')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('employees.net_salary_col', 'Net Salary')}</span>
                    {getSortIndicator('net_salary')}
                  </div>
                </th>
              )}

              {/* Status */}
              {isColVisible('status') && (
                <th className="px-4 py-3 text-left">
                  <span>{t('common.status', 'Status')}</span>
                </th>
              )}

              {/* Actions */}
              <th className="text-right py-3.5 px-4">{t('common.actions', 'Action')}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60 text-xs">
            {isLoading ? (
              <LoadingSkeleton cols={13} />
            ) : payrolls.length === 0 ? (
              <EmptyState cols={13} message={t('employees.no_payrolls_found', 'No payroll records found')} />
            ) : (
              payrolls.map((row: any) => {
                const isSelected = selectedRows.includes(row.id)
                const emp = row.employee || {}
                const empName = emp.name || row.employee_name || 'Staff Member'
                const empCode = emp.employee_number || emp.code || `EMP-${String(row.employee_id || row.id).padStart(4, '0')}`
                const deptName = emp.department?.name || row.department_name || 'General'
                const posName = emp.position?.name || row.position_name || ''
                const currency = (row.currency || 'USD').toUpperCase()
                const country = getCountryInfo(row)

                const basic = Number(row.basic_salary || 0)
                const allowances = Number(row.allowances || 0)
                const overtime = Number(row.overtime_pay || 0)
                const deductions = Number(row.deductions || 0) + Number(row.nssf_deduction || 0)
                const tax = Number(row.tax_deduction || 0)
                const net = Number(row.net_salary || 0)

                const isProtected = row.status === 'paid'

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-muted/40 transition-colors group ${
                      isSelected ? 'bg-teal-50/20 dark:bg-teal-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    {handleSelectRow && (
                      <td
                        className="w-10 px-4 text-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectRow(row.id)
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleSelectRow(row.id)}
                          className="checkbox h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500/20 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Employee Name & ID */}
                    {isColVisible('employee') && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-foreground font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {empName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                              {empName}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => copyRef(e, row.id, empCode)}
                              className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors group/copy mt-0.5 cursor-pointer"
                              title={t('common.copy', 'Copy ID')}
                            >
                              <span>{empCode}</span>
                              {copiedId === row.id ? (
                                <Check size={10} className="text-emerald-500" />
                              ) : (
                                <Copy size={10} className="opacity-40 group-hover/copy:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Country */}
                    {isColVisible('country') && (
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                      </td>
                    )}

                    {/* Currency */}
                    {isColVisible('currency') && (
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-700">
                          {currency}
                        </span>
                      </td>
                    )}

                    {/* Department & Position */}
                    {isColVisible('department') && (
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {deptName}
                        </span>
                        {posName && (
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {posName}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Basic */}
                    {isColVisible('basic_salary') && (
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(basic)}
                      </td>
                    )}

                    {/* Allowances */}
                    {isColVisible('allowances') && (
                      <td className="py-3 px-4 font-mono text-xs text-foreground whitespace-nowrap">
                        {allowances > 0 ? `+${formatCurrency(allowances)}` : '—'}
                      </td>
                    )}

                    {/* Overtime */}
                    {isColVisible('overtime') && (
                      <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {overtime > 0 ? `+${formatCurrency(overtime)}` : '—'}
                      </td>
                    )}

                    {/* Deductions */}
                    {isColVisible('deductions') && (
                      <td className="py-3 px-4 font-mono text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {deductions > 0 ? `-${formatCurrency(deductions)}` : '—'}
                      </td>
                    )}

                    {/* Tax */}
                    {isColVisible('tax') && (
                      <td className="py-3 px-4 font-mono text-xs text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {tax > 0 ? `-${formatCurrency(tax)}` : '—'}
                      </td>
                    )}

                    {/* Net Salary */}
                    {isColVisible('net_salary') && (
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(net)}
                        </div>
                        {currency === 'USD' && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            ~ {Math.round(net * 4100).toLocaleString()} ៛
                          </div>
                        )}
                      </td>
                    )}

                    {/* Status */}
                    {isColVisible('status') && (
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            row.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : row.status === 'approved'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : row.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'paid'
                                ? 'bg-emerald-500'
                                : row.status === 'approved'
                                ? 'bg-blue-500'
                                : row.status === 'pending'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>
                            {row.status === 'paid'
                              ? t('employees.status_processed', 'Processed')
                              : row.status === 'approved'
                              ? t('employees.status_approved', 'Approved')
                              : row.status === 'pending'
                              ? t('employees.status_pending', 'Pending')
                              : t('employees.status_on_hold', 'On Hold')}
                          </span>
                        </span>
                      </td>
                    )}

                    {/* Actions Column */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <RowActionGroup align="right">
                        {/* View Payslip */}
                        <ViewRowButton
                          onClick={() => onViewPayslip(row)}
                          title={t('employees.view_payslip', 'View Payslip')}
                        />

                        {/* Print Payslip */}
                        {onPrintPayslip && (
                          <RowActionButton
                            icon={<Printer size={14} className="stroke-[1.9]" />}
                            onClick={() => onPrintPayslip(row)}
                            title={t('employees.print_payslip', 'Print Payslip')}
                            variant="default"
                          />
                        )}

                        {/* Edit */}
                        {openEditModal && (
                          <EditRowButton
                            onClick={() => openEditModal(row)}
                            title={t('employees.edit_payroll', 'Edit Payroll')}
                          />
                        )}

                        {/* Delete */}
                        {handleDelete && !isProtected && (
                          <DeleteRowButton
                            onClick={() => handleDelete(row.id, empName)}
                            title={t('employees.delete_payroll', 'Delete')}
                          />
                        )}
                      </RowActionGroup>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  )
}

export default PayrollTable
