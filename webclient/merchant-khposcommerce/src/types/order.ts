/**
 * Core Order & POS Entity Types
 * Enterprise Data Contract for Orders, Order Items, Fulfillment, and Billing.
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | string

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded' | string

export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled' | string

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  sku?: string
  quantity: number
  unit_price: number
  price?: number
  discount_amount?: number
  tax_amount?: number
  total?: number
  subtotal?: number
  product_image?: string
  image?: string
  variant?: {
    id: number
    name?: string
    sku?: string
    color?: string
    size?: string
    price?: number
  }
  product?: {
    id?: number
    name?: string
    image?: string
    primary_image?: string
    category?: { name?: string }
  }
  [key: string]: any
}

export interface OrderCustomer {
  id?: number
  name?: string
  phone?: string
  email?: string
  avatar?: string
  photo?: string
  group?: { name?: string; discount_percent?: number }
}

export interface OrderFinancialSummary {
  subtotal: number
  discount_total: number
  tax_total: number
  shipping_total: number
  grand_total: number
  paid_total: number
  due_total: number
}

export interface Order {
  id: number
  order_number: string
  customer?: OrderCustomer | any
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_province?: string
  shipping_postal_code?: string
  carrier?: string
  courier?: string
  tracking_number?: string
  tracking_code?: string
  shipping_method?: any
  shippingMethod?: any
  shipment?: any
  payments?: any[]
  payment_method?: string
  payment_status?: PaymentStatus
  fulfillment_status?: FulfillmentStatus
  status?: OrderStatus
  subtotal?: number
  grand_total?: number
  total_amount?: number
  discount_amount?: number
  tax_amount?: number
  shipping_cost?: number
  shipping_fee?: number
  notes?: string
  created_at: string
  updated_at?: string
  items?: OrderItem[]
  order_items?: OrderItem[]
  details?: OrderItem[]
  [key: string]: any
}
