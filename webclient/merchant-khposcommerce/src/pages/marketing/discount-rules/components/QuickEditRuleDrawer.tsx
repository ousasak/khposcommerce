import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { Tag, ExternalLink, Percent, DollarSign, Layers } from 'lucide-react'
import { FormDrawer } from '@/components/common'
import { marketingService } from '@/services/marketingService'
import { sound } from '@/utils/sound'
import type { FlattenedPromotionRule } from './DiscountRulesTableSection'

export interface QuickEditRuleDrawerProps {
  rule: FlattenedPromotionRule | null
  open: boolean
  onClose: () => void
  onFullEdit?: (campaignId: number) => void
}

export const QuickEditRuleDrawer: React.FC<QuickEditRuleDrawerProps> = ({
  rule,
  open,
  onClose,
  onFullEdit,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons', 'toast'])
  const toast = useToast()
  const queryClient = useQueryClient()

  // Form States
  const [name, setName] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState<string>('0')
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('')
  const [minSubtotal, setMinSubtotal] = useState<string>('')
  const [minQty, setMinQty] = useState<string>('')
  const [priority, setPriority] = useState<string>('10')
  const [isStackable, setIsStackable] = useState<boolean>(true)
  const [isActive, setIsActive] = useState<boolean>(true)

  // Sync state when rule changes
  useEffect(() => {
    if (rule) {
      setName(rule.name || '')
      setDiscountType(rule.discount_type || (rule as any).type || 'percentage')
      setDiscountValue(rule.discount_value !== undefined ? String(rule.discount_value) : '0')
      setMaxDiscountAmount(
        rule.max_discount_amount !== null && rule.max_discount_amount !== undefined
          ? String(rule.max_discount_amount)
          : ''
      )
      setMinSubtotal(
        rule.min_subtotal !== null && rule.min_subtotal !== undefined
          ? String(rule.min_subtotal)
          : ''
      )
      setMinQty(
        rule.min_qty !== null && rule.min_qty !== undefined
          ? String(Number(rule.min_qty))
          : ''
      )
      setPriority(rule.priority !== undefined ? String(rule.priority) : '10')
      setIsStackable(Boolean(rule.is_stackable ?? true))
      setIsActive(Boolean(rule.is_active ?? true))
    }
  }, [rule])

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!rule || !rule.campaign) throw new Error('No campaign associated')

      // Rebuild rules payload for this campaign
      const currentRules = rule.campaign.rules || []
      const updatedRules = currentRules.map((r) => {
        const isCurrent = rule.id ? r.id === rule.id : r.name === rule.name
        if (isCurrent) {
          return {
            name: name.trim(),
            rule_type: r.rule_type || rule.rule_type || 'product_discount',
            discount_type: discountType,
            discount_value: parseFloat(discountValue) || 0,
            max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
            min_subtotal: minSubtotal ? parseFloat(minSubtotal) : null,
            min_qty: minQty ? parseInt(minQty, 10) : null,
            priority: parseInt(priority, 10) || 10,
            is_stackable: isStackable,
            is_active: isActive,
            product_ids: r.product_ids || r.products?.map((p: any) => p.id) || [],
            category_ids: r.category_ids || r.categories?.map((c: any) => c.id) || [],
            brand_ids: r.brand_ids || r.brands?.map((b: any) => b.id) || [],
          }
        }
        return {
          name: r.name,
          rule_type: r.rule_type,
          discount_type: r.discount_type,
          discount_value: Number(r.discount_value || 0),
          max_discount_amount: r.max_discount_amount ? Number(r.max_discount_amount) : null,
          min_subtotal: r.min_subtotal ? Number(r.min_subtotal) : null,
          min_qty: r.min_qty ? Number(r.min_qty) : null,
          priority: Number(r.priority || 10),
          is_stackable: Boolean(r.is_stackable ?? true),
          is_active: Boolean(r.is_active ?? true),
          product_ids: r.product_ids || r.products?.map((p: any) => p.id) || [],
          category_ids: r.category_ids || r.categories?.map((c: any) => c.id) || [],
          brand_ids: r.brand_ids || r.brands?.map((b: any) => b.id) || [],
        }
      })

      // If matching rule was not in campaign.rules (newly flattened)
      if (!currentRules.some((r) => (rule.id ? r.id === rule.id : r.name === rule.name))) {
        updatedRules.push({
          name: name.trim(),
          rule_type: rule.rule_type || 'product_discount',
          discount_type: discountType,
          discount_value: parseFloat(discountValue) || 0,
          max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
          min_subtotal: minSubtotal ? parseFloat(minSubtotal) : null,
          min_qty: minQty ? parseInt(minQty, 10) : null,
          priority: parseInt(priority, 10) || 10,
          is_stackable: isStackable,
          is_active: isActive,
          product_ids: rule.product_ids || rule.products?.map((p: any) => p.id) || [],
          category_ids: rule.category_ids || rule.categories?.map((c: any) => c.id) || [],
          brand_ids: rule.brand_ids || rule.brands?.map((b: any) => b.id) || [],
        })
      }

      return marketingService.updatePromotion(rule.campaign.id, {
        rules: updatedRules,
      })
    },
    onSuccess: () => {
      sound.playSuccess()
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('marketing.ruleUpdatedSuccess', 'Discount rule updated successfully.'))
      onClose()
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('marketing.ruleUpdatedError', 'Failed to update discount rule.')
      toast.error(msg)
    },
  })

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!name.trim()) {
      toast.error(t('marketing.ruleNameRequired', 'Rule name is required.'))
      return
    }
    sound.playClick()
    updateMutation.mutate()
  }

  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]'
  const inputCls =
    `w-full ${controlHeightCls} px-3 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none shadow-2xs`
  const selectCls =
    `w-full ${controlHeightCls} pl-3 pr-8 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={t('marketing.quickEditRule', 'Quick Edit Discount Rule')}
      subtitle={t('marketing.quickEditRuleDesc', 'Quickly adjust discount rates, purchase conditions, and priority.')}
      width="max-w-lg"
      loading={updateMutation.isPending}
      submitLabel={t('buttons.save', 'Save Changes')}
      cancelLabel={t('buttons.cancel', 'Cancel')}
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          {rule?.campaign && onFullEdit ? (
            <button
              type="button"
              onClick={() => {
                onClose()
                onFullEdit(rule.campaign.id)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
            >
              <span>{t('marketing.fullEditCampaign', 'Full Edit Campaign')}</span>
              <ExternalLink size={13} />
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className={`${controlHeightCls} px-4 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-card hover:bg-muted text-foreground text-sm font-semibold transition-all cursor-pointer`}
            >
              {t('buttons.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={updateMutation.isPending}
              className={`${controlHeightCls} px-5 rounded-lg bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50`}
            >
              {updateMutation.isPending ? t('common.saving', 'Saving...') : t('buttons.save', 'Save Changes')}
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Parent Campaign Info Pill */}
        {rule?.campaign && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Tag size={12} className="text-primary" />
                {t('marketing.campaign', 'Campaign')}
              </span>
              {rule.campaign.code && (
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                  {rule.campaign.code}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-foreground truncate">
              {rule.campaign.name}
            </p>
          </div>
        )}

        {/* 1. Rule Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            {t('marketing.ruleName', 'Rule Name')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder={t('marketing.ruleNamePlaceholder', 'e.g. VIP Tier 15% Cart Discount')}
            required
          />
        </div>

        {/* 2. Reward & Discount Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {t('marketing.discountType', 'Discount Type')}
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className={selectCls}
            >
              <option value="percentage">% {t('marketing.percentageDiscount', 'Percentage')}</option>
              <option value="fixed_amount">$ {t('marketing.fixedAmountDiscount', 'Fixed Amount')}</option>
              <option value="bogo">{t('marketing.bogoDiscount', 'BOGO')}</option>
              <option value="free_gift">{t('marketing.freeGiftDiscount', 'Free Gift')}</option>
              <option value="free_shipping">{t('marketing.freeShippingDiscount', 'Free Shipping')}</option>
              <option value="bundle">{t('marketing.bundleDiscount', 'Bundle Deal')}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {t('marketing.discountValue', 'Discount Value')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className={`${inputCls} pr-8`}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                {discountType === 'percentage' ? '%' : '$'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Max Discount Cap */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            {t('marketing.maximumCap', 'Max Discount Cap ($)')}
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={maxDiscountAmount}
            onChange={(e) => setMaxDiscountAmount(e.target.value)}
            className={inputCls}
            placeholder={t('marketing.noLimitOptional', 'Optional (e.g. 100)')}
          />
          <p className="text-[11px] text-muted-foreground">
            {t('marketing.maxDiscountCapHelp', 'Limit the total discount amount given per transaction.')}
          </p>
        </div>

        {/* 4. Purchase Conditions (Min Spend & Min Qty) */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t('marketing.minPurchaseConditions', 'Purchase Conditions')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                {t('marketing.minPurchase', 'Min. Spend ($)')}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={minSubtotal}
                onChange={(e) => setMinSubtotal(e.target.value)}
                className={inputCls}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                {t('marketing.minQuantity', 'Min. Quantity')}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                className={inputCls}
                placeholder="1"
              />
            </div>
          </div>
        </div>

        {/* 5. Priority & Stacking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {t('marketing.priority', 'Priority Weight')}
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground">
              {t('marketing.priorityHelp', 'Higher number executes first.')}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Active Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="checkbox h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs font-semibold text-foreground">
                {t('marketing.statusActive', 'Rule is Active')}
              </span>
            </label>

            {/* Stackable Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isStackable}
                onChange={(e) => setIsStackable(e.target.checked)}
                className="checkbox h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs font-semibold text-foreground">
                {t('marketing.stackable', 'Allow Stackable')}
              </span>
            </label>
          </div>
        </div>
      </form>
    </FormDrawer>
  )
}

export default QuickEditRuleDrawer
