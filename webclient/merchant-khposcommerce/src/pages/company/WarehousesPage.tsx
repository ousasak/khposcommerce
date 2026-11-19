import React, { useState, useImperativeHandle } from 'react'
import { useTranslation } from 'react-i18next'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, RefreshCw, X, Warehouse,
  ToggleLeft, ToggleRight, Eye, Phone, User, MapPin, Loader2, Star, Check
} from 'lucide-react'
import { companyService } from '@/services/companyService'
import { useToast } from '@/hooks/useToast'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { Breadcrumb, EmptyState, ResetButton, Modal as EnterpriseModal, ModalFooter, DeleteConfirmDialog } from '@/components/common'
import { StatusBadge } from '@/components/common'
import { FieldError, getFieldClass, TableToolbar, HeaderActionsGroup, AddButton, ExportButton } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { WarehouseStatsCards } from './components/WarehouseStatsCards'
import { BranchSearchBar } from './components/BranchSearchBar'
import { WarehouseCard, WarehouseCardSkeleton } from './components/WarehouseCard'
import { downloadCsv } from '@/utils/export'

interface WarehouseItem {
  id:          number
  branch_id:   number
  branch?:     { name: string }
  name:        string
  code:        string
  address?:    string
  city?:       string
  province?:   string
  phone?:      string
  pic_name?:   string
  is_main:     boolean
  is_active:   boolean
}

import type { CompanyTabHandle } from './BranchesPage'

