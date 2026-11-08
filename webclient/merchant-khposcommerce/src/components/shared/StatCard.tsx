import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus, Package, type LucideIcon } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { cn } from '@/lib/utils'

export type StatCardVariant =
  | 'default'
  | 'primary'
  | 'emerald'
  | 'green'
  | 'rose'
  | 'red'
  | 'danger'
  | 'amber'
  | 'yellow'
  | 'warning'
  | 'purple'
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'sky'
  | 'cyan'
  | 'slate'
  | 'gray'

export interface StatCardProps {
  title: string
  value: number | string
  prefix?: string
  suffix?: string
  decimals?: number
  useCounter?: boolean
  description?: string
  change?: {
    value: number | string
    trend?: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number }> | React.ReactNode
  iconClassName?: string
  iconContainerClassName?: string
  variant?: StatCardVariant
  className?: string
  valueClassName?: string
  onClick?: () => void
  loading?: boolean
  rightAction?: React.ReactNode
  isActive?: boolean
}

interface VariantTheme {
  borderLeft: string
  iconBox: string
  activeRing: string
  activeBg: string
}

const VARIANT_THEMES: Record<string, VariantTheme> = {
  // Red / Rose / Danger
  rose: {
    borderLeft: 'border-l-4 border-l-rose-500',
    iconBox: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400',
    activeRing: 'ring-2 ring-rose-500/50',
    activeBg: 'bg-rose-50/20 dark:bg-rose-950/10',
  },
  red: {
    borderLeft: 'border-l-4 border-l-red-500',
    iconBox: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400',
    activeRing: 'ring-2 ring-red-500/50',
    activeBg: 'bg-red-50/20 dark:bg-red-950/10',
  },
  danger: {
    borderLeft: 'border-l-4 border-l-rose-500',
    iconBox: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400',
    activeRing: 'ring-2 ring-rose-500/50',
    activeBg: 'bg-rose-50/20 dark:bg-rose-950/10',
  },

  // Amber / Yellow / Warning
  amber: {
    borderLeft: 'border-l-4 border-l-amber-500',
    iconBox: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400',
    activeRing: 'ring-2 ring-amber-500/50',
    activeBg: 'bg-amber-50/20 dark:bg-amber-950/10',
  },
  yellow: {
    borderLeft: 'border-l-4 border-l-amber-500',
    iconBox: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400',
    activeRing: 'ring-2 ring-amber-500/50',
    activeBg: 'bg-amber-50/20 dark:bg-amber-950/10',
  },
  warning: {
    borderLeft: 'border-l-4 border-l-amber-500',
    iconBox: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400',
    activeRing: 'ring-2 ring-amber-500/50',
    activeBg: 'bg-amber-50/20 dark:bg-amber-950/10',
  },

  // Emerald / Green / Success
  emerald: {
    borderLeft: 'border-l-4 border-l-emerald-500',
    iconBox: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400',
    activeRing: 'ring-2 ring-emerald-500/50',
    activeBg: 'bg-emerald-50/20 dark:bg-emerald-950/10',
  },
  green: {
    borderLeft: 'border-l-4 border-l-emerald-500',
    iconBox: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400',
    activeRing: 'ring-2 ring-emerald-500/50',
    activeBg: 'bg-emerald-50/20 dark:bg-emerald-950/10',
  },

  // Blue / Sky / Cyan
  blue: {
    borderLeft: 'border-l-4 border-l-blue-500',
    iconBox: 'bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400',
    activeRing: 'ring-2 ring-blue-500/50',
    activeBg: 'bg-blue-50/20 dark:bg-blue-950/10',
  },
  sky: {
    borderLeft: 'border-l-4 border-l-sky-500',
    iconBox: 'bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400',
    activeRing: 'ring-2 ring-sky-500/50',
    activeBg: 'bg-sky-50/20 dark:bg-sky-950/10',
  },
  cyan: {
    borderLeft: 'border-l-4 border-l-cyan-500',
    iconBox: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 dark:text-cyan-400',
    activeRing: 'ring-2 ring-cyan-500/50',
    activeBg: 'bg-cyan-50/20 dark:bg-cyan-950/10',
  },

  // Purple / Violet / Indigo
  purple: {
    borderLeft: 'border-l-4 border-l-purple-500',
    iconBox: 'bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400',
    activeRing: 'ring-2 ring-purple-500/50',
    activeBg: 'bg-purple-50/20 dark:bg-purple-950/10',
  },
  violet: {
    borderLeft: 'border-l-4 border-l-purple-500',
    iconBox: 'bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400',
    activeRing: 'ring-2 ring-purple-500/50',
    activeBg: 'bg-purple-50/20 dark:bg-purple-950/10',
  },
  indigo: {
    borderLeft: 'border-l-4 border-l-indigo-500',
    iconBox: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400',
    activeRing: 'ring-2 ring-indigo-500/50',
    activeBg: 'bg-indigo-50/20 dark:bg-indigo-950/10',
  },

  // Primary Theme
  primary: {
    borderLeft: 'border-l-4 border-l-primary',
    iconBox: 'bg-primary/10 text-primary',
    activeRing: 'ring-2 ring-primary/50',
    activeBg: 'bg-primary/5',
  },

  // Default / Slate / Gray
  default: {
    borderLeft: 'border-l-4 border-l-slate-400 dark:border-l-slate-600',
    iconBox: 'bg-muted text-muted-foreground',
    activeRing: 'ring-2 ring-muted/50',
    activeBg: 'bg-muted/10',
  },
  slate: {
    borderLeft: 'border-l-4 border-l-slate-400 dark:border-l-slate-600',
    iconBox: 'bg-muted text-muted-foreground',
    activeRing: 'ring-2 ring-muted/50',
    activeBg: 'bg-muted/10',
  },
  gray: {
    borderLeft: 'border-l-4 border-l-gray-400 dark:border-l-gray-600',
    iconBox: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    activeRing: 'ring-2 ring-gray-400/50',
    activeBg: 'bg-gray-50/50 dark:bg-gray-900/50',
  },
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  useCounter = true,
  description,
  change,
  icon: Icon,
  iconClassName = '',
  iconContainerClassName = '',
  variant = 'default',
  className = '',
  valueClassName = '',
  onClick,
  loading = false,
  rightAction,
  isActive = false,
}) => {
  const isClickable = Boolean(onClick)
  const isNumeric = typeof value === 'number'
  const currentTheme = VARIANT_THEMES[variant] || VARIANT_THEMES.default

  const isUp = change?.trend === 'up'
  const isDown = change?.trend === 'down'

  const renderIcon = () => {
    if (!Icon) {
      return <Package className="w-5 h-5" />
    }
    if (React.isValidElement(Icon)) {
      return Icon
    }
    const IconComponent = Icon as React.ComponentType<{ className?: string; size?: number }>
    return <IconComponent className={cn('w-5 h-5 shrink-0', iconClassName)} size={20} />
  }

  if (loading) {
    return (
      <div
        className={cn(
          'bg-card rounded-2xl shadow-xs p-5 min-h-[96px] flex items-center gap-3.5 border border-border/60 animate-pulse',
          currentTheme.borderLeft,
          className
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-6 bg-muted rounded w-16" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={onClick ? { y: -2, transition: { duration: 0.15 } } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'bg-card dark:bg-slate-900 rounded-2xl shadow-xs p-5 min-h-[96px] flex items-center gap-3.5 border border-border/60 transition-all duration-200 select-none relative',
        currentTheme.borderLeft,
        isClickable && 'cursor-pointer hover:shadow-md active:scale-[0.99]',
        isActive && cn('ring-2 shadow-sm', currentTheme.activeRing, currentTheme.activeBg),
        className
      )}
    >
      {/* Left: Icon Box (Rounded-xl with soft tinted background matching inventory stock alert style) */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
          currentTheme.iconBox,
          iconContainerClassName
        )}
      >
        {renderIcon()}
      </div>

      {/* Right: Metric Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <p className="text-xs text-muted-foreground font-medium truncate">
            {title}
          </p>
          {rightAction && <div className="shrink-0">{rightAction}</div>}
        </div>

        <div className="flex items-baseline gap-2 mt-0.5">
          <div
            className={cn(
              'text-2xl font-bold text-foreground tracking-tight truncate font-sans',
              valueClassName
            )}
          >
            {isNumeric && useCounter ? (
              <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
              />
            ) : (
              <span>
                {prefix}
                {value}
                {suffix}
              </span>
            )}
          </div>

          {/* Change Badge (Trend indicator) */}
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.5 rounded-md font-mono shrink-0',
                isUp && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                isDown && 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                !isUp && !isDown && 'bg-muted text-muted-foreground'
              )}
            >
              {isUp ? (
                <ArrowUpRight className="size-3" />
              ) : isDown ? (
                <ArrowDownRight className="size-3" />
              ) : (
                <Minus className="size-3" />
              )}
              {change.value}
              {change.label && <span className="ml-0.5 font-sans font-normal opacity-80">{change.label}</span>}
            </span>
          )}
        </div>

        {description && !change && (
          <div className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">
            {description}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard
