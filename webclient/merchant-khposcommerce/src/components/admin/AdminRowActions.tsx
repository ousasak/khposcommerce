import React from 'react'
import { Eye, Pencil, FileText, Printer, Trash2, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { cn } from '@/lib/utils'

/**
 * Standard sizes for row action buttons cloned from TheManStore
 */
export type AdminActionSize = 'xs' | 'sm' | 'md' | 'lg'
export type AdminActionVariant = 'default' | 'danger' | 'primary' | 'subtle' | 'warning' | 'success'

interface SizeConfig {
  btn: string
  iconSize: number
}

const SIZE_CONFIGS: Record<AdminActionSize, SizeConfig> = {
  xs: {
    btn: 'h-7 w-7 rounded-md min-w-[28px] min-h-[28px]',
    iconSize: 13,
  },
  sm: {
    btn: 'h-8 w-8 rounded-lg min-w-[32px] min-h-[32px]',
    iconSize: 15,
  },
  md: {
    btn: 'h-8.5 w-8.5 rounded-lg min-w-[34px] min-h-[34px]',
    iconSize: 16,
  },
  lg: {
    btn: 'h-10 w-10 rounded-lg min-w-[40px] min-h-[40px]',
    iconSize: 18,
  },
}

export interface AdminActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  title?: string
  ariaLabel?: string
  variant?: AdminActionVariant
  size?: AdminActionSize
  className?: string
  style?: React.CSSProperties
}

/**
 * Single Admin Action Button with standard TheManStore styling
 */
export const AdminActionButton: React.FC<AdminActionButtonProps> = ({
  icon,
  title,
  ariaLabel,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'sm',
  className = '',
  style = {},
  type = 'button',
  ...rest
}) => {
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.sm

  let variantClasses = ''
  let computedStyle: React.CSSProperties = { ...style }

  if (variant === 'danger') {
    variantClasses = cn(
      'border border-rose-200 dark:border-rose-300/50',
      'bg-white dark:bg-rose-500/10',
      'text-rose-600 dark:text-rose-400',
      'hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:border-rose-300 dark:hover:border-rose-300',
      'shadow-2xs'
    )
  } else if (variant === 'primary') {
    variantClasses = cn(
      'text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600',
      'border border-amber-500 dark:border-amber-600 shadow-2xs'
    )
  } else if (variant === 'subtle') {
    variantClasses = cn(
      'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
      'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
    )
  } else if (variant === 'success') {
    variantClasses = cn(
      'border border-emerald-200 dark:border-emerald-800',
      'bg-white dark:bg-slate-900',
      'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300',
      'shadow-2xs'
    )
  } else {
    // Default action style (View, Edit, Invoice, etc.) matching TheManStore
    variantClasses = cn(
      'border border-slate-200/90 dark:border-slate-800',
      'bg-white dark:bg-slate-900',
      'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80',
      'shadow-2xs'
    )
  }

  return (
    <button
      type={type}
      onClick={(e) => {
        if (disabled) return
        if (onClick) onClick(e)
      }}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      style={computedStyle}
      className={cn(
        'inline-flex items-center justify-center transition-colors shrink-0 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        sizeConfig.btn,
        variantClasses,
        className
      )}
      {...rest}
    >
      {icon}
    </button>
  )
}

/**
 * Standard Delete Action Button cloned from TheManStore
 */
export const AdminDeleteButton: React.FC<AdminActionButtonProps> = ({
  onClick,
  title,
  ariaLabel,
  disabled = false,
  size = 'sm',
  className = '',
  style = {},
  icon,
  ...rest
}) => {
  const { t } = useTranslation(['common'])
  const resolvedTitle = title || t('common:delete', 'Delete')
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.sm

  return (
    <AdminActionButton
      type="button"
      onClick={onClick}
      title={resolvedTitle}
      ariaLabel={ariaLabel || resolvedTitle}
      disabled={disabled}
      variant="danger"
      size={size}
      className={className}
      style={style}
      icon={icon || <Trash2 size={sizeConfig.iconSize} className="stroke-[1.8]" />}
      {...rest}
    />
  )
}

export interface ExtraActionItem {
  key?: string | number
  icon?: React.ReactNode
  title?: string
  ariaLabel?: string
  onClick?: (e?: any) => void
  disabled?: boolean
  variant?: AdminActionVariant
  className?: string
  style?: React.CSSProperties
  show?: boolean
}

export interface AdminRowActionsProps {
  // Action Handlers
  onView?: (e?: any) => void
  onEdit?: (e?: any) => void
  onInvoice?: (e?: any) => void
  onPrint?: (e?: any) => void
  onCopy?: (e?: any) => void
  onDelete?: (e?: any) => void

  // Permission Flags
  canView?: boolean
  canEdit?: boolean
  canInvoice?: boolean
  canPrint?: boolean
  canCopy?: boolean
  canDelete?: boolean

  // Tooltitles and Labels
  viewTitle?: string
  editTitle?: string
  invoiceTitle?: string
  printTitle?: string
  copyTitle?: string
  deleteTitle?: string

