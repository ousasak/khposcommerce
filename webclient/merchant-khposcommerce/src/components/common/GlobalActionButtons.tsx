import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Download,
  Upload,
  QrCode,
  Check,
  Loader2,
  RefreshCw,
  Filter,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Printer,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ExportDropdown, {
  type ExportDateRange,
  type ExportDropdownOption,
  type ExportDropdownVariant,
  type ExportDropdownSize,
} from './ExportDropdown'

/**
 * Standard Header Action Button Group container.
 * Keeps spacing, wrapping, and heights completely consistent across all enterprise pages.
 */
export interface HeaderActionsGroupProps {
  children: React.ReactNode
  className?: string
}

export const HeaderActionsGroup: React.FC<HeaderActionsGroupProps> = ({ children, className = '' }) => (
  <div className={cn('flex items-center flex-wrap gap-2 sm:gap-2.5 w-full xl:w-auto xl:justify-end shrink-0', className)}>
    {children}
  </div>
)

/**
 * Standard Primary Action Button (e.g. "+ បន្ថែម...", "+ Add ...", "+ Create ...")
 */
export interface AddButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  type?: 'button' | 'submit'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
  type = 'button',
  size = 'md',
  children,
}) => {
  const content = children ?? label
  const stringTitle = typeof title === 'string' ? title : typeof content === 'string' ? content : undefined

  return (
    <Button
      type={type}
      variant="default"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled || loading}
      title={stringTitle}
      onClick={onClick}
      className={cn('font-semibold shadow-xs transition-all active:scale-[0.98] select-none', className)}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} />
      ) : (
        icon || <Plus className={cn(size === 'sm' ? 'size-3.5' : 'size-4')} strokeWidth={2.5} />
      )}
      {content && <span>{content}</span>}
    </Button>
  )
}

/**
 * Standard Secondary / Action Button (e.g. outline button, audit, transfer, custom actions)
 */
export interface ActionButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  variant?: 'outline' | 'secondary' | 'soft' | 'primary' | 'emerald' | 'danger' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  children?: React.ReactNode
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
  variant = 'outline',
  size = 'md',
  type = 'button',
  children,
}) => {
  const content = children ?? label
  const stringTitle = typeof title === 'string' ? title : typeof content === 'string' ? content : undefined

  const variantMap: Record<string, any> = {
    outline: 'outline',
    secondary: 'secondary',
    soft: 'soft',
    primary: 'default',
    emerald: 'emerald',
    success: 'success',
    danger: 'destructive',
    warning: 'warning',
  }

  return (
    <Button
      type={type}
      variant={variantMap[variant] || 'outline'}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled || loading}
      title={stringTitle}
      onClick={onClick}
      className={cn(
        'font-semibold transition-all active:scale-[0.98] select-none',
        variant === 'outline' && 'border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 text-foreground dark:text-slate-100 hover:bg-muted/80 dark:hover:bg-slate-700',
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} />
      ) : (
        icon
      )}
      {content && <span>{content}</span>}
    </Button>
  )
}

export const SecondaryButton = ActionButton

/**
 * Standard Export CSV / Excel Button (e.g. "នាំចេញ CSV")
 * Supports either direct onClick or rich date-range dropdown (1 day, 7 days, 1 month, all)
 */
export interface ExportButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  onExportRange?: (range: ExportDateRange | string) => void | Promise<void>
  label?: string
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  options?: ExportDropdownOption[]
  align?: 'left' | 'right'
  variant?: ExportDropdownVariant
  size?: ExportDropdownSize
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  onExportRange,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
  options,
  align = 'right',
  variant = 'outline',
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const displayLabel = label || t('common.exportCsv')

  if (onExportRange) {
    return (
      <ExportDropdown
        onExport={onExportRange}
        label={label}
        loading={loading}
        disabled={disabled}
        className={className}
        align={align}
        options={options}
        title={title}
        variant={variant}
        size={size}
      />
    )
  }

  const iconClass =
    variant === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-emerald-600 dark:text-emerald-400'

  return (
    <Button
      type="button"
      variant={variant === 'emerald' ? 'soft' : variant === 'secondary' ? 'secondary' : 'outline'}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled || loading}
      title={title || displayLabel}
      onClick={onClick}
      className={cn(
        'font-semibold transition-all active:scale-[0.98] shrink-0 select-none shadow-2xs hover:shadow-xs',
        'border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/90 text-foreground dark:text-slate-100 hover:bg-muted/80 dark:hover:bg-slate-700',
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} />
      ) : (
        icon || <Download className={cn(size === 'sm' ? 'size-3.5' : 'size-4', iconClass)} />
      )}
      <span>{displayLabel}</span>
    </Button>
  )
}

