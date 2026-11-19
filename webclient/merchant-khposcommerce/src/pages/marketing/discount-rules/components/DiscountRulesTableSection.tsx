import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Tag,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Package,
  Layers,
  Sparkles,
  ShoppingCart,
  Gift,
  Zap,
  Percent,
  Layers as LayersIcon,
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { StatusBadge, EmptyState } from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import type { PromotionCampaign, PromotionRule } from '../../promotions/types'

export type FlattenedPromotionRule = PromotionRule & {
  campaign: PromotionCampaign
}

interface DiscountRulesTableSectionProps {
  rules: FlattenedPromotionRule[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  onView: (rule: FlattenedPromotionRule) => void
  onEditCampaign: (campaign: PromotionCampaign) => void
  onEditRule?: (rule: FlattenedPromotionRule) => void
  pagination?: {
    current_page: number
    last_page: number
    total: number
  }
  perPage?: number
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
}

const RULE_SCOPE_CONFIG: Record<
  string,
  { labelKey: string; fallback: string; icon: React.ElementType; badgeClass: string }
> = {
  product_discount: {
    labelKey: 'marketing.product',
    fallback: 'Product',
    icon: Package,
    badgeClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/70',
  },
  category_discount: {
    labelKey: 'marketing.category',
    fallback: 'Category',
    icon: Layers,
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70',
  },
  brand_discount: {
    labelKey: 'marketing.brand',
    fallback: 'Brand',
    icon: Sparkles,
    badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70',
  },
  cart_discount: {
    labelKey: 'marketing.cart',
    fallback: 'Cart',
    icon: ShoppingCart,
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70',
  },
  buy_x_get_y: {
    labelKey: 'marketing.bogo',
    fallback: 'BOGO',
    icon: Gift,
    badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70',
  },
  bundle_discount: {
    labelKey: 'marketing.bundle',
    fallback: 'Bundle',
    icon: LayersIcon,
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70',
  },
  free_shipping: {
    labelKey: 'marketing.freeShipping',
    fallback: 'Free Shipping',
    icon: Zap,
    badgeClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/70',
  },
}

export const DiscountRulesTableSection: React.FC<DiscountRulesTableSectionProps> = ({
  rules = [],
  isLoading,
  isFetching,
  visibleColumns,
  sortBy = 'priority',
  sortOrder = 'desc',
  onSort,
  onView,
  onEditCampaign,
  onEditRule,
  pagination,
  perPage = 15,
  onPageChange,
  onPerPageChange,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'tables'])
  const activeColsCount = Object.values(visibleColumns).filter(Boolean).length || 7

