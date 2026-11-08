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
  variants?: any[]
  short_description?: string
  track_inventory: boolean
  low_stock_threshold: number
  status: string
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
  images?: Array<{ id?: number; url?: string; image?: string; thumb_url?: string; is_primary?: boolean }> | null
  category?: { id: number; name: string } | null
  brand?: { id: number; name: string } | null
  unit?: { id: number; name: string; symbol?: string } | null
  tax?: { id: number; name: string; rate?: number } | null
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
