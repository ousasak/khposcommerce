import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Store,
  Globe,
  Copy,
  Check,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { getPaymentMethodMeta, formatFeeDisplay } from '@/utils/paymentMethodHelpers'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

export interface PaymentMethodCardProps {
  method: any
  onConfigure: (method: any) => void
  onToggleStatus?: (method: any) => void
  onDelete?: (id: number, name?: string) => void
  canUpdate?: boolean
  canDelete?: boolean
  isToggling?: boolean
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  onConfigure,
  onToggleStatus,
  onDelete,
  canUpdate = true,
  canDelete = true,
  isToggling = false,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const toast = useToast()
  const [copiedCode, setCopiedCode] = useState(false)

  const meta = getPaymentMethodMeta(method)
  const feeInfo = formatFeeDisplay(method.fee_percent, method.fee_fixed)
  const isActive = Boolean(method.is_active)
  const isPos = Boolean(method.available_pos)
  const isOnline = Boolean(method.available_online)
  const IconComponent = meta.icon

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(method.code)
    setCopiedCode(true)
    toast.success(t('finance.code_copied', 'Payment method code copied.'))
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-card border border-border/60 hover:border-border transition-all duration-200 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
        !isActive && 'opacity-85 hover:opacity-100 bg-muted/15 dark:bg-muted/10'
      )}
    >
      {/* Main Card Body */}
      <div className="p-5 sm:p-6 space-y-4.5 flex-1 flex flex-col justify-between">
        {/* 1. Header: Icon, Titles, Switch */}
        <div className="flex items-start justify-between gap-3.5">
          {/* Left: Prominent Circular Icon */}
          <div
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-2xs',
              meta.colorTheme.bg,
              meta.colorTheme.border
            )}
          >
            <IconComponent className={cn('w-5 h-5', meta.colorTheme.text)} />
          </div>

          {/* Center: Title & Short Subtitle */}
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-base font-bold text-foreground tracking-tight leading-snug truncate">
              {method.name || meta.englishName}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">
              {method.description || meta.shortDesc}
            </p>

            {/* Supported Card Brands (for Credit/Debit Card) */}
            {meta.supportedBrands && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {meta.supportedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/40"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Active/Inactive Switch Toggle & Delete action */}
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            <Switch
              checked={isActive}
              onCheckedChange={() => onToggleStatus?.(method)}
              disabled={!canUpdate || isToggling}
              loading={isToggling}
              activeColor="emerald"
              aria-label={`Toggle ${method.name}`}
            />

            {canDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onDelete?.(method.id, method.name)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title={t('common.delete', 'Delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{t('common.delete', 'Delete')}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* 2. Information Section: Clean Modern Inset Panel */}
        <div className="rounded-xl bg-slate-50/80 dark:bg-muted/30 p-3.5 border border-slate-100 dark:border-border/40 grid grid-cols-2 gap-3">
          {/* Left: Service Fee */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t('finance.service_fee', 'Service Fee')}
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className={cn(
                  'text-sm font-bold tracking-tight',
                  feeInfo.isFree
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-foreground'
                )}
              >
                {feeInfo.isFree ? t('finance.free_fee', 'Free (0%)') : feeInfo.label}
              </span>
            </div>
          </div>

          {/* Right: Payment Code with Copy Button */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t('finance.payment_code', 'Payment Code')}
            </span>
            <div className="pt-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-border/70 hover:border-primary/50 text-xs font-mono font-medium text-foreground transition-all cursor-pointer group/code shadow-2xs hover:shadow-xs"
                  >
                    <span>{method.code}</span>
                    {copiedCode ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground opacity-60 group-hover/code:opacity-100 transition-opacity" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">
                    {copiedCode
                      ? t('finance.copied', 'Copied!')
                      : t('finance.click_to_copy', 'Click to copy code')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* 3. Availability Badges & Status Row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Left: Platform Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isPos && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                <Store className="w-3 h-3" />
                <span>{t('finance.channel_pos', 'POS')}</span>
              </span>
            )}
            {isOnline && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-100 dark:border-purple-900/40">
                <Globe className="w-3 h-3" />
                <span>{t('finance.channel_online', 'Online')}</span>
              </span>
            )}
            {!isPos && !isOnline && (
              <span className="text-xs text-muted-foreground italic">
                {t('finance.channel_none', 'No platform assigned')}
              </span>
            )}
          </div>

          {/* Right: Status Pill Badge */}
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
              isActive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/50'
                : 'bg-muted text-muted-foreground border-border/60'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isActive ? 'bg-emerald-500' : 'bg-slate-400'
              )}
            />
            <span>{isActive ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive')}</span>
          </div>
        </div>
      </div>

      {/* 4. Action Footer: Full-Width Button */}
      <div className="p-3.5 sm:p-4 bg-slate-50/50 dark:bg-muted/10 border-t border-border/50">
        <Button
          onClick={() => onConfigure(method)}
          variant="outline"
          className="w-full h-9.5 rounded-xl font-medium text-xs sm:text-[13px] gap-2 bg-white dark:bg-card border-border/80 hover:bg-muted/70 text-foreground transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer"
        >
          <Settings className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:rotate-45" />
          <span>{t('finance.configure_payment_method', 'Configure Payment Method')}</span>
        </Button>
      </div>
    </div>
  )
}

export default PaymentMethodCard
