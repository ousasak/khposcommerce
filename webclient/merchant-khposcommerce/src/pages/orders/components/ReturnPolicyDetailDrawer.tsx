import React from 'react'
import { RotateCcw, Edit2, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import {
  ActionButton,
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
} from '@/components/common'
import { GlobalFormat } from '@/utils/formatters'
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

  // Deduplicate conditions list
  const conditionList = Array.isArray(policy.conditions_accepted) ? policy.conditions_accepted : []
  const filteredConditions = conditionList.filter(
    (c) => !(c === 'has_receipt' && policy.requires_receipt) && !(c === 'original_packaging' && policy.requires_original_packaging)
  )

  // Simulation calculation
  const simItemPrice = 100
  const simRestockingAmount = (simItemPrice * restockingPct) / 100
  const simNetRefund = Math.max(0, simItemPrice - simRestockingAmount - customerShipping)

  return (
    <DetailDrawer
      isOpen={isOpen && !!policy}
      onClose={onClose}
      size="2xl"
    >
      {/* ── 1. DRAWER TOP HEADER ── */}
      <DetailDrawerHeader
        title={localizedName.primary}
        subtitle={
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-mono">{t('policies.policyPrefix', 'Policy')} #{policy.id}</span>
            <span>•</span>
            <span>
              {isStorewide
                ? t('policies.tabs.storewide', 'Store-Wide Standard')
                : `${t('policies.categoryLabel', 'Category')}: ${getCategoryDisplayName(policy.category?.name, t)}`}
            </span>
          </div>
        }
        badge={
          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
            POL-#{String(policy.id).padStart(4, '0')}
          </span>
        }
        onClose={onClose}
      />

      {/* ── 2. HERO OVERVIEW CARD (MATCHING EMPLOYEE PROFILE BANNER) ── */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0 shadow-xs">
            <ShieldCheck size={26} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {localizedName.primary}
              </h2>
              {policy.is_default && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {t('policies.defaultBadge', 'Default')}
                </span>
              )}
              {isNonReturnable ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {t('policies.finalSaleBadge', 'Final Sale')}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {t('policies.returnAllowedBadge', 'Return Allowed')}
                </span>
              )}
              {policy.allow_exchange && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {t('policies.exchangeAllowed', 'Exchange Allowed')}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{isStorewide ? t('policies.storewideBaseline', 'Store-Wide Baseline') : getCategoryDisplayName(policy.category?.name, t)}</span>
              {localizedName.secondary && (
                <>
                  <span>•</span>
                  <span className="italic opacity-80">{localizedName.secondary}</span>
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {GlobalFormat.number(policy.return_window_days)} {t('policies.days', 'Days Window')}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {t('policies.restockingLabel', 'Restocking')}: {restockingPct}%
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {t('policies.customerFeeShort', 'Cust. Shipping')}: {GlobalFormat.currency(customerShipping)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. DRAWER BODY (GROUPED 2-COLUMN CARDS) ── */}
      <DetailDrawerBody className="p-6 space-y-4">
        {/* Card 1: Key Policy Parameters */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t('policies.financialMatrixTitle', 'Key Financial & Duration Parameters')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('policies.columns.window', 'Return Window')}</p>
              <p className="font-semibold text-foreground font-mono mt-0.5">
                {GlobalFormat.number(policy.return_window_days)} {t('policies.days', 'Days')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('policies.columns.restocking', 'Restocking Fee')}</p>
              <p className="font-semibold text-foreground font-mono mt-0.5">
                {restockingPct > 0 ? `${restockingPct}%` : t('policies.zeroFee', '0% (Free)')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('policies.columns.customerShipping', 'Customer Fault Shipping')}</p>
              <p className="font-semibold text-foreground font-mono mt-0.5">
                {customerShipping > 0 ? GlobalFormat.currency(customerShipping) : t('policies.zeroFee', '$0.00 (Waived)')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('policies.columns.storeShipping', 'Store Fault Shipping')}</p>
              <p className="font-semibold text-foreground font-mono mt-0.5">
                {storeShipping > 0 ? GlobalFormat.currency(storeShipping) : t('policies.freeForCustomer', 'Free (Covered by Store)')}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Return Requirements */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t('policies.customerRequirementsTitle', 'Mandatory Verification Requirements')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('policies.preview.requireReceipt', 'Original Receipt / Invoice')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  policy.requires_receipt
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border-border/60'
                }`}>
                  {policy.requires_receipt ? t('policies.required', 'Required') : t('policies.optional', 'Optional')}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {policy.requires_receipt ? t('policies.receiptStrictDesc', 'Invoice required') : t('policies.receiptOptionalDesc', 'System lookup allowed')}
                </span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('policies.preview.requirePackaging', 'Original Packaging')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  policy.requires_original_packaging
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border-border/60'
                }`}>
                  {policy.requires_original_packaging ? t('policies.required', 'Required') : t('policies.optional', 'Optional')}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {policy.requires_original_packaging ? t('policies.packagingStrictDesc', 'Box & seals intact') : t('policies.packagingFlexibleDesc', 'Open-box accepted')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Quality Inspection (QC) Criteria */}
        {filteredConditions.length > 0 && (
          <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('policies.qcChecklistTitle', 'Quality Inspection Checklist (QC)')}
              </h4>
              <span className="text-[11px] font-mono text-muted-foreground">
                {filteredConditions.length} criteria
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {filteredConditions.map((cond) => {
                const { label } = getConditionBadge(cond, t)
                return (
                  <span
                    key={cond}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-foreground border border-border/60"
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Card 4: Financial Simulation Card */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider pb-1.5 border-b border-border/60">
            {t('policies.simulatorTitle', 'Live Return Financial Simulation ($100 Item)')}
          </h4>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                {t('policies.simItemPrice', 'Item Price')}
              </span>
              <span className="font-extrabold font-mono text-foreground text-sm">
                $100.00
              </span>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                {t('policies.restockingDeduction', 'Restocking Fee')}
              </span>
              <span className="font-extrabold font-mono text-rose-500 text-sm">
                -${simRestockingAmount.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/70">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-0.5">
                {t('policies.customerShippingDeduction', 'Shipping Deduction')}
              </span>
              <span className="font-extrabold font-mono text-rose-500 text-sm">
                -${customerShipping.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              {t('policies.simNetRefund', 'Net Estimated Refund to Customer')}
            </span>
            <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
              {GlobalFormat.currency(simNetRefund)}
            </span>
          </div>
        </div>
      </DetailDrawerBody>

      {/* ── 4. DRAWER FOOTER ACTIONS ── */}
      <DetailDrawerFooter
        onClose={onClose}
        rightActions={
          onEdit ? (
            <ActionButton
              variant="primary"
              icon={<Edit2 size={15} />}
              label={t('policies.editPolicy', 'Edit Return Policy')}
              onClick={() => {
                onClose()
                onEdit(policy)
              }}
            />
          ) : undefined
        }
      />
    </DetailDrawer>
  )
}

export default ReturnPolicyDetailDrawer
