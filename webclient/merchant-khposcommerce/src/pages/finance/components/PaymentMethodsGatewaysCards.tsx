import React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, CreditCard } from 'lucide-react'
import { PaymentMethodCard } from './PaymentMethodCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export interface PaymentMethodsGatewaysCardsProps {
  methods?: any[]
  isLoading?: boolean
  isFetching?: boolean
  onConfigure: (method: any) => void
  onToggleStatus?: (method: any) => void
  onDelete?: (id: number, name?: string) => void
  onAddNew?: () => void
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  togglingId?: number | null
}

export const PaymentMethodsGatewaysCards: React.FC<PaymentMethodsGatewaysCardsProps> = ({
  methods = [],
  isLoading = false,
  onConfigure,
  onToggleStatus,
  onDelete,
  onAddNew,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
  togglingId = null,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-2xl border border-border/60 bg-white dark:bg-card p-5 sm:p-6 space-y-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
          >
            {/* Header Skeleton */}
            <div className="flex items-start justify-between gap-3.5">
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 min-w-0 pt-0.5">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
              <Skeleton className="w-10 h-5 rounded-full shrink-0" />
            </div>

            {/* Inset Information Box Skeleton */}
            <div className="rounded-xl bg-slate-50/80 dark:bg-muted/30 p-3.5 border border-slate-100 dark:border-border/40 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>

            {/* Availability Badges Skeleton */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Footer Button Skeleton */}
            <div className="pt-2">
              <Skeleton className="h-9.5 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (methods.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
          <CreditCard className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-foreground">
            {t('finance.no_data_payment_methods', 'No payment methods found.')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            {t(
              'finance.no_methods_desc',
              'No payment methods match your current criteria. Try adding a new method.'
            )}
          </p>
        </div>
        {canCreate && onAddNew && (
          <Button onClick={onAddNew} className="rounded-xl gap-2 font-medium h-10 px-5 shadow-xs cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>{t('finance.add_payment_method', 'Add Payment Method')}</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {methods.map((method) => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          onConfigure={onConfigure}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          canUpdate={canUpdate}
          canDelete={canDelete}
          isToggling={togglingId === method.id}
        />
      ))}

      {/* Dashed Add New Method Card for clean modern enterprise dashboard */}
      {canCreate && onAddNew && (
        <button
          type="button"
          onClick={onAddNew}
          className="group relative flex flex-col items-center justify-center min-h-[230px] p-6 rounded-2xl border-2 border-dashed border-border/70 hover:border-primary/60 bg-white/40 hover:bg-primary/5 dark:bg-card/40 dark:hover:bg-primary/5 transition-all duration-200 text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        >
          <div className="w-11 h-11 rounded-full bg-muted/60 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary flex items-center justify-center transition-all duration-200 mb-3 group-hover:scale-105 border border-border/40">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {t('finance.add_new_gateway', '+ Add New Payment Method')}
          </span>
          <span className="text-xs text-muted-foreground mt-1 max-w-[210px] leading-relaxed">
            {t('finance.add_gateway_sub', 'Add KHQR, Bank Transfer, or Custom Gateway')}
          </span>
        </button>
      )}
    </div>
  )
}

export default PaymentMethodsGatewaysCards
