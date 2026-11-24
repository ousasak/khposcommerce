/**
 * Core Purchase & Procurement Entity Types
 * Enterprise Data Contract for Purchases, Items, and Suppliers.
 */

export interface Supplier {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  contact_person?: string
  tax_number?: string
  is_active?: boolean
}

export interface PurchaseItem {
  id: number
  product_id: number
  product_name: string | null
  product_variant_id?: number | null
  sku: string | null
  quantity: number
  quantity_received: number
  unit_cost: number
  discount_percent: number
  discount_amount: number
  tax_percent: number
  tax_amount: number
  subtotal: number
  total: number
  currency_code?: string
  exchange_rate?: number
  unit_cost_base?: number
  subtotal_base?: number
  total_base?: number
  already_returned?: number
  notes?: string | null
  product?: {
    id: number
    name: string
    sku: string | null
    primary_image?: any
    image?: any
    images?: any[]
    category?: { id: number; name: string }
  } | null
  variant?: { id: number; name: string; sku: string | null; image?: any } | null
  primary_image?: any
  image?: any
  product_image?: any
}

export interface Purchase {
  id: number
  reference_number: string
  supplier?: Supplier
  warehouse?: { id: number; name: string }
  branch?: { id: number; name: string }
  creator?: { id: number; name: string }
  date: string
  due_date?: string
  status: string
  payment_status: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_cost: number
  grand_total: number
  paid_amount: number
  due_amount: number
  subtotal_base?: number
  tax_amount_base?: number
  discount_amount_base?: number
  shipping_cost_base?: number
  grand_total_base?: number
  paid_amount_base?: number
  due_amount_base?: number
  currency_code: string
  exchange_rate: number
  notes?: string
  created_at: string
  items_count?: number
  items?: PurchaseItem[]
}
