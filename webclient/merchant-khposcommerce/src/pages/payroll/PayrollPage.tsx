import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  FileSpreadsheet,
  Plus,
  Landmark,
  Calculator,
  Download,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Home,
  ChevronRight,
} from 'lucide-react'
import { employeeService } from '@/services/employeeService'
import { companyService } from '@/services/companyService'
import { usePermission } from '@/hooks/usePermission'
import { useToast } from '@/hooks/useToast'
import { DeleteConfirmDialog, LoadingSpinner } from '@/components/common'
import Pagination from '@/components/shared/Pagination'

import {
  PayrollSettlementCycleBanner,
  PayrollSummaryStatsCards,
  PayrollMultiCurrencyLedger,
  PayrollSearchBar,
  PayrollTable,
  PayrollPayslipModal,
  PayrollFormDrawer,
} from './components'

// Reuse existing AutoGenerate & ABA Bulk Export modals
import AutoGeneratePayrollModal from '@/pages/employees/components/AutoGeneratePayrollModal'
import AbaBulkExportModal from '@/pages/employees/components/AbaBulkExportModal'

interface PayrollPageProps {
  isTab?: boolean
}

const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
  employee: true,
  country: true,
  currency: true,
  department: true,
  basic_salary: true,
  allowances: true,
  overtime: true,
  deductions: true,
  tax: true,
  net_salary: true,
  status: true,
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ isTab = false }) => {
  const { t } = useTranslation(['employees', 'common'])
  const { hasPermission } = usePermission()
  const toast = useToast()
  const qc = useQueryClient()

  // Permissions
  const canCreate = hasPermission('payroll.create')
  const canEdit = hasPermission('payroll.edit')
  const canDelete = hasPermission('payroll.delete')
  const canExport = hasPermission('payroll.export')

  // Search & Filter state
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [currency, setCurrency] = useState('')
  const [status, setStatus] = useState('')
  const [periodMonth, setPeriodMonth] = useState(
    new Date().toISOString().substring(0, 7) // e.g. "2026-09"
  )
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Table Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(DEFAULT_VISIBLE_COLUMNS)

  const tableColumns = useMemo(
    () => [
      { key: 'employee', label: t('employees.table_employee', 'Employee') },
      { key: 'country', label: t('employees.table_country', 'Country') },
      { key: 'currency', label: t('employees.table_currency', 'Currency') },
      { key: 'department', label: t('employees.table_dept_role', 'Department & Role') },
      { key: 'basic_salary', label: t('employees.table_basic', 'Basic Salary') },
      { key: 'allowances', label: t('employees.table_allowances', 'Allowances') },
      { key: 'overtime', label: t('employees.table_overtime', 'Overtime') },
      { key: 'deductions', label: t('employees.table_deductions', 'Deductions') },
      { key: 'tax', label: t('employees.table_tax', 'Tax (14.2%)') },
      { key: 'net_salary', label: t('employees.table_net_salary', 'Net Salary') },
      { key: 'status', label: t('employees.table_status', 'Status') },
    ],
    [t]
  )

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Modals & Drawers State
  const [payslipModalOpen, setPayslipModalOpen] = useState(false)
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null)

  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<any | null>(null)

  const [autoPayrollModalOpen, setAutoPayrollModalOpen] = useState(false)
  const [abaModalOpen, setAbaModalOpen] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any | null>(null)

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  // Fetch Departments for Filter Dropdown
  const { data: deptData } = useQuery({
    queryKey: ['departments-list'],
    queryFn: () => employeeService.departments({ per_page: 100 }),
  })
  const departments = deptData?.data || []

  // Fetch Branches for AutoGenerate modal
  const { data: branchData } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.branches({ per_page: 50 }),
  })
  const branchesList = branchData?.data || []

  // Build Query Params for Payrolls
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      per_page: perPage,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
    if (search.trim()) params.search = search.trim()
    if (departmentId) params.department_id = departmentId
    if (currency) params.currency = currency
    if (status) params.status = status
    if (periodMonth) params.period_month = periodMonth
    return params
  }, [page, perPage, sortBy, sortOrder, search, departmentId, currency, status, periodMonth])

  // Fetch Payroll Data
  const {
    data: payrollResponse,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['payrolls', queryParams],
    queryFn: () => employeeService.payrolls(queryParams),
  })

  const payrolls = payrollResponse?.data || []
  const paginationMeta = payrollResponse?.meta || {
    current_page: page,
    last_page: 1,
    per_page: perPage,
    total: payrolls.length,
    from: payrolls.length > 0 ? 1 : 0,
    to: payrolls.length,
  }

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeService.deletePayroll(id),
    onSuccess: () => {
      toast.success(t('employees.payroll_deleted_success', 'Payroll record deleted successfully!'))
      qc.invalidateQueries({ queryKey: ['payrolls'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete payroll record')
    },
  })

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => employeeService.bulkDeletePayrolls(ids),
    onSuccess: () => {
      toast.success(t('employees.bulk_deleted_success', 'Selected payroll records deleted successfully!'))
      setSelectedIds([])
      qc.invalidateQueries({ queryKey: ['payrolls'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      setBulkDeleteDialogOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to bulk delete payroll records')
    },
  })

  // Handlers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (allIds: number[]) => {
    setSelectedIds(allIds)
  }

  const handleResetFilters = () => {
    setSearch('')
    setDepartmentId('')
    setCurrency('')
    setStatus('')
    setPeriodMonth(new Date().toISOString().substring(0, 7))
    setPage(1)
  }

  const handleViewPayslip = (payroll: any) => {
    setSelectedPayrollId(payroll.id)
    setPayslipModalOpen(true)
  }

  const handlePrintPayslip = (payroll: any) => {
    setSelectedPayrollId(payroll.id)
    setPayslipModalOpen(true)
  }

  const handleEditPayroll = (payroll: any) => {
    setEditingPayroll(payroll)
    setFormDrawerOpen(true)
  }

  const handleDeletePayroll = (payroll: any) => {
    setItemToDelete(payroll)
    setDeleteDialogOpen(true)
  }

  const handleExportRegister = async () => {
    try {
      toast.info(t('employees.preparing_export', 'Exporting Global Payroll register...'))
      const response = await employeeService.exportPayrolls(queryParams)
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `global-payroll-${periodMonth || 'register'}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success(t('employees.export_success', 'Global Payroll register exported successfully!'))
    } catch {
      toast.error(t('employees.export_error', 'Failed to export payroll register'))
    }
  }

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* SmartHR Page Header */}
      {!isTab && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1.5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="hover:text-foreground transition-colors cursor-pointer inline-flex items-center gap-1">
                <Home size={12} />
                <span>{t('employees.home', 'Home')}</span>
              </span>
              <ChevronRight size={12} className="text-muted-foreground/60" />
              <span className="hover:text-foreground transition-colors cursor-pointer">
                {t('employees.hr_management', 'HR Management')}
              </span>
              <ChevronRight size={12} className="text-muted-foreground/60" />
              <span className="text-foreground font-semibold">
                {t('employees.global_payroll', 'Global Payroll')}
              </span>
            </div>

            {/* Title & Cycle Status Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {t('employees.global_payroll_control_center', 'Global Payroll Control Center')}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>
                  {t('employees.cycle_status_active', 'Cycle: {{month}} · Active Run', {
                    month: periodMonth || 'Current Cycle',
                  })}
                </span>
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {t(
                'employees.global_payroll_subtitle',
                'Execute multi-currency payroll disbursements, audit statutory deductions, and manage compliance across 14 international operational hubs.'
              )}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-end">
            {/* Export Register Button */}
            {canExport && (
              <button
                type="button"
                onClick={handleExportRegister}
                className="px-3.5 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-semibold inline-flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                title={t('employees.export_register_tooltip', 'Export Global Payroll Register to CSV')}
              >
                <Download size={14} className="text-muted-foreground" />
                <span>{t('employees.export_register', 'Export Register')}</span>
              </button>
            )}

            {/* ABA Bulk Export Button */}
            {canExport && (
              <button
                type="button"
                onClick={() => setAbaModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                title={t('employees.export_aba_tooltip', 'Export Corporate ABA Bank Payment CSV')}
              >
                <Landmark size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{t('employees.export_aba_bulk', 'ABA Bulk CSV')}</span>
              </button>
            )}

            {/* Manual New Payroll */}
            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  setEditingPayroll(null)
                  setFormDrawerOpen(true)
                }}
                className="px-3.5 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>{t('employees.create_single_slip', 'Manual Slip')}</span>
              </button>
            )}

            {/* Auto-Generate / Run Monthly Payroll Button */}
            {canCreate && (
              <button
                type="button"
                onClick={() => setAutoPayrollModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Calculator size={15} />
                <span>{t('employees.settlement_finalized', '+ Run Monthly Payroll')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Settlement Cycle Banner */}
      <PayrollSettlementCycleBanner
        periodMonth={periodMonth}
        totalEmployees={paginationMeta.total || 0}
        processedEmployees={payrolls.length}
        pendingCount={payrolls.filter((p: any) => p.status === 'draft' || !p.status).length}
        settlementDate="Sep 30, 2026"
        status="settled"
      />

      {/* 2. Summary Stats Cards (6 Cards, cursor-default select-none) */}
      <PayrollSummaryStatsCards
        countryCount={28}
        currencyGroupCount={9}
        avgTaxPercent={14.2}
        benefitsPercent={6.8}
        overtimeStaffCount={payrolls.filter((p: any) => Number(p.overtime_pay || 0) > 0).length || 38}
        auditExceptionsCount={payrolls.filter((p: any) => p.status === 'draft').length || 5}
      />

      {/* 3. Multi-Currency Breakdown & Ledger */}
      <PayrollMultiCurrencyLedger
        payrolls={payrolls}
        selectedCurrency={currency}
        onSelectCurrency={(curr) => setCurrency(curr === 'ALL' ? '' : curr)}
      />

      {/* 4. Search and Filter Inline Toolbar */}
      <PayrollSearchBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        departmentFilter={departmentId}
        onDepartmentChange={(v) => {
          setDepartmentId(v)
          setPage(1)
        }}
        departments={departments}
        currencyFilter={currency}
        onCurrencyChange={(v) => {
          setCurrency(v)
          setPage(1)
        }}
        statusFilter={status}
        onStatusChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
        monthFilter={periodMonth}
        onMonthChange={(v) => {
          setPeriodMonth(v)
          setPage(1)
        }}
        onApply={() => {
          setPage(1)
          refetch()
        }}
        onReset={handleResetFilters}
        columns={tableColumns}
        visibleColumns={visibleColumns}
        defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
        onColumnChange={setVisibleColumns}
        selectedCount={selectedIds.length}
        onBulkDelete={() => setBulkDeleteDialogOpen(true)}
      />

      {/* 5. Main Payroll Register Table */}
      <PayrollTable
        payrolls={payrolls}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        selectedRows={selectedIds}
        handleSelectRow={handleSelectRow}
        handleSelectAll={handleSelectAll}
        handleSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onViewPayslip={handleViewPayslip}
        onPrintPayslip={handlePrintPayslip}
        openEditModal={canEdit ? handleEditPayroll : undefined}
        handleDelete={
          canDelete
            ? (id) => {
                const item = payrolls.find((p: any) => p.id === id)
                handleDeletePayroll(item || { id })
              }
            : undefined
        }
      />

      {/* 6. Pagination Controls */}
      {paginationMeta.total > 0 && (
        <Pagination
          currentPage={paginationMeta.current_page}
          lastPage={paginationMeta.last_page}
          total={paginationMeta.total}
          perPage={perPage}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(pp) => {
            setPerPage(pp)
            setPage(1)
          }}
        />
      )}

      {/* Modals & Drawers */}

      {/* 1. Official Payslip Modal */}
      <PayrollPayslipModal
        isOpen={payslipModalOpen}
        onClose={() => {
          setPayslipModalOpen(false)
          setSelectedPayrollId(null)
        }}
        payrollId={selectedPayrollId}
      />

      {/* 2. Create / Edit Payroll Form Drawer */}
      <PayrollFormDrawer
        isOpen={formDrawerOpen}
        onClose={() => {
          setFormDrawerOpen(false)
          setEditingPayroll(null)
        }}
        initialData={editingPayroll}
      />

      {/* 3. Auto Generate Payroll Modal */}
      <AutoGeneratePayrollModal
        isOpen={autoPayrollModalOpen}
        onClose={() => setAutoPayrollModalOpen(false)}
        branchesList={branchesList}
        onOpenAbaExport={(month) => {
          setAutoPayrollModalOpen(false)
          setPeriodMonth(month)
          setAbaModalOpen(true)
        }}
      />

      {/* 4. ABA Bulk Export Modal */}
      <AbaBulkExportModal
        isOpen={abaModalOpen}
        onClose={() => setAbaModalOpen(false)}
        initialMonth={periodMonth}
      />

      {/* 5. Delete Single Payroll Confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        title={t('employees.delete_payroll_title', 'Delete Payroll Record')}
        itemName={
          itemToDelete?.employee?.name ||
          (itemToDelete ? `#${itemToDelete.id} (${itemToDelete.period_month})` : '')
        }
        warningText={t(
          'employees.delete_payroll_warning',
          'Are you sure you want to delete this payroll record? This will permanently erase the salary calculation and tax ledger entry for this employee.'
        )}
        isPending={deleteMutation.isPending}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setItemToDelete(null)
        }}
        onSoftDelete={() => {
          if (itemToDelete?.id) {
            deleteMutation.mutate(itemToDelete.id)
          }
        }}
      />

      {/* 6. Bulk Delete Payroll Confirmation */}
      <DeleteConfirmDialog
        isOpen={bulkDeleteDialogOpen}
        title={t('employees.bulk_delete_payrolls_title', 'Delete Selected Payroll Records')}
        itemName={`${selectedIds.length} ${t('employees.payrolls_entries', 'payroll records')}`}
        warningText={t(
          'employees.bulk_delete_warning',
          'Are you sure you want to bulk delete the selected payroll records? This action cannot be undone.'
        )}
        isPending={bulkDeleteMutation.isPending}
        onCancel={() => setBulkDeleteDialogOpen(false)}
        onSoftDelete={() => {
          if (selectedIds.length > 0) {
            bulkDeleteMutation.mutate(selectedIds)
          }
        }}
      />
    </div>
  )
}

export default PayrollPage
