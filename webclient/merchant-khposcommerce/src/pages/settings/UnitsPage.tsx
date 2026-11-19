import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalHeader, EmptyState, ResetButton, Modal as EnterpriseModal, ModalFooter, FormField, getFieldClass } from '@/components/common'
import { 
  Plus, Edit2, Trash2, X, Scale, ToggleLeft, ToggleRight, Loader2, 
  ChevronUp, ChevronDown, Download, Upload, Trash, RefreshCw, AlertCircle,
  Save, Sparkles
} from 'lucide-react'
import { unitService } from '@/services/unitService'
import { useToast } from '@/hooks/useToast'
import { downloadBlob } from '@/utils/export'
import { focusFirstInvalidField } from '@/utils/formValidation'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import { PageHeader } from '@/components/common'
import { Breadcrumb } from '@/components/common'
import { DeleteConfirmDialog } from '@/components/common'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { usePermission } from '@/hooks/usePermission'
import { ColumnSettingsPopover } from '@/components/shared/ColumnSettingsPopover'
import { TableToolbar, AddButton, ExportButton, ImportButton, HeaderActionsGroup } from '@/components/common'
import UnitStatsCards from './components/UnitStatsCards'
import { UnitSearchBar } from './components/UnitSearchBar'
import { ModernSelect } from '@/components/shared/ModernSelect'

interface Unit {
  id: number
  company_id: number
  name: string
  symbol: string
  description?: string | null
  is_active: boolean
  deleted_at?: string | null
}

interface UnitPreset {
  symbol: string
  fallback: string
}

const POPULAR_UNIT_PRESETS: UnitPreset[] = [
  { symbol: 'pcs', fallback: 'Piece' },
  { symbol: 'box', fallback: 'Box' },
  { symbol: 'pack', fallback: 'Pack' },
  { symbol: 'set', fallback: 'Set' },
  { symbol: 'pair', fallback: 'Pair' },
  { symbol: 'kg', fallback: 'Kilogram' },
  { symbol: 'g', fallback: 'Gram' },
  { symbol: 'L', fallback: 'Liter' },
  { symbol: 'm', fallback: 'Meter' },
  { symbol: 'btl', fallback: 'Bottle' },
  { symbol: 'can', fallback: 'Can' },
  { symbol: 'bag', fallback: 'Bag' },
]

