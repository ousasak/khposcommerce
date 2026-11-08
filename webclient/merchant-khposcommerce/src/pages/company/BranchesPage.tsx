import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, RefreshCw, X, Building2,
  ToggleLeft, ToggleRight, Eye, Mail, Phone, MapPin, Loader2, Star, Check
} from 'lucide-react'
import { companyService } from '@/services/companyService'
import { useToast } from '@/hooks/useToast'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { Breadcrumb, EmptyState, ResetButton, Modal as EnterpriseModal, ModalFooter } from '@/components/common'
import { StatusBadge, CloseButton, FieldError, getFieldClass, TableToolbar, HeaderActionsGroup, AddButton, ExportButton } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { BranchStatsCards } from './components/BranchStatsCards'
import { BranchSearchBar } from './components/BranchSearchBar'
import { downloadCsv } from '@/utils/export'

interface Branch {
  id:          number
  company_id:  number
  name:        string
  code:        string
  email?:      string
  phone?:      string
  address?:    string
  city?:       string
  province?:   string
  postal_code?: string
  is_main:     boolean
  is_active:   boolean
}

const BranchesPage: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
  const { t } = useTranslation(['settings', 'common'])
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
  } = useServerPagination({ storageKey: 'branches' })
    // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [provinceFilter, setProvinceFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    branch: true,
    code: true,
    contact: true,
    location: true,
    main: true,
    status: true,
    actions: true,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [viewBranch, setViewBranch] = useState<Branch | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['branches', page, debouncedSearch, perPage, statusFilter, provinceFilter, typeFilter],
    queryFn: () => companyService.getBranches({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage,
      status: statusFilter || undefined,
      province: provinceFilter || undefined,
      is_main: typeFilter === 'main' ? true : typeFilter === 'sub' ? false : undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (newBranch: any) => companyService.createBranch(newBranch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch created successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create branch.'
      toast.error(msg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => companyService.updateBranch(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch updated successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update branch.'
      toast.error(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyService.deleteBranch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch deleted successfully.')
      adjustAfterDelete(branches.length)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to delete branch.'
      toast.error(msg)
    }
  })

  const branches: Branch[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = () => {
    setEditingBranch(null)
    setFormErrors({})
    setName('')
    setCode('')
    setEmail('')
    setPhone('')
    setAddress('')
    setCity('')
    setProvince('')
    setPostalCode('')
    setIsMain(false)
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch)
    setFormErrors({})
    setName(branch.name)
    setCode(branch.code)
    setEmail(branch.email ?? '')
    setPhone(branch.phone ?? '')
    setAddress(branch.address ?? '')
    setCity(branch.city ?? '')
    setProvince(branch.province ?? '')
    setPostalCode(branch.postal_code ?? '')
    setIsMain(branch.is_main)
    setIsActive(branch.is_active)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingBranch(null)
    setFormErrors({})
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!code.trim()) {
      errors.code = t('settings.errors.branchCodeRequired', 'Please enter branch code')
    }
    if (!name.trim()) {
      errors.name = t('settings.errors.branchNameRequired', 'Please enter branch name')
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
      name,
      code,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      province: province || null,
      postal_code: postalCode || null,
      is_main: isMain,
      is_active: isActive
    }

    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleExportCSV = () => {
    const list = data?.data ?? []
    if (!list.length) {
      toast.info(t('common.noDataToExport', 'No branch data to export.'))
      return
    }
    const headers = ['ID', 'Name', 'Code', 'Phone', 'Email', 'City', 'Province', 'Is Main', 'Status']
    const rows = list.map((b: Branch) => [
      b.id,
      b.name,
      b.code,
      b.phone || '',
      b.email || '',
      b.city || '',
      b.province || '',
      b.is_main ? 'Yes' : 'No',
      b.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('company_branches', headers, rows)
    toast.success(t('common.exportSuccess', 'Branches exported successfully.'))
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb
            items={[
              { label: t('nav.companyManagement', 'Company Management'), path: '/company' },
              { label: t('nav.branches', 'Branches') },
            ]}
          />

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
                {t('branches.title', 'Branches')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                {t('branches.subtitle', 'Manage corporate office and store branch coordinates across regions')}
              </p>
            </div>

            <HeaderActionsGroup>
              <ExportButton
                onClick={handleExportCSV}
                label={t('common.exportCsv', 'Export CSV')}
              />
              <AddButton
                onClick={openCreateModal}
                label={t('branches.addBranch', 'Add Branch')}
              />
            </HeaderActionsGroup>
          </div>

          <BranchStatsCards
            branches={data?.data ?? []}
            total={data?.pagination?.total ?? data?.total}
            isLoading={isLoading}
          />
        </>
      )}

      {/* SmartHR-style Unified Filter Bar */}
      <BranchSearchBar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(val) => { setStatusFilter(val); setPage(1); }}
        provinceFilter={provinceFilter}
        onProvinceChange={(val) => { setProvinceFilter(val); setPage(1); }}
        typeFilter={typeFilter}
        onTypeChange={(val) => { setTypeFilter(val); setPage(1); }}
        onReset={() => {
          reset()
          setStatusFilter('')
          setProvinceFilter('')
          setTypeFilter('')
        }}
        columns={[
          { key: 'branch', label: t('branches.colBranch', 'Branch') },
          { key: 'code', label: t('branches.colCode', 'Code') },
          { key: 'contact', label: t('branches.colContact', 'Contact') },
          { key: 'location', label: t('branches.colLocation', 'Location') },
          { key: 'main', label: t('branches.colMain', 'Main HQ') },
          { key: 'status', label: t('branches.colStatus', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        rightAction={
          isTab ? (
            <AddButton
              onClick={openCreateModal}
              label={t('branches.addBranch', 'Add Branch')}
            />
          ) : undefined
        }
      />

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table">
            <thead>
              <tr>
                {visibleColumns.branch !== false && <th className="text-left">Branch</th>}
                {visibleColumns.code !== false && <th className="text-left">Code</th>}
                {visibleColumns.contact !== false && <th className="text-left">Contact</th>}
                {visibleColumns.location !== false && <th className="text-left">Location</th>}
                {visibleColumns.main !== false && <th className="text-left">Main</th>}
                {visibleColumns.status !== false && <th className="text-left">Status</th>}
                {visibleColumns.actions !== false && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {visibleColumns.branch !== false && <td><div className="skeleton h-4 w-32 rounded" /></td>}
                      {visibleColumns.code !== false && <td><div className="skeleton h-4 w-16 rounded" /></td>}
                      {visibleColumns.contact !== false && <td><div className="skeleton h-4 w-28 rounded" /></td>}
                      {visibleColumns.location !== false && <td><div className="skeleton h-4 w-36 rounded" /></td>}
                      {visibleColumns.main !== false && <td><div className="skeleton h-4 w-10 rounded" /></td>}
                      {visibleColumns.status !== false && <td><div className="skeleton h-4 w-16 rounded" /></td>}
                      {visibleColumns.actions !== false && <td><div className="skeleton h-4 w-12 rounded ml-auto" /></td>}
                    </tr>
                  ))
                : branches.map((b) => (
                    <tr key={b.id} className="group hover:bg-muted/25 transition-colors">
                      {visibleColumns.branch !== false && (
                        <td>
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-primary flex-shrink-0" />
                            <div>
                              <span className="font-medium text-foreground text-sm">{b.name}</span>
                              {b.is_main && (
                                <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                                  <Star size={10} fill="currentColor" /> Main
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.code !== false && (
                        <td className="font-mono text-xs text-muted-foreground">{b.code}</td>
                      )}
                      {visibleColumns.contact !== false && (
                        <td>
                          <div className="text-xs space-y-0.5 text-muted-foreground">
                            {b.email && <div className="flex items-center gap-1"><Mail size={10} /> {b.email}</div>}
                            {b.phone && <div className="flex items-center gap-1"><Phone size={10} /> {b.phone}</div>}
                          </div>
                        </td>
                      )}
                      {visibleColumns.location !== false && (
                        <td className="text-muted-foreground text-sm">
                          {b.city ? `${b.city}, ${b.province}` : b.address ?? '—'}
                        </td>
                      )}
                      {visibleColumns.main !== false && (
                        <td>
                          {b.is_main ? (
                            <span className="text-green-500 flex items-center gap-0.5 text-xs font-semibold">
                              <Check size={14} /> Yes
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.status !== false && (
                        <td>
                          <StatusBadge status={b.is_active} />
                        </td>
                      )}
                      {visibleColumns.actions !== false && (
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            variant="inline"
                            onView={() => setViewBranch(b)}
                            onEdit={() => openEditModal(b)}
                            onDelete={() => {
                              if (confirm('Are you sure you want to delete this branch?')) deleteMutation.mutate(b.id)
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
              {!isLoading && branches.length === 0 && (
                <EmptyState
                  cols={7}
                  icon={<Building2 size={24} className="stroke-1.5" />}
                  title={t('settings.noBranches', 'No Branches Found')}
                  description={t('settings.noBranchesDesc', 'Register branch locations to organize sales points and inventory distribution.')}
                  actionLabel={t('settings.addBranch', 'Add Branch')}
                  onAction={openCreateModal}
                />
              )}
            </tbody>
          </table>
      </TableWrapper>
      </div>

      {/* Branch Create/Edit Modal */}
      <EnterpriseModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingBranch ? t('settings.editBranch', 'Edit Branch') : t('settings.addBranch', 'Add Branch')}
        subtitle={
          editingBranch
            ? t('settings.editBranchDesc', 'Update branch location and contact details')
            : t('settings.addBranchDesc', 'Create a new branch location for your business')
        }
        icon={<Building2 size={20} />}
        iconVariant="blue"
        size="lg"
        footer={
          <ModalFooter
            onCancel={closeModal}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            isEdit={Boolean(editingBranch)}
            submitLabel={editingBranch ? t('common.saveChanges', 'Save Changes') : t('common.create', 'Save')}
            onSubmit={handleSubmit}
          />
        }
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.branchCode', 'Branch Code')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="code"
                name="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  handleClearError('code')
                }}
                placeholder="BR001"
                className={getFieldClass(
                  formErrors.code,
                  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
                )}
              />
              <FieldError error={formErrors.code} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.branchName', 'Branch Name')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  handleClearError('name')
                }}
                placeholder={t('settings.branchNamePlaceholder', 'Branch Name')}
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
                {t('settings.email', 'Email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="branch@company.com"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.phone', 'Phone')}
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
              placeholder={t('settings.addressPlaceholder', 'Physical address')}
              rows={2}
              className="w-full min-h-[64px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.city', 'City')}
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
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
                placeholder="Province"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.postalCode', 'Postal Code')}
              </label>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal Code"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Main Branch Option Card */}
          <div className="p-3.5 sm:p-4 bg-muted/15 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="isMainBranch" className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 cursor-pointer select-none block">
                {t('settings.mainBranch', 'Mark as Main Branch')}
              </label>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('settings.mainBranchDesc', 'Designate this location as the central business headquarters')}
              </p>
            </div>
            <input
              type="checkbox"
              id="isMainBranch"
              checked={isMain}
              onChange={(e) => setIsMain(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Status Card */}
          <div className="p-3.5 sm:p-4 bg-muted/15 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="isBranchActive" className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 cursor-pointer select-none block">
                {t('settings.branchActiveStatus', 'Active Branch Status')}
              </label>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('settings.branchActiveStatusDesc', 'Active branches are visible across POS registers and order routes')}
              </p>
            </div>
            <input
              type="checkbox"
              id="isBranchActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary cursor-pointer"
            />
          </div>
        </form>
      </EnterpriseModal>

      {/* Detail Drawer */}
      <AnimatePresence>
        {viewBranch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-card w-full max-w-md border-l border-border h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Branch Detail</h3>
                <CloseButton onClose={() => setViewBranch(null)} size="md" color="rose" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Basic Info</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-mono font-medium">{viewBranch.code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{viewBranch.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Main Office:</span>
                      <span className="font-medium">{viewBranch.is_main ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={viewBranch.is_active} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact Details</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{viewBranch.email ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{viewBranch.phone ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location Address</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-start gap-1"><MapPin size={14} className="mt-0.5" /> Address:</span>
                      <span className="font-medium text-right max-w-[200px] break-words">{viewBranch.address ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">City:</span>
                      <span className="font-medium">{viewBranch.city ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Province:</span>
                      <span className="font-medium">{viewBranch.province ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Postal Code:</span>
                      <span className="font-medium">{viewBranch.postal_code ?? '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BranchesPage
