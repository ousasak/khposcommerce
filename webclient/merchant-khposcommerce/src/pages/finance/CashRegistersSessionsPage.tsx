import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { financeService } from '@/services/financeService'
import { useToast } from '@/hooks/useToast'
import { usePermission } from '@/hooks/usePermission'
import { useServerPagination } from '@/hooks/useServerPagination'
import { downloadCsv } from '@/utils/export'
import { Breadcrumb } from '@/components/common'
import { HeaderActionsGroup, AddButton, ExportButton, ConfirmModal } from '@/components/common'
import { focusFirstInvalidField } from '@/utils/formValidation'
import Pagination from '@/components/shared/Pagination'
import type { RegisterForm } from './types/finance.types'
import {
  CashRegistersSessionsFormDrawer,
  CashRegistersSessionsCloseModal,
  CashRegistersSessionsTable,
  CashRegisterSearchBar,
} from './components'

export const CashRegistersSessionsPage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  // Permissions
  const canCreateRegister = hasPermission('cash_register.create')
  const canUpdateRegister = hasPermission('cash_register.update')
  const canDeleteRegister = hasPermission('cash_register.delete')
  const canManageRegister = hasPermission('cash_register.manage')

  // Pagination & Search
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'finance_registers' })

  // Filters
  const [filterStatus, setFilterStatus] = useState('')

  // Visible Columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    register_title: true,
    register_opening: true,
    register_sales: true,
    register_balance: true,
    register_status: true,
  })

  // Drawer & Form State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [closeRegisterModalItem, setCloseRegisterModalItem] = useState<any | null>(null)
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    title: '',
    status: 'open',
    opening_balance: '0',
    closing_balance: '0',
    branch_id: '1',
    store_id: '1',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name?: string }>({
    open: false,
    id: null,
    name: '',
  })

  // Query
  const {
    data: registersData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['cash-registers-tab', page, debouncedSearch, perPage, filterStatus],
    queryFn: () =>
      financeService.getCashRegisters({
        page,
        search: debouncedSearch,
        per_page: perPage,
        status: filterStatus || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const registers = registersData?.data ?? []
  const pagination = registersData?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: RegisterForm) => {
      if (editingItem) {
        return financeService.updateCashRegister(editingItem.id, payload)
      } else {
        return financeService.createCashRegister({ ...payload, company_id: 1 })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-registers-tab'] })
      qc.invalidateQueries({ queryKey: ['all-registers-stats'] })
      toast.success(editingItem ? t('finance.update_success', 'Updated successfully.') : t('finance.save_success', 'Saved successfully.'))
      setDrawerOpen(false)
      setEditingItem(null)
    },
    onError: (err: any) => {
      const apiErrors = err?.response?.data?.errors
      if (apiErrors && typeof apiErrors === 'object') {
        const fieldErrors: Record<string, string> = {}
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key]
        })
        setErrors(fieldErrors)
        focusFirstInvalidField(fieldErrors)
        return
      }
      toast.error(err?.response?.data?.message ?? t('finance.save_error', 'Failed to save details.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deleteCashRegister(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-registers-tab'] })
      qc.invalidateQueries({ queryKey: ['all-registers-stats'] })
      toast.success(t('finance.delete_success', 'Record deleted successfully.'))
      setDeleteConfirm({ open: false, id: null, name: '' })
      adjustAfterDelete(1)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete record.'))
    },
  })

  const closeRegisterMutation = useMutation({
    mutationFn: ({ id, note, actualCash }: { id: number; closingBalance: number; note: string; actualCash: number }) =>
      financeService.updateCashRegister(id, {
        status: 'closed',
        closing_balance: actualCash,
        closing_note: note,
        notes: note,
        closed_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-registers-tab'] })
      qc.invalidateQueries({ queryKey: ['all-registers-stats'] })
      toast.success(t('finance.close_register_success', 'Cash register shift closed successfully.'))
      setCloseRegisterModalItem(null)
    },
    onError: () => toast.error(t('finance.save_error', 'Failed to close register shift.')),
  })

  // Handlers
  const openCreateDrawer = () => {
    setEditingItem(null)
    setRegisterForm({
      title: '',
      status: 'open',
      opening_balance: '0',
      closing_balance: '0',
      branch_id: '1',
      store_id: '1',
      notes: '',
    })
    setErrors({})
    setDrawerOpen(true)
  }

  const openEditDrawer = (item: any) => {
    setEditingItem(item)
    setRegisterForm({
      title: item.title || item.name || '',
      status: item.status || 'open',
      opening_balance: String(item.opening_balance ?? '0'),
      closing_balance: String(item.closing_balance ?? '0'),
      branch_id: String(item.branch_id || '1'),
      store_id: String(item.store_id || '1'),
      notes: item.notes || '',
    })
    setErrors({})
    setDrawerOpen(true)
  }

  const handleSaveRegister = () => {
    if (!registerForm.title.trim()) {
      const newErrors = { title: t('finance.register_title_required', 'សូមបញ្ចូលឈ្មោះម៉ាស៊ីនគិតប្រាក់') }
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }
    saveMutation.mutate(registerForm)
  }

  const handleExportCsv = () => {
    const toastId = toast.loading(t('finance.exporting', 'Exporting CSV dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('finance.register_title', 'Register Title'),
          t('finance.opening_balance', 'Opening Balance'),
          t('finance.closing_balance', 'Closing Balance'),
          t('finance.cash_sales', 'Cash Sales'),
          t('finance.status_col', 'Status'),
        ]
        const rows = (registers || []).map((reg: any) => [
          reg.title || reg.name || `Register #${reg.id}`,
          Number(reg.opening_balance || 0).toFixed(2),
          Number(reg.closing_balance || 0).toFixed(2),
          Number(reg.cash_sales_amount || 0).toFixed(2),
          reg.status === 'open' ? t('finance.status_open', 'Open') : t('finance.status_closed', 'Closed'),
        ])
        downloadCsv('finance_registers', headers, rows)
        toast.dismiss(toastId)
        toast.success(t('finance.export_success', 'Dataset exported successfully.'))
      } catch {
        toast.dismiss(toastId)
        toast.error(t('finance.export_error', 'Failed to export dataset.'))
      }
    }, 300)
  }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.financeManagement', t('finance.financial_management', 'Finance')), path: '/finance/expenses' },
          { label: t('finance.registers_title', 'Cash Registers') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.registers_title', 'Cash Registers (Till Drawers)')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('finance.registers_subtitle', 'Monitor POS till balances, shift opening reserves, and closing reconciliations.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCsv}
            label={t('finance.export_csv', 'Export CSV')}
          />
          {canCreateRegister && (
            <AddButton
              onClick={openCreateDrawer}
              label={t('finance.add_register', 'Open Cash Register')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* SmartHR-Style Cash Registers Filter Bar */}
      <CashRegisterSearchBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        statusFilter={filterStatus}
        onStatusChange={(val) => {
          setFilterStatus(val)
          setPage(1)
        }}
        onApply={() => {
          setPage(1)
          qc.invalidateQueries({ queryKey: ['cash-registers-tab'] })
        }}
        onReset={() => {
          setSearch('')
          setFilterStatus('')
          setPage(1)
        }}
        columns={[
          { key: 'register_title', label: t('finance.register_title', 'Register Title') },
          { key: 'register_opening', label: t('finance.opening_balance', 'Opening Balance') },
          { key: 'register_sales', label: t('finance.cash_sales', 'Cash Sales') },
          { key: 'register_balance', label: t('finance.current_balance', 'Current Balance') },
          { key: 'register_status', label: t('finance.status_col', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Registers Table */}
      <CashRegistersSessionsTable
        registers={registers}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        openEditDrawer={canUpdateRegister ? openEditDrawer : undefined}
        handleDelete={canDeleteRegister ? (id, name) => setDeleteConfirm({ open: true, id, name }) : undefined}
        onCloseShift={canManageRegister ? (reg) => setCloseRegisterModalItem(reg) : undefined}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      {/* Form Drawer */}
      <CashRegistersSessionsFormDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setErrors({})
        }}
        editingItem={editingItem}
        onSubmit={handleSaveRegister}
        isPending={saveMutation.isPending}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        errors={errors}
        onClearError={handleClearError}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.open}
        variant="danger"
        actionType="delete"
        title={t('finance.delete_confirm_title', 'Delete Record')}
        message={t('finance.delete_confirm_msg', 'Are you sure you want to delete this record? This action cannot be undone.')}
        itemName={deleteConfirm.name}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteConfirm.id && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: '' })}
      />

      {/* Cash Register Shift Close & Reconciliation Modal */}
      <CashRegistersSessionsCloseModal
        register={closeRegisterModalItem}
        isOpen={Boolean(closeRegisterModalItem)}
        onClose={() => setCloseRegisterModalItem(null)}
        onConfirmClose={(data) => closeRegisterMutation.mutate(data)}
        isSubmitting={closeRegisterMutation.isPending}
      />
    </div>
  )
}

export const FinanceCashRegistersPage = CashRegistersSessionsPage
export default CashRegistersSessionsPage
