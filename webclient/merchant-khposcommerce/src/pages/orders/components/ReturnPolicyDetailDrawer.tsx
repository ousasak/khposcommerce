import React from 'react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import {
  ActionButton,
  CancelButton,
  EnterpriseModal,
} from '@/components/common'
import { GlobalFormat, formatShortDate } from '@/utils/formatters'
import type { ReturnPolicy } from '../types'
import {
  getLocalizedPolicyName,
  getConditionBadge,
  getCategoryDisplayName,
} from '../ReturnPoliciesPage'

interface ReturnPolicyDetailDrawerProps {
  policy: ReturnPolicy | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (policy: ReturnPolicy) => void
}

export const ReturnPolicyDetailDrawer: React.FC<ReturnPolicyDetailDrawerProps> = ({
  policy,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation(['policies', 'returns', 'nav', 'sales', 'common'])
  const { language } = useThemeStore()
  const currentLang = i18n.language || language || 'km'
  const isKhmer = currentLang.startsWith('km')

  if (!isOpen || !policy) return null

  const localizedName = getLocalizedPolicyName(policy.name, isKhmer)
  const isStorewide = !policy.category_id && !policy.category
  const isNonReturnable = !policy.is_returnable
  const restockingPct = Number(policy.restocking_fee_percentage || 0)
  const customerShipping = Number(policy.customer_fault_shipping_fee || 0)
  const storeShipping = Number(policy.store_fault_shipping_fee || 0)
  const returnDays = Number(policy.return_window_days || 0)

  // Deduplicate conditions list
  const conditionList = Array.isArray(policy.conditions_accepted) ? policy.conditions_accepted : []
  const filteredConditions = conditionList.filter(
    (c) => !(c === 'has_receipt' && policy.requires_receipt) && !(c === 'original_packaging' && policy.requires_original_packaging)
  )

  // Simulation calculation ($100 Item)
  const simItemPrice = 100
  const simRestockingAmount = (simItemPrice * restockingPct) / 100
  const simNetRefund = Math.max(0, simItemPrice - simRestockingAmount - customerShipping)

  return (
    <EnterpriseModal
      isOpen={isOpen && !!policy}
      onClose={onClose}
      size="3xl"
      className="bg-card dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 dark:border-slate-800"
      bodyClassName="p-0"
      showCloseButton={true}
      title={
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-base sm:text-lg text-foreground">
            {localizedName.primary}
          </span>
          <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            POL-#{String(policy.id).padStart(4, '0')}
          </span>
          {policy.is_default && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t('policies.defaultBadge', 'Default')}
            </span>
          )}
        </div>
      }
      subtitle={
        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate pt-0.5">
          <span className="font-medium text-foreground">
            {isStorewide
              ? t('policies.tabs.storewide', 'Store-Wide Standard')
              : `${t('policies.categoryLabel', 'Category')}: ${getCategoryDisplayName(policy.category?.name, t)}`}
          </span>
          {localizedName.secondary && (
            <>
              <span>•</span>
              <span className="italic opacity-80">{localizedName.secondary}</span>
            </>
          )}
          {policy.updated_at && (
            <>
              <span>•</span>
              <span>{formatShortDate(policy.updated_at)}</span>
            </>
          )}
        </div>
      }
      footer={
        <div className="px-5 sm:px-6 py-3.5 border-t border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 flex items-center justify-between gap-3 w-full shrink-0">
          <CancelButton
            onClick={onClose}
            label={isKhmer ? 'បិទ' : t('common.close', 'Close')}
          />
          {onEdit && (
            <ActionButton
              variant="primary"
              label={t('policies.editPolicy', 'Edit Return Policy')}
              onClick={() => {
                onClose()
                onEdit(policy)
              }}
            />
          )}
        </div>
      }
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* ── 1. POLICY SCOPE & STATUS HIGHLIGHTS ── */}
        <div className="p-4 rounded-2xl bg-muted/30 dark:bg-slate-800/40 border border-border/70 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isNonReturnable ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {t('policies.finalSaleBadge', 'Final Sale / Non-Returnable')}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {t('policies.returnAllowedBadge', 'Return & Refund Allowed')}
                </span>
              )}

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  policy.allow_exchange
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                    : 'bg-muted text-muted-foreground border-border/70'
                }`}
              >
                {policy.allow_exchange
                  ? t('policies.exchangeAllowed', 'Exchange Allowed')
                  : t('policies.noExchange', 'No Exchange')}
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-background text-foreground border border-border/70">
                {isStorewide
                  ? t('policies.tabs.storewide', 'Store-Wide Standard')
                  : getCategoryDisplayName(policy.category?.name, t)}
              </span>

              {policy.is_default && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {t('policies.storeDefaultBadge', 'Store Default')}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {isStorewide
              ? t('policies.storewidePolicyNote', 'This baseline policy automatically governs all retail products and customer orders unless an explicit category policy overrides it.')
              : t('policies.categoryPolicyNote', 'This dedicated policy overrides storewide defaults for all items categorized under this specific catalog group.')}
          </p>
        </div>

        {/* ── 2. KEY PARAMETERS & FEES (CLEAN 4-METRIC TILE GRID) ── */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            {t('policies.financialMatrixTitle', 'Key Financial & Duration Parameters')}
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Return Window */}
            <div className="p-3.5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                {t('policies.columns.window', 'Return Window')}
              </span>
              <p className="text-base sm:text-lg font-bold font-mono text-foreground tabular-nums">
                {returnDays > 0 ? `${GlobalFormat.number(returnDays)} ${t('policies.days', 'Days')}` : '0 ថ្ងៃ'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {returnDays > 0 ? t('policies.fromOrderDate', 'From delivery date') : t('policies.conditionFinalSale', 'Final Sale')}
              </p>
            </div>

            {/* Restocking Fee */}
            <div className="p-3.5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                {t('policies.columns.restocking', 'Restocking Fee')}
              </span>
              <p className="text-base sm:text-lg font-bold font-mono text-foreground tabular-nums">
                {restockingPct > 0 ? `${restockingPct}%` : t('policies.freeRestock', '0% (Free)')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {restockingPct > 0 ? t('policies.deductedFromRefund', 'Deducted from refund') : t('policies.freeRestocking', 'No fee charged')}
              </p>
            </div>

            {/* Customer Shipping */}
            <div className="p-3.5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                {t('policies.customerShippingShort', 'Cust. Shipping')}
              </span>
              <p className="text-base sm:text-lg font-bold font-mono text-foreground tabular-nums">
                {customerShipping > 0 ? GlobalFormat.currency(customerShipping) : t('policies.free', '$0.00 (Free)')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('policies.buyerFault', 'Customer mind-change')}
              </p>
            </div>

            {/* Store Shipping */}
            <div className="p-3.5 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                {t('policies.storeShippingShort', 'Store Shipping')}
              </span>
              <p className="text-base sm:text-lg font-bold font-mono text-foreground tabular-nums">
                {storeShipping > 0 ? GlobalFormat.currency(storeShipping) : t('policies.free', 'Free (Covered)')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('policies.storeReimbursed', 'Store covered')}
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. MANDATORY VERIFICATION REQUIREMENTS (CLEAN CARDS) ── */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            {t('policies.customerRequirementsTitle', 'Mandatory Verification Requirements')}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Receipt Requirement */}
            <div className="p-4 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {t('policies.preview.requireReceipt', 'Original Receipt / Invoice')}
                </p>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    policy.requires_receipt
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border/60'
                  }`}
                >
                  {policy.requires_receipt ? t('policies.required', 'Required') : t('policies.optional', 'Optional')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {policy.requires_receipt
                  ? t('policies.receiptStrictDesc', 'Customer must present invoice or order number before refund.')
                  : t('policies.receiptOptionalDesc', 'Returns allowed without physical receipt with system lookup.')}
              </p>
            </div>

            {/* Packaging Requirement */}
            <div className="p-4 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {t('policies.preview.requirePackaging', 'Original Packaging')}
                </p>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    policy.requires_original_packaging
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border/60'
                  }`}
                >
                  {policy.requires_original_packaging ? t('policies.required', 'Required') : t('policies.optional', 'Optional')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {policy.requires_original_packaging
                  ? t('policies.packagingStrictDesc', 'Factory box, seals, and bundled accessories must be intact.')
                  : t('policies.packagingFlexibleDesc', 'Open-box or repacked items accepted with standard grading.')}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. QUALITY INSPECTION (QC) CHECKLIST ── */}
        {filteredConditions.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {t('policies.qcChecklistTitle', 'Quality Inspection Checklist (QC)')}
              </span>
              <span className="text-[11px] font-mono font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-muted border border-border/60">
                {filteredConditions.length} {t('policies.conditionsCount', 'criteria')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs">
              <div className="flex flex-wrap gap-2">
                {filteredConditions.map((cond) => {
                  const { label, color } = getConditionBadge(cond, t)
                  return (
                    <span
                      key={cond}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border shadow-2xs ${color}`}
                    >
                      {label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. LIVE RETURN FINANCIAL SIMULATION OR FINAL SALE NOTICE ── */}
        {!isNonReturnable ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {t('policies.simulatorTitle', 'Live Return Financial Simulation ($100 Item)')}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {t('policies.preview.simulationBadge', 'Simulation')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 dark:bg-slate-800/40 border border-border/70 space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                    {t('policies.simItemPrice', 'Item Price')}
                  </span>
                  <span className="font-extrabold font-mono text-foreground text-sm sm:text-base">
                    $100.00
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 dark:bg-slate-800/40 border border-border/70 space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                    {t('policies.restockingDeduction', 'Restocking Fee')}
                  </span>
                  <span
                    className={`font-extrabold font-mono text-sm sm:text-base ${
                      simRestockingAmount > 0 ? 'text-rose-500' : 'text-foreground'
                    }`}
                  >
                    {simRestockingAmount > 0 ? `-$${simRestockingAmount.toFixed(2)}` : '$0.00'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 dark:bg-slate-800/40 border border-border/70 space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                    {t('policies.customerShippingDeduction', 'Shipping Deduction')}
                  </span>
                  <span
                    className={`font-extrabold font-mono text-sm sm:text-base ${
                      customerShipping > 0 ? 'text-rose-500' : 'text-foreground'
                    }`}
                  >
                    {customerShipping > 0 ? `-$${customerShipping.toFixed(2)}` : '$0.00'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-foreground block truncate">
                    {t('policies.simNetRefund', 'Net Estimated Refund to Customer')}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {t('policies.actualRefundNotice', 'Estimated net payout to customer')}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                    {GlobalFormat.currency(simNetRefund)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {GlobalFormat.currency(simNetRefund * 4100, 'KHR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <p className="text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-400">
              {t('policies.finalSaleNotice', 'Items under this policy are strictly non-returnable and non-refundable (Final Sale)')}
            </p>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
              {t('policies.finalSaleNoticeDesc', 'All sales are final with no return or exchange eligibility unless defective upon receipt.')}
            </p>
          </div>
        )}
      </div>
    </EnterpriseModal>
  )
}

export { ReturnPolicyDetailDrawer as ReturnPolicyDetailModal }
export default ReturnPolicyDetailDrawer
