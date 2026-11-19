import React from 'react'
import {
  History,
  Calendar,
  User,
  Store,
  Globe,
  Smartphone,
  Eye,
  FileSpreadsheet,
  Building2,
  Tag,
  ArrowUpDown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import { EmptyState, ExportButton } from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import type { UsageRecord } from './UsageDetailDrawer'

export interface UsageHistorySectionProps {
  usages: UsageRecord[]
  isLoading?: boolean
  isFetching?: boolean
  visibleColumns?: Record<string, boolean>
  pagination?: {
    current_page: number
    last_page: number
    total: number
  }
  perPage?: number
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  onViewUsage?: (usage: UsageRecord) => void
  onResetFilters?: () => void
}

export const UsageHistorySection: React.FC<UsageHistorySectionProps> = ({
  usages = [],
  isLoading = false,
  isFetching = false,
  visibleColumns = {
    transaction: true,
    campaign: true,
    rule: true,
    customer: true,
    discount: true,
    timestamp: true,
    actions: true,
  },
  pagination,
  perPage = 15,
  onPageChange,
  onPerPageChange,
  onViewUsage,
  onResetFilters,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons'])

  // Helper for channel badges with bilingual localization
  const renderChannelBadge = (ch: string) => {
    const lower = (ch || '').toLowerCase()
    if (lower === 'pos') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Store size={10} />
          <span>{t('marketing.channelBadgePos', 'POS')}</span>
        </span>
      )
    }
    if (lower === 'web') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          <Globe size={10} />
          <span>{t('marketing.channelBadgeWeb', 'Web')}</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
        <Smartphone size={10} />
        <span>{t('marketing.channelBadgeMobile', 'App')}</span>
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* ─── Table Section Wrapper ─── */}
      <TableWrapper isFetching={isFetching}>
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-8 bg-muted/40 animate-pulse rounded-lg" />
            <div className="h-10 bg-muted/20 animate-pulse rounded-lg" />
            <div className="h-10 bg-muted/20 animate-pulse rounded-lg" />
            <div className="h-10 bg-muted/20 animate-pulse rounded-lg" />
            <div className="h-10 bg-muted/20 animate-pulse rounded-lg" />
          </div>
        ) : usages.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={History}
              title={t('marketing.noUsageFound', 'No Promotion Usage Records Found')}
              description={t(
                'marketing.noUsageFoundDesc',
                'No promotion usage records match your current search and filter criteria.'
              )}
              actionLabel={t('buttons.reset', 'Reset Filters')}
              onAction={onResetFilters}
            />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-muted/30 border-b border-border text-muted-foreground uppercase font-semibold text-[11px] tracking-wider select-none">
                <tr>
                  {visibleColumns.transaction !== false && (
                    <th className="py-3.5 px-4">{t('marketing.colTransaction', 'Transaction / Order')}</th>
                  )}
                  {visibleColumns.campaign !== false && (
                    <th className="py-3.5 px-4">{t('marketing.colCampaign', 'Campaign & Code')}</th>
                  )}
                  {visibleColumns.rule !== false && (
                    <th className="py-3.5 px-4">{t('marketing.colRule', 'Rule Applied')}</th>
                  )}
                  {visibleColumns.customer !== false && (
                    <th className="py-3.5 px-4">{t('marketing.colCustomerBranch', 'Customer & Branch')}</th>
                  )}
                  {visibleColumns.discount !== false && (
                    <th className="py-3.5 px-4 text-right">{t('marketing.colDiscountSaved', 'Discount Saved')}</th>
                  )}
                  {visibleColumns.timestamp !== false && (
                    <th className="py-3.5 px-4">{t('marketing.colTimestamp', 'Timestamp')}</th>
                  )}
                  {visibleColumns.actions !== false && (
                    <th className="py-3.5 px-4 text-center w-20">{t('marketing.colActions', 'Actions')}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {usages.map((usage) => (
                  <tr
                    key={usage.id}
                    onClick={() => onViewUsage?.(usage)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    {/* 1. Transaction / Order & Channel */}
                    {visibleColumns.transaction !== false && (
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                            {usage.sale_number}
                          </span>
                          {renderChannelBadge(usage.channel)}
                        </div>
                      </td>
                    )}

                    {/* 2. Campaign Name & Code */}
                    {visibleColumns.campaign !== false && (
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-col gap-0.5 items-start">
                          <span className="font-bold text-foreground line-clamp-1">
                            {usage.campaign_name}
                          </span>
                          <span className="font-mono text-[10px] text-primary font-bold px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                            {usage.campaign_code}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* 3. Rule Applied */}
                    {visibleColumns.rule !== false && (
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground line-clamp-2">
                            {usage.rule_applied}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* 4. Customer & Branch */}
                    {visibleColumns.customer !== false && (
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5 text-foreground font-semibold">
                          <User size={12} className="text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[150px]">{usage.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <Building2 size={11} className="shrink-0" />
                          <span className="truncate max-w-[150px]">{usage.branch_name}</span>
                        </div>
                      </td>
                    )}

                    {/* 5. Discount Saved */}
                    {visibleColumns.discount !== false && (
                      <td className="py-3.5 px-4 text-right align-middle">
                        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          -${usage.discount_amount.toFixed(2)}
                        </span>
                      </td>
                    )}

                    {/* 6. Timestamp */}
                    {visibleColumns.timestamp !== false && (
                      <td className="py-3.5 px-4 text-muted-foreground align-middle">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar size={12} className="shrink-0" />
                          <span className="font-mono text-[11px]">{usage.used_at}</span>
                        </div>
                      </td>
                    )}

                    {/* 7. Actions */}
                    {visibleColumns.actions !== false && (
                      <td className="py-3.5 px-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onViewUsage?.(usage)}
                          className="p-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
                          title={t('marketing.viewDetails', 'View Details')}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TableWrapper>

      {/* ─── Pagination ─── */}
      {pagination && pagination.total > 0 && onPageChange && (
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

export default UsageHistorySection
