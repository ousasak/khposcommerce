import React from 'react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { StatusBadge, EmptyState } from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import type { PromotionCampaign } from '../types'

interface PromotionTableSectionProps {
  promotions: PromotionCampaign[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  getPromoStatus: (p: PromotionCampaign) => 'running' | 'scheduled' | 'expired' | 'paused' | 'draft'
  setDetailDrawerPromo: (p: PromotionCampaign) => void
  openEditModal: (p: PromotionCampaign) => void
  handleDuplicate: (p: PromotionCampaign) => void
  setDeleteTarget: (p: PromotionCampaign) => void
  toggleStatusMutation: any
  onOpenSimulator?: (p?: PromotionCampaign) => void
  pagination?: {
    current_page: number
    last_page: number
    total: number
  }
  perPage?: number
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
}

export const PromotionTableSection: React.FC<PromotionTableSectionProps> = ({
  promotions = [],
  isLoading,
  isFetching,
  visibleColumns,
  getPromoStatus,
  setDetailDrawerPromo,
  openEditModal,
  handleDuplicate,
  setDeleteTarget,
  toggleStatusMutation,
  onOpenSimulator,
  pagination,
  perPage = 15,
  onPageChange,
  onPerPageChange,
}) => {
  const { t, i18n } = useTranslation(['marketing', 'common'])
  const activeColsCount = Object.values(visibleColumns).filter(Boolean).length || 8

  const formatNumber = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === '') return '0'
    const num = Number(val)
    if (isNaN(num)) return String(val)
    return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '')
  }

  /**
   * Render primary discount badge (e.g. 15% OFF, $10 OFF, BOGO)
   */
  const renderDiscountBadge = (campaign: PromotionCampaign) => {
    const rules = campaign.rules || []
    if (rules.length === 0) {
      if (campaign.type) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
            {campaign.type.replace('_', ' ')}
          </span>
        )
      }
      return (
        <span className="text-xs text-muted-foreground/70 italic">
          {t('marketing.noDiscountRulesYet', 'No discount rule')}
        </span>
      )
    }

    const primaryRule = rules[0]
    const extraCount = rules.length - 1

    let label = ''
    let badgeColor = 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'

    const dType = primaryRule.discount_type || (primaryRule as any).type
    const dVal = primaryRule.discount_value

    if (dType === 'percentage') {
      label = `${formatNumber(dVal)}% ${t('marketing.off', 'OFF')}`
      badgeColor = 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
    } else if (dType === 'fixed_amount') {
      label = `$${formatNumber(dVal)} ${t('marketing.off', 'OFF')}`
      badgeColor = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    } else if (dType === 'bogo') {
      label = t('marketing.bogo', 'BOGO')
      badgeColor = 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    } else if (dType === 'free_gift' || dType === 'free_item') {
      label = t('marketing.freeGift', 'Free Gift')
      badgeColor = 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    } else if (dType === 'free_shipping') {
      label = t('marketing.freeShipping', 'Free Shipping')
      badgeColor = 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
    } else if (dType === 'bundle') {
      label = t('marketing.bundleDeal', 'Bundle Deal')
      badgeColor = 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    } else {
      label = `${formatNumber(dVal)} ${dType || 'Discount'}`
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-2xs ${badgeColor}`}>
            {label}
          </span>
          {extraCount > 0 && (
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
              +{extraCount}
            </span>
          )}
        </div>
        {primaryRule.max_discount_amount && Number(primaryRule.max_discount_amount) > 0 && (
          <div className="text-[11px] text-muted-foreground font-medium">
            {t('marketing.maximumCap', 'Cap')}:{' '}
            <span className="font-mono font-semibold text-foreground">
              ${formatNumber(primaryRule.max_discount_amount)}
            </span>
          </div>
        )}
      </div>
    )
  }

  /**
   * Render Purchase Conditions (Min. Spend & Min. Qty)
   */
  const renderConditions = (campaign: PromotionCampaign) => {
    const primaryRule = campaign.rules?.[0]
    const minSubtotal = primaryRule?.min_subtotal ? Number(primaryRule.min_subtotal) : 0
    const minQty = primaryRule?.min_qty ? Number(primaryRule.min_qty) : 0
    const hasMinSpend = minSubtotal > 0
    const hasMinQty = minQty > 0

    if (!hasMinSpend && !hasMinQty) {
      return (
        <span className="text-xs text-muted-foreground/70 font-medium">
          {t('marketing.noMinimum', '—')}
        </span>
      )
    }

    return (
      <div className="space-y-0.5 text-xs">
        {hasMinSpend && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              {t('marketing.minPurchase', 'Min. Spend')}
            </span>
            <span className="font-mono font-bold text-foreground">
              ${minSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
        {hasMinQty && (
          <div className="text-[11px] text-muted-foreground font-medium">
            {t('marketing.minQuantity', 'Min. Qty')}: <span className="font-mono font-bold text-foreground">{minQty}</span>
          </div>
        )}
      </div>
    )
  }

  /**
   * Render Target Scope Badge (Product, Category, Brand, Cart)
   */
  const renderTargetScopeBadge = (campaign: PromotionCampaign) => {
    const primaryRule = campaign.rules?.[0]
    if (!primaryRule) return null

    const rType = primaryRule.rule_type
    let label = t('marketing.product', 'Product')
    let cls = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/70'

    if (rType === 'category_discount') {
      label = t('marketing.category', 'Category')
      cls = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70'
    } else if (rType === 'brand_discount') {
      label = t('marketing.brand', 'Brand')
      cls = 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70'
    } else if (rType === 'cart_discount') {
      label = t('marketing.cart', 'Cart')
      cls = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70'
    } else if (rType === 'buy_x_get_y') {
      label = t('marketing.bogo', 'BOGO')
      cls = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70'
    }

    return (
      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${cls}`}>
        {label}
      </span>
    )
  }

  /**
   * Render sales channel scope (Omni-Channel, POS, Web Storefront)
   */
  const renderChannelBadges = (campaign: PromotionCampaign) => {
    const channels = campaign.channels?.map((c) => c.channel) || []
    const scope =
      campaign.channel_scope ||
      (channels.length === 0 || channels.includes('all') ? 'all' : channels[0])

    if (scope === 'all' || channels.length === 0 || channels.includes('all')) {
      return (
        <span className="inline-flex items-center text-[10px] font-medium text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded border border-border/60">
          Omni-Channel
        </span>
      )
    }

    if (scope === 'pos' || scope === 'pos_only') {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          POS Only
        </span>
      )
    }

    if (scope === 'web' || scope === 'storefront_only') {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
          Storefront Only
        </span>
      )
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {channels.map((ch) => (
          <span
            key={ch}
            className="text-[10px] font-medium text-foreground bg-muted/60 px-1.5 py-0.5 rounded uppercase"
          >
            {ch}
          </span>
        ))}
      </div>
    )
  }

  /**
   * Render branch scope
   */
  const renderBranchBadges = (campaign: PromotionCampaign) => {
    const branches = campaign.branches || []
    if (branches.length === 0 || campaign.branch_ids === 'all') {
      return (
        <span className="text-[11px] text-muted-foreground">
          {t('marketing.allBranchesNationwide', 'All Branches')}
        </span>
      )
    }

    const allNames = branches.map((b) => b.name).join(', ')

    if (branches.length === 1) {
      return (
        <span
          className="text-[11px] text-muted-foreground truncate block max-w-[180px]"
          title={allNames}
        >
          {branches[0].name}
        </span>
      )
    }

    return (
      <div
        className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0"
        title={allNames}
      >
        <span className="truncate max-w-[120px]">{branches[0].name}</span>
        <span className="inline-flex items-center px-1 rounded text-[10px] font-medium bg-muted text-muted-foreground shrink-0 border border-border/50">
          +{branches.length - 1}
        </span>
      </div>
    )
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return null
      return d.toLocaleDateString(i18n.language === 'km' ? 'km-KH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 sticky top-0 border-b border-border/80 z-10 select-none">
              <tr>
                {visibleColumns.name && (
                  <th className="min-w-[200px] max-w-[260px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('marketing.campaign', 'Campaign')}
                  </th>
                )}
                {(visibleColumns.reward || (!visibleColumns.scope && visibleColumns.type)) && (
                  <th className="min-w-[130px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('marketing.discountReward', 'Reward / Discount')}
                  </th>
                )}
                {visibleColumns.scope && (
                  <th className="min-w-[190px] max-w-[250px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('marketing.scopeAndChannels', 'Scope & Channels')}
                  </th>
                )}
                {visibleColumns.conditions && (
                  <th className="min-w-[120px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('marketing.minPurchaseConditions', 'Min. Purchase')}
                  </th>
                )}
                {visibleColumns.priority && (
                  <th className="w-[85px] text-center py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('marketing.priority', 'Priority')}
                  </th>
                )}
                {visibleColumns.dates && (
                  <th className="min-w-[140px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('marketing.scheduleDates', 'Schedule')}
                  </th>
                )}
                {visibleColumns.performance && (
                  <th className="min-w-[150px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('marketing.usageLimitRedemptions', 'Usage Limit & Redemptions')}
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="w-[110px] text-center py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('common.status', 'Status')}
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="w-[110px] text-right py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('common.actions', 'Actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={activeColsCount} />
              ) : promotions.length === 0 ? (
                <EmptyState
                  cols={activeColsCount}
                  message={t(
                    'marketing.noCampaignsFound',
                    'No promotion campaigns found matching query.'
                  )}
                />
              ) : (
                promotions.map((p) => {
                  const st = getPromoStatus(p)
                  const usedCount = p.usage_count || p.usages_count || 0
                  const maxUses = p.usage_limit || null
                  const usagePercent = maxUses
                    ? Math.min(100, Math.round((usedCount / maxUses) * 100))
                    : null

                  const startDateStr = p.start_at || p.starts_at
                  const endDateStr = p.end_at || p.ends_at
                  const formattedStart = formatDate(startDateStr)
                  const formattedEnd = formatDate(endDateStr)
                  const isExpired = endDateStr && new Date(endDateStr) < new Date()

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors border-b border-border/50"
                    >
                      {/* Column 1: Campaign Name & Code */}
                      {visibleColumns.name && (
                        <td className="py-3 px-3.5 max-w-[280px]">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p
                                onClick={() => setDetailDrawerPromo(p)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors text-sm truncate max-w-[220px]"
                                title={p.name}
                              >
                                {p.name}
                              </p>
                              {p.code && (
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/60 shrink-0">
                                  {p.code}
                                </span>
                              )}
                            </div>
                            {p.description ? (
                              <p
                                className="text-xs text-muted-foreground truncate"
                                title={p.description}
                              >
                                {p.description}
                              </p>
                            ) : (
                              <p className="text-[11px] text-muted-foreground/50 italic">
                                {t('marketing.noDescription', 'No description')}
                              </p>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Column 2: Reward / Discount */}
                      {(visibleColumns.reward || (!visibleColumns.scope && visibleColumns.type)) && (
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {renderDiscountBadge(p)}
                        </td>
                      )}

                      {/* Column 3: Scope & Channels */}
                      {visibleColumns.scope && (
                        <td className="py-3 px-3.5 max-w-[240px]">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {renderTargetScopeBadge(p)}
                              {renderChannelBadges(p)}
                            </div>
                            <div className="min-w-0">{renderBranchBadges(p)}</div>
                          </div>
                        </td>
                      )}

                      {/* Column 4: Min. Purchase / Conditions */}
                      {visibleColumns.conditions && (
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {renderConditions(p)}
                        </td>
                      )}

                      {/* Column 3: Priority */}
                      {visibleColumns.priority && (
                        <td className="py-3 px-3.5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md text-xs font-mono font-bold bg-muted/80 text-foreground border border-border/60 shadow-2xs">
                            {p.priority || 0}
                          </span>
                        </td>
                      )}

                      {/* Column 4: Schedule */}
                      {visibleColumns.dates && (
                        <td className="py-3 px-3.5 text-xs whitespace-nowrap">
                          <div className="font-medium text-foreground">
                            {formattedStart || t('marketing.dateImmediate', 'Immediate')}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <span className="text-muted-foreground/60">
                              {t('marketing.dateTo', 'to')}
                            </span>
                            <span className={isExpired ? 'text-rose-500 font-semibold' : ''}>
                              {formattedEnd || t('marketing.dateNever', 'Never')}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Column 5: Performance & Usage */}
                      {visibleColumns.performance && (
                        <td className="py-3 px-3.5 text-xs">
                          <div className="space-y-1.5 min-w-[120px] max-w-[150px]">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-foreground">
                                {usedCount.toLocaleString()} {t('marketing.used', 'used')}
                              </span>
                              <span className="text-muted-foreground text-[11px]">
                                {maxUses ? `/ ${maxUses.toLocaleString()}` : t('marketing.unlimited', 'Unlimited')}
                              </span>
                            </div>
                            {maxUses ? (
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    usagePercent && usagePercent >= 90
                                      ? 'bg-rose-500'
                                      : usagePercent && usagePercent >= 70
                                      ? 'bg-amber-500'
                                      : 'bg-primary'
                                  }`}
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </td>
                      )}

                      {/* Column 6: Status Toggle */}
                      {visibleColumns.status && (
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: p.id,
                                is_active: !p.is_active,
                              })
                            }
                            className="inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                            title={
                              p.is_active
                                ? t('marketing.clickToPause', 'Click to pause campaign')
                                : t('marketing.clickToActivate', 'Click to activate campaign')
                            }
                          >
                            <StatusBadge status={st} />
                          </button>
                        </td>
                      )}

                      {/* Column 7: Actions */}
                      {visibleColumns.actions && (
                        <td
                          className="py-3 px-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end">
                            <TableActionMenu
                              variant="inline"
                              buttonSize="sm"
                              align="right"
                              onView={() => setDetailDrawerPromo(p)}
                              onEdit={() => openEditModal(p)}
                              onDelete={() => setDeleteTarget(p)}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>

      {pagination && onPageChange && onPerPageChange && pagination.total > 0 && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={perPage}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
        />
      )}
    </div>
  )
}

export default PromotionTableSection
