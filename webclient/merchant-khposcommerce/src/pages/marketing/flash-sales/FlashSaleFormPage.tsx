import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, Trash2, Plus, Check, Loader2, X, Package, SlidersHorizontal } from 'lucide-react'
import { marketingService } from '@/services/marketingService'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { companyService } from '@/services/companyService'
import { financeService } from '@/services/financeService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import {
  FormLayout,
  FormContent,
  FormCard,
  FormHeader,
  FormFooter,
  FormField,
  Input,
  Textarea,
  ToggleSwitch,
  EnterpriseDateTimePicker,
} from '@/components/common'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { formatDateTimeLocal } from '@/utils/formatters'
import { getAbsoluteImageUrl, DEFAULT_PRODUCT_IMAGE, DEFAULT_PRODUCT_DATA_URI } from '@/utils/image'
import type { FlashSale, FlashSaleProductItem, ChannelScope, TimeSlotSession } from './types'

interface ProductItemImageProps {
  src?: string | null
  alt: string
  className?: string
  sizeClass?: string
}

const ProductItemImage: React.FC<ProductItemImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  sizeClass = 'w-9 h-9',
}) => {
  const resolvedUrl = src ? getAbsoluteImageUrl(src) : ''
  const [currentSrc, setCurrentSrc] = useState<string>(resolvedUrl || DEFAULT_PRODUCT_IMAGE)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const url = src ? getAbsoluteImageUrl(src) : ''
    setCurrentSrc(url || DEFAULT_PRODUCT_IMAGE)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError && currentSrc !== DEFAULT_PRODUCT_IMAGE) {
      setHasError(true)
      setCurrentSrc(DEFAULT_PRODUCT_IMAGE)
    } else {
      setCurrentSrc(DEFAULT_PRODUCT_DATA_URI)
    }
  }

  return (
    <div
      className={`${sizeClass} rounded-lg bg-muted/60 border border-border/50 shrink-0 flex items-center justify-center overflow-hidden select-none`}
    >
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onError={handleError}
      />
    </div>
  )
}

const FLASH_SALE_TIME_SESSIONS: TimeSlotSession[] = [
  {
    id: 'morning_rush',
    labelKm: 'ពេលព្រឹក (08:00 - 11:00)',
    labelEn: 'Morning Rush (08:00 - 11:00)',
    timeRange: '08:00 - 11:00',
    startHour: 8,
    endHour: 11,
    iconName: '',
    badge: '08:00 - 11:00',
  },
  {
    id: 'lunch_rush',
    labelKm: 'អាហារថ្ងៃត្រង់ (12:00 - 14:00)',
    labelEn: 'Lunch Rush (12:00 - 14:00)',
    timeRange: '12:00 - 14:00',
    startHour: 12,
    endHour: 14,
    iconName: '',
    badge: '12:00 - 14:00',
  },
  {
    id: 'prime_evening',
    labelKm: 'ពេលល្ងាច (18:00 - 21:00)',
    labelEn: 'Prime Evening (18:00 - 21:00)',
    timeRange: '18:00 - 21:00',
    startHour: 18,
    endHour: 21,
    iconName: '',
    badge: '18:00 - 21:00',
  },
  {
    id: 'night_owl',
    labelKm: 'ពេលយប់ (21:00 - 24:00)',
    labelEn: 'Night Owl (21:00 - 24:00)',
    timeRange: '21:00 - 24:00',
    startHour: 21,
    endHour: 24,
    iconName: '',
    badge: '21:00 - 24:00',
  },
  {
    id: 'custom_session',
    labelKm: 'កំណត់ពេលផ្ទាល់ខ្លួន',
    labelEn: 'Custom Slot',
    timeRange: '--:-- - --:--',
    startHour: 0,
    endHour: 0,
    iconName: '',
    badge: 'Custom',
  },
]

