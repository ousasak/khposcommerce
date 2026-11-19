import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Copy,
  Check,
  Store,
  Globe,
  Layers,
  Ticket,
  Percent,
  DollarSign,
  Truck,
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { StatusBadge, EmptyState } from '@/components/common'
import { useToast } from '@/hooks/useToast'
import type { Coupon } from '../types'

interface CouponTableSectionProps {
  coupons: Coupon[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  setDetailDrawerCoupon: (coupon: Coupon) => void
  openEditModal: (coupon: Coupon) => void
  handleDuplicate: (coupon: Coupon) => void
  setDeleteTarget: (coupon: Coupon) => void
  toggleStatusMutation: any
  onOpenVerifier?: (coupon: Coupon) => void
  selectedRows?: number[]
  setSelectedRows?: React.Dispatch<React.SetStateAction<number[]>>
}

export const CouponTableSection: React.FC<CouponTableSectionProps> = ({
  coupons = [],
  isLoading,
  isFetching,
  visibleColumns,
  setDetailDrawerCoupon,
  openEditModal,
  handleDuplicate,
  setDeleteTarget,
  toggleStatusMutation,
  onOpenVerifier,
  selectedRows = [],
  setSelectedRows,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'toast'])
  const toast = useToast()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const activeColsCount =
    (setSelectedRows ? 1 : 0) +
    Object.values(visibleColumns).filter(Boolean).length

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(t('marketing.copiedCode', { code, defaultValue: `បានចម្លងកូដ៖ ${code}` }))
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setSelectedRows) return
    if (e.target.checked) {
      setSelectedRows(coupons.map((c) => c.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number) => {
    if (!setSelectedRows) return
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const renderChannelBadge = (scope?: string) => {
    if (scope === 'pos_only') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <Store size={10} />
          <span>POS</span>
        </span>
      )
    }
    if (scope === 'storefront_only') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
          <Globe size={10} />
          <span>WEB</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
        <Layers size={10} />
        <span>OMNI</span>
      </span>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 sticky top-0 border-b border-border/80 z-10 select-none">
              <tr>
                {setSelectedRows && (
                  <th className="w-10 text-center py-3.5 px-2">
                    <input
                      type="checkbox"
                      checked={coupons.length > 0 && selectedRows.length === coupons.length}
                      onChange={handleSelectAll}
                      className="checkbox h-4 w-4 rounded border-border"
                    />
                  </th>
                )}
                {visibleColumns.name && (
                  <th className="text-left py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[220px]">
                    {t('marketing.couponCampaign', 'យុទ្ធនាការប័ណ្ណ')}
                  </th>
                )}
                {visibleColumns.code && (
                  <th className="text-left py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[170px]">
                    {t('marketing.codeAndChannel', 'កូដ & បណ្តាញ')}
                  </th>
                )}
                {visibleColumns.type && (
                  <th className="text-left py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[130px]">
                    {t('common.type', 'ប្រភេទ')}
                  </th>
                )}
                {visibleColumns.value && (
                  <th className="text-left py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[120px]">
                    {t('marketing.discountValue', 'តម្លៃបញ្ចុះ')}
                  </th>
                )}
                {visibleColumns.minSpend && (
                  <th className="text-left py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[110px]">
                    {t('marketing.minPurchase', 'ទិញអប្បបរមា')}
                  </th>
                )}
                {visibleColumns.usageLimit && (
                  <th className="text-left py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[140px]">
                    {t('marketing.couponUsage', 'ការប្រើប្រាស់')}
                  </th>
                )}
                {visibleColumns.expiresAt && (
                  <th className="text-left py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[120px]">
                    {t('marketing.expiresAt', 'ថ្ងៃផុតកំណត់')}
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="text-center py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[100px]">
                    {t('common.status', 'ស្ថានភាព')}
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="text-right py-3.5 px-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[80px]">
                    {t('common.actions', 'សកម្មភាព')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={activeColsCount} />
              ) : coupons.length === 0 ? (
                <EmptyState
                  cols={activeColsCount}
                  message={t('marketing.noCouponsFound', 'រកមិនឃើញប័ណ្ណបញ្ចុះតម្លៃដែលត្រូវគ្នានឹងការស្វែងរកឡើយ')}
                />
              ) : (
                coupons.map((coupon) => {
                  const isExp = coupon.expires_at && new Date(coupon.expires_at) < new Date()
                  const isKhqr = coupon.payment_methods?.includes('khqr_bakong')
                  const maxUses = coupon.usage_limit || 100
                  const used = coupon.used_count || 0
                  const usagePercent = Math.min(100, Math.round((used / maxUses) * 100))
                  const isSelected = selectedRows.includes(coupon.id)

                  return (
                    <tr
                      key={coupon.id}
                      className={`hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors border-b border-border/50 ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      {setSelectedRows && (
                        <td
                          className="text-center py-3 px-2 align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(coupon.id)}
                            className="checkbox h-4 w-4 rounded border-border"
                          />
                        </td>
                      )}

                      {/* 1. Campaign Name & Icon */}
                      {visibleColumns.name && (
                        <td className="py-3 px-3.5 align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                              <Ticket size={15} />
                            </div>
                            <div className="min-w-0">
                              <p
                                onClick={() => setDetailDrawerCoupon(coupon)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors text-sm truncate max-w-[200px] xl:max-w-[240px]"
                                title={coupon.name}
                              >
                                {coupon.name}
                              </p>
                              {coupon.batch_id ? (
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  Batch: {coupon.batch_id}
                                </p>
                              ) : isKhqr ? (
                                <span className="inline-flex items-center text-[9px] font-black uppercase text-rose-600 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                  KHQR Only
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 2. Code & Channel */}
                      {visibleColumns.code && (
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-foreground bg-muted/60 hover:bg-muted pl-2 pr-1 py-1 rounded-md border border-border/80 transition-colors shadow-2xs">
                              <span className="text-primary tracking-wide">{coupon.code}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyCode(coupon.code)
                                }}
                                className="p-1 hover:bg-primary/20 rounded transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                                title={t('marketing.copyCode', 'ចម្លងកូដ')}
                              >
                                {copiedCode === coupon.code ? (
                                  <Check size={12} className="text-emerald-600 stroke-[3]" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                            {renderChannelBadge(coupon.channel_scope)}
                          </div>
                        </td>
                      )}

                      {/* 3. Discount Type (Styled Badges) */}
                      {visibleColumns.type && (
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                          {coupon.type === 'percentage' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              <Percent size={11} className="stroke-[2.5]" />
                              <span>{t('marketing.percentageDiscount', 'ភាគរយ (%)')}</span>
                            </span>
                          ) : coupon.type === 'fixed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <DollarSign size={11} className="stroke-[2.5]" />
                              <span>{t('marketing.fixedDiscount', 'ទឹកប្រាក់ថេរ ($)')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                              <Truck size={11} className="stroke-[2.5]" />
                              <span>{t('marketing.freeShipping', 'ដឹកជញ្ជូន')}</span>
                            </span>
                          )}
                        </td>
                      )}

                      {/* 4. Discount Value */}
                      {visibleColumns.value && (
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                          {coupon.type === 'percentage' ? (
                            <div>
                              <span className="font-mono font-black text-teal-700 dark:text-teal-300 text-sm">
                                {Number(coupon.value || 0)}% OFF
                              </span>
                              {coupon.max_discount_cap && Number(coupon.max_discount_cap) > 0 && (
                                <span className="text-[10px] text-muted-foreground block font-sans">
                                  {t('marketing.maximumCap', 'អតិបរមា')}: ${Number(coupon.max_discount_cap).toFixed(2)}
                                </span>
                              )}
                            </div>
                          ) : coupon.type === 'fixed' ? (
                            <span className="font-mono font-bold text-foreground text-sm">
                              {coupon.currency === 'KHR'
                                ? `${Number(coupon.value || 0).toLocaleString()} ៛`
                                : `$${Number(coupon.value || 0).toFixed(2)}`}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">
                              {t('marketing.free', 'ឥតគិតថ្លៃ')}
                            </span>
                          )}
                        </td>
                      )}

                      {/* 5. Min Spend (Clean '—' when 0) */}
                      {visibleColumns.minSpend && (
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                          {coupon.minimum_amount && Number(coupon.minimum_amount) > 0 ? (
                            <div>
                              <span className="font-mono font-bold text-foreground text-xs">
                                ${Number(coupon.minimum_amount).toFixed(2)}
                              </span>
                              {coupon.minimum_amount_khr && Number(coupon.minimum_amount_khr) > 0 && (
                                <span className="text-[10px] text-muted-foreground block font-mono">
                                  ~{Number(coupon.minimum_amount_khr).toLocaleString()} ៛
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 text-xs font-medium">—</span>
                          )}
                        </td>
                      )}

                      {/* 6. Usage & Progress Bar */}
                      {visibleColumns.usageLimit && (
                        <td className="py-3 px-3.5 align-middle">
                          <div className="space-y-1 min-w-[110px] max-w-[130px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-foreground text-[12px]">
                                {used}{' '}
                                <span className="text-muted-foreground font-normal text-[10px]">
                                  / {coupon.usage_limit || '∞'}
                                </span>
                              </span>
                              <span className="text-[10px] font-semibold text-muted-foreground font-mono">
                                {usagePercent}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  usagePercent >= 90
                                    ? 'bg-rose-500'
                                    : usagePercent >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-primary'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 7. Expiry Date (Clean, NO duplicate 'ផុតកំណត់' text) */}
                      {visibleColumns.expiresAt && (
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                          <span className="font-mono text-xs text-foreground font-medium">
                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '—'}
                          </span>
                        </td>
                      )}

                      {/* 8. Status Badge (Centered) */}
                      {visibleColumns.status && (
                        <td className="py-3 px-3.5 align-middle text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: coupon.id,
                                is_active: !coupon.is_active,
                              })
                            }
                            className="cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center justify-center"
                            title={t('marketing.toggleStatus', 'ចុចដើម្បីបិទ/បើក')}
                          >
                            <StatusBadge
                              status={isExp ? 'expired' : coupon.is_active ? 'active' : 'inactive'}
                            />
                          </button>
                        </td>
                      )}

                      {/* 9. Action Menu (Right-aligned) */}
                      {visibleColumns.actions && (
                        <td
                          className="py-3 px-3.5 align-middle text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TableActionMenu
                            onView={() => setDetailDrawerCoupon(coupon)}
                            onEdit={() => openEditModal(coupon)}
                            onDelete={() => setDeleteTarget(coupon)}
                            items={[
                              {
                                label: t('marketing.duplicateCoupon', 'ចម្លងប័ណ្ណ (Duplicate)'),
                                icon: Copy,
                                onClick: () => handleDuplicate(coupon),
                              },
                            ]}
                          />
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
    </div>
  )
}

export default CouponTableSection
