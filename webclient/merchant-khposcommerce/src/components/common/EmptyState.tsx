import React from 'react'
import { Inbox, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'

// ─── Re-export primitives so both @/components/ui/empty & @/components/common work ────
export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>
}

export interface EmptyStateProps {
  /**
   * Number of columns when rendered inside a <tbody> (generates <tr><td colSpan={cols}>).
   * If omitted or undefined, renders as a standard <div> block container.
   */
  cols?: number

  /** Primary title. Supports string or custom ReactNode. */
  title?: React.ReactNode

  /** Legacy / alternate prop for title (for backward compatibility with existing usages). */
  message?: React.ReactNode

  /**
   * Secondary guidance or descriptive text (e.g. "Create a new record or adjust filter criteria").
   * Supports string or custom ReactNode.
   */
  description?: React.ReactNode

  /**
   * Custom icon element or Lucide component. Defaults to a clean, subtle stroke-1 icon.
   */
  icon?: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>

  /** Optional action button or custom action node */
  action?: EmptyStateAction | React.ReactNode

  /** Convenience prop for action button label */
  actionLabel?: string

  /** Convenience prop for action button click handler */
  onAction?: () => void

  /** Optional icon for action button */
  actionIcon?: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>

  /** Optional extra container class name */
  className?: string

  /** Vertical padding class (default: 'py-12') */
  py?: string

  /** Visual container variant: 'subtle' for tables/transparent, 'default' for dashed box, 'card' for bordered card */
  variant?: 'default' | 'subtle' | 'card' | 'outline'

  /** Optional extra child content */
  children?: React.ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

export const EmptyState: React.FC<EmptyStateProps> = ({
  cols,
  title,
  message,
  description,
  icon,
  action,
  actionLabel,
  onAction,
  actionIcon,
  className,
  py = 'py-12',
  variant,
  children,
}) => {
  const { t } = useTranslation(['empty', 'common'])

  // Resolve title
  const resolvedTitle =
    title ??
    message ??
    t('empty.noData', t('common.noData', 'No data found'))

  // Resolve description
  const resolvedDesc =
    description !== undefined
      ? description
      : title === undefined && message === undefined
        ? t('empty.noDataDesc', t('common.noDataDesc', 'There are no records to display, or adjust your search and filters.'))
        : t('empty.noRecordDesc', t('common.noRecordsDesc', 'Create a new record or adjust filter criteria to get started.'))

  // Resolve icon safely (handling React elements, forwardRef components, functions, strings)
  let renderedIcon: React.ReactNode = null
  if (React.isValidElement(icon)) {
    renderedIcon = icon
  } else if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && ('$$typeof' in icon || 'render' in icon))
  ) {
    const IconComp = icon as React.ComponentType<{ size?: number; className?: string }>
    renderedIcon = <IconComp size={24} className="stroke-1.5" />
  } else if (typeof icon === 'string') {
    renderedIcon = <span className="text-2xl">{icon}</span>
  } else if (icon) {
    renderedIcon = icon as React.ReactNode
  } else {
    renderedIcon = <Inbox size={24} className="stroke-1.5" />
  }

  // Resolve action button
  const resolvedAction = action ?? (
    actionLabel && onAction
      ? {
          label: actionLabel,
          onClick: onAction,
          icon: actionIcon,
        }
      : undefined
  )

  // Empty container variant: when inside table (cols !== undefined), default to subtle/transparent
  const resolvedVariant = variant ?? (cols !== undefined ? 'subtle' : 'default')

  const content = (
    <Empty variant={resolvedVariant} className={clsx("min-h-[160px] p-4 border-0 bg-transparent", className)}>
      <EmptyHeader>
        {renderedIcon && (
          <EmptyMedia variant="icon">
            {renderedIcon}
          </EmptyMedia>
        )}

        {resolvedTitle && (
          <EmptyTitle>{resolvedTitle}</EmptyTitle>
        )}

        {resolvedDesc && (
          <EmptyDescription>{resolvedDesc}</EmptyDescription>
        )}
      </EmptyHeader>

      {(resolvedAction || children) && (
        <EmptyContent>
          {resolvedAction && (
            React.isValidElement(resolvedAction) ? (
              resolvedAction
            ) : typeof resolvedAction === 'object' && 'label' in resolvedAction && 'onClick' in resolvedAction ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(resolvedAction as EmptyStateAction).onClick}
                className="gap-1.5 font-medium shadow-2xs hover:bg-muted"
              >
                {(() => {
                  const actIcon = (resolvedAction as EmptyStateAction).icon
                  if (React.isValidElement(actIcon)) return actIcon
                  if (typeof actIcon === 'function' || (typeof actIcon === 'object' && actIcon !== null && ('$$typeof' in actIcon || 'render' in actIcon))) {
                    const ActIconComp = actIcon as React.ComponentType<{ size?: number; className?: string }>
                    return <ActIconComp size={14} />
                  }
                  return <Plus size={14} />
                })()}
                <span>{(resolvedAction as EmptyStateAction).label}</span>
              </Button>
            ) : null
          )}
          {children}
        </EmptyContent>
      )}
    </Empty>
  )

  // If cols is specified, render as a <tr><td colSpan={cols}> for table bodies
  if (cols !== undefined) {
    return (
      <tr>
        <td
          colSpan={cols}
          className={clsx(py, 'px-4 text-center text-muted-foreground w-full', className)}
        >
          {content}
        </td>
      </tr>
    )
  }

  // Standalone container mode for cards, lists, grids, or non-table pages
  return (
    <div
      className={clsx(py, 'px-4 text-center text-muted-foreground w-full', className)}
    >
      {content}
    </div>
  )
}

export const TableEmptyState = EmptyState

export default EmptyState
