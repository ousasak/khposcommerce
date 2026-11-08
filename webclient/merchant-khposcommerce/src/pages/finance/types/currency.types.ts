export type RateSource = 'system' | 'manual' | 'nbc' | 'api'

export interface CurrencyForm {
  name: string
  code: string
  symbol: string
  exchange_rate: string
  is_active: boolean
  is_default: boolean
  country?: string
  rate_source?: RateSource
  decimal_precision?: number
}

export interface CurrencyItem {
  id: number
  name: string
  code: string
  symbol: string
  exchange_rate: number | string
  is_active: boolean
  is_default: boolean
  country?: string
  rate_source?: RateSource
  decimal_precision?: number
  created_at?: string
  updated_at?: string
}
