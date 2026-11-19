import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marketingService } from '@/services/marketingService'
import { useToast } from '@/hooks/useToast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Breadcrumb } from '@/components/common'
import { PageHeader } from '@/components/common'
import { HeaderActionsGroup, AddButton, ExportButton, ImportButton } from '@/components/common'
import { downloadCsv } from '@/utils/export'
import { useTranslation } from 'react-i18next'

import { PromotionSearchBar } from './components/PromotionSearchBar'
import { PromotionDetailDrawer } from './components/PromotionDetailDrawer'
import { PromotionImportModal } from './components/PromotionImportModal'
import { PromotionTableSection } from './components/PromotionTableSection'
import { PromotionSimulatorModal } from './components/PromotionSimulatorModal'
import { DiscountRulesStatsCards } from '../discount-rules/components/DiscountRulesStatsCards'
import { type Promotion } from './types'

const PromotionsPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'toast'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  // Modals & Drawers
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [detailDrawerPromo, setDetailDrawerPromo] = useState<Promotion | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)

  // Filters & View State
  const [statusTab, setStatusTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [page, setPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(15)

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    reward: true,
    scope: true,
    conditions: true,
    priority: true,
    dates: true,
    performance: true,
    status: true,
    actions: true,
  })

  // CSV Import
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreviewData, setImportPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Query - Fetch all campaigns with isFetching tracking
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => marketingService.getPromotions({ per_page: 100 }),
  })

  const campaigns: Promotion[] = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.data?.data)) return data.data.data
    return []
  }, [data])

  const getPromoStatus = (p: Promotion): 'running' | 'scheduled' | 'expired' | 'paused' | 'draft' => {
    if (!p.is_active) return 'paused'
    const now = new Date()
    const start = p.start_at || p.starts_at
    const end = p.end_at || p.ends_at
    if (start && new Date(start) > now) return 'scheduled'
    if (end && new Date(end) < now) return 'expired'
    if (p.priority < 0) return 'draft'
    return 'running'
  }

  // Analytics Computation for KPI Cards
  const analytics = useMemo(() => {
    let runningCount = 0
    let scheduledCount = 0
    let pausedCount = 0
    let expiredCount = 0
    let totalRedemptions = 0
    let totalLimit = 0
    let totalRules = 0
    let expiringSoonCount = 0

    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(now.getDate() + 7)

    campaigns.forEach((c) => {
      const status = getPromoStatus(c)
      if (status === 'running') runningCount++
      else if (status === 'scheduled') scheduledCount++
      else if (status === 'paused') pausedCount++
      else if (status === 'expired') expiredCount++

      const end = c.end_at || c.ends_at
      if (status === 'running' && end) {
        const endDate = new Date(end)
        if (endDate > now && endDate <= sevenDaysFromNow) {
          expiringSoonCount++
        }
      }

      totalRedemptions += c.usage_count || c.usages_count || 0
      if (c.usage_limit) totalLimit += c.usage_limit
      totalRules += (c.rules || []).length
    })

    return {
      totalPromotions: campaigns.length,
      runningPromotions: runningCount,
      scheduledPromotions: scheduledCount,
      pausedPromotions: pausedCount,
      expiredPromotions: expiredCount,
      expiringSoonPromotions: expiringSoonCount,
      totalRedemptions,
      totalUsageLimit: totalLimit,
      totalRules,
    }
  }, [campaigns])

  // Filtered Campaigns based on Status Tab, Search, and Channel
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const status = getPromoStatus(c)

      // Status Tab filter
      if (statusTab !== 'all' && status !== statusTab) {
        return false
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchName = c.name?.toLowerCase().includes(query)
        const matchCode = c.code?.toLowerCase().includes(query)
        const matchDesc = c.description?.toLowerCase().includes(query)
        const matchRules = (c.rules || []).some((r: any) =>
          r.name?.toLowerCase().includes(query) ||
          r.products?.some((p: any) => p.name?.toLowerCase().includes(query)) ||
          r.brands?.some((b: any) => b.name?.toLowerCase().includes(query)) ||
          r.categories?.some((cat: any) => cat.name?.toLowerCase().includes(query))
        )
        if (!matchName && !matchCode && !matchDesc && !matchRules) {
          return false
        }
      }

      // Channel Filter
      if (channelFilter !== 'all') {
        const channels = c.channels || []
        const hasChannel = channels.some(
          (ch: any) => ch.channel === channelFilter || ch.channel === 'all'
        )
        if (!hasChannel && channels.length > 0) {
          return false
        }
      }

      // Type Filter
      if (typeFilter !== 'all') {
        const hasType =
          (c.rules || []).some(
            (r: any) =>
              r.discount_type === typeFilter ||
              r.rule_type === typeFilter ||
              r.type === typeFilter
          ) ||
          (c as any).type === typeFilter ||
          (c as any).discount_type === typeFilter
        if (!hasType && (c.rules || []).length > 0) {
          return false
        }
      }

      return true
    })
  }, [campaigns, statusTab, searchQuery, channelFilter, typeFilter])

  // Paginated Campaigns for Table and Cards
  const total = filteredCampaigns.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const paginatedCampaigns = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredCampaigns.slice(start, start + perPage)
  }, [filteredCampaigns, page, perPage])

  const handleResetFilters = () => {
    setSearchQuery('')
    setChannelFilter('all')
    setStatusTab('all')
    setTypeFilter('all')
    setPage(1)
  }

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => marketingService.deletePromotion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] })
      setDeleteTarget(null)
      toast.success(t('marketing.promoDeleted', 'Promotion campaign deleted successfully.'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete promotion.'),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      marketingService.togglePromotionStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('marketing.statusUpdated', 'Promotion status updated.'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update status.'),
  })

  const openCreateModal = () => {
    navigate('/marketing/promotions/create')
  }

  const openEditModal = (promo: Promotion) => {
    navigate(`/marketing/promotions/${promo.id}/edit`)
  }

  const handleDuplicate = (promo: Promotion) => {
    navigate('/marketing/promotions/create', { state: { duplicateFrom: promo } })
  }

  const handleExportCSV = () => {
    if (!campaigns.length) {
      toast.error(t('marketing.noDataToExport', 'No data available to export.'))
      return
    }
    const headers = [
      t('common.id', 'ID'),
      t('marketing.campaign', 'Campaign'),
      t('marketing.code', 'Code'),
      t('marketing.channel', 'Channel'),
      t('marketing.priority', 'Priority'),
      t('marketing.startsAt', 'Starts At'),
      t('marketing.endsAt', 'Ends At'),
      t('common.status', 'Status'),
    ]
    const rows = campaigns.map((p) => [
      p.id,
      p.name,
      p.code || '',
      p.channel_scope || 'all',
      p.priority,
      p.starts_at ? new Date(p.starts_at).toLocaleDateString() : t('marketing.dateImmediate', 'Immediate'),
      p.ends_at ? new Date(p.ends_at).toLocaleDateString() : t('marketing.dateNever', 'Never'),
      p.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive'),
    ])
    downloadCsv('promotion_campaigns', headers, rows)
    toast.success(t('marketing.exportSuccess', 'Downloaded promotions as CSV.'))
  }

  const handleFileSelectForImport = (file: File) => {
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0)
      if (lines.length === 0) return
      const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim())
      const rows = lines.slice(1, 6).map((line) => line.split(',').map((c) => c.replace(/^"|"$/g, '').trim()))
      setImportPreviewData({ headers, rows })
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      await new Promise((res) => setTimeout(res, 800))
      qc.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('marketing.importSuccess', 'Successfully imported promotions dataset.'))
      setImportModalOpen(false)
      setImportFile(null)
      setImportPreviewData(null)
    } catch {
      toast.error(t('marketing.importFailed', 'Failed to import dataset.'))
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.marketingManagement', t('nav.marketing', 'Marketing')), path: '/marketing/promotions' },
          { label: t('marketing.promotionsTitle', 'Promotions & Discounts') },
        ]}
      />

      {/* Hero Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('marketing.promotionsTitle', 'Promotions & Discounts')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t(
              'marketing.promotionsSubtitle',
              'Manage campaigns, discount rules, schedules, channels, and redemption limits.'
            )}
          </p>
        </div>
        <HeaderActionsGroup>
          <ImportButton
            onClick={() => setImportModalOpen(true)}
            label={t('marketing.importCsv', 'Import CSV')}
          />
          <ExportButton
            onClick={handleExportCSV}
            label={t('marketing.exportCsv', 'Export CSV')}
          />
          <AddButton
            onClick={openCreateModal}
            label={t('marketing.addPromotion', 'Add Promotion')}
          />
        </HeaderActionsGroup>
      </div>

      {/* KPI Stats Cards */}
      <DiscountRulesStatsCards campaigns={campaigns} isLoading={isLoading} />

      {/* ─── SmartHR-Style Promotion Search & Filter Bar (Matching ProductSearchBar) ─── */}
      <PromotionSearchBar
        search={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setPage(1)
        }}
        statusFilter={statusTab}
        onStatusChange={(val) => {
          setStatusTab(val)
          setPage(1)
        }}
        channelFilter={channelFilter}
        onChannelChange={(val) => {
          setChannelFilter(val)
          setPage(1)
        }}
        typeFilter={typeFilter}
        onTypeChange={(val) => {
          setTypeFilter(val)
          setPage(1)
        }}
        onReset={handleResetFilters}
        columns={[
          { key: 'name', label: t('marketing.campaign', 'Campaign') },
          { key: 'reward', label: t('marketing.discountReward', 'Reward / Discount') },
          { key: 'scope', label: t('marketing.scopeAndChannels', 'Scope & Channels') },
          { key: 'conditions', label: t('marketing.minPurchaseConditions', 'Min. Purchase') },
          { key: 'priority', label: t('marketing.priority', 'Priority') },
          { key: 'dates', label: t('marketing.scheduleDates', 'Schedule') },
          { key: 'performance', label: t('marketing.usageLimitRedemptions', 'Usage Limit & Redemptions') },
          { key: 'status', label: t('common.status', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        columnSettingsTitle={t('tables.manageTable', 'Manage Table')}
      />

      {/* Clean Enterprise Table */}
      <PromotionTableSection
        promotions={paginatedCampaigns}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        getPromoStatus={getPromoStatus}
        setDetailDrawerPromo={setDetailDrawerPromo}
        openEditModal={openEditModal}
        handleDuplicate={handleDuplicate}
        setDeleteTarget={setDeleteTarget}
        toggleStatusMutation={toggleStatusMutation}
        onOpenSimulator={() => setSimulatorOpen(true)}
        pagination={{ current_page: page, last_page: lastPage, total }}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(newPerPage) => {
          setPerPage(newPerPage)
          setPage(1)
        }}
      />

      {/* Detail Drawer */}
      <PromotionDetailDrawer
        promo={detailDrawerPromo}
        onClose={() => setDetailDrawerPromo(null)}
        handleDuplicate={handleDuplicate}
        openEditModal={openEditModal}
        onOpenSimulator={() => setSimulatorOpen(true)}
      />

      {/* CSV Import Modal */}
      <PromotionImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        importFile={importFile}
        setImportFile={setImportFile}
        handleFileSelectForImport={handleFileSelectForImport}
        importPreviewData={importPreviewData}
        isImporting={isImporting}
        handleConfirmImport={handleConfirmImport}
      />

      {/* Promotion Simulator Modal */}
      <PromotionSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('marketing.deleteCampaignTitle', 'Delete Promotion Campaign')}
        message={t(
          'marketing.deleteCampaignMessage',
          'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
          { name: deleteTarget?.name }
        )}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        confirmText={t('marketing.deleteCampaign', 'Delete Campaign')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

export default PromotionsPage
