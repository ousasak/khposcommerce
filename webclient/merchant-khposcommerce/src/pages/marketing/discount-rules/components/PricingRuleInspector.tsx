import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  Search,
  Sparkles,
  Layers,
  ShieldAlert,
  Clock,
  MapPin,
  Smartphone,
  UserCheck,
  ShoppingBag,
  Percent,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { PricingEngineResult, PricingEngineSkippedRule } from '../../promotions/types'

interface PricingRuleInspectorProps {
  pricingResult?: PricingEngineResult | null
  isLoading?: boolean
  onQuickFix?: (fixType: string, payload?: any) => void
}

export const PricingRuleInspector: React.FC<PricingRuleInspectorProps> = ({
  pricingResult,
  onQuickFix,
}) => {
  const { t } = useTranslation(['marketing', 'common'])
  const [activeTab, setActiveTab] = useState<'applied' | 'skipped' | 'all'>('applied')
  const [searchFilter, setSearchFilter] = useState('')

  const appliedPromos = pricingResult?.applied_promotions || []
  const skippedRules = pricingResult?.skipped_rules || []
  const allRulesCount = appliedPromos.length + skippedRules.length

  const getReasonBadge = (reasonCode: string) => {
    switch (reasonCode) {
      case 'branch_restriction':
        return {
          label: t('marketing.reasonBranchExcluded', 'Branch Excluded'),
          className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
          icon: <MapPin size={11} />,
        }
      case 'channel_mismatch':
        return {
          label: t('marketing.reasonChannelMismatch', 'Channel Mismatch'),
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
          icon: <Smartphone size={11} />,
        }
      case 'promotion_not_started':
        return {
          label: t('marketing.reasonPromotionNotStarted', 'Not Started Yet'),
          className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
          icon: <Clock size={11} />,
        }
      case 'promotion_expired':
        return {
          label: t('marketing.reasonPromotionExpired', 'Expired'),
          className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
          icon: <Clock size={11} />,
        }
      case 'customer_group_mismatch':
      case 'customer_mismatch':
        return {
          label: t('marketing.reasonCustomerTierIneligible', 'Tier Ineligible'),
          className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
          icon: <UserCheck size={11} />,
        }
      case 'min_subtotal_not_met':
        return {
          label: t('marketing.reasonMinSubtotalNotMet', 'Min Subtotal Unmet'),
          className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
          icon: <Percent size={11} />,
        }
      case 'max_subtotal_exceeded':
        return {
          label: t('marketing.reasonMaxSubtotalExceeded', 'Max Subtotal Exceeded'),
          className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
          icon: <Percent size={11} />,
        }
      case 'min_qty_not_met':
        return {
          label: t('marketing.reasonMinQtyNotMet', 'Min Qty Unmet'),
          className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
          icon: <ShoppingBag size={11} />,
        }
      case 'max_qty_exceeded':
        return {
          label: t('marketing.reasonMaxQtyExceeded', 'Max Qty Exceeded'),
          className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
          icon: <ShoppingBag size={11} />,
        }
      case 'target_not_in_cart':
        return {
          label: t('marketing.reasonTargetNotInCart', 'Target Not In Cart'),
          className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          icon: <ShoppingBag size={11} />,
        }
      case 'bogo_criteria_unmet':
        return {
          label: t('marketing.reasonBogoCriteriaUnmet', 'BOGO Criteria Unmet'),
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
          icon: <Sparkles size={11} />,
        }
      case 'bogo_get_item_missing':
        return {
          label: t('marketing.reasonBogoRewardMissing', 'Free Reward Missing'),
          className: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
          icon: <Sparkles size={11} />,
        }
      case 'non_stackable_conflict':
        return {
          label: t('marketing.reasonRuleLocked', 'Non-stackable Locked'),
          className: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
          icon: <ShieldAlert size={11} />,
        }
      case 'coupon_invalid':
        return {
          label: t('marketing.reasonInvalidVoucher', 'Invalid Voucher'),
          className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
          icon: <XCircle size={11} />,
        }
      default:
        return {
          label: t('marketing.reasonConditionUnmet', 'Condition Unmet'),
          className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
          icon: <XCircle size={11} />,
        }
    }
  }

  // Filtered lists based on search
  const filteredApplied = useMemo(() => {
    if (!searchFilter.trim()) return appliedPromos
    const q = searchFilter.toLowerCase()
    return appliedPromos.filter(
      (p) =>
        p.rule_name?.toLowerCase().includes(q) ||
        p.campaign_name?.toLowerCase().includes(q) ||
        p.rule_type?.toLowerCase().includes(q)
    )
  }, [appliedPromos, searchFilter])

  const filteredSkipped = useMemo(() => {
    if (!searchFilter.trim()) return skippedRules
    const q = searchFilter.toLowerCase()
    return skippedRules.filter(
      (r) =>
        r.rule_name?.toLowerCase().includes(q) ||
        r.campaign_name?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q) ||
        r.reason_code?.toLowerCase().includes(q)
    )
  }, [skippedRules, searchFilter])

  return (
    <div className="space-y-3.5">
      {/* ── Sub Tabs Navigation (Applied / Skipped / All) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Layers size={14} className="text-[#0f766e] dark:text-teal-400" />
          <span>{t('marketing.ruleInspection', 'Rules Diagnostics')}</span>
        </span>

        <div className="inline-flex h-8 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('applied')}
            className={`h-full px-2.5 sm:px-3 rounded-md transition-all flex items-center justify-center cursor-pointer text-xs ${
              activeTab === 'applied'
                ? 'bg-card text-[#0f766e] dark:text-teal-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-foreground font-semibold'
            }`}
          >
            {t('marketing.appliedRulesTab', 'Applied ({{count}})', { count: appliedPromos.length })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skipped')}
            className={`h-full px-2.5 sm:px-3 rounded-md transition-all flex items-center justify-center cursor-pointer text-xs ${
              activeTab === 'skipped'
                ? 'bg-card text-[#0f766e] dark:text-teal-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-foreground font-semibold'
            }`}
          >
            {t('marketing.skippedRulesTab', 'Skipped ({{count}})', { count: skippedRules.length })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`h-full px-2 sm:px-2.5 rounded-md transition-all flex items-center justify-center cursor-pointer text-xs ${
              activeTab === 'all'
                ? 'bg-card text-[#0f766e] dark:text-teal-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-foreground font-semibold'
            }`}
          >
            {t('marketing.allRulesTab', 'All ({{count}})', { count: allRulesCount })}
          </button>
        </div>
      </div>

      {/* ── Summary Statistics Banner ── */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
            {t('marketing.appliedRulesCount', 'Applied Rules')}
          </span>
          <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400">
            {appliedPromos.length}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
            {t('marketing.skippedRulesCount', 'Skipped Rules')}
          </span>
          <span className="font-mono font-bold text-sm text-slate-500 dark:text-slate-400">
            {skippedRules.length}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
            {t('marketing.totalSavingsLabel', 'Savings')}
          </span>
          <span className="font-mono font-bold text-sm text-[#0f766e] dark:text-teal-400">
            ${(pricingResult?.summary?.total_discount ?? 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── Optional Search inside Inspector if rules exist ── */}
      {allRulesCount > 3 && (
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t('marketing.searchRulesPlaceholder', 'Filter evaluated rules by name or reason...')}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-background focus:outline-none focus:ring-1 focus:ring-teal-500 text-foreground"
          />
        </div>
      )}

      {/* ── 1. Applied Rules List ── */}
      {(activeTab === 'applied' || activeTab === 'all') && (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {activeTab === 'all' && (
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-1">
              ✓ {t('marketing.appliedRulesTab', 'Applied Promotions ({{count}})', { count: appliedPromos.length })}
            </p>
          )}

          {filteredApplied.length === 0 ? (
            activeTab === 'applied' && (
              <div className="py-8 text-center space-y-2.5">
                <p className="text-xs text-muted-foreground italic">
                  {t('marketing.noPromotionsEligible', 'No promotions eligible for this cart.')}
                </p>
                {skippedRules.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('skipped')}
                    className="text-xs font-semibold text-[#0f766e] dark:text-teal-400 border-teal-600/30 hover:bg-teal-50 dark:hover:bg-teal-950/40 gap-1.5 cursor-pointer"
                  >
                    <span>
                      {t('marketing.checkSkippedRulesPrompt', 'Inspect unmet conditions ({{count}} skipped rules)', {
                        count: skippedRules.length,
                      })}
                    </span>
                    <ArrowRight size={13} />
                  </Button>
                )}
              </div>
            )
          ) : (
            filteredApplied.map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-teal-500/25 dark:border-teal-500/35 bg-teal-50/30 dark:bg-teal-950/20 text-xs space-y-1.5 shadow-2xs hover:border-teal-500/40 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <p className="font-semibold text-foreground truncate">{p.rule_name || p.campaign_name}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100/90 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 shadow-2xs font-mono shrink-0">
                    -${p.discount_amount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-5 flex-wrap">
                  <span className="font-medium text-slate-600 dark:text-slate-400">{p.campaign_name}</span>
                  <span>•</span>
                  <span className="uppercase font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                    {p.rule_type?.replace(/_/g, ' ')}
                  </span>
                  {p.is_stackable ? (
                    <span className="text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      {t('marketing.stackable', 'Stackable')}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {t('marketing.nonStackable', 'Exclusive / Locked')}
                    </span>
                  )}
                  {p.priority !== undefined && (
                    <span className="font-mono text-slate-500">
                      {t('marketing.priority', 'Priority')}: {p.priority}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── 2. Skipped Rules List ── */}
      {(activeTab === 'skipped' || activeTab === 'all') && (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {activeTab === 'all' && (
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-200 dark:border-slate-800">
              ✗ {t('marketing.skippedRulesTab', 'Skipped Rules ({{count}})', { count: skippedRules.length })}
            </p>
          )}

          {filteredSkipped.length === 0 ? (
            activeTab === 'skipped' && (
              <p className="text-xs text-muted-foreground py-8 text-center italic">
                {t('marketing.noSkippedRules', 'No rules were skipped.')}
              </p>
            )
          ) : (
            filteredSkipped.map((r: PricingEngineSkippedRule, idx: number) => {
              const badge = getReasonBadge(r.reason_code)
              const reasonText = r.reason || r.message || t('marketing.reasonConditionUnmet', 'Condition Unmet')

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs space-y-2 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Top Bar: Rule Name & Reason Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <XCircle size={15} className="text-slate-400 shrink-0" />
                      <p className="font-semibold text-foreground truncate">{r.rule_name || r.campaign_name}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-2xs shrink-0 ${badge.className}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Campaign & Rule Type Scope */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-5 flex-wrap">
                    <span>{r.campaign_name}</span>
                    <span>•</span>
                    <span className="uppercase font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {r.rule_type?.replace(/_/g, ' ')}
                    </span>
                    {r.priority !== undefined && (
                      <span className="font-mono text-slate-500">
                        {t('marketing.priority', 'Priority')}: {r.priority}
                      </span>
                    )}
                  </div>

                  {/* Detailed Diagnostic Explanation */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-5 bg-background/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    {reasonText}
                  </p>

                  {/* Actionable Suggestion Banner (💡 ដំណោះស្រាយដើម្បីទទួលបានប្រូម៉ូសិន) */}
                  {r.action_hint && (
                    <div className="ml-5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5">
                        <Lightbulb size={13} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div>
                          <strong className="font-semibold">{t('marketing.actionSuggestion', 'Action Needed')}: </strong>
                          <span>{r.action_hint}</span>
                        </div>
                      </div>

                      {/* Quick Fix Button if applicable */}
                      {onQuickFix && (
                        <button
                          type="button"
                          onClick={() => onQuickFix(r.reason_code, r)}
                          className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0 cursor-pointer"
                        >
                          {t('marketing.quickFixAction', 'Apply Solution')} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default PricingRuleInspector
