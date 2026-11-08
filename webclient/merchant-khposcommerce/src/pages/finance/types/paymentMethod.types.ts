export interface PaymentMethodForm {
  name: string
  code: string
  type: string
  fee_percent: string
  fee_fixed: string
  available_pos: boolean
  available_online: boolean
  is_active: boolean
  description?: string
  logo?: string
  config?: Record<string, any>
}

export interface PaymentMethodItem {
  id: number
  name: string
  code: string
  type: string
  fee_percent: number | string
  fee_fixed: number | string
  available_pos: boolean
  available_online: boolean
  is_active: boolean
  description?: string
  logo?: string
  config?: Record<string, any>
  created_at?: string
  updated_at?: string
}
