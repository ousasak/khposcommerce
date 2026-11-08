import React from 'react'
import { ToggleSwitch, type ToggleSwitchProps } from '@/components/common'

export interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  activeColor?: ToggleSwitchProps['activeColor']
  className?: string
  'aria-label'?: string
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  loading = false,
  size = 'md',
  activeColor = 'emerald',
  className = '',
  'aria-label': ariaLabel,
}) => {
  return (
    <ToggleSwitch
      checked={checked}
      onChange={(newChecked) => onCheckedChange?.(newChecked)}
      disabled={disabled}
      loading={loading}
      size={size}
      activeColor={activeColor}
      className={className}
    />
  )
}

export default Switch
