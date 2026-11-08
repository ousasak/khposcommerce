import React, { useState, useMemo } from 'react'
import {
  Copy,
  Check,
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
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
import { formatCurrency, formatShortDate } from '@/utils/formatters'
import { getStorageFileUrl } from '@/utils/image'
import { useToast } from '@/hooks/useToast'
import ExpensesSpendingDetailModal from './ExpensesSpendingDetailModal'

export interface ExpensesSpendingTableProps {
  expenses: any[]
  allExpenses?: any[]
  categories?: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer?: (row: any) => void
  handleDelete?: (id: number, name?: string) => void
  renderSortIcon: (field: string) => React.ReactNode
  handleSort: (field: string) => void
  selectedRows?: number[]
  handleSelectRow?: (id: number) => void
  handleSelectAll?: (allIds: number[]) => void
  activeCategoryFilter?: string
  setActiveCategoryFilter?: (catId: string) => void
  onPrintVoucher?: (expense: any) => void
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
}

export const ExpensesSpendingTable: React.FC<ExpensesSpendingTableProps> = ({
  expenses = [],
  allExpenses = [],
  categories = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditDrawer,
  handleDelete,
  renderSortIcon,
  handleSort,
  selectedRows = [],
  handleSelectRow,
  handleSelectAll,
  activeCategoryFilter = '',
  setActiveCategoryFilter,
  onPrintVoucher,
  onApprove,
  onReject,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const currentLocale = i18n.language === 'km' ? 'km-KH' : i18n.language
  const isKhmer = i18n.language === 'km' || i18n.language?.startsWith('km')
  const toast = useToast()

  const [viewExpense, setViewExpense] = useState<any | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const copyRef = (e: React.MouseEvent, id: number, text: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(t('common.copied', 'Copied to clipboard!'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter based on selected quick category filter pill
  const displayedExpenses = useMemo(() => {
    if (!activeCategoryFilter) return expenses
    return expenses.filter((item: any) => {
      const catId = item.expense_category_id || item.category?.id || item.category_id
      return String(catId) === String(activeCategoryFilter)
    })
  }, [expenses, activeCategoryFilter])

  const allDisplayedIds = useMemo(() => {
    return displayedExpenses.map((exp: any) => exp.id)
  }, [displayedExpenses])

  const isAllSelected = allDisplayedIds.length > 0 && allDisplayedIds.every((id: number) => selectedRows.includes(id) || selectedRows.includes(Number(id)))
  const isSomeSelected = allDisplayedIds.some((id: number) => selectedRows.includes(id) || selectedRows.includes(Number(id))) && !isAllSelected

  const handleToggleAll = () => {
    if (handleSelectAll) {
      handleSelectAll(allDisplayedIds)
    }
  }

  return (
    <div className="space-y-4 print:p-0">
      {/* ─── Main Expenses Table Wrapper ─── */}
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table border-collapse">
              <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
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
                        className="checkbox h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </th>
                  )}
                  {visibleColumns.expense_title && (
                    <th className="cursor-pointer select-none px-4 py-3 text-left" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-1.5">
                        <span>{t('finance.title_col', 'Expense Details')}</span>
                        {renderSortIcon('title')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.expense_category && (
                    <th className="cursor-pointer select-none px-4 py-3 text-left" onClick={() => handleSort('expense_category_id')}>
                      <div className="flex items-center gap-1.5">
                        <span>{t('finance.category_col', 'Category')}</span>
                        {renderSortIcon('expense_category_id')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.expense_amount && (
                    <th className="cursor-pointer select-none px-4 py-3 text-left" onClick={() => handleSort('amount')}>
                      <div className="flex items-center gap-1.5">
                        <span>{t('finance.amount_col', 'Amount ($)')}</span>
                        {renderSortIcon('amount')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.expense_status && (
                    <th className="cursor-pointer select-none px-4 py-3 text-left" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1.5">
                        <span>{t('finance.status_col', 'Status')}</span>
                        {renderSortIcon('status')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.expense_date && (
                    <th className="cursor-pointer select-none px-4 py-3 text-left" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1.5">
                        <span>{t('finance.date_col', 'Date')}</span>
                        {renderSortIcon('date')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.expense_receipt && (
                    <th className="text-center px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{t('finance.receipt', 'Receipt')}</span>
                      </div>
                    </th>
                  )}
                  <th className="text-right py-3.5 px-4">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <LoadingSkeleton cols={8} />
                ) : displayedExpenses.length === 0 ? (
                  <EmptyState cols={8} message={t('finance.no_data_expenses', 'No expense records found.')} />
                ) : (
                  displayedExpenses.map((row: any) => {
                    const categoryName = row.category?.name || (typeof row.expense_category === 'object' ? row.expense_category?.name : row.expense_category) || t('finance.category_general', 'General')
                    const refCode = row.reference_number || `EXP-${String(row.id).padStart(5, '0')}`
                    const isSelected = selectedRows.includes(row.id) || selectedRows.includes(Number(row.id))
                    const amountVal = Number(row.amount || 0)

                    const isPending = row.status === 'pending'
                    const isProtectedStatus = row.status === 'approved' || row.status === 'paid'

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-muted/40 transition-colors group ${
                          isSelected ? 'bg-primary/5' : ''
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
                              className="checkbox h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                            />
                          </td>
                        )}

                        {/* Title & Ref Column */}
                        {visibleColumns.expense_title && (
                          <td className="py-3 px-4">
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                {row.title || `Expense #${row.id}`}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyRef(e, row.id, refCode)
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors group/copy"
                                  title={t('common.copy', 'Click to copy reference')}
                                >
                                  <span>{refCode}</span>
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

                        {/* Category Column */}
                        {visibleColumns.expense_category && (
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-muted text-foreground text-xs font-semibold border border-border">
                              {categoryName}
                            </span>
                            {row.branch?.name && (
                              <span className="block text-[10px] text-muted-foreground mt-0.5 font-medium">
                                {row.branch.name}
                              </span>
                            )}
                          </td>
                        )}

                        {/* Amount Column (Dual USD and KHR) */}
                        {visibleColumns.expense_amount && (
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                              -{formatCurrency(amountVal, { locale: currentLocale })}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono font-medium mt-0.5">
                              ~ {Math.round(amountVal * 4100).toLocaleString()} ៛
                            </div>
                          </td>
                        )}

                        {/* Status Column */}
                        {visibleColumns.expense_status && (
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                              row.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : row.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}>
                              {row.status === 'approved'
                                ? t('finance.status_approved', 'Approved')
                                : row.status === 'pending'
                                ? t('finance.status_pending', 'Pending')
                                : t('finance.status_rejected', 'Rejected')}
                            </span>
                          </td>
                        )}

                        {/* Date Column */}
                        {visibleColumns.expense_date && (
                          <td className="py-3 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                            {row.date ? formatShortDate(row.date) : '—'}
                          </td>
                        )}

                        {/* Receipt Attachment Column */}
                        {visibleColumns.expense_receipt && (
                          <td className="py-3 text-center">
                            {row.receipt ? (
                              <a
                                href={getStorageFileUrl(row.receipt)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                              >
                                <FileText size={12} />
                                <span>{t('finance.receipt_view', 'Receipt')}</span>
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                        )}

                        {/* Actions Column (SmartHR RowActionGroup with Soft Drop Shadow) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <RowActionGroup align="right">
                            {onPrintVoucher && (
                              <RowActionButton
                                icon={<Printer size={14} className="stroke-[1.9]" />}
                                onClick={() => onPrintVoucher(row)}
                                title={t('finance.print_disbursement_voucher', 'Print Disbursement Voucher')}
                                variant="default"
                              />
                            )}
                            {isPending && onApprove && (
                              <RowActionButton
                                icon={<CheckCircle2 size={14} className="stroke-[2]" />}
                                onClick={() => onApprove(row.id)}
                                title={t('finance.approve_claim', 'Approve Claim')}
                                variant="success"
                              />
                            )}
                            {isPending && onReject && (
                              <RowActionButton
                                icon={<XCircle size={14} className="stroke-[2]" />}
                                onClick={() => onReject(row.id)}
                                title={t('finance.reject_claim', 'Reject Claim')}
                                variant="danger"
                              />
                            )}
                            <ViewRowButton
                              onClick={() => setViewExpense(row)}
                              title={t('finance.view_claim_details', 'View Claim Details')}
                            />
                            {openEditDrawer && (
                              <EditRowButton
                                onClick={() => openEditDrawer(row)}
                                title={t('finance.edit_expense_claim', 'Edit Expense')}
                              />
                            )}
                            {handleDelete && !isProtectedStatus && (
                              <DeleteRowButton
                                onClick={() => handleDelete(row.id, row.title)}
                                title={t('finance.delete_expense_claim', 'Delete Expense')}
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

      {/* ─── Detail Modal ─── */}
      <ExpensesSpendingDetailModal
        isOpen={Boolean(viewExpense)}
        expense={viewExpense}
        onClose={() => setViewExpense(null)}
        onEdit={openEditDrawer}
        onPrintOfficialVoucher={onPrintVoucher}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  )
}

export { ExpensesSpendingTable as ExpensesTable, ExpensesSpendingTable as ExpensesTab }
export default ExpensesSpendingTable
