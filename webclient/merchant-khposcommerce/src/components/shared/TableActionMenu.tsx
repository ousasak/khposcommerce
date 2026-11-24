import React from 'react'
import { MoreVertical, Pencil, Trash2, Eye, Printer, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type TableActionVariant =
  | 'default'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'print'
  | 'primary'
  | 'edit'

export type TableActionEditColor = 'slate' | 'blue' | 'amber' | 'teal' | 'indigo' | 'emerald'

export interface TableActionItem {
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode
  onClick: () => void
  variant?: TableActionVariant
  disabled?: boolean
  hidden?: boolean
  className?: string
}

export interface TableActionMenuProps {
  items?: TableActionItem[]
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onPrint?: () => void
  editLabel?: string
  deleteLabel?: string
  viewLabel?: string
  printLabel?: string
  align?: 'right' | 'left'
  className?: string
  triggerSize?: number
  /**
   * Presentation variant:
   * - 'dropdown': 3-dots popup menu (default, best for 4+ actions like Products)
   * - 'inline': Direct square icon buttons side-by-side (best for 1-3 actions like Sales/Orders)
   * - 'hybrid': Shows top N actions inline, remaining actions in a 3-dots dropdown
   */
  variant?: 'dropdown' | 'inline' | 'hybrid'
  /** Max items shown inline when using 'hybrid' variant (default: 2) */
  maxInline?: number
  /** Button sizing for inline mode (default: 'md') */
  buttonSize?: 'sm' | 'md'
  /** Custom accent color for edit action button (default: 'blue') */
  editColor?: TableActionEditColor
  /** Force dropdown menu even if only 1 action exists (default: false) */
  forceDropdown?: boolean
}

export const TableActionMenu: React.FC<TableActionMenuProps> = ({
  items,
  onEdit,
  onDelete,
  onView,
  onPrint,
  editLabel,
  deleteLabel,
  viewLabel,
  printLabel,
  align = 'right',
  className = '',
  triggerSize = 16,
  variant = 'hybrid',
  maxInline = 2,
  buttonSize = 'sm',
  editColor = 'slate',
  forceDropdown = false,
}) => {
  const { t } = useTranslation(['common', 'buttons', 'inventory', 'purchases'])

  const getViewText = () => {
    if (viewLabel) return viewLabel
    const val = t('view', '')
    if (val && val !== 'view' && val !== 'common.view') return val
    const valCommon = t('common.view', '')
    if (valCommon && valCommon !== 'common.view' && valCommon !== 'view') return valCommon
    return 'View'
  }

  const getPrintText = () => {
    if (printLabel) return printLabel
    const val = t('print', '')
    if (val && val !== 'print' && val !== 'common.print') return val
    const valCommon = t('common.print', '')
    if (valCommon && valCommon !== 'common.print' && valCommon !== 'print') return valCommon
    return 'Print'
  }

  const getEditText = () => {
    if (editLabel) return editLabel
    const val = t('edit', '')
    if (val && val !== 'edit' && val !== 'common.edit') return val
    const valCommon = t('common.edit', '')
    if (valCommon && valCommon !== 'common.edit' && valCommon !== 'edit') return valCommon
    return 'Edit'
  }

  const getDeleteText = () => {
    if (deleteLabel) return deleteLabel
    const val = t('delete', '')
    if (val && val !== 'delete' && val !== 'common.delete') return val
    const valCommon = t('common.delete', '')
    if (valCommon && valCommon !== 'common.delete' && valCommon !== 'delete') return valCommon
    return 'Delete'
  }

  const resolvedEditLabel = getEditText()
  const resolvedDeleteLabel = getDeleteText()
  const resolvedViewLabel = getViewText()
  const resolvedPrintLabel = getPrintText()

  // Build items array if custom list not passed directly or merge quick props
  const finalItems: TableActionItem[] = [...(items || [])]

  if (onView && !finalItems.some((i) => i.label === resolvedViewLabel)) {
    finalItems.unshift({
      label: resolvedViewLabel,
      icon: Eye,
      onClick: onView,
      variant: 'default',
    })
  }

  if (onEdit && !finalItems.some((i) => i.label === resolvedEditLabel)) {
    const viewIdx = finalItems.findIndex((i) => i.label === resolvedViewLabel)
    const insertIdx = viewIdx >= 0 ? viewIdx + 1 : 0
    finalItems.splice(insertIdx, 0, {
      label: resolvedEditLabel,
      icon: Pencil,
      onClick: onEdit,
      variant: 'edit',
    })
  }

  if (onPrint && !finalItems.some((i) => i.label === resolvedPrintLabel)) {
    const editIdx = finalItems.findIndex((i) => i.label === resolvedEditLabel)
    const insertIdx = editIdx >= 0 ? editIdx + 1 : finalItems.length
    finalItems.splice(insertIdx, 0, {
      label: resolvedPrintLabel,
      icon: Printer,
      onClick: onPrint,
      variant: 'default',
    })
  }

  if (onDelete && !finalItems.some((i) => i.label === resolvedDeleteLabel)) {
    finalItems.push({
      label: resolvedDeleteLabel,
      icon: Trash2,
      onClick: onDelete,
      variant: 'danger',
    })
  }

  // Auto standardize edit icon to Pencil and edit variant (Harmonized with Product table)
  finalItems.forEach((item) => {
    if (
      item.variant === 'edit' ||
      /edit|update|modify|កែប្រែ|កែ/i.test(item.label)
    ) {
      if (!item.variant) item.variant = 'edit'
      if (!React.isValidElement(item.icon)) {
        item.icon = Pencil
      }
    }
  })

  const resolveItemVariant = (item: TableActionItem): TableActionVariant => {
    if (item.variant && item.variant !== 'default') {
      return item.variant
    }
    // Auto-detect dangerous/delete actions
    if (item.icon === Trash2 || /delete|remove|លុប/i.test(item.label)) return 'danger'
    // Auto-detect edit/modify actions
    if (item.icon === Pencil || (item.icon as any) === 'Pencil' || /edit|update|modify|កែប្រែ|កែ/i.test(item.label)) return 'edit'
    return 'default'
  }

  const visibleItems = finalItems.filter((item) => !item.hidden)

  if (visibleItems.length === 0) return null

  // Render an individual inline icon button
  const renderInlineButton = (item: TableActionItem, idx: number) => {
    const Icon = item.icon as any
    const itemVariant = resolveItemVariant(item)
    const isDanger = itemVariant === 'danger'
    const isWarning = itemVariant === 'warning'
    const isSuccess = itemVariant === 'success'
    const isView = item.icon === Eye || /view|detail|មើល/i.test(item.label)

    const editColorClasses: Record<TableActionEditColor, string> = {
      slate:
        'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs',
      blue:
        'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 shadow-2xs',
      amber:
        'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 shadow-2xs',
      teal:
        'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:border-teal-300 dark:hover:border-teal-800 hover:bg-teal-50/60 dark:hover:bg-teal-950/20 shadow-2xs',
      indigo:
        'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 shadow-2xs',
      emerald:
        'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 shadow-2xs',
    }

    // TheManStore cloned styling: clean white card action button with soft drop shadow
    let colorClasses =
      'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs'

    if (isDanger) {
      colorClasses =
        'border border-rose-200 dark:border-rose-300/50 bg-white dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:border-rose-300 dark:hover:border-rose-300 shadow-2xs'
    } else if (itemVariant === 'edit') {
      colorClasses = editColorClasses[editColor] || editColorClasses.slate
    } else if (isWarning) {
      colorClasses =
        'border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50/50 shadow-2xs'
    } else if (isSuccess) {
      colorClasses =
        'border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-2xs'
    } else if (isView) {
      colorClasses =
        'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs'
    } else if (itemVariant === 'primary' || itemVariant === 'info') {
      colorClasses =
        'border border-amber-500 dark:border-amber-600 bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
    }

    const sizeClasses =
      buttonSize === 'sm'
        ? 'h-8 w-8 min-w-[32px] min-h-[32px] rounded-lg'
        : 'h-8.5 w-8.5 min-w-[34px] min-h-[34px] rounded-lg'
    const iconDimension = buttonSize === 'sm' ? 15 : 16

    return (
      <button
        key={idx}
        type="button"
        disabled={item.disabled}
        title={item.label}
        aria-label={item.label}
        onClick={(e) => {
          e.stopPropagation()
          item.onClick()
        }}
        className={cn(
          'inline-flex items-center justify-center border font-medium cursor-pointer select-none transition-all duration-150',
          // SmartHR soft drop shadow
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-2xs',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none',
          sizeClasses,
          colorClasses,
          item.className
        )}
      >
        {React.isValidElement(item.icon) ? (
          item.icon
        ) : itemVariant === 'edit' ? (
          <Pencil size={iconDimension} className="shrink-0 stroke-[1.8]" />
        ) : Icon ? (
          <Icon size={iconDimension} className="shrink-0 stroke-[1.8]" />
        ) : null}
      </button>
    )
  }

  // MODE 1: INLINE (Clean icon buttons in a row)
  // If more than maxInline items exist (e.g. 3, 4, 5), gracefully switch to hybrid so extra actions collapse into '...'
  if (variant === 'inline' && visibleItems.length <= maxInline) {
    return (
      <div
        className={cn('inline-flex items-center justify-end gap-1.5', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {visibleItems.map((item, idx) => renderInlineButton(item, idx))}
      </div>
    )
  }

  // AUTO-INLINE SINGLE ACTION:
  // When a table row only has 1 visible action (e.g. only View, or only Edit/Print),
  // directly show that action button rather than requiring the user to click
  // a redundant 3-dots '...' menu just to trigger a single action!
  if (visibleItems.length === 1 && !forceDropdown) {
    return (
      <div
        className={cn('inline-flex items-center justify-end gap-1.5', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {renderInlineButton(visibleItems[0], 0)}
      </div>
    )
  }

  // MODE 2 & 3: DROPDOWN OR HYBRID
  const inlineItems = variant === 'hybrid' ? visibleItems.slice(0, maxInline) : []
  const dropdownItems = variant === 'hybrid' ? visibleItems.slice(maxInline) : visibleItems

  return (
    <div
      className={cn('inline-flex items-center justify-end gap-1.5 text-left', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* If hybrid, render the primary items directly inline */}
      {inlineItems.map((item, idx) => renderInlineButton(item, idx))}

      {/* Render 3-dots trigger button via shadcn DropdownMenu */}
      {dropdownItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-8 w-8 min-w-[32px] min-h-[32px] rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 active:scale-95"
              aria-label="Actions menu"
              title={t('common.actions', 'More Actions')}
            >
              <MoreVertical size={triggerSize} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={align === 'left' ? 'start' : 'end'}
            className="w-48 p-1.5 space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {dropdownItems.map((item, idx) => {
              const Icon = item.icon as any
              const itemVariant = resolveItemVariant(item)
              const isDanger = itemVariant === 'danger'

              return (
                <DropdownMenuItem
                  key={idx}
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    item.onClick()
                  }}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-semibold cursor-pointer rounded-lg',
                    isDanger && 'text-destructive focus:bg-destructive/10 focus:text-destructive',
                    itemVariant === 'edit' && 'text-blue-600 dark:text-blue-400 focus:bg-blue-500/10 focus:text-blue-600',
                    itemVariant === 'success' && 'text-emerald-600 dark:text-emerald-400 focus:bg-emerald-500/10',
                    itemVariant === 'warning' && 'text-amber-600 dark:text-amber-400 focus:bg-amber-500/10',
                    (itemVariant === 'primary' || itemVariant === 'info') && 'text-primary focus:bg-primary/10'
                  )}
                >
                  {React.isValidElement(item.icon) ? (
                    item.icon
                  ) : itemVariant === 'edit' ? (
                    <Pencil size={14} className="shrink-0" />
                  ) : Icon ? (
                    <Icon size={14} className="shrink-0" />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export default TableActionMenu
