import React from 'react'
import { X, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sound } from '@/utils/sound'

export interface ActiveFilterItem {
  key: string
  label: string
  value: string | number
  displayValue?: string
  icon?: React.ReactNode
  onRemove: () => void
}

export interface ActiveFilterChipsProps {
  items: ActiveFilterItem[]
  onClearAll?: () => void
  clearAllLabel?: string
  title?: string
  className?: string
}

/**
 * ActiveFilterChips Component
 * Displays applied filter criteria as removable badges/chips directly below the toolbar.
 * Enables 1-click removal of individual filters or clearing all filters at once.
 */
export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  items,
  onClearAll,
  clearAllLabel,
  title,
  className = '',
}) => {
  const { t } = useTranslation(['common'])

  const activeItems = items.filter(
    (item) => item.value !== undefined && item.value !== null && String(item.value).trim() !== '' && String(item.value) !== 'all'
  )

  if (activeItems.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 px-1 py-1 text-xs animate-in fade-in duration-200 ${className}`}>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {title || t('common.activeFilters', 'Active Filters')}:
      </span>

      {activeItems.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/60 text-xs font-medium shadow-2xs transition-all"
        >
          {item.icon && <span className="text-teal-600 dark:text-teal-400 shrink-0">{item.icon}</span>}
          <span>
            <strong className="font-semibold text-teal-900 dark:text-teal-100">{item.label}:</strong>{' '}
            {item.displayValue || String(item.value)}
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              item.onRemove()
            }}
            className="hover:bg-teal-200/60 dark:hover:bg-teal-800/60 text-teal-700 dark:text-teal-300 rounded-full p-0.5 transition-colors cursor-pointer"
            title={`${t('common.remove', 'Remove')} ${item.label}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {onClearAll && activeItems.length > 1 && (
        <button
          type="button"
          onClick={() => {
            sound.playClick()
            onClearAll()
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1 cursor-pointer underline underline-offset-2"
        >
          <RotateCcw size={10} />
          <span>{clearAllLabel || t('common.clearAll', 'Clear All')}</span>
        </button>
      )}
    </div>
  )
}

export default ActiveFilterChips