const WarehousesPage = React.forwardRef<CompanyTabHandle, { isTab?: boolean }>(({ isTab }, ref) => {
  const { t } = useTranslation(['company', 'settings', 'common', 'nav', 'buttons', 'tables'])
  const qc = useQueryClient()
  const toast = useToast()
    const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'warehouses' })
    // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [provinceFilter, setProvinceFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem('company_warehouses_view_mode') as 'grid' | 'table') || 'grid'
  })

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode)
    localStorage.setItem('company_warehouses_view_mode', mode)
  }
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    warehouse: true,
    code: true,
    branch: true,
    pic: true,
    main: true,
    status: true,
    actions: true,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null)
  const [viewWarehouse, setViewWarehouse] = useState<WarehouseItem | null>(null)
  const [deletingWarehouse, setDeletingWarehouse] = useState<WarehouseItem | null>(null)

  // Form states
  const [branchId, setBranchId] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [phone, setPhone] = useState('')
  const [picName, setPicName] = useState('')
  const [isMain, setIsMain] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.getBranches().then(r => r.data ?? []),
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['warehouses', page, debouncedSearch, perPage, statusFilter, provinceFilter],
    queryFn: () => companyService.getWarehouses({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage,
      status: statusFilter || undefined,
      province: provinceFilter || undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (newWarehouse: any) => companyService.createWarehouse(newWarehouse),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Warehouse created successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create warehouse.'
      toast.error(msg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => companyService.updateWarehouse(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Warehouse updated successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update warehouse.'
      toast.error(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyService.deleteWarehouse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Warehouse deleted successfully.')
      adjustAfterDelete(warehouses.length)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to delete warehouse.'
      toast.error(msg)
    }
  })

  const warehouses: WarehouseItem[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = () => {
    setEditingWarehouse(null)
    setFormErrors({})
    setBranchId('')
    setName('')
    setCode('')
    setAddress('')
    setCity('')
    setProvince('')
    setPhone('')
    setPicName('')
    setIsMain(false)
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (wh: WarehouseItem) => {
    setEditingWarehouse(wh)
    setFormErrors({})
    setBranchId(wh.branch_id.toString())
    setName(wh.name)
    setCode(wh.code)
    setAddress(wh.address ?? '')
    setCity(wh.city ?? '')
    setProvince(wh.province ?? '')
    setPhone(wh.phone ?? '')
    setPicName(wh.pic_name ?? '')
    setIsMain(wh.is_main)
    setIsActive(wh.is_active)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingWarehouse(null)
    setFormErrors({})
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!branchId) {
      errors.branchId = t('settings.errors.warehouseBranchRequired', 'Please select a branch')
    }
    if (!code.trim()) {
      errors.code = t('settings.errors.warehouseCodeRequired', 'Please enter warehouse code')
    }
    if (!name.trim()) {
      errors.name = t('settings.errors.warehouseNameRequired', 'Please enter warehouse name')
    }
    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    const payload = {
      company_id: 1,
      branch_id: Number(branchId),
      name,
      code,
      address: address || null,
      city: city || null,
      province: province || null,
      phone: phone || null,
      pic_name: picName || null,
      is_main: isMain,
      is_active: isActive
    }

    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleExportCSV = () => {
    const list = data?.data ?? []
    if (!list.length) {
      toast.info(t('common.noDataToExport', 'No warehouse data to export.'))
      return
    }
    const headers = ['ID', 'Name', 'Code', 'Branch', 'City', 'Province', 'Phone', 'PIC', 'Is Main', 'Status']
    const rows = list.map((w: WarehouseItem) => [
      w.id,
      w.name,
      w.code,
      w.branch?.name || '',
      w.city || '',
      w.province || '',
      w.phone || '',
      w.pic_name || '',
      w.is_main ? 'Yes' : 'No',
      w.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('company_warehouses', headers, rows)
    toast.success(t('common.exportSuccess', 'Warehouses exported successfully.'))
  }

  useImperativeHandle(ref, () => ({
    openCreate: openCreateModal,
    exportCSV: handleExportCSV,
  }))

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb
            items={[
              { label: t('company.pageTitle', 'Company Management'), path: '/company' },
              { label: t('company.tabWarehouses', 'Warehouses') },
            ]}
          />

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
                {t('company.tabWarehouses', 'Warehouses')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                {t('warehouses.subtitle', 'Manage inventory depots, central storage facilities, and stock distribution centers')}
              </p>
            </div>

            <HeaderActionsGroup>
              <ExportButton
                onClick={handleExportCSV}
                label={t('common.exportCsv', 'Export CSV')}
              />
              <AddButton
                onClick={openCreateModal}
                label={t('company.addWarehouse', 'Add Warehouse')}
              />
            </HeaderActionsGroup>
          </div>
        </>
      )}

      {/* Grid or Table Presentation */}
      {viewMode === 'grid' ? (
        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl pointer-events-none">
              <div className="bg-card px-4 py-2 rounded-xl shadow-md border border-border flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
                <Loader2 size={14} className="animate-spin" />
                <span>{t('common.updating', 'កំពុងធ្វើបច្ចុប្បន្នភាព...')}</span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <WarehouseCardSkeleton key={i} />
              ))}
            </div>
          ) : warehouses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
              {warehouses.map((w) => (
                <WarehouseCard
                  key={w.id}
                  warehouse={w}
                  onView={() => setViewWarehouse(w)}
                  onEdit={() => openEditModal(w)}
                  onDelete={() => setDeletingWarehouse(w)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border/80 p-8">
              <EmptyState
                cols={7}
                icon={<Warehouse size={28} className="stroke-1.5" />}
                title={t('settings.noWarehouses', 'No Warehouses Found')}
                description={t(
                  'settings.noWarehousesDesc',
                  'Register storage depots to manage inventory logistics and branch transfers.'
                )}
                actionLabel={t('settings.addWarehouse', 'Add Warehouse')}
                onAction={openCreateModal}
              />
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <TableWrapper isFetching={isFetching}>
            <table className="w-full data-table">
              <thead>
                <tr>
                  {visibleColumns.warehouse !== false && <th className="text-left">{t('company.colWarehouse', 'Warehouse')}</th>}
                  {visibleColumns.code !== false && <th className="text-left">{t('company.colCode', 'Code')}</th>}
                  {visibleColumns.branch !== false && <th className="text-left">{t('company.colBranchRef', 'Branch')}</th>}
                  {visibleColumns.pic !== false && <th className="text-left">{t('company.colPic', 'PIC')}</th>}
                  {visibleColumns.main !== false && <th className="text-left">{t('company.colMainDepot', 'Main Depot')}</th>}
                  {visibleColumns.status !== false && <th className="text-left">{t('company.colStatus', 'Status')}</th>}
                  {visibleColumns.actions !== false && <th className="text-right">{t('common.actions', 'Actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {visibleColumns.warehouse !== false && <td><div className="skeleton h-4 w-32 rounded" /></td>}
                        {visibleColumns.code !== false && <td><div className="skeleton h-4 w-16 rounded" /></td>}
                        {visibleColumns.branch !== false && <td><div className="skeleton h-4 w-28 rounded" /></td>}
                        {visibleColumns.pic !== false && <td><div className="skeleton h-4 w-24 rounded" /></td>}
                        {visibleColumns.main !== false && <td><div className="skeleton h-4 w-10 rounded" /></td>}
                        {visibleColumns.status !== false && <td><div className="skeleton h-4 w-16 rounded" /></td>}
                        {visibleColumns.actions !== false && <td><div className="skeleton h-4 w-12 rounded ml-auto" /></td>}
                      </tr>
                    ))
                  : warehouses.map((w) => (
                      <tr key={w.id} className="group hover:bg-muted/25 transition-colors">
                        {visibleColumns.warehouse !== false && (
                          <td>
                            <div className="flex items-center gap-2">
                              <Warehouse size={16} className="text-primary flex-shrink-0" />
                              <div>
                                <span className="font-medium text-foreground text-sm">{w.name}</span>
                                {w.is_main && (
                                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                                    <Star size={10} fill="currentColor" /> {t('company.mainHQ', 'Main')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.code !== false && (
                          <td className="font-mono text-xs text-muted-foreground">{w.code}</td>
                        )}
                        {visibleColumns.branch !== false && (
                          <td className="text-muted-foreground text-sm">{w.branch?.name ?? '—'}</td>
                        )}
                        {visibleColumns.pic !== false && (
                          <td>
                            <div className="text-xs space-y-0.5 text-muted-foreground">
                              {w.pic_name && <div className="flex items-center gap-1 font-medium text-foreground"><User size={10} /> {w.pic_name}</div>}
                              {w.phone && <div className="flex items-center gap-1"><Phone size={10} /> {w.phone}</div>}
                            </div>
                          </td>
                        )}
                        {visibleColumns.main !== false && (
                          <td>
                            {w.is_main ? (
                              <span className="text-green-500 flex items-center gap-0.5 text-xs font-semibold">
                                <Check size={14} /> {t('company.yes', 'Yes')}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">{t('company.no', 'No')}</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.status !== false && (
                          <td>
                            <StatusBadge status={w.is_active} />
                          </td>
                        )}
                        {visibleColumns.actions !== false && (
                          <td className="text-right" onClick={(e) => e.stopPropagation()}>
                            <TableActionMenu
                              variant="inline"
                              onView={() => setViewWarehouse(w)}
                              onEdit={() => openEditModal(w)}
                              onDelete={() => setDeletingWarehouse(w)}
                              editColor="teal"
                              buttonSize="md"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                {!isLoading && warehouses.length === 0 && (
                  <EmptyState
                    cols={7}
                    icon={<Warehouse size={24} className="stroke-1.5" />}
                    title={t('settings.noWarehouses', 'No Warehouses Found')}
                    description={t('settings.noWarehousesDesc', 'Register storage depots to manage inventory logistics and branch transfers.')}
                    actionLabel={t('settings.addWarehouse', 'Add Warehouse')}
                    onAction={openCreateModal}
                  />
                )}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      {/* Warehouse Create/Edit Modal */}
      <EnterpriseModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingWarehouse ? t('settings.editWarehouse', 'Edit Warehouse') : t('settings.addWarehouse', 'Add Warehouse')}
        subtitle={
          editingWarehouse
            ? t('settings.editWarehouseDesc', 'Update depot storage facilities and logistical point of contact')
            : t('settings.addWarehouseDesc', 'Register a new storage depot or distribution center')
        }
        icon={<Warehouse size={20} />}
        iconVariant="blue"
        size="lg"
        footer={
          <ModalFooter
            onCancel={closeModal}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            isEdit={Boolean(editingWarehouse)}
            submitLabel={editingWarehouse ? t('common.saveChanges', 'Save Changes') : t('common.create', 'Save')}
            onSubmit={handleSubmit}
          />
        }
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
              {t('settings.branch', 'Branch')} <span className="text-rose-500 font-bold">*</span>
            </label>
            <select
              id="branchId"
              name="branchId"
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value)
                handleClearError('branchId')
              }}
              className={getFieldClass(
                formErrors.branchId,
                'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
              )}
            >
              <option value="">{t('settings.selectBranch', 'Select Branch')}</option>
              {(branches ?? []).map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <FieldError error={formErrors.branchId} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.warehouseCode', 'Warehouse Code')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="code"
                name="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  handleClearError('code')
                }}
                placeholder="WH001"
                className={getFieldClass(
                  formErrors.code,
                  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
                )}
              />
              <FieldError error={formErrors.code} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.warehouseName', 'Warehouse Name')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  handleClearError('name')
                }}
                placeholder={t('settings.warehouseNamePlaceholder', 'Warehouse Name')}
                className={getFieldClass(
                  formErrors.name,
                  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
                )}
              />
              <FieldError error={formErrors.name} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.picName', 'PIC Name')}
              </label>
              <input
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                placeholder={t('settings.picNamePlaceholder', 'Person in Charge')}
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.picPhone', 'PIC Phone')}
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+ -]/g, ''))}
                placeholder="012 345 678"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
              {t('settings.address', 'Address')}
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('settings.addressPlaceholder', 'Physical depot address')}
              rows={2}
              className="w-full min-h-[64px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.city', 'City')}
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('company.cityPlaceholder', 'City / Capital')}
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.province', 'Province')}
              </label>
              <input
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder={t('company.provincePlaceholder', 'Province')}
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Main Depot Option Card */}
          <div className="p-3.5 sm:p-4 bg-muted/15 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="isMainWarehouse" className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 cursor-pointer select-none block">
                {t('settings.mainWarehouse', 'Mark as Main Depot')}
              </label>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('settings.mainWarehouseDesc', 'Designate this warehouse as the central primary inventory depot')}
              </p>
            </div>
            <input
              type="checkbox"
              id="isMainWarehouse"
              checked={isMain}
              onChange={(e) => setIsMain(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Status Card */}
          <div className="p-3.5 sm:p-4 bg-muted/15 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="isWarehouseActive" className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 cursor-pointer select-none block">
                {t('settings.warehouseActiveStatus', 'Active Warehouse Status')}
              </label>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('settings.warehouseActiveStatusDesc', 'Active warehouses can receive stock and fulfill store transfer orders')}
              </p>
            </div>
            <input
              type="checkbox"
              id="isWarehouseActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary cursor-pointer"
            />
          </div>
        </form>
      </EnterpriseModal>

      {/* Detail Drawer */}
      <AnimatePresence>
        {viewWarehouse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-card w-full max-w-md border-l border-border h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">{t('company.warehouseDetail', 'Warehouse Details')}</h3>
                <CloseButton onClose={() => setViewWarehouse(null)} size="md" color="rose" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('company.basicInfo', 'Basic Information')}</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('company.lblCode', 'Code:')}</span>
                      <span className="font-mono font-medium">{viewWarehouse.code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('company.lblName', 'Name:')}</span>
                      <span className="font-medium">{viewWarehouse.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('company.lblAssociatedBranch', 'Associated Branch:')}</span>
                      <span className="font-medium">{viewWarehouse.branch?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('company.lblMainStorageUnit', 'Main Depot:')}</span>
                      <span className="font-medium">{viewWarehouse.is_main ? t('company.yes', 'Yes') : t('company.no', 'No')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{t('company.lblStatus', 'Status:')}</span>
                      <StatusBadge status={viewWarehouse.is_active} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('company.contactPic', 'Contact & PIC')}</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><User size={12} /> {t('company.lblPicName', 'PIC Name:')}</span>
                      <span className="font-medium">{viewWarehouse.pic_name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><Phone size={12} /> {t('company.lblPicPhone', 'PIC Phone:')}</span>
                      <span className="font-medium">{viewWarehouse.phone ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('company.locationAddress', 'Location & Coordinates')}</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-start gap-1"><MapPin size={14} className="mt-0.5" /> {t('company.lblAddress', 'Address:')}</span>
                      <span className="font-medium text-right max-w-[200px] break-words">{viewWarehouse.address ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('company.lblCity', 'City:')}</span>
                      <span className="font-medium">{viewWarehouse.city ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('company.lblProvince', 'Province:')}</span>
                      <span className="font-medium">{viewWarehouse.province ?? '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={Boolean(deletingWarehouse)}
        title={t('company.deleteWarehouseTitle', 'លុបឃ្លាំងស្តុក')}
        itemName={deletingWarehouse?.name}
        warningText={t(
          'company.deleteWarehouseDesc',
          'តើអ្នកពិតជាចង់លុបឃ្លាំងនេះមែនទេ? ស្តុកទាំងអស់ដែលពាក់ព័ន្ធត្រូវតែផ្ទេរចេញជាមុនសិន។'
        )}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingWarehouse) {
            deleteMutation.mutate(deletingWarehouse.id, {
              onSuccess: () => setDeletingWarehouse(null),
            })
          }
        }}
        onCancel={() => setDeletingWarehouse(null)}
      />
    </div>
  )
})

WarehousesPage.displayName = 'WarehousesPage'

export default WarehousesPage