export const FlashSaleFormPage: React.FC = () => {
  const { t, i18n } = useTranslation(['marketing', 'common', 'nav', 'buttons', 'toast'])
  const isKm = i18n.language === 'km'
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const saleId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const toast = useToast()

  // ─── Base Campaign State ──────────────────────────────────────────────────
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState<string>('prime_evening')
  const [channelScope, setChannelScope] = useState<ChannelScope>('all')
  const [branchIds, setBranchIds] = useState<string>('all')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isActive, setIsActive] = useState(true)

  // ─── Products & Quota Matrix ──────────────────────────────────────────────
  const [selectedProducts, setSelectedProducts] = useState<FlashSaleProductItem[]>([])
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all')
  const [searchedProductList, setSearchedProductList] = useState<any[]>([])
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const filterBoxRef = useRef<HTMLDivElement>(null)

  // Quick Bulk Actions States
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<string>('')
  const [bulkQuota, setBulkQuota] = useState<string>('')

  // ─── Click Outside & Escape Key Listener to dismiss Search Dropdown ───────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterBoxRef.current && !filterBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // ─── POS & Checkout Rules ─────────────────────────────────────────────────
  const [posQuickCode, setPosQuickCode] = useState(`FLASH-${Math.floor(1000 + Math.random() * 9000)}`)
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['all'])
  const [perCustomerLimit, setPerCustomerLimit] = useState<number>(2)
  const [autoStockRollback, setAutoStockRollback] = useState(true)
  const [priority, setPriority] = useState<string>('10')

  // Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // ─── Fetch Accessible Branches ────────────────────────────────────────────
  const accessibleBranches = useAuthStore((s) => s.user?.accessible_branches) || []
  const currentUserBranch = useAuthStore((s) => s.user?.branch)

  const { data: branchesData } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.getBranches({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const availableBranches = useMemo(() => {
    if (Array.isArray(branchesData?.data)) return branchesData.data
    if (Array.isArray(branchesData?.data?.data)) return branchesData.data.data
    if (accessibleBranches.length > 0) return accessibleBranches
    if (currentUserBranch) return [currentUserBranch]
    return []
  }, [branchesData, accessibleBranches, currentUserBranch])

  // ─── Categories from database ─────────────────────────────────────────────
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-list-all'],
    queryFn: () => categoryService.list({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const availableCategories = useMemo(() => {
    const raw = Array.isArray(categoriesData?.data)
      ? categoriesData.data
      : Array.isArray(categoriesData?.data?.data)
      ? categoriesData.data.data
      : Array.isArray(categoriesData)
      ? categoriesData
      : []
    return raw
  }, [categoriesData])

  // ─── Brands from database ─────────────────────────────────────────────────
  const { data: brandsData } = useQuery({
    queryKey: ['brands-list-all'],
    queryFn: () => brandService.list({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const availableBrands = useMemo(() => {
    const raw = Array.isArray(brandsData?.data)
      ? brandsData.data
      : Array.isArray(brandsData?.data?.data)
      ? brandsData.data.data
      : Array.isArray(brandsData)
      ? brandsData
      : []
    return raw
  }, [brandsData])

  // ─── Currencies & Exchange Rate ───────────────────────────────────────────
  const { data: currenciesData } = useQuery({
    queryKey: ['currencies-active'],
    queryFn: () => financeService.getCurrencies({ status: 'active', per_page: 50 }),
    staleTime: 10 * 60 * 1000,
  })

  const availableCurrencies = useMemo(() => {
    const raw = Array.isArray(currenciesData?.data)
      ? currenciesData.data
      : Array.isArray(currenciesData?.data?.data)
      ? currenciesData.data.data
      : Array.isArray(currenciesData)
      ? currenciesData
      : []
    if (raw.length > 0) return raw.filter((c: any) => c.is_active !== false)
    return [
      { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', exchange_rate: 1 },
      { id: 2, code: 'KHR', name: 'Cambodian Riel', symbol: '៛', exchange_rate: 4100 },
    ]
  }, [currenciesData])

  const khrExchangeRate = useMemo(() => {
    const khr = availableCurrencies.find((c: any) => c.code === 'KHR')
    return khr && parseFloat(khr.exchange_rate) > 0 ? parseFloat(khr.exchange_rate) : 4100
  }, [availableCurrencies])

  // ─── Fetch Sale Detail (Edit Mode) ────────────────────────────────────────
  const { data: saleDetail, isLoading: isLoadingSale } = useQuery({
    queryKey: ['flash-sale-detail', saleId],
    queryFn: () => (saleId ? marketingService.getFlashSale(saleId) : null),
    enabled: isEdit && !isNaN(saleId as number),
  })

  // Set default initial dates for create mode
  useEffect(() => {
    if (!isEdit && !startsAt && !endsAt) {
      const now = new Date()
      const startIso = new Date(now.getTime() + 10 * 60 * 1000)
      const endIso = new Date(now.getTime() + 4 * 60 * 60 * 1000)
      setStartsAt(formatDateTimeLocal(startIso.toISOString()))
      setEndsAt(formatDateTimeLocal(endIso.toISOString()))
    }
  }, [isEdit, startsAt, endsAt])

  // Populate data when editing
  useEffect(() => {
    const target = saleDetail || (location.state as any)?.sale
    if (target) {
      setName(target.name || '')
      setDescription(target.description || '')
      setStartsAt(formatDateTimeLocal(target.starts_at) || '')
      setEndsAt(formatDateTimeLocal(target.ends_at) || '')
      setIsActive(target.is_active ?? true)
      setChannelScope(target.channel_scope || 'all')
      setBranchIds(
        Array.isArray(target.branch_ids)
          ? target.branch_ids[0]?.toString() || 'all'
          : target.branch_ids?.toString() || 'all'
      )

      if (target.time_slot_name) {
        const foundSess = FLASH_SALE_TIME_SESSIONS.find(
          (s) => s.labelEn.toLowerCase().includes(target.time_slot_name.toLowerCase()) || s.id === target.time_slot_name
        )
        if (foundSess) setSelectedSessionId(foundSess.id)
      }

      if (target.conditions) {
        if (target.conditions.pos_quick_code) setPosQuickCode(target.conditions.pos_quick_code)
        if (target.conditions.payment_methods) setPaymentMethods(target.conditions.payment_methods)
        if (target.conditions.per_customer_limit) setPerCustomerLimit(target.conditions.per_customer_limit)
        if (target.conditions.auto_stock_rollback !== undefined) setAutoStockRollback(target.conditions.auto_stock_rollback)
        if (target.conditions.priority) setPriority(target.conditions.priority.toString())
      }

      const rawItems = target.products || target.items || []
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        setSelectedProducts(
          rawItems.map((p: any) => {
            const rawImg =
              p.product?.image_url ||
              p.product?.image ||
              p.product?.thumbnail ||
              p.product_image ||
              (Array.isArray(p.product?.images)
                ? typeof p.product.images[0] === 'string'
                  ? p.product.images[0]
                  : p.product.images[0]?.url || p.product.images[0]?.image || ''
                : '') ||
              ''
            return {
              id: p.id,
              product_id: p.product_id || p.product?.id || p.id,
              product_name: p.product?.name || p.product_name || `Product #${p.product_id}`,
              product_sku: p.product?.sku || p.product_sku || 'SKU-FLASH',
              product_image: rawImg ? getAbsoluteImageUrl(rawImg) : DEFAULT_PRODUCT_IMAGE,
              product_category: p.product?.category?.name || p.product_category || 'General',
              product_brand: p.product?.brand?.name || p.product_brand || '',
              original_price: Number(p.product?.selling_price || p.original_price || 25),
              flash_price: Number(p.flash_price || 15),
              flash_price_khr: Number(p.flash_price || 15) * khrExchangeRate,
              discount_percent: Number(p.discount_percent || 40),
              quota: Number(p.quota || 50),
              sold_count: Number(p.sold_count || 0),
              per_customer_limit: Number(p.per_customer_limit || 2),
              product_variant_id: p.product_variant_id || null,
            }
          })
        )
      }
    }
  }, [saleDetail, location.state, khrExchangeRate])

  // ─── Realtime Product Search & Filter ─────────────────────────────────────
  useEffect(() => {
    const hasFilter = productSearchQuery.trim() || selectedCategoryId !== 'all' || selectedBrandId !== 'all'
    if (!hasFilter) {
      setSearchedProductList([])
      setShowDropdown(false)
      return
    }

    let active = true
    const fetchProducts = async () => {
      setIsSearchingProducts(true)
      try {
        const params: any = { per_page: 20 }
        if (productSearchQuery.trim()) params.search = productSearchQuery.trim()
        if (selectedCategoryId !== 'all') params.category_id = selectedCategoryId
        if (selectedBrandId !== 'all') params.brand_id = selectedBrandId

        const res = await productService.list(params)
        if (active) {
          const list = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : []
          setSearchedProductList(list)
          if (list.length > 0) {
            setShowDropdown(true)
          }
        }
      } catch {
        if (active) setSearchedProductList([])
      } finally {
        if (active) setIsSearchingProducts(false)
      }
    }

    const timer = setTimeout(fetchProducts, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [productSearchQuery, selectedCategoryId, selectedBrandId])

  const handleResetFilters = () => {
    setProductSearchQuery('')
    setSelectedCategoryId('all')
    setSelectedBrandId('all')
    setSearchedProductList([])
    setShowDropdown(false)
  }

  // ─── Session Preset Handler ───────────────────────────────────────────────
  const handleApplySession = (session: TimeSlotSession) => {
    setSelectedSessionId(session.id)
    if (session.id === 'custom_session') return

    const now = new Date()
    const start = new Date(now)
    start.setHours(session.startHour, 0, 0, 0)
    if (start < now) {
      start.setDate(start.getDate() + 1)
    }

    const end = new Date(start)
    end.setHours(session.endHour, 0, 0, 0)

    setStartsAt(formatDateTimeLocal(start.toISOString()))
    setEndsAt(formatDateTimeLocal(end.toISOString()))

    if (formErrors.startsAt || formErrors.endsAt) {
      setFormErrors((prev) => ({ ...prev, startsAt: '', endsAt: '' }))
    }
  }

  // ─── Product Selection Handlers ───────────────────────────────────────────
  const handleAddProduct = (prod: any) => {
    if (selectedProducts.some((p) => p.product_id === prod.id)) return

    const origPrice = Number(prod.selling_price || prod.price || 20)
    const discPct = bulkDiscountPercent ? Number(bulkDiscountPercent) : 30
    const quotaVal = bulkQuota ? Number(bulkQuota) : 50
    const flashPrice = Number((origPrice * (1 - discPct / 100)).toFixed(2))
    const rawImg =
      prod.image_url ||
      prod.thumbnail ||
      prod.image ||
      prod.primary_image ||
      (Array.isArray(prod.images)
        ? typeof prod.images[0] === 'string'
          ? prod.images[0]
          : prod.images[0]?.url || prod.images[0]?.image || ''
        : '') ||
      ''
    const img = rawImg ? getAbsoluteImageUrl(rawImg) : DEFAULT_PRODUCT_IMAGE

    setSelectedProducts((prev) => [
      ...prev,
      {
        product_id: prod.id,
        product_name: prod.name,
        product_sku: prod.sku || `SKU-${prod.id}`,
        product_image: img,
        product_category: prod.category?.name || 'General',
        product_brand: prod.brand?.name || '',
        original_price: origPrice,
        flash_price: flashPrice,
        flash_price_khr: Math.round(flashPrice * khrExchangeRate),
        discount_percent: discPct,
        quota: quotaVal,
        sold_count: 0,
        per_customer_limit: perCustomerLimit,
      },
    ])

    if (formErrors.products) {
      setFormErrors((prev) => ({ ...prev, products: '' }))
    }
  }

  // Bulk Add all filtered products
  const handleAddAllFiltered = () => {
    const toAdd = searchedProductList.filter(
      (p) => !selectedProducts.some((sp) => sp.product_id === p.id)
    )
    if (toAdd.length === 0) return

    const discPct = bulkDiscountPercent ? Number(bulkDiscountPercent) : 30
    const quotaVal = bulkQuota ? Number(bulkQuota) : 50

    const newItems: FlashSaleProductItem[] = toAdd.map((prod) => {
      const origPrice = Number(prod.selling_price || prod.price || 20)
      const flashPrice = Number((origPrice * (1 - discPct / 100)).toFixed(2))
      const rawImg =
        prod.image_url ||
        prod.thumbnail ||
        prod.image ||
        prod.primary_image ||
        (Array.isArray(prod.images)
          ? typeof prod.images[0] === 'string'
            ? prod.images[0]
            : prod.images[0]?.url || prod.images[0]?.image || ''
          : '') ||
        ''
      const img = rawImg ? getAbsoluteImageUrl(rawImg) : DEFAULT_PRODUCT_IMAGE
      return {
        product_id: prod.id,
        product_name: prod.name,
        product_sku: prod.sku || `SKU-${prod.id}`,
        product_image: img,
        product_category: prod.category?.name || 'General',
        product_brand: prod.brand?.name || '',
        original_price: origPrice,
        flash_price: flashPrice,
        flash_price_khr: Math.round(flashPrice * khrExchangeRate),
        discount_percent: discPct,
        quota: quotaVal,
        sold_count: 0,
        per_customer_limit: perCustomerLimit,
      }
    })

    setSelectedProducts((prev) => [...prev, ...newItems])
    if (formErrors.products) {
      setFormErrors((prev) => ({ ...prev, products: '' }))
    }
  }

  // Bulk Apply Discount % to all selected products
  const handleApplyBulkDiscount = () => {
    const pct = Math.min(Math.max(Number(bulkDiscountPercent) || 0, 1), 99)
    if (!bulkDiscountPercent || isNaN(pct)) return

    setSelectedProducts((prev) =>
      prev.map((item) => {
        const calculatedPrice = Number((item.original_price * (1 - pct / 100)).toFixed(2))
        return {
          ...item,
          discount_percent: pct,
          flash_price: calculatedPrice,
          flash_price_khr: Math.round(calculatedPrice * khrExchangeRate),
        }
      })
    )
    toast.success(
      t('marketing.bulkDiscountApplied', {
        pct,
        defaultValue: `បានអនុវត្តបញ្ចុះតម្លៃ ${pct}% លើគ្រប់ទំនិញទាំងអស់`,
      })
    )
  }

  // Bulk Apply Quota to all selected products
  const handleApplyBulkQuota = () => {
    const q = Math.max(1, Number(bulkQuota) || 0)
    if (!bulkQuota || isNaN(q)) return

    setSelectedProducts((prev) =>
      prev.map((item) => ({
        ...item,
        quota: q,
      }))
    )
    toast.success(
      t('marketing.bulkQuotaApplied', {
        quota: q,
        defaultValue: `បានកំណត់កូតា ${q} ឯកតាលើគ្រប់ទំនិញទាំងអស់`,
      })
    )
  }

  const handleClearAllProducts = () => {
    setSelectedProducts([])
  }

  const handleProductChange = (index: number, field: keyof FlashSaleProductItem, value: any) => {
    setSelectedProducts((prev) => {
      const copy = [...prev]
      const item = { ...copy[index], [field]: value }

      if (field === 'flash_price') {
        const numVal = Math.max(0, Number(value) || 0)
        item.flash_price = numVal
        item.flash_price_khr = Math.round(numVal * khrExchangeRate)
        item.discount_percent =
          item.original_price > 0
            ? Math.max(0, Math.min(100, Math.round(((item.original_price - numVal) / item.original_price) * 100)))
            : 0
      } else if (field === 'discount_percent') {
        const pct = Math.min(Math.max(Number(value) || 0, 0), 100)
        item.discount_percent = pct
        const calculatedPrice = Number((item.original_price * (1 - pct / 100)).toFixed(2))
        item.flash_price = calculatedPrice
        item.flash_price_khr = Math.round(calculatedPrice * khrExchangeRate)
      }

      copy[index] = item
      return copy
    })
  }

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Payment Methods Toggle ───────────────────────────────────────────────
  const togglePaymentMethod = (methodId: string) => {
    if (methodId === 'all') {
      setPaymentMethods(['all'])
      return
    }
    const withoutAll = paymentMethods.filter((p) => p !== 'all')
    if (withoutAll.includes(methodId)) {
      const next = withoutAll.filter((p) => p !== methodId)
      setPaymentMethods(next.length === 0 ? ['all'] : next)
    } else {
      setPaymentMethods([...withoutAll, methodId])
    }
  }

  // ─── Code Generator ───────────────────────────────────────────────────────
  const handleGenerateBarcode = () => {
    const code = `FLASH-${Math.floor(1000 + Math.random() * 9000)}`
    setPosQuickCode(code)
  }

  // ─── Calculated Metrics Preview ───────────────────────────────────────────
  const campaignSummary = useMemo(() => {
    const count = selectedProducts.length
    const totalQuota = selectedProducts.reduce((acc, p) => acc + (Number(p.quota) || 0), 0)
    const avgDiscount =
      count > 0
        ? Math.round(selectedProducts.reduce((acc, p) => acc + (Number(p.discount_percent) || 0), 0) / count)
        : 0
    const estGrossRevenueUsd = selectedProducts.reduce(
      (acc, p) => acc + (Number(p.flash_price) || 0) * (Number(p.quota) || 0),
      0
    )
    const estGrossRevenueKhr = Math.round(estGrossRevenueUsd * khrExchangeRate)
    const estSavingsUsd = selectedProducts.reduce(
      (acc, p) =>
        acc + Math.max(0, (Number(p.original_price) || 0) - (Number(p.flash_price) || 0)) * (Number(p.quota) || 0),
      0
    )
    const estSavingsKhr = Math.round(estSavingsUsd * khrExchangeRate)

    let durationLabel = '--'
    if (startsAt && endsAt) {
      const s = new Date(startsAt).getTime()
      const e = new Date(endsAt).getTime()
      if (e > s) {
        const diffHours = Math.round((e - s) / (1000 * 60 * 60))
        if (diffHours < 24) {
          durationLabel = t('marketing.durationHours', { count: diffHours, defaultValue: `${diffHours} Hours` })
        } else {
          const days = Math.floor(diffHours / 24)
          const hrs = diffHours % 24
          durationLabel = t('marketing.durationDaysHours', {
            days,
            hours: hrs,
            defaultValue: `${days}d ${hrs}h`,
          })
        }
      }
    }

    return {
      count,
      totalQuota,
      avgDiscount,
      estGrossRevenueUsd,
      estGrossRevenueKhr,
      estSavingsUsd,
      estSavingsKhr,
      durationLabel,
    }
  }, [selectedProducts, startsAt, endsAt, khrExchangeRate, t])

  // ─── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: any) => marketingService.createFlashSale(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flash-sales'] })
      toast.success(t('marketing.flashCreatedSuccess', 'Flash sale campaign created successfully.'))
      navigate('/marketing/flash-sales')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('toast.error', 'Operation failed.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => marketingService.updateFlashSale(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flash-sales'] })
      qc.invalidateQueries({ queryKey: ['flash-sale-detail', saleId] })
      toast.success(t('marketing.flashUpdatedSuccess', 'Flash sale campaign updated successfully.'))
      navigate('/marketing/flash-sales')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('toast.error', 'Operation failed.'))
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // ─── Form Submission ──────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = t('marketing.validationFlashNameRequired', 'Flash sale campaign name is required')
    }

    if (!startsAt || !endsAt) {
      errors.startsAt = t('marketing.validationFlashDatesRequired', 'Please select valid start and end dates')
    } else if (new Date(endsAt) <= new Date(startsAt)) {
      errors.endsAt = t('marketing.validationFlashDateOrder', 'End date must be after start date')
    }

    if (selectedProducts.length === 0) {
      errors.products = t(
        'marketing.validationFlashProductsRequired',
        'Please add at least one product to this flash sale'
      )
    }

    for (let i = 0; i < selectedProducts.length; i++) {
      const p = selectedProducts[i]
      if (p.flash_price <= 0) {
        errors[`flash_price_${i}`] = t('marketing.validationFlashPriceRequired', 'Flash price must be greater than 0')
      }
      if (p.quota <= 0) {
        errors[`quota_${i}`] = t('marketing.validationFlashQuotaRequired', 'Stock quota must be greater than 0')
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    setFormErrors({})

    const sessionPreset = FLASH_SALE_TIME_SESSIONS.find((s) => s.id === selectedSessionId)

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      channel_scope: channelScope,
      branch_ids:
        branchIds === 'all'
          ? 'all'
          : [parseInt(branchIds, 10)].filter((n) => !isNaN(n)),
      starts_at: startsAt,
      ends_at: endsAt,
      is_active: isActive,
      time_slot_name: sessionPreset ? (isKm ? sessionPreset.labelKm : sessionPreset.labelEn) : 'Custom Slot',
      products: selectedProducts.map((p) => ({
        product_id: p.product_id,
        product_variant_id: p.product_variant_id || null,
        flash_price: p.flash_price,
        discount_percent: p.discount_percent,
        quota: p.quota,
        per_customer_limit: p.per_customer_limit || perCustomerLimit,
        sold_count: p.sold_count || 0,
      })),
      conditions: {
        pos_quick_code: posQuickCode,
        payment_methods: paymentMethods,
        per_customer_limit: perCustomerLimit,
        auto_stock_rollback: autoStockRollback,
        priority: parseInt(priority, 10) || 10,
      },
    }

    if (isEdit && saleId) {
      updateMutation.mutate({ id: saleId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isLoading={isLoadingSale}
      isSubmitting={isSubmitting}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? t('marketing.formEditFlashTitle', 'Edit Flash Sale Campaign')
              : t('marketing.formCreateFlashTitle', 'Create Flash Sale Campaign')
          }
          subtitle={t(
            'marketing.formFlashSubtitle',
            'Configure limited-time rush offers, quota allocations, and omnichannel POS sync.'
          )}
          breadcrumbs={[
            { label: t('marketing.breadcrumbMarketing', 'Marketing'), path: '/marketing/flash-sales' },
            { label: t('nav.flashSales', 'Flash Sales'), path: '/marketing/flash-sales' },
            {
              label: isEdit
                ? t('marketing.breadcrumbEdit', 'Edit')
                : t('marketing.breadcrumbCreate', 'Create'),
            },
          ]}
          statusBadge={
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                }`}
              />
              {isActive ? t('marketing.active', 'Active') : t('marketing.inactive', 'Inactive')}
            </span>
          }
          backPath="/marketing/flash-sales"
          backLabel={t('common.back', 'Back')}
        />
      }
      footer={
        <FormFooter
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/marketing/flash-sales')}
          cancelPath="/marketing/flash-sales"
          cancelLabel={t('buttons.cancel', 'Cancel')}
          submitLabel={
            isEdit
              ? t('marketing.btnSaveFlash', 'Save Changes')
              : t('marketing.btnCreateFlash', 'Create Flash Sale')
          }
        />
      }
    >
      <FormContent maxWidth="full" layout="two-column">
        {/* ─── LEFT COLUMN (8 cols): Main Campaign Configuration ─── */}
        <div className="lg:col-span-8 space-y-6">
          {/* CARD 1: GENERAL INFORMATION & RUSH SESSIONS */}
          <FormCard
            title={t('marketing.flashGeneralInfo', 'General Information & Rush Sessions')}
            subtitle={t(
              'marketing.flashGeneralInfoDesc',
              'Campaign headline, description, rush session presets, and sales channel scope'
            )}
            contentClassName="space-y-5"
          >
            {/* Campaign Headline */}
            <FormField
              label={t('marketing.campaignName', 'Campaign Name')}
              required
              error={formErrors.name}
            >
              <Input
                name="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (formErrors.name) {
                    setFormErrors((prev) => ({ ...prev, name: '' }))
                  }
                }}
                placeholder={t(
                  'marketing.campaignNamePlaceholder',
                  'e.g. 🌸 Khmer New Year Mega Flash 50% OFF'
                )}
                error={formErrors.name}
              />
            </FormField>

            {/* Campaign Description */}
            <FormField label={t('marketing.bannerDescription', 'Description / Banner Subtitle')}>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  'marketing.campaignDescPlaceholder',
                  'Enter campaign highlights or promotional banner notes...'
                )}
                rows={2}
              />
            </FormField>

            {/* Rush Time Session Preset */}
            <FormField
              label={t('marketing.rushSessionPreset', 'Rush Time Session Preset')}
              hint={t('marketing.quickPresets', 'Quick Rush Presets:')}
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {FLASH_SALE_TIME_SESSIONS.map((sess) => {
                  const isCur = selectedSessionId === sess.id
                  return (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => handleApplySession(sess)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isCur
                          ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/20'
                          : 'border-border bg-card text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-xs font-semibold truncate">
                        {isKm ? sess.labelKm.split(' ')[0] : sess.labelEn.split(' ')[0]}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{sess.timeRange}</div>
                    </button>
                  )
                })}
              </div>
            </FormField>

            {/* Sales Channel Scope */}
            <FormField label={t('marketing.targetChannelScope', 'Target Channel Scope')} required>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: 'all',
                    label: t('marketing.channelOmni', 'All Channels (Omni)'),
                    desc: 'POS + Online Web + Mobile App',
                  },
                  {
                    id: 'pos_only',
                    label: t('marketing.channelPos', 'Retail POS Branches'),
                    desc: 'In-store Cashier Registers',
                  },
                  {
                    id: 'storefront_only',
                    label: t('marketing.channelWeb', 'E-Commerce Website'),
                    desc: 'Storefront Online Checkout',
                  },
                  {
                    id: 'app_only',
                    label: t('marketing.channelMobile', 'Mobile App Only'),
                    desc: 'iOS & Android Mobile App',
                  },
                ].map((ch) => {
                  const isSel = channelScope === ch.id
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannelScope(ch.id as any)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/20'
                          : 'border-border bg-card text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-xs font-bold">{ch.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{ch.desc}</div>
                    </button>
                  )
                })}
              </div>
            </FormField>

            {/* Branch Allocation */}
            <FormField label={t('marketing.branchAllocation', 'Retail Branch Assignment')}>
              <select
                value={branchIds}
                onChange={(e) => setBranchIds(e.target.value)}
                className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
              >
                <option value="all">
                  {t('marketing.allBranches', 'All Branches Nationwide')}
                </option>
                {availableBranches.map((b: any) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name} {b.code ? `(${b.code})` : ''}
                  </option>
                ))}
              </select>
            </FormField>
          </FormCard>

          {/* CARD 2: PRODUCTS & QUOTA ALLOCATION */}
          <FormCard
            title={
              <div className="flex items-center justify-between gap-3 w-full">
                <span>{t('marketing.flashProductsTitle', 'Products & Quota Allocation')}</span>
                {selectedProducts.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {selectedProducts.length} {t('marketing.productsUnit', 'Products')}
                  </span>
                )}
              </div>
            }
            subtitle={t(
              'marketing.flashProductsDesc',
              'Select products, assign flash prices ($ / ៛), discount percentage, and stock quotas'
            )}
            contentClassName="space-y-4"
          >
            {/* ── Filter Bar: Search, Category & Brand ── */}
            <div ref={filterBoxRef} className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                {/* Search text input */}
                <div className="sm:col-span-6 relative flex items-center">
                  <Search className="absolute left-3 text-muted-foreground/70 pointer-events-none" size={16} />
                  <input
                    type="text"
                    placeholder={t(
                      'marketing.searchProductsPlaceholder',
                      'Search products by name, SKU, or category...'
                    )}
                    value={productSearchQuery}
                    onFocus={() => {
                      if (searchedProductList.length > 0) setShowDropdown(true)
                    }}
                    onChange={(e) => {
                      setProductSearchQuery(e.target.value)
                      setShowDropdown(true)
                    }}
                    className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                  {productSearchQuery && !isSearchingProducts && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductSearchQuery('')
                        if (selectedCategoryId === 'all' && selectedBrandId === 'all') {
                          setShowDropdown(false)
                        }
                      }}
                      className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title={t('common.clear', 'Clear')}
                    >
                      <X size={14} />
                    </button>
                  )}
                  {isSearchingProducts && (
                    <Loader2 className="absolute right-3 animate-spin text-muted-foreground pointer-events-none" size={15} />
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="sm:col-span-3">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value)
                      setShowDropdown(true)
                    }}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer transition-all"
                  >
                    <option value="all">{t('marketing.allCategories', 'All Categories')}</option>
                    {availableCategories.map((c: any) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Dropdown & Reset */}
                <div className="sm:col-span-3 flex items-center gap-2">
                  <select
                    value={selectedBrandId}
                    onChange={(e) => {
                      setSelectedBrandId(e.target.value)
                      setShowDropdown(true)
                    }}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer transition-all"
                  >
                    <option value="all">{t('marketing.allBrands', 'All Brands')}</option>
                    {availableBrands.map((b: any) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  {(productSearchQuery || selectedCategoryId !== 'all' || selectedBrandId !== 'all') && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      title={t('marketing.resetFilters', 'Reset filters')}
                      className="h-10 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Floating Popover: Searched / Filtered Items ── */}
              {showDropdown && searchedProductList.length > 0 && (
                <div className="absolute z-30 left-0 right-0 top-full mt-2 border border-border rounded-xl bg-card overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2.5 bg-muted/60 border-b border-border flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {t('marketing.filterResultsCount', {
                        count: searchedProductList.length,
                        defaultValue: `Found ${searchedProductList.length} products`,
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleAddAllFiltered}
                        className="px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors cursor-pointer"
                      >
                        + {t('marketing.addAllFiltered', 'Add All Filtered Items')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDropdown(false)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title={t('common.close', 'Close')}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-border/60">
                    {searchedProductList.map((p) => {
                      const isAdded = selectedProducts.some((sp) => sp.product_id === p.id)
                      const rawImg =
                        p.image_url ||
                        p.thumbnail ||
                        p.image ||
                        p.primary_image ||
                        (Array.isArray(p.images)
                          ? typeof p.images[0] === 'string'
                            ? p.images[0]
                            : p.images[0]?.url || p.images[0]?.image || ''
                          : '') ||
                        ''
                      return (
                        <div
                          key={p.id}
                          className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-muted/40 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <ProductItemImage
                              src={rawImg}
                              alt={p.name}
                              sizeClass="w-10 h-10"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground text-xs sm:text-sm truncate">{p.name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                                <span>{p.sku || `SKU-${p.id}`}</span>
                                {p.category?.name && (
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-sans">
                                    {p.category.name}
                                  </span>
                                )}
                                {p.brand?.name && (
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-sans">
                                    {p.brand.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-foreground font-mono">
                              ${Number(p.selling_price || p.price || 0).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              disabled={isAdded}
                              onClick={() => handleAddProduct(p)}
                              className={`h-8 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                                isAdded
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                  : 'bg-primary text-primary-foreground hover:opacity-90'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check size={13} />
                                  <span>{t('common.added', 'Added')}</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={13} />
                                  <span>{t('common.add', 'Add')}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Quick Bulk Actions Toolbar (When products are added) ── */}
            {selectedProducts.length > 0 && (
              <div className="p-3.5 bg-muted/30 border border-border/70 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 whitespace-nowrap text-xs">
                    <SlidersHorizontal size={14} className="text-primary" />
                    {t('marketing.batchQuickSet', 'Batch Quick Set')}:
                  </span>

                  {/* Apply Discount to all */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {t('marketing.applyDiscountToAll', 'Discount %')}:
                    </span>
                    <div className="relative flex items-center w-20">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        placeholder="30"
                        value={bulkDiscountPercent}
                        onChange={(e) => setBulkDiscountPercent(e.target.value)}
                        className="w-full h-8 pl-2 pr-6 rounded-lg border border-border/80 bg-background text-foreground text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-center shadow-xs transition-all"
                      />
                      <span className="absolute right-2 text-xs font-bold text-muted-foreground pointer-events-none select-none">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyBulkDiscount}
                      className="h-8 px-3 rounded-lg bg-background hover:bg-muted border border-border text-foreground font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {t('marketing.apply', 'Apply')}
                    </button>
                  </div>

                  <div className="h-4 w-px bg-border/80 hidden sm:block" />

                  {/* Apply Quota to all */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {t('marketing.applyQuotaToAll', 'Quota')}:
                    </span>
                    <div className="relative flex items-center w-24">
                      <input
                        type="number"
                        min="1"
                        placeholder="50"
                        value={bulkQuota}
                        onChange={(e) => setBulkQuota(e.target.value)}
                        className="w-full h-8 pl-2 pr-8 rounded-lg border border-border/80 bg-background text-foreground text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-center shadow-xs transition-all"
                      />
                      <span className="absolute right-2 text-[10px] text-muted-foreground pointer-events-none select-none font-medium">
                        {t('marketing.units', 'units')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyBulkQuota}
                      className="h-8 px-3 rounded-lg bg-background hover:bg-muted border border-border text-foreground font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {t('marketing.apply', 'Apply')}
                    </button>
                  </div>
                </div>

                {/* Clear all products button */}
                <button
                  type="button"
                  onClick={handleClearAllProducts}
                  className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 size={13} />
                  <span>{t('marketing.clearAll', 'Clear All')}</span>
                </button>
              </div>
            )}

            {formErrors.products && (
              <p className="text-xs text-rose-500 font-medium">{formErrors.products}</p>
            )}

            {/* Selected Products Table */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead className="bg-muted/40 border-b border-border font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">{t('marketing.productName', 'Product Details')}</th>
                      <th className="py-3 px-3">{t('marketing.originalPrice', 'Regular Price')}</th>
                      <th className="py-3 px-3">{t('marketing.flashPriceUsd', 'Flash Price ($)')}</th>
                      <th className="py-3 px-3">{t('marketing.flashPriceKhr', 'Flash Price (៛)')}</th>
                      <th className="py-3 px-3 text-center">{t('marketing.discountPercent', 'Discount %')}</th>
                      <th className="py-3 px-3 text-center">{t('marketing.quotaLimit', 'Stock Quota')}</th>
                      <th className="py-3 px-4 text-right">{t('marketing.actions', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                              <Package size={22} className="text-muted-foreground/60" />
                            </div>
                            <p className="text-xs font-semibold text-foreground">
                              {t('marketing.noProductsAddedYet', 'No products added yet')}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {t(
                                'marketing.noProductsAddedHint',
                                'Use the search bar above to include products in this flash sale.'
                              )}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      selectedProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          {/* Product Details with Image */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <ProductItemImage
                                src={p.product_image}
                                alt={p.product_name}
                                sizeClass="w-9 h-9"
                              />
                              <div className="min-w-0 max-w-[220px]">
                                <div className="font-semibold text-foreground text-xs leading-snug truncate" title={p.product_name}>
                                  {p.product_name}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>{p.product_sku}</span>
                                  {p.product_category && (
                                    <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded font-sans truncate">
                                      {p.product_category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Regular Price */}
                          <td className="py-3 px-3">
                            <span className="font-mono text-xs text-muted-foreground font-semibold">
                              ${p.original_price.toFixed(2)}
                            </span>
                          </td>

                          {/* Flash Price USD */}
                          <td className="py-3 px-3">
                            <div className="relative flex items-center w-26">
                              <span className="absolute left-2.5 text-xs font-semibold text-muted-foreground pointer-events-none select-none">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={p.flash_price}
                                onChange={(e) => handleProductChange(idx, 'flash_price', e.target.value)}
                                className="w-full h-8 pl-6 pr-2 text-xs font-semibold rounded-lg border border-border/80 bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                              />
                            </div>
                            {formErrors[`flash_price_${idx}`] && (
                              <span className="text-[10px] text-rose-500 block mt-0.5 font-medium">
                                {formErrors[`flash_price_${idx}`]}
                              </span>
                            )}
                          </td>

                          {/* Flash Price KHR */}
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted/40 font-mono text-xs text-muted-foreground font-medium border border-border/40">
                              {(p.flash_price_khr || Math.round(p.flash_price * khrExchangeRate)).toLocaleString()} ៛
                            </span>
                          </td>

                          {/* Discount % */}
                          <td className="py-3 px-3">
                            <div className="relative flex items-center w-20 mx-auto">
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={p.discount_percent}
                                onChange={(e) => handleProductChange(idx, 'discount_percent', e.target.value)}
                                className="w-full h-8 pl-2 pr-6 text-xs font-semibold rounded-lg border border-border/80 bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-center transition-all shadow-xs"
                              />
                              <span className="absolute right-2 text-xs font-bold text-muted-foreground pointer-events-none select-none">%</span>
                            </div>
                          </td>

                          {/* Quota */}
                          <td className="py-3 px-3">
                            <div className="w-22 mx-auto">
                              <input
                                type="number"
                                min="1"
                                value={p.quota}
                                onChange={(e) => handleProductChange(idx, 'quota', Number(e.target.value))}
                                className="w-full h-8 px-2 text-xs font-semibold rounded-lg border border-border/80 bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-center transition-all shadow-xs"
                              />
                            </div>
                            {formErrors[`quota_${idx}`] && (
                              <span className="text-[10px] text-rose-500 block mt-0.5 font-medium text-center">
                                {formErrors[`quota_${idx}`]}
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(idx)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title={t('common.remove', 'Remove')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Sub-Footer Summary */}
              {selectedProducts.length > 0 && (
                <div className="px-4 py-3 bg-muted/30 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>{t('marketing.quotaLimit', 'Stock Quota')}:</span>
                      <span className="font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded-md border border-border/60">
                        {campaignSummary.totalQuota.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>{t('marketing.avgDiscountRate', 'Avg Discount')}:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {campaignSummary.avgDiscount}% OFF
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    {selectedProducts.length} {t('marketing.productsUnit', 'Products')}
                  </div>
                </div>
              )}
            </div>
          </FormCard>

          {/* CARD 3: POS SYNCHRONIZATION & RULES */}
          <FormCard
            title={t('marketing.flashPosRulesTitle', 'POS Synchronization & Checkout Rules')}
            subtitle={t(
              'marketing.flashPosRulesDesc',
              'POS hotkey barcode, anti-scalping purchase limit, payment methods, and auto stock rollback'
            )}
            contentClassName="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* POS Quick Barcode Code */}
              <FormField
                label={t('marketing.posQuickCode', 'POS Quick Barcode Scan Code')}
                hint={t('marketing.posHotkeyHint', 'Cashiers can scan or key in this code to trigger instant flash pricing.')}
              >
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={posQuickCode}
                    onChange={(e) => setPosQuickCode(e.target.value)}
                    className="font-mono font-medium"
                    placeholder="e.g. FLASH-2026"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="px-3 h-10 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shrink-0"
                  >
                    {t('marketing.generateBarcode', 'Generate Code')}
                  </button>
                </div>
              </FormField>

              {/* Per-Customer Purchase Limit */}
              <FormField
                label={t('marketing.perCustomerLimit', 'Per-Customer Purchase Limit')}
                hint={t('marketing.antiScalpingDesc', 'Enforce per-customer purchase limits to prevent bulk reselling.')}
              >
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={perCustomerLimit}
                  onChange={(e) => setPerCustomerLimit(Number(e.target.value))}
                />
              </FormField>
            </div>

            {/* Eligible Payment Methods */}
            <FormField label={t('marketing.paymentMethods', 'Eligible Payment Methods')}>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {[
                  { id: 'all', label: t('marketing.allPaymentMethods', 'All Payment Methods') },
                  { id: 'khqr_bakong', label: t('marketing.khqrOnly', 'Bakong KHQR') },
                  { id: 'aba_pay', label: 'ABA PAY' },
                  { id: 'cash', label: t('marketing.cashOnly', 'Cash at POS') },
                ].map((pm) => {
                  const isSel = paymentMethods.includes(pm.id)
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => togglePaymentMethod(pm.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-2xs'
                          : 'bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      {pm.label}
                    </button>
                  )
                })}
              </div>
            </FormField>

            {/* Auto Stock Rollback Toggle */}
            <div className="p-3.5 rounded-lg bg-muted/20 border border-border flex items-start gap-3">
              <input
                type="checkbox"
                id="autoStockRollbackToggle"
                checked={autoStockRollback}
                onChange={(e) => setAutoStockRollback(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary cursor-pointer h-4 w-4"
              />
              <div className="space-y-0.5">
                <label
                  htmlFor="autoStockRollbackToggle"
                  className="text-xs font-semibold text-foreground cursor-pointer block"
                >
                  {t('marketing.autoRollbackStock', 'Auto-Stock Rollback on Session Expiration')}
                </label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t(
                    'marketing.autoRollbackDesc',
                    'When this flash sale campaign expires or reaches quota, unsold stock automatically reverts to standard retail pricing without manual intervention.'
                  )}
                </p>
              </div>
            </div>

            {/* Priority Level */}
            <FormField
              label={t('marketing.priorityLevel', 'Pricing Engine Priority Level')}
              hint={t('marketing.priorityHint', 'Higher priority rules override standard store discounts (default: 10).')}
            >
              <Input
                type="number"
                min="1"
                max="100"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-28 font-medium"
              />
            </FormField>
          </FormCard>
        </div>

        {/* ─── RIGHT COLUMN (4 cols): Schedule, Status & Live Summary ─── */}
        <div className="lg:col-span-4 space-y-6">
          {/* CARD 1: STATUS & SCHEDULE */}
          <FormCard
            title={t('marketing.flashStatusSchedule', 'Status & Schedule')}
            subtitle={t(
              'marketing.flashStatusScheduleDesc',
              'Manage campaign activation and runtime window'
            )}
            contentClassName="space-y-4"
          >
            {/* Status Toggle */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-foreground">
                  {t('marketing.activeStatus', 'Campaign Status')}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isActive
                    ? t('marketing.activeNow', 'Campaign is active and live')
                    : t('marketing.inactive', 'Paused or inactive')}
                </div>
              </div>
              <ToggleSwitch
                checked={isActive}
                onChange={(val) => setIsActive(val)}
                label={isActive ? t('marketing.active', 'Active') : t('marketing.inactive', 'Inactive')}
              />
            </div>

            {/* Starts At */}
            <FormField label={t('marketing.startsAt', 'Start Date & Time')} required error={formErrors.startsAt}>
              <EnterpriseDateTimePicker
                required
                value={startsAt}
                onChange={(val) => {
                  setStartsAt(val)
                  setSelectedSessionId('custom_session')
                  if (formErrors.startsAt) setFormErrors((p) => ({ ...p, startsAt: '' }))
                }}
                outputFormat="YYYY-MM-DDTHH:mm"
              />
            </FormField>

            {/* Ends At */}
            <FormField label={t('marketing.endsAt', 'End Date & Time')} required error={formErrors.endsAt}>
              <EnterpriseDateTimePicker
                required
                minDateTime={startsAt}
                value={endsAt}
                onChange={(val) => {
                  setEndsAt(val)
                  setSelectedSessionId('custom_session')
                  if (formErrors.endsAt) setFormErrors((p) => ({ ...p, endsAt: '' }))
                }}
                outputFormat="YYYY-MM-DDTHH:mm"
              />
            </FormField>

            {/* Duration Pill */}
            {startsAt && endsAt && (
              <div className="px-3 py-2 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  {t('marketing.activePeriod', 'Runtime Duration')}:
                </span>
                <span className="font-semibold text-foreground">{campaignSummary.durationLabel}</span>
              </div>
            )}
          </FormCard>

          {/* CARD 2: LIVE CAMPAIGN SUMMARY */}
          <FormCard
            title={t('marketing.flashLiveSummary', 'Campaign Live Overview')}
            subtitle={t(
              'marketing.flashLiveSummaryDesc',
              'Estimated metrics and real-time allocation overview'
            )}
            contentClassName="space-y-4"
          >
            {/* Channel Reach */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 text-xs">
              <span className="text-muted-foreground">{t('marketing.targetChannelScope', 'Channel Scope')}:</span>
              <span className="font-semibold text-foreground">
                {channelScope === 'all'
                  ? t('marketing.channelOmni', 'Omni-Channel')
                  : channelScope === 'pos_only'
                  ? t('marketing.channelPos', 'POS Retail')
                  : channelScope === 'storefront_only'
                  ? t('marketing.channelWeb', 'Web Storefront')
                  : t('marketing.channelMobile', 'Mobile App')}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                  {t('marketing.selectedFlashProducts', 'Products Included')}
                </div>
                <div className="text-base font-bold text-foreground">
                  {campaignSummary.count} <span className="text-xs font-normal text-muted-foreground">{t('marketing.productsUnit', 'Items')}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                  {t('marketing.quotaLimit', 'Total Quota')}
                </div>
                <div className="text-base font-bold text-foreground">
                  {campaignSummary.totalQuota} <span className="text-xs font-normal text-muted-foreground">Units</span>
                </div>
              </div>
            </div>

            {/* Potential Revenue & Savings Breakdown */}
            <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('marketing.potentialRevenue', 'Potential Gross Revenue')}:</span>
                <span className="font-bold text-foreground">
                  ${campaignSummary.estGrossRevenueUsd.toFixed(2)}
                </span>
              </div>
              <div className="text-right text-[11px] font-mono text-muted-foreground">
                ≈ {campaignSummary.estGrossRevenueKhr.toLocaleString()} ៛
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-muted-foreground">{t('marketing.customerSavingsEst', 'Est. Customer Savings')}:</span>
                <span className="font-semibold text-foreground">
                  ${campaignSummary.estSavingsUsd.toFixed(2)}
                </span>
              </div>
            </div>
          </FormCard>
        </div>
      </FormContent>
    </FormLayout>
  )
}

export default FlashSaleFormPage
