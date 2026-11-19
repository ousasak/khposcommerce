import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Warehouse,
  Building2,
  Star,
  User,
  Phone,
  MapPin,
  Check,
  Copy,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { cn } from '@/lib/utils'

export interface WarehouseItem {
  id: number
  branch_id: number
  branch?: { name: string }
  name: string
  code: string
  pic_name?: string
  pic_phone?: string
  address?: string
  city?: string
  province?: string
  is_main: boolean
  is_active: boolean
}

export interface WarehouseCardProps {
  warehouse: WarehouseItem
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

/**
 * WarehouseCard Component
 * Modern Enterprise Card with curved top border accent,
 * soft modern shadow, breathable data layout, and unified action buttons.
 */
export const WarehouseCard: React.FC<WarehouseCardProps> = ({
  warehouse,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation(['company', 'common', 'buttons'])
  const [copied, setCopied] = React.useState(false)

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!warehouse.code) return
    navigator.clipboard.writeText(warehouse.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const primaryLocation = warehouse.city
    ? `${warehouse.city}${warehouse.province ? `, ${warehouse.province}` : ''}`
    : warehouse.address || warehouse.province || '—'

  return (
    <Card
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden',
        'bg-card text-card-foreground border-slate-200/80 dark:border-slate-800',
        'shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]',
        warehouse.is_main
          ? 'border-t-4 border-t-amber-500 hover:border-t-amber-500 bg-gradient-to-b from-amber-500/[0.03] to-transparent ring-1 ring-amber-500/20'
          : 'border-t-4 border-t-[#0f766e] dark:border-t-teal-500 hover:border-t-[#0f766e]'
      )}
    >
      {/* Header & Content */}
      <div className="p-5 sm:p-5.5 space-y-3.5 flex-1 flex flex-col justify-between">
        {/* Header */}
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-2xs',
                  warehouse.is_main
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60'
                    : 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200/80 dark:border-teal-800/60'
                )}
              >
                <Warehouse className="w-5 h-5 stroke-[2]" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {warehouse.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground border border-border/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title={t('common.copy', 'Copy code')}
                  >
                    <span>{warehouse.code}</span>
                    {copied ? (
                      <Check size={11} className="text-emerald-600" />
                    ) : (
                      <Copy size={10} className="opacity-60" />
                    )}
                  </button>

                  {warehouse.is_main ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/70 gap-1 px-2 py-0.5"
                    >
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      <span>{t('company.statsMainWarehouses', 'ឃ្លាំងមេ')}</span>
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/80 font-medium px-1.5 py-0.5 rounded bg-muted/40 border border-border/40">
                      #{warehouse.id}
                    </span>
                  )}

                  {warehouse.branch?.name && (
                    <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 truncate max-w-[120px]">
                      {warehouse.branch.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              <StatusBadge status={warehouse.is_active} />
            </div>
          </div>
        </div>

        {/* Clean Data Fields: Location & PIC */}
        <div className="space-y-2.5 pt-3 border-t border-border/50 text-xs">
          {/* Location */}
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <MapPin size={15} className="shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground line-clamp-1 leading-snug">
                {primaryLocation}
              </p>
              {warehouse.address && warehouse.city && (
                <p className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5">
                  {warehouse.address}
                </p>
              )}
            </div>
          </div>

          {/* PIC & Phone (Clean Horizontal Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-muted-foreground">
            <div className="flex items-center gap-2 min-w-0">
              <User size={13} className="shrink-0 text-teal-600 dark:text-teal-400" />
              <span className="text-foreground/80 text-xs truncate font-medium">
                {warehouse.pic_name || '—'}
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <Phone size={13} className="shrink-0 text-teal-600 dark:text-teal-400" />
              {warehouse.pic_phone ? (
                <a
                  href={`tel:${warehouse.pic_phone}`}
                  className="font-mono text-xs text-foreground/80 hover:text-teal-600 hover:underline truncate"
                >
                  {warehouse.pic_phone}
                </a>
              ) : (
                <span className="text-muted-foreground/60 text-xs">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unified Action Footer */}
      <div className="px-5 py-3 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
        <span className="text-[11px] font-mono text-muted-foreground/80 font-medium">
          ID: #{warehouse.id}
        </span>

        {/* Global Action Menu Component */}
        <TableActionMenu
          variant="inline"
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          editColor="teal"
          buttonSize="md"
          viewLabel={t('common.view', 'មើល')}
          editLabel={t('common.edit', 'កែប្រែ')}
          deleteLabel={t('common.delete', 'លុប')}
        />
      </div>
    </Card>
  )
}

/**
 * WarehouseCardSkeleton Component
 */
export const WarehouseCardSkeleton: React.FC = () => {
  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 border-t-4 border-t-muted p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="space-y-2 pt-2 border-t border-border/50">
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
      </div>

      <div className="pt-3 border-t border-border/50 flex items-center justify-between">
        <Skeleton className="h-4 w-12 rounded" />
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </Card>
  )
}

export default WarehouseCard