  const renderSortIcon = (columnKey: string) => {
    if (!onSort) return null
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={13} className="text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowDown size={13} className="text-primary shrink-0 transition-transform" />
      )
    }
    return (
      <ArrowUpDown
        size={13}
        className="opacity-0 group-hover:opacity-60 text-muted-foreground shrink-0 transition-opacity"
      />
    )
  }

  const formatNumber = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === '') return '0'
    const num = Number(val)
    if (isNaN(num)) return String(val)
    return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '')
  }

  /**
   * Render discount reward badge (e.g., 15% OFF, $10 OFF, BOGO)
   */
  const renderRewardBadge = (rule: FlattenedPromotionRule) => {
    const dType = rule.discount_type || (rule as any).type
    const dVal = rule.discount_value

    let label = ''
    let badgeClass = 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'

    if (dType === 'percentage') {
      label = `${formatNumber(dVal)}% ${t('marketing.off', 'OFF')}`
      badgeClass = 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
    } else if (dType === 'fixed_amount') {
      label = `$${formatNumber(dVal)} ${t('marketing.off', 'OFF')}`
      badgeClass = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    } else if (dType === 'bogo') {
      label = t('marketing.bogo', 'BOGO')
      badgeClass = 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    } else if (dType === 'free_gift' || dType === 'free_item') {
      label = t('marketing.freeGift', 'Free Gift')
      badgeClass = 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    } else if (dType === 'free_shipping') {
      label = t('marketing.freeShipping', 'Free Shipping')
      badgeClass = 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
    } else if (dType === 'bundle') {
      label = t('marketing.bundleDeal', 'Bundle Deal')
      badgeClass = 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    } else {
      label = `${formatNumber(dVal)} ${dType || ''}`
    }

    return (
      <div className="space-y-1">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-2xs ${badgeClass}`}
        >
          {label}
        </span>
        {rule.max_discount_amount && Number(rule.max_discount_amount) > 0 && (
          <div className="text-[11px] text-muted-foreground font-medium">
            {t('marketing.maximumCap', 'Cap')}:{' '}
            <span className="font-mono font-semibold text-foreground">
              ${formatNumber(rule.max_discount_amount)}
            </span>
          </div>
        )}
      </div>
    )
  }

  /**
   * Render Scope and Target chips
   */
  const renderScopeAndTargets = (rule: FlattenedPromotionRule) => {
    const scopeCfg = RULE_SCOPE_CONFIG[rule.rule_type] ?? {
      labelKey: 'marketing.discount',
      fallback: 'Discount',
      icon: Percent,
      badgeClass: 'bg-muted text-muted-foreground border-border/60',
    }
    const ScopeIcon = scopeCfg.icon

    const targets: string[] = [
      ...(rule.products?.map((p) => p.name) ?? []),
      ...(rule.brands?.map((b) => b.name) ?? []),
      ...(rule.categories?.map((c: any) => c.name) ?? []),
    ]

    return (
      <div className="space-y-1.5 min-w-0 max-w-[280px]">
        {/* Scope Pill */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${scopeCfg.badgeClass}`}
          >
            <ScopeIcon size={12} className="shrink-0" />
            <span>{t(scopeCfg.labelKey, scopeCfg.fallback)}</span>
          </span>
        </div>

        {/* Target summary chips */}
        {targets.length > 0 ? (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground flex-wrap">
            {targets.slice(0, 2).map((targetName, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-200/80 dark:border-slate-700 truncate max-w-[130px]"
                title={targetName}
              >
                {targetName}
              </span>
            ))}
            {targets.length > 2 && (
              <span className="text-[10px] text-muted-foreground font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                +{targets.length - 2}
              </span>
            )}
          </div>
        ) : rule.rule_type === 'cart_discount' ? (
          <span className="text-xs text-muted-foreground font-medium block">
            {t('marketing.entireCart', 'Entire Cart')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/80 font-medium block">
            {t('marketing.allQualifiedItems', 'All qualifying items')}
          </span>
        )}
      </div>
    )
  }

  /**
   * Render Min Purchase / Conditions
   */
  const renderConditions = (rule: FlattenedPromotionRule) => {
    const minSubtotal = rule.min_subtotal ? Number(rule.min_subtotal) : 0
    const minQty = rule.min_qty ? Number(rule.min_qty) : 0
    const hasMinSpend = minSubtotal > 0
    const hasMinQty = minQty > 0

    if (!hasMinSpend && !hasMinQty) {
      return (
        <span className="text-xs font-medium text-muted-foreground/80">
          {t('marketing.noMinimum', 'No minimum')}
        </span>
      )
    }

    return (
      <div className="space-y-1 text-xs">
        {hasMinSpend && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              {t('marketing.minPurchase', 'Min. Spend')}
            </span>
            <span className="font-mono font-bold text-sm text-foreground">
              ${minSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
        {hasMinQty && (
          <div className="text-[11px] text-muted-foreground font-medium">
            {t('marketing.minQuantity', 'Min. Qty')}:{' '}
            <span className="font-mono font-bold text-foreground">
              {minQty}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 sticky top-0 border-b border-border/80 z-10 select-none">
              <tr>
                {visibleColumns.name && (
                  <th
                    onClick={() => onSort?.('name')}
                    className="min-w-[220px] max-w-[280px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('marketing.ruleAndCampaign', 'Rule & Campaign')}</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                )}
                {visibleColumns.discount && (
                  <th
                    onClick={() => onSort?.('discount_value')}
                    className="min-w-[140px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('marketing.discountReward', 'Reward / Discount')}</span>
                      {renderSortIcon('discount_value')}
                    </div>
                  </th>
                )}
                {visibleColumns.scope && (
                  <th className="min-w-[200px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('marketing.scopeAndTargets', 'Scope & Targets')}
                  </th>
                )}
                {visibleColumns.conditions && (
                  <th
                    onClick={() => onSort?.('min_subtotal')}
                    className="min-w-[130px] text-left py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('marketing.minPurchaseConditions', 'Min. Purchase')}</span>
                      {renderSortIcon('min_subtotal')}
                    </div>
                  </th>
                )}
                {visibleColumns.priority && (
                  <th
                    onClick={() => onSort?.('priority')}
                    className="w-[85px] text-center py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{t('marketing.priority', 'Priority')}</span>
                      {renderSortIcon('priority')}
                    </div>
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="w-[110px] text-center py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('common.status', 'Status')}
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="w-[100px] text-right py-3 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('common.actions', 'Actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={activeColsCount} />
              ) : rules.length === 0 ? (
                <EmptyState
                  cols={activeColsCount}
                  message={t(
                    'marketing.noRulesFound',
                    'No discount rules found matching query.'
                  )}
                />
              ) : (
                rules.map((rule, idx) => {
                  const ruleKey = rule.id || `${rule.campaign?.id}-${rule.name}-${idx}`
                  const isActive = Boolean(
                    rule.is_active && (rule.campaign?.is_active ?? true)
                  )

                  return (
                    <tr
                      key={ruleKey}
                      className="hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors border-b border-border/50"
                    >
                      {/* Column 1: Rule Name & Parent Campaign */}
                      {visibleColumns.name && (
                        <td className="py-3 px-3.5 max-w-[280px]">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={() => onView(rule)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors text-sm truncate max-w-[240px]"
                                title={rule.name}
                              >
                                {rule.name}
                              </span>
                              {rule.is_stackable && (
                                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 shrink-0">
                                  {t('marketing.stackable', 'Stackable')}
                                </span>
                              )}
                            </div>

                            {/* Campaign Subtitle */}
                            {rule.campaign && (
                              <button
                                type="button"
                                onClick={() => onEditCampaign(rule.campaign)}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group/camp truncate max-w-[240px] text-left cursor-pointer"
                                title={rule.campaign.name}
                              >
                                <Tag size={12} className="shrink-0 text-muted-foreground/60 group-hover/camp:text-primary transition-colors" />
                                <span className="truncate group-hover/camp:underline underline-offset-2">
                                  {rule.campaign.name}
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Column 2: Reward / Discount */}
                      {visibleColumns.discount && (
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {renderRewardBadge(rule)}
                        </td>
                      )}

                      {/* Column 3: Scope & Targets */}
                      {visibleColumns.scope && (
                        <td className="py-3 px-3.5">
                          {renderScopeAndTargets(rule)}
                        </td>
                      )}

                      {/* Column 4: Min. Purchase / Conditions */}
                      {visibleColumns.conditions && (
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {renderConditions(rule)}
                        </td>
                      )}

                      {/* Column 5: Priority */}
                      {visibleColumns.priority && (
                        <td className="py-3 px-3.5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-2 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-700 shadow-2xs">
                            {rule.priority ?? 0}
                          </span>
                        </td>
                      )}

                      {/* Column 6: Status */}
                      {visibleColumns.status && (
                        <td className="py-3 px-3.5 text-center">
                          <StatusBadge status={isActive ? 'active' : 'inactive'} />
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
                              onView={() => onView(rule)}
                              onEdit={() => (onEditRule ? onEditRule(rule) : onEditCampaign(rule.campaign))}
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

export default DiscountRulesTableSection
