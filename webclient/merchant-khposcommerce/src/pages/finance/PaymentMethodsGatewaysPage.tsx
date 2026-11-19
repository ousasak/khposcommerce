import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { financeService } from '@/services/financeService'
import { useToast } from '@/hooks/useToast'
import { usePermission } from '@/hooks/usePermission'
import { useServerPagination } from '@/hooks/useServerPagination'
import {
  Breadcrumb,
  ConfirmModal,
} from '@/components/common'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { Button } from '@/components/ui/button'
import Pagination from '@/components/shared/Pagination'
import type { PaymentMethodForm } from './types/finance.types'
import {
  PaymentMethodsGatewaysFormDrawer,
  PaymentMethodsGatewaysCards,
  PaymentMethodSearchBar,
} from './components'

export const PaymentMethodsGatewaysPage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  // Permissions
  const canCreatePaymentMethod = hasPermission('payment_method.create')
  const canUpdatePaymentMethod = hasPermission('payment_method.update')
  const canDeletePaymentMethod = hasPermission('payment_method.delete')

  // Pagination
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'finance_payment_methods' })

  // Tracking toggling method
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Drawer / Dialog Form State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [paymentMethodForm, setPaymentMethodForm] = useState<PaymentMethodForm>({
    name: '',
    code: '',
    type: 'cash',
    fee_percent: '0.00',
    fee_fixed: '0.00',
    available_pos: true,
    available_online: true,
    is_active: true,
    description: '',
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

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    id: number | null
    name?: string
  }>({
    open: false,
    id: null,
    name: '',
  })

  // Query Payment Methods
  const {
    data: paymentMethodsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['payment-methods-tab', page, perPage, search, statusFilter, typeFilter],
    queryFn: () =>
      financeService.getPaymentMethods({
        page,
        per_page: perPage,
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const rawPaymentMethods = paymentMethodsData?.data ?? []
  const paymentMethods = useMemo(() => {
    return rawPaymentMethods.filter((item: any) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = (item.name || '').toLowerCase().includes(q)
        const matchCode = (item.code || '').toLowerCase().includes(q)
        if (!matchName && !matchCode) return false
      }
      if (statusFilter === 'active' && !item.is_active) return false
      if (statusFilter === 'inactive' && item.is_active) return false
      if (typeFilter && item.type !== typeFilter) return false
      return true
    })
  }, [rawPaymentMethods, search, statusFilter, typeFilter])

  const pagination = paymentMethodsData?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: PaymentMethodForm) => {
      if (editingItem) {
        return financeService.updatePaymentMethod(editingItem.id, payload)
      } else {
        return financeService.createPaymentMethod({ ...payload, company_id: 1 })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods-tab'] })
      qc.invalidateQueries({ queryKey: ['payment-methods-select'] })
      qc.invalidateQueries({ queryKey: ['payment-methods-active'] })
      toast.success(
        editingItem
          ? t('finance.update_success', 'Payment method updated successfully.')
          : t('finance.save_success', 'Payment method added successfully.')
      )
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
      toast.error(
        err?.response?.data?.message ?? t('finance.save_error', 'Failed to save payment method.')
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deletePaymentMethod(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods-tab'] })
      qc.invalidateQueries({ queryKey: ['payment-methods-select'] })
      toast.success(t('finance.delete_success', 'Payment method deleted successfully.'))
      setDeleteConfirm({ open: false, id: null, name: '' })
      adjustAfterDelete(1)
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete payment method.')
      )
    },
  })

  const togglePaymentMethodStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => {
      setTogglingId(id)
      return financeService.updatePaymentMethod(id, { is_active: active })
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['payment-methods-tab'] })
      qc.invalidateQueries({ queryKey: ['payment-methods-active'] })
      toast.success(
        variables.active
          ? t('finance.status_activated', 'Payment method activated successfully.')
          : t('finance.status_deactivated', 'Payment method deactivated successfully.')
      )
    },
    onError: () => toast.error(t('finance.save_error', 'Failed to update status.')),
    onSettled: () => setTogglingId(null),
  })

  // Handlers
  const openCreateDrawer = () => {
    setEditingItem(null)
    setPaymentMethodForm({
      name: '',
      code: '',
      type: 'cash',
      fee_percent: '0.00',
      fee_fixed: '0.00',
      available_pos: true,
      available_online: true,
      is_active: true,
      description: '',
    })
    setErrors({})
    setDrawerOpen(true)
  }

  const openEditDrawer = (item: any) => {
    setEditingItem(item)
    setPaymentMethodForm({
      name: item.name || '',
      code: item.code || '',
      type: item.type || 'cash',
      fee_percent: String(item.fee_percent ?? '0.00'),
      fee_fixed: String(item.fee_fixed ?? '0.00'),
      available_pos: Boolean(item.available_pos ?? true),
      available_online: Boolean(item.available_online ?? true),
      is_active: Boolean(item.is_active ?? true),
      description: item.description || '',
    })
    setErrors({})
    setDrawerOpen(true)
  }

  const handleSavePaymentMethod = () => {
    const newErrors: Record<string, string> = {}
    if (!paymentMethodForm.name.trim()) {
      newErrors.name = t('finance.method_name_required', 'សូមបញ្ចូលឈ្មោះវិធីសាស្ត្រទូទាត់')
    }
    if (!paymentMethodForm.code.trim()) {
      newErrors.code = t('finance.method_code_required', 'សូមបញ្ចូលលេខកូដវិធីសាស្ត្រទូទាត់')
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }
    saveMutation.mutate(paymentMethodForm)
  }

  return (
    <div className="space-y-6 print:p-0">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: t('nav.financeManagement', t('finance.financial_management', 'Finance')),
            path: '/finance/expenses',
          },
          { label: t('finance.payment_methods_title', 'Payment Methods') },
        ]}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.payment_methods_title', 'Payment Methods')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {t(
              'finance.payment_methods_desc',
              'Configure payment methods, transaction fees, and supported platforms for POS and Online store.'
            )}
          </p>
        </div>
        {canCreatePaymentMethod && (
          <Button
            onClick={openCreateDrawer}
            className="rounded-xl gap-2 font-medium h-10 px-4 shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('finance.add_payment_method', 'Add Payment Method')}</span>
          </Button>
        )}
      </div>

      {/* SmartHR-Style Payment Methods Filter Bar */}
      <PaymentMethodSearchBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        typeFilter={typeFilter}
        onTypeChange={(val) => {
          setTypeFilter(val)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val)
          setPage(1)
        }}
        onApply={() => {
          setPage(1)
          refetch()
        }}
        onReset={() => {
          setSearch('')
          setTypeFilter('')
          setStatusFilter('')
          setPage(1)
        }}
      />

      {/* Main Content: Modern Payment Methods Cards Grid */}
      <PaymentMethodsGatewaysCards
        methods={paymentMethods}
        isLoading={isLoading}
        isFetching={isFetching}
        onConfigure={openEditDrawer}
        onAddNew={canCreatePaymentMethod ? openCreateDrawer : undefined}
        onDelete={
          canDeletePaymentMethod
            ? (id, name) => setDeleteConfirm({ open: true, id, name })
            : undefined
        }
        onToggleStatus={
          canUpdatePaymentMethod
            ? (method) =>
                togglePaymentMethodStatusMutation.mutate({
                  id: method.id,
                  active: !method.is_active,
                })
            : undefined
        }
        canCreate={canCreatePaymentMethod}
        canUpdate={canUpdatePaymentMethod}
        canDelete={canDeletePaymentMethod}
        togglingId={togglingId}
      />

      {/* Pagination (Cleanly hidden when items fit on 1 page) */}
      {pagination.total > perPage && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      {/* Configuration & Add Form Modal / Dialog */}
      <PaymentMethodsGatewaysFormDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditingItem(null)
          setErrors({})
        }}
        editingItem={editingItem}
        onSubmit={handleSavePaymentMethod}
        isPending={saveMutation.isPending}
        paymentMethodForm={paymentMethodForm}
        setPaymentMethodForm={setPaymentMethodForm}
        errors={errors}
        onClearError={handleClearError}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.open}
        variant="danger"
        actionType="delete"
        title={t('finance.delete_confirm_title', 'Delete Payment Method')}
        message={t(
          'finance.delete_confirm_msg',
          'Are you sure you want to delete this payment method? This action cannot be undone.'
        )}
        itemName={deleteConfirm.name}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteConfirm.id && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: '' })}
      />
    </div>
  )
}

export const FinancePaymentMethodsPage = PaymentMethodsGatewaysPage
export default PaymentMethodsGatewaysPage
