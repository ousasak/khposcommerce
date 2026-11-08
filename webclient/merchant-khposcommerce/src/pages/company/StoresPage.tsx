import React, { useState } from 'react'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, RefreshCw, X, Store,
  ToggleLeft, ToggleRight, Eye, Mail, Phone, MapPin, Globe, Loader2, BookOpen
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { companyService } from '@/services/companyService'
import { useToast } from '@/hooks/useToast'
import { Breadcrumb, EmptyState, ResetButton, Modal as EnterpriseModal, ModalFooter } from '@/components/common'
import { StatusBadge } from '@/components/common'
import { TableToolbar, HeaderActionsGroup, AddButton, ExportButton } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { StoreStatsCards } from './components/StoreStatsCards'
import { BranchSearchBar } from './components/BranchSearchBar'
import { downloadCsv } from '@/utils/export'

interface StoreItem {
  id:          number
  branch_id:   number
  branch?:     { name: string }
  name:        string
  code:        string
  slug:        string
  domain?:     string
  email?:      string
  phone?:      string
  address?:    string
  description?: string
  type:        'online' | 'offline' | 'hybrid'
  is_active:   boolean
}

const StoresPage: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
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
  } = useServerPagination({ storageKey: 'stores' })
    // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    store: true,
    code: true,
    branch: true,
    type: true,
    domain: true,
    status: true,
    actions: true,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null)
  const [viewStore, setViewStore] = useState<StoreItem | null>(null)

  // Form states
  const [branchId, setBranchId] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [slug, setSlug] = useState('')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'online' | 'offline' | 'hybrid'>('hybrid')
  const [isActive, setIsActive] = useState(true)

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.getBranches().then(r => r.data ?? []),
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['stores', page, debouncedSearch, perPage, statusFilter, typeFilter],
    queryFn: () => companyService.getStores({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (newStore: any) => companyService.createStore(newStore),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Store created successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create store.'
      toast.error(msg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => companyService.updateStore(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Store updated successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update store.'
      toast.error(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyService.deleteStore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Store deleted successfully.')
      adjustAfterDelete(stores.length)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to delete store.'
      toast.error(msg)
    }
  })

  const stores: StoreItem[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = () => {
    setEditingStore(null)
    setBranchId('')
    setName('')
    setCode('')
    setSlug('')
    setDomain('')
    setEmail('')
    setPhone('')
    setAddress('')
    setDescription('')
    setType('hybrid')
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (store: StoreItem) => {
    setEditingStore(store)
    setBranchId(store.branch_id.toString())
    setName(store.name)
    setCode(store.code)
    setSlug(store.slug)
    setDomain(store.domain ?? '')
    setEmail(store.email ?? '')
    setPhone(store.phone ?? '')
    setAddress(store.address ?? '')
    setDescription(store.description ?? '')
    setType(store.type)
    setIsActive(store.is_active)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingStore(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      company_id: 1,
      branch_id: Number(branchId),
      name,
      code,
      slug: slug || null,
      domain: domain || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      description: description || null,
      type,
      is_active: isActive
    }

    if (editingStore) {
      updateMutation.mutate({ id: editingStore.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleExportCSV = () => {
    const list = data?.data ?? []
    if (!list.length) {
      toast.info(t('common.noDataToExport', 'No store data to export.'))
      return
    }
    const headers = ['ID', 'Name', 'Code', 'Branch', 'Type', 'Domain', 'Phone', 'Email', 'Status']
    const rows = list.map((s: StoreItem) => [
      s.id,
      s.name,
      s.code,
      s.branch?.name || '',
      s.type,
      s.domain || '',
      s.phone || '',
      s.email || '',
      s.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('company_stores', headers, rows)
    toast.success(t('common.exportSuccess', 'Stores exported successfully.'))
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb
            items={[
              { label: t('nav.companyManagement', 'Company Management'), path: '/company' },
              { label: t('nav.stores', 'Stores') },
            ]}
          />

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
                {t('stores.title', 'Stores & Outlets')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                {t('stores.subtitle', 'Manage POS retail outlets, online channels, and hybrid physical stores')}
              </p>
            </div>

            <HeaderActionsGroup>
              <ExportButton
                onClick={handleExportCSV}
                label={t('common.exportCsv', 'Export CSV')}
              />
              <AddButton
                onClick={openCreateModal}
                label={t('stores.addStore', 'Add Store')}
              />
            </HeaderActionsGroup>
          </div>

          <StoreStatsCards
            stores={data?.data ?? []}
            total={data?.pagination?.total ?? data?.total}
            isLoading={isLoading}
          />
        </>
      )}

      {/* SmartHR-style Unified Filter Bar */}
      <BranchSearchBar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder={t('stores.searchPlaceholder', 'Search stores...')}
        statusFilter={statusFilter}
        onStatusChange={(val) => { setStatusFilter(val); setPage(1); }}
        typeFilter={typeFilter}
        onTypeChange={(val) => { setTypeFilter(val); setPage(1); }}
        typeOptions={[
          { label: 'Hybrid Outlet', value: 'hybrid' },
          { label: 'Offline POS Store', value: 'offline' },
          { label: 'Online Storefront', value: 'online' },
        ]}
        onReset={() => {
          reset()
          setStatusFilter('')
          setTypeFilter('')
        }}
        columns={[
          { key: 'store', label: t('stores.colStore', 'Store') },
          { key: 'code', label: t('stores.colCode', 'Code') },
          { key: 'branch', label: t('stores.colBranch', 'Branch') },
          { key: 'type', label: t('stores.colType', 'Type') },
          { key: 'domain', label: t('stores.colDomain', 'Domain') },
          { key: 'status', label: t('stores.colStatus', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        rightAction={
          isTab ? (
            <AddButton
              onClick={openCreateModal}
              label={t('stores.addStore', 'Add Store')}
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
                {visibleColumns.store !== false && <th className="text-left">Store</th>}
                {visibleColumns.code !== false && <th className="text-left">Code</th>}
                {visibleColumns.branch !== false && <th className="text-left">Branch</th>}
                {visibleColumns.type !== false && <th className="text-left">Type</th>}
                {visibleColumns.domain !== false && <th className="text-left">Domain</th>}
                {visibleColumns.status !== false && <th className="text-left">Status</th>}
                {visibleColumns.actions !== false && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {visibleColumns.store !== false && <td><div className="skeleton h-4 w-32 rounded" /></td>}
                      {visibleColumns.code !== false && <td><div className="skeleton h-4 w-16 rounded" /></td>}
                      {visibleColumns.branch !== false && <td><div className="skeleton h-4 w-28 rounded" /></td>}
                      {visibleColumns.type !== false && <td><div className="skeleton h-4 w-20 rounded" /></td>}
                      {visibleColumns.domain !== false && <td><div className="skeleton h-4 w-36 rounded" /></td>}
                      {visibleColumns.status !== false && <td><div className="skeleton h-4 w-16 rounded" /></td>}
                      {visibleColumns.actions !== false && <td><div className="skeleton h-4 w-12 rounded ml-auto" /></td>}
                    </tr>
                  ))
                : stores.map((s) => (
                    <tr key={s.id} className="group hover:bg-muted/25 transition-colors">
                      {visibleColumns.store !== false && (
                        <td>
                          <div className="flex items-center gap-2">
                            <Store size={16} className="text-primary flex-shrink-0" />
                            <div>
                              <span className="font-medium text-foreground text-sm">{s.name}</span>
                              <div className="text-[10px] text-muted-foreground font-mono">{s.slug}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.code !== false && (
                        <td className="font-mono text-xs text-muted-foreground">{s.code}</td>
                      )}
                      {visibleColumns.branch !== false && (
                        <td className="text-muted-foreground text-sm">{s.branch?.name ?? '—'}</td>
                      )}
                      {visibleColumns.type !== false && (
                        <td>
                          <span className={`badge-${
                            s.type === 'online' ? 'success' :
                            s.type === 'offline' ? 'warning' : 'info'
                          }`}>
                            {s.type}
                          </span>
                        </td>
                      )}
                      {visibleColumns.domain !== false && (
                        <td className="text-muted-foreground text-sm font-mono text-xs">
                          {s.domain ? (
                            <a href={`https://${s.domain}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                              <Globe size={11} /> {s.domain}
                            </a>
                          ) : '—'}
                        </td>
                      )}
                      {visibleColumns.status !== false && (
                        <td>
                          <StatusBadge status={s.is_active} />
                        </td>
                      )}
                      {visibleColumns.actions !== false && (
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            variant="inline"
                            onView={() => setViewStore(s)}
                            onEdit={() => openEditModal(s)}
                            onDelete={() => {
                              if (confirm('Are you sure you want to delete this store?')) deleteMutation.mutate(s.id)
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  ))
              }
              {!isLoading && stores.length === 0 && (
                <EmptyState
                  cols={7}
                  icon={<Store size={24} className="stroke-1.5" />}
                  title={t('settings.noStores', 'No Stores Found')}
                  description={t('settings.noStoresDesc', 'Add POS retail store outlets or online channel configurations.')}
                  actionLabel={t('settings.addStore', 'Add Store')}
                  onAction={openCreateModal}
                />
              )}
            </tbody>
          </table>
      </TableWrapper>
      </div>

      {/* Store Create/Edit Modal */}
      <EnterpriseModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingStore ? t('settings.editStore', 'Edit Store') : t('settings.addStore', 'Add Store')}
        subtitle={
          editingStore
            ? t('settings.editStoreDesc', 'Update retail store branch, outlets, and channel configurations')
            : t('settings.addStoreDesc', 'Create a new POS store outlet or online channel')
        }
        icon={<Store size={20} />}
        iconVariant="blue"
        size="lg"
        footer={
          <ModalFooter
            onCancel={closeModal}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            isEdit={Boolean(editingStore)}
            submitLabel={editingStore ? t('common.saveChanges', 'Save Changes') : t('common.create', 'Save')}
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
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
              className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            >
              <option value="">{t('settings.selectBranch', 'Select Branch')}</option>
              {(branches ?? []).map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.code', 'Store Code')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="ST001"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.name', 'Store Name')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t('settings.storeNamePlaceholder', 'Store Name')}
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.slug', 'Slug (URL Part)')}
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="store-name-outlet"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.domain', 'Custom Domain')}
              </label>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="shop.domain.com"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.email', 'Email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@company.com"
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
            <div>
              <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
                {t('settings.storeType', 'Store Type')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                required
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              >
                <option value="online">{t('settings.onlineStore', 'Online Store')}</option>
                <option value="offline">{t('settings.offlineStore', 'Offline / POS Outlet')}</option>
                <option value="hybrid">{t('settings.hybridStore', 'Hybrid (Both)')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
              {t('settings.address', 'Address')}
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('settings.addressPlaceholder', 'Physical outlet coordinates')}
              rows={2}
              className="w-full min-h-[64px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
              {t('settings.description', 'Description / Notes')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('settings.descriptionPlaceholder', 'Brief description about this branch outlet')}
              rows={2}
              className="w-full min-h-[64px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
            />
          </div>

          {/* Active Status Card */}
          <div className="p-3.5 sm:p-4 bg-muted/15 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="isStoreActive" className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 cursor-pointer select-none block">
                {t('settings.activeStoreStatus', 'Active Store Status')}
              </label>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('settings.activeStoreStatusDesc', 'Active stores can process sales and accept online orders')}
              </p>
            </div>
            <input
              type="checkbox"
              id="isStoreActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary cursor-pointer"
            />
          </div>
        </form>
      </EnterpriseModal>

      {/* Detail Drawer */}
      <AnimatePresence>
        {viewStore && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-card w-full max-w-md border-l border-border h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Store Details</h3>
                <button onClick={() => setViewStore(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Basic Info</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-mono font-medium">{viewStore.code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{viewStore.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slug:</span>
                      <span className="font-mono font-medium text-xs">{viewStore.slug}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{viewStore.type}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={viewStore.is_active} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact & Online Channels</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{viewStore.email ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{viewStore.phone ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="font-mono text-xs">{viewStore.domain ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location Coordinates</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-start gap-1"><MapPin size={14} className="mt-0.5" /> Address:</span>
                      <span className="font-medium text-right max-w-[200px] break-words">{viewStore.address ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description / Notes</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border text-sm text-muted-foreground leading-relaxed">
                    {viewStore.description ? (
                      <div className="flex gap-2">
                        <BookOpen size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>{viewStore.description}</span>
                      </div>
                    ) : 'No description provided.'}
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

export default StoresPage
