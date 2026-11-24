import React from 'react'
import { useTranslation } from 'react-i18next'
import { Receipt, DollarSign, Store, Globe, Smartphone, Calendar, User, Building2, Copy, Check } from 'lucide-react'
import {
  EnterpriseModal,
  StatusBadge,
} from '@/components/common'

export interface UsageRecord {
  id: number | string
  sale_number: string
  campaign_name: string
  campaign_code: string
  branch_name: string
  customer_name: string
  customer_phone?: string
  customer_tier?: string
  discount_amount: number
  subtotal_amount?: number
  final_amount?: number
  rule_applied: string
  channel: string
  used_at: string
  audit_hash?: string
}

export interface UsageDetailDrawerProps {
  usage: UsageRecord | null
  onClose: () => void
}

/**
 * UsageDetailDrawer Component
 * Refactored to match EmployeeDetailDrawer layout:
 * - DetailDrawer (2xl)
 * - DetailDrawerHeader
 * - Profile Overview Hero Card (Receipt icon, campaign name, sub info, tags)
 * - DetailDrawerBody with grouped 2-column cards
 * - DetailDrawerFooter with Close button
 */
export const UsageDetailDrawer: React.FC<UsageDetailDrawerProps> = ({ usage, onClose }) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons'])
  const [copied, setCopied] = React.useState(false)

  if (!usage) return null

  const formatCurrency = (val?: number) => {
    if (typeof val !== 'number') return '$0.00'
    return `$${val.toFixed(2)}`
  }

  const subtotalAmount = usage.subtotal_amount ?? usage.discount_amount * 5
  const finalAmount =
    usage.final_amount ?? Math.max(0, subtotalAmount - usage.discount_amount)

  const handleCopySale = () => {
    navigator.clipboard.writeText(usage.sale_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const renderChannelBadge = (ch: string) => {
    const lower = (ch || '').toLowerCase()
    if (lower === 'pos') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Store size={10} />
          <span>{t('marketing.channelBadgePos', 'POS Counter')}</span>
        </span>
      )
    }
    if (lower === 'web') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          <Globe size={10} />
          <span>{t('marketing.channelBadgeWeb', 'Online Web')}</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
        <Smartphone size={10} />
        <span>{t('marketing.channelBadgeMobile', 'Mobile App')}</span>
      </span>
    )
  }

  return (
    <EnterpriseModal
      isOpen={Boolean(usage)}
      onClose={onClose}
      size="xl"
      title={t('marketing.usageDetailsTitle', 'Promotion Redemption Details')}
      subtitle={usage.sale_number}
      icon={<Receipt size={20} />}
      iconVariant="indigo"
      badge={
        <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
          {usage.sale_number}
        </span>
      }
      footer={
        <div className="flex items-center justify-end p-4 border-t border-border/80 bg-muted/20 w-full shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {t('buttons.close', 'Close')}
          </button>
        </div>
      }
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Profile Overview Card */}
        <div className="p-4 bg-muted/30 rounded-2xl border border-border/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border/80 flex items-center justify-center shrink-0 text-primary shadow-2xs">
              <Receipt size={28} className="text-primary" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  {usage.campaign_name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  -${usage.discount_amount.toFixed(2)} OFF
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>{usage.branch_name || 'Phnom Penh HQ'}</span>
                <span>•</span>
                <span className="font-semibold text-foreground/80">{usage.customer_name || 'Walk-in Customer'}</span>
                <span>•</span>
                <span>{usage.used_at}</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                  {usage.campaign_code}
                </span>
                {renderChannelBadge(usage.channel)}
              </div>
            </div>
          </div>
        </div>
        {/* Card 1: Order & Transaction */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t('marketing.orderInvoice', 'Order & Transaction Details')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.colSaleNumber', 'Sale / Invoice Number')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-foreground">{usage.sale_number}</span>
                <button
                  type="button"
                  onClick={handleCopySale}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title={t('common.copy', 'Copy')}
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.colTimestamp', 'Date & Time')}</p>
              <p className="font-semibold font-mono text-foreground mt-0.5">{usage.used_at}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.colChannel', 'Sales Channel')}</p>
              <div className="mt-0.5">{renderChannelBadge(usage.channel)}</div>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.branchLocation', 'Branch Outlet')}</p>
              <p className="font-semibold text-foreground mt-0.5">{usage.branch_name || '-'}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Campaign & Rule Applied */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t('marketing.campaignRuleInfo', 'Campaign & Rule Evaluation')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.colCampaign', 'Campaign')}</p>
              <p className="font-semibold text-foreground mt-0.5">{usage.campaign_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.colCode', 'Campaign Code')}</p>
              <p className="font-semibold font-mono text-primary mt-0.5">{usage.campaign_code}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.colRule', 'Rule Applied')}</p>
              <p className="font-semibold text-foreground mt-0.5">{usage.rule_applied}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Financial Breakdown */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t('marketing.discountBreakdown', 'Financial Breakdown')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.orderSubtotal', 'Gross Subtotal')}</p>
              <p className="font-semibold font-mono text-foreground mt-0.5">{formatCurrency(subtotalAmount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.discountSavedAmount', 'Discount Saved')}</p>
              <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                -${usage.discount_amount.toFixed(2)}
              </p>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="font-bold text-foreground">{t('marketing.finalPayableAmount', 'Final Payable')}</span>
              <span className="text-base font-extrabold font-mono text-foreground">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseModal>
  )
}

export { UsageDetailDrawer as UsageDetailModal }
export default UsageDetailDrawer