  // Custom Icons
  viewIcon?: React.ReactNode
  editIcon?: React.ReactNode
  invoiceIcon?: React.ReactNode
  printIcon?: React.ReactNode
  copyIcon?: React.ReactNode
  deleteIcon?: React.ReactNode

  // Delete status
  deleteDisabled?: boolean
  deleteDisabledReason?: string

  // Extra Custom Action Items
  extraActions?: ExtraActionItem[]

  // Layout & Sizing
  size?: AdminActionSize
  align?: 'end' | 'start' | 'center'
  gap?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  stopPropagation?: boolean
}

/**
 * AdminRowActions
 *
 * Global standardized row actions component cloned from TheManStore design.
 * Provides consistent View, Edit, Invoice, Print, Delete, and custom action buttons.
 */
export const AdminRowActions: React.FC<AdminRowActionsProps> = ({
  onView,
  onEdit,
  onInvoice,
  onPrint,
  onCopy,
  onDelete,

  canView = true,
  canEdit = true,
  canInvoice = true,
  canPrint = true,
  canCopy = true,
  canDelete = true,

  viewTitle,
  editTitle,
  invoiceTitle,
  printTitle,
  copyTitle,
  deleteTitle,

  viewIcon,
  editIcon,
  invoiceIcon,
  printIcon,
  copyIcon,
  deleteIcon,

  deleteDisabled = false,
  deleteDisabledReason,

  extraActions = [],

  size = 'sm',
  align = 'end',
  gap = 'gap-1.5',
  className = '',
  style = {},
  children,
  stopPropagation = false,
  ...props
}) => {
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.sm
  const { t } = useTranslation(['common', 'orders', 'sales'])

  const resolvedViewTitle = viewTitle || t('common:view', 'View')
  const resolvedEditTitle = editTitle || t('common:edit', 'Edit')
  const resolvedInvoiceTitle = invoiceTitle || t('orders:invoice', 'Invoice / Receipt')
  const resolvedPrintTitle = printTitle || t('common:print', 'Print')
  const resolvedCopyTitle = copyTitle || t('common:copy', 'Duplicate')
  const resolvedDeleteTitle = deleteTitle || t('common:delete', 'Delete')

  const alignClass =
    align === 'start'
      ? 'justify-start'
      : align === 'center'
      ? 'justify-center'
      : 'justify-end'

  const handleContainerClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation()
    }
  }

  return (
    <div
      onClick={handleContainerClick}
      style={style}
      className={cn('flex items-center', alignClass, gap, className)}
      {...props}
    >
      {/* 1. View Action */}
      {onView && canView ? (
        <AdminActionButton
          onClick={onView}
          title={resolvedViewTitle}
          size={size}
          icon={viewIcon || <Eye size={sizeConfig.iconSize} className="stroke-[1.8]" />}
        />
      ) : null}

      {/* 2. Edit Action */}
      {onEdit && canEdit ? (
        <AdminActionButton
          onClick={onEdit}
          title={resolvedEditTitle}
          size={size}
          icon={editIcon || <Pencil size={sizeConfig.iconSize} className="stroke-[1.8]" />}
        />
      ) : null}

      {/* 3. Invoice Action (FileText) */}
      {onInvoice && canInvoice ? (
        <AdminActionButton
          onClick={onInvoice}
          title={resolvedInvoiceTitle}
          size={size}
          icon={invoiceIcon || <FileText size={sizeConfig.iconSize} className="stroke-[1.8]" />}
        />
      ) : null}

      {/* 4. Print Action */}
      {onPrint && canPrint ? (
        <AdminActionButton
          onClick={onPrint}
          title={resolvedPrintTitle}
          size={size}
          icon={printIcon || <Printer size={sizeConfig.iconSize} className="stroke-[1.8]" />}
        />
      ) : null}

      {/* 5. Copy / Duplicate Action */}
      {onCopy && canCopy ? (
        <AdminActionButton
          onClick={onCopy}
          title={resolvedCopyTitle}
          size={size}
          icon={copyIcon || <Copy size={sizeConfig.iconSize} className="stroke-[1.8]" />}
        />
      ) : null}

      {/* 6. Extra Custom Actions */}
      {Array.isArray(extraActions) &&
        extraActions.map((act, index) => {
          if (act.show === false) return null
          return (
            <AdminActionButton
              key={act.key || index}
              onClick={act.onClick}
              title={act.title}
              ariaLabel={act.ariaLabel}
              disabled={act.disabled}
              variant={act.variant || 'default'}
              size={size}
              icon={act.icon}
              className={act.className}
              style={act.style}
            />
          )
        })}

      {/* 7. Children for inline custom buttons */}
      {children}

      {/* 8. Delete Action */}
      {onDelete && canDelete ? (
        <AdminDeleteButton
          onClick={onDelete}
          title={deleteDisabled && deleteDisabledReason ? deleteDisabledReason : resolvedDeleteTitle}
          ariaLabel={resolvedDeleteTitle}
          disabled={deleteDisabled}
          size={size}
          icon={deleteIcon || <Trash2 size={sizeConfig.iconSize} className="stroke-[1.8]" />}
        />
      ) : null}
    </div>
  )
}

export default AdminRowActions