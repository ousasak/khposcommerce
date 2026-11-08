import React, { useState, useEffect } from 'react'
import { getSupplierLogoUrl } from '@/utils/image'

export interface SupplierLogoProps {
  logo?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  shape?: 'rounded' | 'circle' | 'square'
  className?: string
  alt?: string
}

const SIZE_MAP = {
  xs: 'w-6 h-6 rounded-md text-[10px]',
  sm: 'w-8 h-8 rounded-lg text-xs',
  md: 'w-10 h-10 rounded-xl text-sm',
  lg: 'w-12 h-12 rounded-2xl text-base',
  xl: 'w-16 h-16 rounded-2xl text-lg',
}

// Deterministic colour palette — picks a colour based on first char of name
const AVATAR_COLORS = [
  'bg-teal-500   text-white',
  'bg-indigo-500 text-white',
  'bg-blue-500   text-white',
  'bg-emerald-500 text-white',
  'bg-violet-500 text-white',
  'bg-rose-500   text-white',
  'bg-amber-500  text-white',
  'bg-cyan-500   text-white',
  'bg-pink-500   text-white',
  'bg-orange-500 text-white',
]

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    // Single word — take first 2 chars
    return parts[0].slice(0, 2).toUpperCase()
  }
  // Multi-word — take first char of first two words
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0]
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

export const SupplierLogo: React.FC<SupplierLogoProps> = ({
  logo,
  name = '',
  size = 'md',
  shape = 'rounded',
  className = '',
  alt,
}) => {
  const hasLogo = Boolean(logo)
  const initialUrl = hasLogo ? getSupplierLogoUrl(logo, name) : ''
  const [imgSrc, setImgSrc] = useState<string>(initialUrl)
  const [imgFailed, setImgFailed] = useState(!hasLogo)

  useEffect(() => {
    if (logo) {
      setImgFailed(false)
      setImgSrc(getSupplierLogoUrl(logo, name))
    } else {
      setImgFailed(true)
      setImgSrc('')
    }
  }, [logo, name])

  const handleError = () => {
    setImgFailed(true)
  }

  const isNumeric = typeof size === 'number'
  const sizeClasses = isNumeric ? '' : SIZE_MAP[size] || SIZE_MAP.md
  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-none' : ''
  const styleObj: React.CSSProperties = isNumeric
    ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }
    : {}

  const baseClass = `relative shrink-0 overflow-hidden border border-border/60 shadow-xs flex items-center justify-center select-none transition-transform duration-200 group-hover:scale-105 ${sizeClasses} ${shapeClass} ${className}`

  // ── Initials Fallback ───────────────────────────────────────────────────────
  if (imgFailed || !imgSrc) {
    const initials   = getInitials(name)
    const colorClass = getAvatarColor(name)
    return (
      <div
        style={styleObj}
        className={`${baseClass} ${colorClass} font-bold tracking-tight leading-none`}
        title={name || 'Supplier'}
        aria-label={alt || name || 'Supplier'}
      >
        {initials}
      </div>
    )
  }

  // ── Logo Image ──────────────────────────────────────────────────────────────
  return (
    <div
      style={styleObj}
      className={`${baseClass} bg-white dark:bg-slate-900 p-0.5`}
    >
      <img
        src={imgSrc}
        alt={alt || name || 'Supplier Logo'}
        onError={handleError}
        className="w-full h-full object-contain rounded-[inherit]"
        loading="lazy"
      />
    </div>
  )
}

export default SupplierLogo
