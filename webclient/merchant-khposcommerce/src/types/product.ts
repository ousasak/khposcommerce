/**
 * Core Product Entity & Catalog Types
 * Enterprise Data Contract for Products, Variants, Inventory, and Metrics.
 */

export interface ProductCategory {
  id: number
  name: string
  slug?: string
}

export interface ProductBrand {
  id: number
  name: string
  logo?: string
}

export interface ProductUnit {
  id: number
  name: string
  symbol?: string
}

export interface ProductTax {
  id: number
  name: string
  rate?: number
}

export interface ProductImage {
  id?: number
  url?: string
  image?: string
  thumb_url?: string
  is_primary?: boolean
}

export interface ProductVariant {
  id: number
  product_id?: number
  name?: string
  sku: string
  barcode?: string
  selling_price: number
  cost_price?: number
  compare_price?: number
  stock?: number
  attributes?: Array<{ name: string; value: string } | Record<string, any>>
  image?: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  name: string
  slug?: string
  sku: string
  barcode?: string
  category_id?: number | null
  brand_id?: number | null
  unit_id?: number | null
  tax_id?: number | null
  selling_price: number
  cost_price?: number
  compare_price?: number
  weight?: number
  length?: number
  width?: number
  height?: number
  has_variants?: boolean
  variants?: ProductVariant[] | any[]
  short_description?: string
  track_inventory: boolean
  low_stock_threshold: number
  status: 'active' | 'draft' | 'archived' | string
  is_featured: boolean
  is_digital: boolean
  sold_count: number
  rating_avg: number
  rating_count?: number
  view_count?: number
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  description?: string
  primary_image?: string | { image?: string; url?: string } | null
  images?: ProductImage[] | Array<{ id?: number; url?: string; image?: string; thumb_url?: string; is_primary?: boolean }> | null
  category?: ProductCategory | { id: number; name: string } | null
  brand?: ProductBrand | { id: number; name: string } | null
  unit?: ProductUnit | { id: number; name: string; symbol?: string } | null
  tax?: ProductTax | { id: number; name: string; rate?: number } | null
  stock?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ProductAnalytics {
  totalProducts: number
  activeProducts: number
  draftProducts: number
  archivedProducts: number
  totalCatalogValue: number
  avgSellingPrice: number
  totalStockQuantity: number
  lowStockItemsCount: number
  outOfStockItemsCount: number
  featuredCount: number
}