const UnitsPage: React.FC<{ isTab?: boolean; triggerAdd?: number }> = ({ isTab, triggerAdd }) => {
  const { language } = useThemeStore()
  const { t, i18n } = useTranslation(['products', 'common'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  const canCreateUnit = hasPermission('unit.create')
  const canUpdateUnit = hasPermission('unit.update')
  const canDeleteUnit = hasPermission('unit.delete')
  const canExportUnit = hasPermission('unit.export')
  const canImportUnit = hasPermission('unit.import')

  // Open add modal only when triggerAdd changes to a positive number
  const prevTriggerRef = React.useRef(triggerAdd || 0)
  React.useEffect(() => {
    if (triggerAdd && triggerAdd > 0 && triggerAdd !== prevTriggerRef.current) {
      if (canCreateUnit) {
        openCreateModal()
      }
    }
    prevTriggerRef.current = triggerAdd || 0
  }, [triggerAdd, canCreateUnit])

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'units' })

  // UI state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    symbol: true,
    description: true,
    status: true,
  })

  // CSV Import Modal
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // Sorting states
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  // Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['units', page, debouncedSearch, perPage, sortBy, sortOrder, statusFilter],
    queryFn: () => unitService.list({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage, 
      sort_by: sortBy, 
      sort_order: sortOrder,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    placeholderData: (prev) => prev,
  })

  const units: Unit[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: units.length, current_page: 1, last_page: 1 }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => unitService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.created'))
      closeModal()
    },
    onError: (err: any) => {
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const apiErrors: Record<string, string> = {}
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          apiErrors[k] = Array.isArray(v) ? (v[0] as string) : String(v)
        })
        setErrors(apiErrors)
        focusFirstInvalidField(apiErrors)
        return
      }
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => unitService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.updated'))
      closeModal()
    },
    onError: (err: any) => {
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const apiErrors: Record<string, string> = {}
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          apiErrors[k] = Array.isArray(v) ? (v[0] as string) : String(v)
        })
        setErrors(apiErrors)
        focusFirstInvalidField(apiErrors)
        return
      }
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unitService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
      adjustAfterDelete(units.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => unitService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.deleted'))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkRestoreMutation = useMutation({
    mutationFn: (ids: number[]) => unitService.bulkRestore(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.restored'))
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  // Handlers
  const openCreateModal = () => {
    setEditingUnit(null)
    setName('')
    setSymbol('')
    setDescription('')
    setIsActive(true)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit)
    setName(unit.name)
    setSymbol(unit.symbol)
    setDescription(unit.description ?? '')
    setIsActive(unit.is_active)
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingUnit(null)
    setErrors({})
  }

  const handleSubmit = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = t('products.errors.unitNameRequired', 'Please enter unit name')
    }
    if (!symbol.trim()) {
      newErrors.symbol = t('products.errors.unitSymbolRequired', 'Please enter unit symbol')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }

    const payload = {
      company_id: 1,
      name: name.trim(),
      symbol: symbol.trim(),
      description: description.trim() || null,
      is_active: isActive,
    }

    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleImport = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault()
    if (!importFile) return
    setImporting(true)
    const fd = new FormData()
    fd.append('file', importFile)
    try {
      await unitService.import(fd)
      toast.success(t('toast.importSuccess'))
      setImportOpen(false)
      setImportFile(null)
      qc.invalidateQueries({ queryKey: ['units'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('toast.importError'))
    } finally {
      setImporting(false)
    }
  }

  const handleExport = () => {
    if (!canExportUnit) {
      toast.error(t('errors.permissionDenied', 'Permission denied'))
      return
    }
    unitService.export()
      .then(res => {
        const blob = new Blob(['\uFEFF', res.data], { type: 'text/csv;charset=utf-8;' })
        const dateStamp = new Date().toISOString().split('T')[0]
        downloadBlob(blob, `units_export_${dateStamp}.csv`)
        toast.success(t('toast.exportSuccess'))
      })
      .catch(() => toast.error(t('toast.exportError')))
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb
            items={[
              { label: t('nav.productManagement', 'Products'), path: '/products' },
              { label: t('nav.units', 'Measurement Units') },
            ]}
          />

          {/* Hero Header */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
                {t('products.tabUnits', 'Measurement Units')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                {t('units.subtitle', 'Define standard units of measure, packaging conversions, and precision rules.')}
              </p>
            </div>

            <HeaderActionsGroup>
              {canExportUnit && (
                <ExportButton
                  onClick={handleExport}
                  label={t('products.exportCSV', 'Export CSV')}
                />
              )}

              {canImportUnit && (
                <ImportButton
                  onClick={() => setImportOpen(true)}
                  label={t('products.importCSV', 'Import CSV')}
                />
              )}

              {canCreateUnit && (
                <AddButton
                  onClick={openCreateModal}
                  label={t('products.addUnit', 'Add Unit')}
                />
              )}
            </HeaderActionsGroup>
          </div>

          {/* Stats Cards */}
          <UnitStatsCards
            units={units}
            total={pagination.total}
            isLoading={isLoading}
          />
        </>
      )}

      {/* Bulk actions panel */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            <AlertCircle size={16} />
            <span>{selectedRows.length} {t('products.selectedCount')}</span>
          </div>
          <div className="flex items-center gap-2">
            {canDeleteUnit && (
              <button
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 cursor-pointer"
              >
                <Trash size={13} />
                {t('products.deleteSelected')}
              </button>
            )}
            <button
              onClick={() => setSelectedRows([])}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 cursor-pointer"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* SmartHR-style Unified Filter Bar */}
      <UnitSearchBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val)
          setPage(1)
        }}
        onReset={() => {
          setSearch('')
          setStatusFilter('all')
          setSortBy('created_at')
          setSortOrder('desc')
          setPage(1)
          setSelectedRows([])
        }}
        columns={[
          { key: 'name', label: t('products.colUnitName', 'Unit Name') },
          { key: 'symbol', label: t('products.colSymbol', 'Symbol') },
          { key: 'description', label: t('products.colDescription', 'Description') },
          { key: 'status', label: t('products.colStatus', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        selectedCount={selectedRows.length}
        onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
      />

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <TableWrapper isFetching={isFetching}>
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={units.length > 0 && selectedRows.length === units.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(units.map(u => u.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                  />
                </th>
                {visibleColumns.name !== false && (
                  <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3">
                    {t('products.colUnitName')} {renderSortIcon('name')}
                  </th>
                )}
                {visibleColumns.symbol !== false && (
                  <th onClick={() => handleSort('symbol')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3">
                    {t('products.colSymbol')} {renderSortIcon('symbol')}
                  </th>
                )}
                {visibleColumns.description !== false && (
                  <th onClick={() => handleSort('description')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3">
                    {t('products.colDescription')} {renderSortIcon('description')}
                  </th>
                )}
                {visibleColumns.status !== false && (
                  <th onClick={() => handleSort('is_active')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3 w-28">
                    {t('products.colStatus')} {renderSortIcon('is_active')}
                  </th>
                )}
                <th className="text-right pr-4 py-3 select-none w-28">{t('products.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="w-12"><div className="skeleton h-4 w-4 rounded mx-auto" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-32 rounded" /></td>
                    <td><div className="skeleton h-4 w-16 rounded" /></td>
                    <td><div className="skeleton h-4 w-48 rounded" /></td>
                    <td><div className="skeleton h-4 w-16 rounded" /></td>
                    <td><div className="skeleton h-4 w-12 rounded ml-auto pr-4" /></td>
                  </tr>
                ))
              ) : (
                units.map((unit) => (
                  <tr key={unit.id} className="group border-b border-border/40 hover:bg-muted/30">
                    <td className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(unit.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(prev => [...prev, unit.id])
                          } else {
                            setSelectedRows(prev => prev.filter(id => id !== unit.id))
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                      />
                    </td>
                    {visibleColumns.name !== false && (
                      <td className="font-medium text-foreground text-sm py-3 flex items-center gap-2">
                        <Scale size={16} className="text-blue-500 flex-shrink-0" />
                        <span>{unit.name}</span>
                      </td>
                    )}
                    {visibleColumns.symbol !== false && (
                      <td className="text-muted-foreground font-mono text-xs">{unit.symbol}</td>
                    )}
                    {visibleColumns.description !== false && (
                      <td className="text-muted-foreground text-sm">{unit.description ?? '—'}</td>
                    )}
                    {visibleColumns.status !== false && (
                      <td>
                        <StatusBadge status={unit.is_active} />
                      </td>
                    )}
                    <td className="text-right pr-4">
                      <TableActionMenu
                        variant="inline"
                        onEdit={canUpdateUnit ? () => openEditModal(unit) : undefined}
                        onDelete={canDeleteUnit ? () => setDeleteTarget(unit) : undefined}
                      />
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && units.length === 0 && (
                <EmptyState
                  cols={6}
                  icon={<Scale size={32} />}
                  title={t('products.noUnitsFound', 'No Units Found')}
                  description={t('products.noUnitsDescription', 'Get started by creating your first unit of measurement.')}
                  actionLabel={canCreateUnit ? t('products.addUnit', 'Add Unit') : undefined}
                  onAction={canCreateUnit ? openCreateModal : undefined}
                />
              )}
            </tbody>
          </table>
        </TableWrapper>

        <Pagination 
          currentPage={pagination.current_page} 
          lastPage={pagination.last_page} 
          total={pagination.total} 
          perPage={perPage} 
          onPageChange={setPage} 
          onPerPageChange={setPerPage} 
        />
      </div>

      {/* Unit Create/Edit Modal */}
      <EnterpriseModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingUnit ? t('products.editUnit', 'Edit Unit') : t('products.addUnit', 'Add Unit')}
        subtitle={
          editingUnit
            ? t('products.editUnitDesc', 'Modify measurement unit attributes and notation')
            : t('products.addUnitDesc', 'Create a new measurement unit for inventory tracking')
        }
        icon={<Scale size={20} />}
        iconVariant="blue"
        size="lg"
        footer={
          <ModalFooter
            onCancel={closeModal}
            isSubmitting={isSaving}
            isEdit={Boolean(editingUnit)}
            submitLabel={editingUnit ? t('common.saveChanges', 'Save Changes') : t('products.addUnit', 'Create Unit')}
            onSubmit={handleSubmit}
          />
        }
      >
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-4">
          {/* Popular Quick Presets */}
          {!editingUnit && (
            <div className="p-3 bg-muted/20 dark:bg-slate-900/40 rounded-2xl border border-border/70 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Sparkles size={13} className="text-primary" />
                <span>{t('products.quickPresets', 'Popular Presets')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_UNIT_PRESETS.map((p) => {
                  const isSelected = symbol === p.symbol
                  const displayName = t(`products.presets.${p.symbol}`, p.fallback)
                  return (
                    <button
                      key={p.symbol}
                      type="button"
                      onClick={() => {
                        setName(displayName)
                        setSymbol(p.symbol)
                        handleClearError('name')
                        handleClearError('symbol')
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background text-foreground border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                      }`}
                    >
                      {displayName} <span className="opacity-70 font-mono text-[10px]">({p.symbol})</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Unit Name */}
            <FormField
              label={t('products.colUnitName', 'Unit Name')}
              required
              error={errors.name}
            >
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  handleClearError('name')
                }}
                placeholder={t('products.unitNamePlaceholder', 'e.g. Pieces, Kilograms, Boxes, Sets...')}
                className={getFieldClass(errors.name, "w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium")}
              />
            </FormField>

            {/* Symbol */}
            <FormField
              label={t('products.colSymbol', 'Symbol')}
              required
              error={errors.symbol}
            >
              <input
                id="symbol"
                name="symbol"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value)
                  handleClearError('symbol')
                }}
                placeholder={t('products.unitSymbolPlaceholder', 'e.g. pcs, kg, box')}
                className={getFieldClass(errors.symbol, "w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-semibold")}
              />
            </FormField>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5">
              {t('products.colDescription', 'Description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('products.unitDescPlaceholder', 'Short overview about this measurement unit...')}
              rows={2}
              className="w-full min-h-[64px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
            />
          </div>

          {/* Active Status Card */}
          <div className="p-3.5 sm:p-4 bg-muted/15 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="isUnitActive" className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 cursor-pointer select-none block">
                {t('products.activeUnitStatus', 'Active Unit Status')}
              </label>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('products.activeUnitStatusDesc', 'Active units are available when assigning measurement units to products')}
              </p>
            </div>
            <input
              type="checkbox"
              id="isUnitActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary cursor-pointer"
            />
          </div>
        </form>
      </EnterpriseModal>

      {/* CSV Import Modal */}
      <EnterpriseModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title={t('products.importCSV', 'Import CSV')}
        subtitle={t('products.importCSVDesc', 'Batch import measurement units via CSV/TXT file')}
        icon={<Upload size={20} />}
        iconVariant="blue"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setImportOpen(false)}
            isSubmitting={importing}
            submitLabel={t('products.importCSV', 'Import CSV')}
            onSubmit={handleImport}
          />
        }
      >
        <form onSubmit={handleImport} className="p-5 sm:p-6 space-y-4">
          <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 text-center hover:bg-muted/10 transition-colors">
            <Upload className="mx-auto text-primary mb-2 opacity-80" size={32} />
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-unit-upload"
              required
            />
            <label htmlFor="csv-unit-upload" className="cursor-pointer font-bold text-xs text-primary hover:underline block">
              {importFile ? importFile.name : t('products.clickToUploadCSV', 'Click to browse CSV / TXT file')}
            </label>
            <p className="text-[11px] text-muted-foreground mt-1">UTF-8 CSV format (name, symbol, description)</p>
          </div>
        </form>
      </EnterpriseModal>

      {/* Unified Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('units.deleteTitle', 'Delete Unit')}
        itemName={deleteTarget?.name}
        confirmText={t('common.confirmDelete', 'Confirm Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title={t('units.bulkDeleteTitle', 'Delete Selected Units')}
        message={t('units.confirmBulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected units? This action cannot be undone.`
        }).replace('{{count}}', String(selectedRows.length))}
        confirmText={t('products.deleteSelected', 'Delete Selected')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
        variant="danger"
      />
    </div>
  )
}

export default UnitsPage

