import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Check, X, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterButton } from './GlobalActionButtons'
import { sound } from '@/utils/sound'

export interface FilterPopoverProps {
  /** Optional custom trigger node. If omitted, default FilterButton is used. */
  trigger?: React.ReactNode
  /** Label for the filter button (defaults to "Filters") */
  label?: string
  /** Title inside popover header */
  title?: string
  /** Active filter count */
  activeCount?: number
  /** Whether any filter is active */
  isActive?: boolean
  /** Child filter form fields */
  children: React.ReactNode
  /** Callback when Apply is clicked */
  onApply?: () => void
  /** Callback when Reset is clicked */
  onReset?: () => void
  /** Label for Apply button */
  applyLabel?: string
  /** Label for Reset button */
  resetLabel?: string
  /** Custom popover width class (defaults to 'w-80 sm:w-96') */
  popoverWidthClass?: string
  /** Popover alignment relative to trigger ('left' | 'right') */
  align?: 'left' | 'right'
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Root className */
  className?: string
}

/**
 * FilterPopover Component
 * Replaces heavy, screen-blocking Filter Drawers with an elegant,
 * compact floating filter panel anchored directly to the toolbar.
 */
export const FilterPopover: React.FC<FilterPopoverProps> = ({
  trigger,
  label,
  title,
  activeCount = 0,
  isActive = false,
  children,
  onApply,
  onReset,
  applyLabel,
  resetLabel,
  popoverWidthClass = 'w-80 sm:w-[340px]',
  align = 'left',
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const { t } = useTranslation(['common', 'buttons'])
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const hasActive = isActive || activeCount > 0

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Close on Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (disabled) return
    sound.playClick()
    setIsOpen(!isOpen)
  }

  const handleApply = () => {
    sound.playClick()
    onApply?.()
    setIsOpen(false)
  }

  const handleReset = () => {
    sound.playClick()
    onReset?.()
  }

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`} ref={popoverRef}>
      {/* ── Trigger Button ── */}
      {trigger ? (
        <div onClick={handleToggle} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <FilterButton
          onClick={handleToggle}
          isActive={hasActive}
          activeCount={activeCount}
          label={label || t('common.filter', 'Filter')}
          disabled={disabled}
          size={size}
        />
      )}

      {/* ── Floating Popover Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-full mt-2 ${
              align === 'right' ? 'right-0' : 'left-0'
            } z-50 ${popoverWidthClass} rounded-xl border border-slate-200 dark:border-slate-800 bg-card dark:bg-slate-900 shadow-xl overflow-hidden flex flex-col max-h-[85vh]`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-teal-600 dark:text-teal-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-slate-200">
                  {title || t('common.moreFilters', 'More Filters')}
                </h4>
                {activeCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-teal-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
                title={t('common.close', 'Close')}
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Content (Form Fields) */}
            <div className="p-4 space-y-3.5 overflow-y-auto max-h-[60vh] text-left">
              {children}
            </div>

            {/* Footer with Reset & Apply */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>{resetLabel || t('common.reset', 'Reset')}</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>{applyLabel || t('common.apply', 'Apply')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FilterPopover

