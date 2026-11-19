import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/common'
import { HeaderActionsGroup, AddButton } from '@/components/common'
import { marketingService } from '@/services/marketingService'
import DiscountRulesStatsCards from './components/DiscountRulesStatsCards'
import { DiscountRulesSearchBar } from './components/DiscountRulesSearchBar'
import {
  DiscountRulesTableSection,
  type FlattenedPromotionRule,
} from './components/DiscountRulesTableSection'
import { QuickEditRuleDrawer } from './components/QuickEditRuleDrawer'
import { PromotionDetailDrawer } from '../promotions/components/PromotionDetailDrawer'
import { PromotionSimulatorModal } from '../promotions/components/PromotionSimulatorModal'
import { type PromotionCampaign } from '../promotions/types'

const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
  name: true,
  discount: true,
  scope: true,
  conditions: true,
  priority: true,
  status: true,
  actions: true,
}

export const DiscountRulesPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'nav', 'tables', 'buttons'])
  const navigate = useNavigate()

  // State
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [detailDrawerPromo, setDetailDrawerPromo] = useState<PromotionCampaign | null>(null)
  const [quickEditRule, setQuickEditRule] = useState<FlattenedPromotionRule | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [ruleTypeFilter, setRuleTypeFilter] = useState('all')
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Sorting
  const [sortBy, setSortBy] = useState('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  // Columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    DEFAULT_VISIBLE_COLUMNS
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => marketingService.getPromotions({ per_page: 100 }),
  })

  const campaigns: PromotionCampaign[] = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.data?.data)) return data.data.data
    return []
  }, [data])

  // Extract all rules flattened with parent campaign
  const allRules: FlattenedPromotionRule[] = useMemo(() => {
    const list: FlattenedPromotionRule[] = []
    campaigns.forEach((camp) => {
      ;(camp.rules || []).forEach((rule) => {
        list.push({ ...rule, campaign: camp })
      })
    })
    return list
  }, [campaigns])

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return allRules.filter((r) => {
      // 1. Rule Type Filter
      if (ruleTypeFilter !== 'all' && r.rule_type !== ruleTypeFilter) {
        return false
      }

      // 2. Discount / Reward Type Filter
      if (discountTypeFilter !== 'all') {
        const dType = r.discount_type || (r as any).type
        if (dType !== discountTypeFilter) {
          return false
        }
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        const isActive = Boolean(r.is_active && (r.campaign?.is_active ?? true))
        if (statusFilter === 'active' && !isActive) return false
        if (statusFilter === 'inactive' && isActive) return false
      }

      // 4. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const nameMatch = r.name?.toLowerCase().includes(q)
        const campaignMatch = r.campaign?.name?.toLowerCase().includes(q)
        const codeMatch = r.campaign?.code?.toLowerCase().includes(q)
        const targetProductsMatch = r.products?.some((p) =>
          p.name.toLowerCase().includes(q)
        )
        const targetBrandsMatch = r.brands?.some((b) =>
          b.name.toLowerCase().includes(q)
        )
        const targetCategoriesMatch = r.categories?.some((c: any) =>
          c.name.toLowerCase().includes(q)
        )

        if (
          !nameMatch &&
          !campaignMatch &&
          !codeMatch &&
          !targetProductsMatch &&
          !targetBrandsMatch &&
          !targetCategoriesMatch
        ) {
          return false
        }
      }

      return true
    })
  }, [allRules, ruleTypeFilter, discountTypeFilter, statusFilter, searchQuery])

  // Sorted Rules
  const sortedRules = useMemo(() => {
    return [...filteredRules].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '')
      } else if (sortBy === 'discount_value') {
        comparison = Number(a.discount_value || 0) - Number(b.discount_value || 0)
      } else if (sortBy === 'min_subtotal') {
        comparison = Number(a.min_subtotal || 0) - Number(b.min_subtotal || 0)
      } else if (sortBy === 'priority') {
        comparison = Number(a.priority || 0) - Number(b.priority || 0)
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredRules, sortBy, sortOrder])

  // Paginated Rules
  const total = sortedRules.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const paginatedRules = useMemo(() => {
    const start = (page - 1) * perPage
    return sortedRules.slice(start, start + perPage)
  }, [sortedRules, page, perPage])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setRuleTypeFilter('all')
    setDiscountTypeFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  const openCreateModal = () => {
    navigate('/marketing/promotions/create')
  }

  const openEditModal = (promo: PromotionCampaign) => {
    navigate(`/marketing/promotions/${promo.id}/edit`)
  }

  const handleDuplicate = (promo: PromotionCampaign) => {
    navigate(`/marketing/promotions/create?duplicate_id=${promo.id}`)
  }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          {
            label: t('nav.marketingManagement', t('nav.marketing', 'Marketing')),
            path: '/marketing/promotions',
          },
          { label: t('marketing.discountRulesTitle', 'Discount Rules') },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {t('marketing.discountRulesTitle', 'Discount Rules')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t(
              'marketing.discountRulesSubtitle',
              'Manage discount rules across products, brands, categories, carts, BOGO, and bundles per campaign.'
            )}
          </p>
        </div>

        <HeaderActionsGroup>
          <AddButton
            onClick={openCreateModal}
            label={t('marketing.addCampaign', 'Campaign')}
          />
        </HeaderActionsGroup>
      </div>

      {/* Stats Cards */}
      <DiscountRulesStatsCards campaigns={campaigns} isLoading={isLoading} />

      {/* Unified Search & Filter Bar (Matching Product & Promotion standard) */}
      <DiscountRulesSearchBar
        search={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setPage(1)
        }}
        ruleTypeFilter={ruleTypeFilter}
        onRuleTypeChange={(val) => {
          setRuleTypeFilter(val)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val)
          setPage(1)
        }}
        discountTypeFilter={discountTypeFilter}
        onDiscountTypeChange={(val) => {
          setDiscountTypeFilter(val)
          setPage(1)
        }}
        onReset={handleResetFilters}
        columns={[
          { key: 'name', label: t('marketing.ruleAndCampaign', 'Rule & Campaign') },
          { key: 'discount', label: t('marketing.discountReward', 'Reward / Discount') },
          { key: 'scope', label: t('marketing.scopeAndTargets', 'Scope & Targets') },
          { key: 'conditions', label: t('marketing.minPurchaseConditions', 'Min. Purchase') },
          { key: 'priority', label: t('marketing.priority', 'Priority') },
          { key: 'status', label: t('common.status', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
        onColumnChange={setVisibleColumns}
        columnSettingsTitle={t('tables.manageTable', 'Manage Table')}
      />

      {/* Clean Enterprise Table Section */}
      <DiscountRulesTableSection
        rules={paginatedRules}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onView={(rule) => setDetailDrawerPromo(rule.campaign)}
        onEditCampaign={(camp) => openEditModal(camp)}
        onEditRule={(rule) => setQuickEditRule(rule)}
        pagination={{ current_page: page, last_page: lastPage, total }}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(newPerPage) => {
          setPerPage(newPerPage)
          setPage(1)
        }}
      />

      {/* Quick Edit Rule Drawer */}
      <QuickEditRuleDrawer
        rule={quickEditRule}
        open={Boolean(quickEditRule)}
        onClose={() => setQuickEditRule(null)}
        onFullEdit={(campaignId) => navigate(`/marketing/promotions/${campaignId}/edit`)}
      />

      {/* Detail Drawer */}
      <PromotionDetailDrawer
        promo={detailDrawerPromo}
        onClose={() => setDetailDrawerPromo(null)}
        handleDuplicate={handleDuplicate}
        openEditModal={openEditModal}
        onOpenSimulator={() => {
          setDetailDrawerPromo(null)
          setSimulatorOpen(true)
        }}
      />

      {/* Simulator Modal */}
      <PromotionSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />
    </div>
  )
}

export default DiscountRulesPage