/**
 * Standard Import CSV Button (e.g. "Import CSV")
 */
export interface ImportButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: string
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  size?: ExportDropdownSize
}

export const ImportButton: React.FC<ImportButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const displayLabel = label || t('common.importCsv')

  return (
    <Button
      type="button"
      variant="outline"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled || loading}
      title={title || displayLabel}
      onClick={onClick}
      className={cn(
        'font-semibold transition-all active:scale-[0.98] shrink-0 select-none shadow-2xs hover:shadow-xs',
        'border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/90 text-foreground dark:text-slate-100 hover:bg-muted/80 dark:hover:bg-slate-700',
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} />
      ) : (
        icon || <Upload className={cn(size === 'sm' ? 'size-3.5' : 'size-4', 'text-blue-600 dark:text-blue-400')} />
      )}
      <span>{displayLabel}</span>
    </Button>
  )
}

/**
 * Standard QR Kiosk Button (e.g. "Launch QR Kiosk")
 */
export interface QrKioskButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: string
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
}

export const QrKioskButton: React.FC<QrKioskButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const displayLabel = label || t('employees.launch_qr_kiosk', 'Company Entrance QR')
  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      disabled={disabled || loading}
      title={title || displayLabel}
      onClick={onClick}
      className={cn(
        'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border-purple-500/20 font-semibold active:scale-[0.98]',
        className
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon || <QrCode className="size-4" />}
      <span>{displayLabel}</span>
    </Button>
  )
}

/**
 * Standard Save / Update Form Action Button (e.g. "Save", "Save Changes")
 */
export interface SaveButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  type?: 'submit' | 'button'
  label?: string
  isEdit?: boolean
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  type = 'submit',
  label,
  isEdit = false,
  loading = false,
  disabled = false,
  icon,
  className = '',
}) => {
  const { t } = useTranslation(['common'])
  const displayLabel = label || (isEdit ? t('common.saveChanges', 'Save Changes') : t('common.save', 'Save'))
  return (
    <Button
      type={type}
      variant="default"
      size="md"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn('font-bold shadow-xs hover:shadow active:scale-95 transition-all', className)}
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : icon || <Check className="size-3.5" strokeWidth={2.5} />}
      <span>{displayLabel}</span>
    </Button>
  )
}

/**
 * Standard Cancel Form Action Button (e.g. "Cancel")
 */
export interface CancelButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: string
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation(['common'])
  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      disabled={disabled}
      onClick={onClick}
      className={cn('font-semibold active:scale-95 text-muted-foreground hover:text-foreground', className)}
    >
      {icon}
      <span>{label || t('common.cancel', 'Cancel')}</span>
    </Button>
  )
}

/**
 * Standard Filter Button (e.g. "Filter")
 */
export interface FilterButtonProps {
  onClick: (e?: React.MouseEvent) => void
  isActive?: boolean
  activeCount?: number
  label?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  isActive = false,
  activeCount,
  label,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const displayLabel = label || t('common.filter', 'Filter')
  const hasActive = isActive || (activeCount !== undefined && activeCount > 0)

  // Exact sizing matching SearchInput and ColumnSettingsPopover (Manage Columns)
  const sizeClasses = {
    sm: 'h-8 min-h-[32px] max-h-[32px] px-2.5 text-xs font-medium rounded-md gap-1.5',
    md: 'h-10 min-h-[40px] max-h-[40px] px-3.5 sm:px-4 text-sm font-medium rounded-lg gap-2',
    lg: 'h-12 min-h-[48px] max-h-[48px] px-4.5 text-base font-medium rounded-xl gap-2.5',
  }

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.md
  const currentIconSize = iconSizes[size] || iconSizes.md

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 select-none shrink-0 box-border leading-normal cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        currentSizeClass,
        hasActive
          ? 'border border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold ring-2 ring-teal-500/20 shadow-2xs hover:bg-teal-100/70 dark:hover:bg-teal-900/50'
          : 'border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:bg-muted/80 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-xs',
        className
      )}
      title={displayLabel}
    >
      <Filter
        size={currentIconSize}
        className={cn(
          'shrink-0 stroke-[2] transition-colors',
          hasActive ? 'text-teal-700 dark:text-teal-300' : 'text-muted-foreground/80 dark:text-slate-400'
        )}
      />
      <span className="whitespace-nowrap">{displayLabel}</span>
      {activeCount !== undefined && activeCount > 0 ? (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-teal-600 text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs ml-0.5">
          {activeCount}
        </span>
      ) : hasActive ? (
        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 ml-0.5" />
      ) : null}
    </button>
  )
}

