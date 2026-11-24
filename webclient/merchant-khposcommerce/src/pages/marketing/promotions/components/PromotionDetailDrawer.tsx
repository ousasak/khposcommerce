import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Sparkles, Layers, Tag, Ticket, Pencil, Calendar } from 'lucide-react'
import type { PromotionCampaign } from '../types'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  StatusBadge,
  ActionButton,
} from '@/components/common'
import type { DetailDrawerTabItem } from '@/components/common'
import { formatDisplayDate } from '@/utils/formatters'

interface PromotionDetailDrawerProps {
  promo: PromotionCampaign | null
  onClose: () => void
  handleDuplicate: (p: PromotionCampaign) => void
  openEditModal: (p: PromotionCampaign) => void
  onOpenSimulator?: (p: PromotionCampaign) => void
}

type TabKey = 'overview' | 'rules' | 'coupons'

export const PromotionDetailDrawer: React.FC<PromotionDetailDrawerProps> = ({
  promo,
  onClose,
  handleDuplicate,
  openEditModal,
  onOpenSimulator,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons'])
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!promo) return null

  const rules = promo.rules || []
  const branches = promo.branches || []
  const channels = promo.channels?.map((c) => c.channel) || []
  const coupons = promo.coupons || []
  const usedCount = promo.usage_count || promo.usages_count || 0
  const maxUses = promo.usage_limit || null
  const usagePercent = maxUses ? Math.min(100, Math.round((usedCount / maxUses) * 100)) : 0

  const startDateStr = promo.start_at || promo.starts_at
  const endDateStr = promo.end_at || promo.ends_at

  const getPromoStatus = (p: PromotionCampaign): 'running' | 'scheduled' | 'expired' | 'paused' | 'draft' => {
    if (!p.is_active) return 'paused'
    const now = new Date()
    const start = p.start_at || p.starts_at
    const end = p.end_at || p.ends_at
    if (start && new Date(start) > now) return 'scheduled'
    if (end && new Date(end) < now) return 'expired'
    if (p.priority < 0) return 'draft'
    return 'running'
  }

  const promoStatus = getPromoStatus(promo)

  const handleCopy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const tabs: DetailDrawerTabItem[] = [
    {
      key: 'overview',
      label: t('marketing.tabOverview', 'Overview & Scope'),
      icon: Layers,
    },
    {
      key: 'rules',
      label: t('marketing.tabRules', 'Discount Rules'),
      icon: Tag,
      badge: rules.length,
    },
    {
      key: 'coupons',
      label: t('marketing.tabCoupons', 'Coupons'),
      icon: Ticket,
      badge: coupons.length > 0 ? coupons.length : undefined,
    },
  ]

  return (
    <DetailDrawer
      isOpen={Boolean(promo)}
      onClose={onClose}
      size="2xl"
    >
      {/* ─── 1. GLOBAL DRAWER HEADER ─── */}
      <DetailDrawerHeader
        title={t('marketing.campaignDetails', 'Promotion Campaign Details')}
        subtitle={promo.code ? `PROMO-${promo.code}` : `PROMO-${String(promo.id).padStart(4, '0')}`}
        badge={
          promo.code ? (
            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
              {promo.code}
            </span>
          ) : (
            <StatusBadge status={promoStatus} />
          )
        }
        onClose={onClose}
      />

      {/* ─── 2. PROFILE OVERVIEW CARD (Matching Employee Detail Drawer) ─── */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border/80 flex items-center justify-center shrink-0 text-primary shadow-2xs">
            <Sparkles size={28} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {promo.name}
              </h2>
              <StatusBadge status={promoStatus} />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{t('marketing.priority', 'Priority')} {promo.priority || 0}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/80">
                {branches.length === 0 ? t('marketing.allBranchesCompany', 'All Branches') : `${branches.length} Branches`}
              </span>
              <span>•</span>
              <span>{startDateStr ? formatDisplayDate(startDateStr) : t('marketing.dateImmediate', 'Immediate')}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {promo.code && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                  {promo.code}
                </span>
              )}
              {promo.is_stackable && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {t('marketing.stackable', 'Stackable')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. TAB NAVIGATION (Matching Employee Detail Drawer TabNav) ─── */}
      <DetailDrawerTabNav
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      {/* ─── 4. GLOBAL DRAWER BODY ─── */}
      <DetailDrawerBody>
        {/* TAB 1: OVERVIEW & SCOPE */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Card 1: Campaign Information */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('marketing.campaignDetails', 'Campaign Information')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.campaignName', 'Campaign Name')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{promo.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.promoCode', 'Promo Code')}</p>
                  <p className="font-semibold font-mono text-primary mt-0.5">{promo.code || t('common.none', 'None')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('common.status', 'Status')}</p>
                  <div className="mt-0.5">
                    <StatusBadge status={promoStatus} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.priority', 'Priority & Stacking')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    Level {promo.priority || 0} {promo.is_stackable ? `• ${t('marketing.stackable', 'Stackable')}` : ''}
                  </p>
                </div>
                {promo.description && (
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground text-[11px] font-medium">{t('common.description', 'Description')}</p>
                    <p className="font-medium text-foreground mt-0.5 leading-relaxed">{promo.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Branch Scope & Channels */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('marketing.branchScopeChannels', 'Branch Scope & Channels')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.branchScope', 'Branch Scope')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {branches.length === 0 ? t('marketing.allBranchesCompany', 'All Branches') : branches.map((b) => b.name).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.channels', 'Channels')}</p>
                  <p className="font-semibold uppercase text-foreground mt-0.5">
                    {channels.length === 0 || channels.includes('all') ? 'All Channels (POS, Web, App)' : channels.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Schedule & Usage */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('marketing.scheduleDates', 'Schedule & Usage Limits')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.startsAt', 'Starts At')}</p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">
                    {startDateStr ? formatDisplayDate(startDateStr) : t('marketing.dateImmediate', 'Immediate')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.endsAt', 'Ends At')}</p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">
                    {endDateStr ? formatDisplayDate(endDateStr) : t('marketing.dateNever', 'Never')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.usageLimitRedemptions', 'Redemptions')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">
                    {usedCount} {maxUses ? `/ ${maxUses} (${usagePercent}%)` : `(${t('marketing.unlimited', 'Unlimited')})`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.redemptionProgress', 'Usage Progress')}</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2 border border-slate-200/50 dark:border-slate-700/50">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISCOUNT RULES */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            {rules.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {t('marketing.noDiscountRulesYet', 'No discount rules configured for this campaign yet.')}
                </p>
              </div>
            ) : (
              rules.map((rule, idx) => (
                <div
                  key={rule.id || idx}
                  className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-mono text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-foreground">{rule.name}</h4>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground font-mono">
                      {rule.discount_type === 'percentage'
                        ? `${rule.discount_value}% OFF`
                        : rule.discount_type === 'fixed_amount'
                        ? `$${rule.discount_value} OFF`
                        : rule.discount_type === 'free_item'
                        ? t('marketing.freeItem', 'FREE ITEM')
                        : `$${rule.discount_value}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                    <div>
                      <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.ruleType', 'Rule Type')}</p>
                      <p className="font-semibold capitalize text-foreground mt-0.5">{rule.rule_type?.replace(/_/g, ' ') || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.priority', 'Priority')}</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {rule.priority} {rule.is_stackable ? `• (${t('marketing.stackable', 'Stackable')})` : ''}
                      </p>
                    </div>
                    {rule.min_subtotal && (
                      <div>
                        <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.minSubtotal', 'Min Subtotal')}</p>
                        <p className="font-semibold font-mono text-foreground mt-0.5">${rule.min_subtotal}</p>
                      </div>
                    )}
                    {rule.products && rule.products.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.targetProducts', 'Target Products')}</p>
                        <p className="font-semibold text-foreground mt-0.5">{rule.products.length} products</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            {coupons.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {t('marketing.noCouponsYet', 'No coupons attached to this campaign.')}
                </p>
              </div>
            ) : (
              coupons.map((c) => (
                <div
                  key={c.id || c.code}
                  className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/50">
                    <span className="font-mono font-black text-sm text-primary">{c.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(c.code, c.code)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={t('common.copy', 'Copy')}
                    >
                      {copiedKey === c.code ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                    <div>
                      <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.usageLimitRedemptions', 'Redemptions')}</p>
                      <p className="font-semibold font-mono text-foreground mt-0.5">
                        {c.used_count || 0} / {c.usage_limit || t('marketing.unlimited', 'Unlimited')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DetailDrawerBody>

      {/* ─── 5. GLOBAL DRAWER FOOTER (Matching Employee Detail Drawer) ─── */}
      <DetailDrawerFooter
        onClose={onClose}
        leftActions={
          <ActionButton
            onClick={() => handleDuplicate(promo)}
            label={t('marketing.duplicate', 'Duplicate')}
            variant="outline"
            icon={<Copy size={15} />}
          />
        }
        rightActions={
          <ActionButton
            onClick={() => {
              onClose()
              openEditModal(promo)
            }}
            label={t('common.edit', 'Edit')}
            variant="primary"
            icon={<Pencil size={15} />}
          />
        }
      />
    </DetailDrawer>
  )
}

export default PromotionDetailDrawer