/**
 * Standard Refresh Action Button (e.g. "Refresh")
 */
export interface RefreshButtonProps {
  onClick: (e?: React.MouseEvent) => void
  loading?: boolean
  disabled?: boolean
  title?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  title,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])

  // Exact icon button sizing matching ColumnSettingsPopover icon variant
  const sizeClasses = {
    sm: 'h-8 w-8 min-h-[32px] max-h-[32px] rounded-md',
    md: 'h-10 w-10 min-h-[40px] max-h-[40px] rounded-lg',
    lg: 'h-12 w-12 min-h-[48px] max-h-[48px] rounded-xl',
  }

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.md
  const currentIconSize = iconSizes[size] || iconSizes.md

  return (
    <button
      type="button"
      disabled={disabled || loading}
      title={title || t('common.refresh', 'Refresh')}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 select-none shrink-0 box-border leading-normal cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        currentSizeClass,
        'border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted/80 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-xs',
        className
      )}
    >
      <RefreshCw
        size={currentIconSize}
        className={cn('shrink-0 transition-transform duration-300', loading && 'animate-spin')}
      />
    </button>
  )
}

/**
 * Standard Reset Action Button (e.g. "Reset", "កំណត់ឡើងវិញ")
 */
export interface ResetButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: string
  iconOnly?: boolean
  disabled?: boolean
  className?: string
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ResetButton: React.FC<ResetButtonProps> = ({
  onClick,
  label,
  iconOnly = false,
  disabled = false,
  className = '',
  title,
  size = 'md',
}) => {
  const { t } = useTranslation(['common', 'buttons'])
  const displayLabel = label
    ? label.includes('.')
      ? t(label, { defaultValue: label })
      : label
    : t('common.reset', 'Reset')

  const sizeClasses = {
    sm: iconOnly
      ? 'h-8 w-8 min-h-[32px] max-h-[32px] rounded-md'
      : 'h-8 min-h-[32px] max-h-[32px] px-2.5 text-xs font-medium rounded-md gap-1.5',
    md: iconOnly
      ? 'h-10 w-10 min-h-[40px] max-h-[40px] rounded-lg'
      : 'h-10 min-h-[40px] max-h-[40px] px-3.5 sm:px-4 text-sm font-medium rounded-lg gap-2',
    lg: iconOnly
      ? 'h-12 w-12 min-h-[48px] max-h-[48px] rounded-xl'
      : 'h-12 min-h-[48px] max-h-[48px] px-4.5 text-base font-medium rounded-xl gap-2.5',
  }

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.md
  const currentIconSize = iconSizes[size] || iconSizes.md

  return (
    <button
      type="button"
      disabled={disabled}
      title={title || displayLabel}
      aria-label={displayLabel}
      onClick={onClick}
      className={cn(
        'group inline-flex items-center justify-center font-medium transition-all duration-200 select-none shrink-0 box-border leading-normal cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        currentSizeClass,
        'border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:bg-muted/80 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-xs',
        className
      )}
    >
      <RotateCcw
        size={currentIconSize}
        className="text-muted-foreground/80 dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-white group-hover:-rotate-90 transition-transform duration-300 ease-out shrink-0"
      />
      {!iconOnly && <span className="whitespace-nowrap">{displayLabel}</span>}
    </button>
  )
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SmartHR-Style Table Row Action Buttons with Clean Soft Drop Shadow
 * References: https://smarthr.dreamstechnologies.com/fsm/react/technician-stock
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface RowActionGroupProps {
  children: React.ReactNode
  className?: string
  align?: 'right' | 'left' | 'center'
}

export const RowActionGroup: React.FC<RowActionGroupProps> = ({
  children,
  className = '',
  align = 'right',
}) => (
  <div
    className={cn(
      'inline-flex items-center gap-1.5 sm:gap-2',
      align === 'right' && 'justify-end',
      align === 'left' && 'justify-start',
      align === 'center' && 'justify-center',
      className
    )}
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
)

export type RowActionVariant =
  | 'default'
  | 'view'
  | 'edit'
  | 'danger'
  | 'warning'
  | 'success'
  | 'primary'

export type RowActionColor = 'blue' | 'amber' | 'teal' | 'indigo' | 'emerald' | 'rose' | 'default'

export const ROW_ACTION_COLOR_MAP: Record<RowActionColor, string> = {
  blue:
    'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/60 dark:hover:bg-blue-950/20',
  amber:
    'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50/60 dark:hover:bg-amber-950/20',
  teal:
    'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:border-teal-300 dark:hover:border-teal-800 hover:bg-teal-50/60 dark:hover:bg-teal-950/20',
  indigo:
    'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20',
  emerald:
    'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20',
  rose:
    'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50/60 dark:hover:bg-rose-950/20',
  default:
    'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
}

export interface RowActionButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  icon: React.ReactNode
  title?: string
  ariaLabel?: string
  variant?: RowActionVariant
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export const RowActionButton: React.FC<RowActionButtonProps> = ({
  onClick,
  icon,
  title,
  ariaLabel,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'h-7 w-7 min-w-[28px] min-h-[28px] rounded-md'
      : 'h-8 w-8 min-w-[32px] min-h-[32px] rounded-lg'

  const variantClasses = {
    default:
      'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
    view:
      'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
    edit:
      'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/60 dark:hover:bg-blue-950/20',
    danger:
      'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50/60 dark:hover:bg-rose-950/20',
    success:
      'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
    primary:
      'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-primary hover:text-primary/90 hover:border-primary/40 hover:bg-primary/5',
    warning:
      'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50/50',
  }[variant]

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      title={title}
      aria-label={ariaLabel || title}
      className={cn(
        'inline-flex items-center justify-center border font-medium cursor-pointer select-none transition-all duration-150',
        // SmartHR soft drop shadow
        'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-2xs',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none',
        sizeClasses,
        variantClasses,
        className
      )}
    >
      {icon}
    </button>
  )
}

export const ViewRowButton: React.FC<Omit<RowActionButtonProps, 'icon'> & { icon?: React.ReactNode }> = ({
  icon,
  title = 'View',
  size = 'md',
  ...props
}) => (
  <RowActionButton
    icon={icon || <Eye size={size === 'sm' ? 13 : 14} className="stroke-[1.9]" />}
    title={title}
    variant="view"
    size={size}
    {...props}
  />
)

export interface EditRowButtonProps extends Omit<RowActionButtonProps, 'icon'> {
  icon?: React.ReactNode
  color?: RowActionColor
}

export const EditRowButton: React.FC<EditRowButtonProps> = ({
  icon,
  title = 'Edit',
  size = 'md',
  color = 'blue',
  className = '',
  ...props
}) => (
  <RowActionButton
    icon={icon || <Edit2 size={size === 'sm' ? 13 : 14} className="stroke-[1.9]" />}
    title={title}
    variant="edit"
    size={size}
    className={cn(color && color !== 'blue' && ROW_ACTION_COLOR_MAP[color], className)}
    {...props}
  />
)

export const DeleteRowButton: React.FC<Omit<RowActionButtonProps, 'icon'> & { icon?: React.ReactNode }> = ({
  icon,
  title = 'Delete',
  size = 'md',
  ...props
}) => (
  <RowActionButton
    icon={icon || <Trash2 size={size === 'sm' ? 13 : 14} className="stroke-[1.9]" />}
    title={title}
    variant="danger"
    size={size}
    {...props}
  />
)

export const CopyRowButton: React.FC<Omit<RowActionButtonProps, 'icon'> & { icon?: React.ReactNode }> = ({
  icon,
  title = 'Copy',
  size = 'md',
  ...props
}) => (
  <RowActionButton
    icon={icon || <Copy size={size === 'sm' ? 13 : 14} className="stroke-[1.9]" />}
    title={title}
    variant="default"
    size={size}
    {...props}
  />
)

export const PrintRowButton: React.FC<Omit<RowActionButtonProps, 'icon'> & { icon?: React.ReactNode }> = ({
  icon,
  title = 'Print',
  size = 'md',
  ...props
}) => (
  <RowActionButton
    icon={icon || <Printer size={size === 'sm' ? 13 : 14} className="stroke-[1.9]" />}
    title={title}
    variant="default"
    size={size}
    {...props}
  />
)

export default {
  HeaderActionsGroup,
  AddButton,
  ActionButton,
  SecondaryButton,
  ExportButton,
  ImportButton,
  QrKioskButton,
  SaveButton,
  CancelButton,
  FilterButton,
  RefreshButton,
  ResetButton,
}
