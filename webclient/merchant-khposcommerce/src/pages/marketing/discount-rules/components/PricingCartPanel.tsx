import React, { useState, useEffect, useRef } from 'react'
import { Trash2, CheckCircle2, AlertCircle, Barcode, Plus, Minus, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SearchInput, Input } from '@/components/common'
import { Button } from '@/components/ui/button'
import { productService } from '@/services/productService'
import type { CartItemInput, PricingEngineResult } from '../../promotions/types'

interface ProductSearchResult {
  id: number
  name: string
  sku: string
  barcode?: string | null
  selling_price: number
  cost_price?: number | null
  stock?: number
}

interface PricingCartPanelProps {
  cartItems: CartItemInput[]
  onChangeCartItems: (items: CartItemInput[]) => void
  couponCode: string
  onChangeCouponCode: (code: string) => void
  onValidateCoupon: () => void
  pricingResult?: PricingEngineResult | null
  isSimulating?: boolean
}

export const PricingCartPanel: React.FC<PricingCartPanelProps> = ({
  cartItems,
  onChangeCartItems,
  couponCode,
  onChangeCouponCode,
  onValidateCoupon,
  pricingResult,
  isSimulating,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons'])

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const [barcodeInput, setBarcodeInput] = useState('')
  const [barcodeMsg, setBarcodeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const searchBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Real product search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await productService.list({ search: searchQuery.trim(), per_page: 8 })
        const list = Array.isArray(res) ? res : res.data || []
        setSearchResults(list)
        setShowDropdown(true)
      } catch {
        // Fallback silently
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const addProductToCart = (prod: ProductSearchResult) => {
    const existingIdx = cartItems.findIndex((it) => it.product_id === prod.id)
    if (existingIdx >= 0) {
      const updated = [...cartItems]
      updated[existingIdx].quantity += 1
      onChangeCartItems(updated)
    } else {
      onChangeCartItems([
        ...cartItems,
        {
          product_id: prod.id,
          name: prod.name,
          sku: prod.sku || `SKU-${prod.id}`,
          unit_price: Number(prod.selling_price) || 0,
          cost_price: Number(prod.cost_price) || 0,
          quantity: 1,
          stock: prod.stock,
        },
      ])
    }
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = barcodeInput.trim()
    if (!code) return

    setBarcodeMsg(null)
    try {
      const cartIdx = cartItems.findIndex((it) => it.sku.toLowerCase() === code.toLowerCase())
      if (cartIdx >= 0) {
        const updated = [...cartItems]
        updated[cartIdx].quantity += 1
        onChangeCartItems(updated)
        setBarcodeMsg({ type: 'success', text: `+1 ${updated[cartIdx].name}` })
        setBarcodeInput('')
        return
      }

      const res = await productService.list({ search: code, per_page: 5 })
      const list: ProductSearchResult[] = Array.isArray(res) ? res : res.data || []
      const match = list.find(
        (p) =>
          p.sku?.toLowerCase() === code.toLowerCase() ||
          p.barcode?.toLowerCase() === code.toLowerCase() ||
          p.name.toLowerCase().includes(code.toLowerCase())
      ) || list[0]

      if (match) {
        addProductToCart(match)
        setBarcodeMsg({
          type: 'success',
          text: t('marketing.addedProduct', 'Added: {{name}}', { name: match.name }),
        })
        setBarcodeInput('')
      } else {
        setBarcodeMsg({
          type: 'error',
          text: t('marketing.barcodeNotFound', 'Product not found'),
        })
      }
    } catch {
      setBarcodeMsg({
        type: 'error',
        text: t('marketing.errorSearchingBarcode', 'Error searching barcode'),
      })
    }
  }

  const updateQuantity = (productId: number, delta: number) => {
    onChangeCartItems(
      cartItems.map((item) => {
        if (item.product_id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) }
        }
        return item
      })
    )
  }

  const removeItem = (productId: number) => {
    onChangeCartItems(cartItems.filter((item) => item.product_id !== productId))
  }

  const evaluatedItemsMap = new Map(
    pricingResult?.items.map((it) => [it.product_id, it]) || []
  )

  const totalItemsCount = cartItems.reduce((acc, it) => acc + it.quantity, 0)

  return (
    <div className="space-y-4">
      {/* ── Product Search & Barcode Bar (Clean Standard Form Controls) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Search Product using SearchInput */}
        <div ref={searchBoxRef} className="relative sm:col-span-7">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
            {t('marketing.searchProduct', 'Search Product')}
          </label>
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              if (searchResults.length > 0) setShowDropdown(true)
            }}
            placeholder={t('marketing.searchProductsPlaceholder', 'Search inventory by product name or SKU...')}
            size="md"
          />

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-card border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => addProductToCart(prod)}
                  className="w-full p-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{prod.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      SKU: {prod.sku || 'N/A'} {prod.barcode ? `| Barcode: ${prod.barcode}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-foreground">
                      ${Number(prod.selling_price || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 block font-semibold">
                      {t('marketing.add', '+ Add')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Barcode Input & Scan Button using standard Input & Button */}
        <form onSubmit={handleBarcodeSubmit} className="sm:col-span-5 flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              {t('marketing.barcodeLabel', 'Barcode / SKU')}
            </label>
            <Input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder={t('marketing.barcodePlaceholder', 'Barcode / SKU...')}
              size="md"
              icon={<Barcode size={15} />}
            />
          </div>
          <Button
            type="submit"
            variant="default"
            size="md"
            className="bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold cursor-pointer shrink-0"
          >
            {t('marketing.scan', 'Scan')}
          </Button>
        </form>
      </div>

      {barcodeMsg && (
        <p
          className={`text-xs font-medium flex items-center gap-1.5 ${
            barcodeMsg.type === 'success' ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'
          }`}
        >
          {barcodeMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{barcodeMsg.text}</span>
        </p>
      )}

      {/* ── Cart Items Table (Formatted like DataTable) ── */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-card shadow-2xs">
        {/* Table Header Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {t('marketing.cartItems', 'Cart Items')} (
            {t('marketing.itemsCountSummary', '{{items}} items • {{units}} units', {
              items: cartItems.length,
              units: totalItemsCount,
            })}
            )
          </span>
          {cartItems.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChangeCartItems([])}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-7 px-2 font-semibold cursor-pointer"
            >
              {t('marketing.clearCart', 'Clear Cart')}
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="py-14 text-center text-xs text-muted-foreground">
            {t(
              'marketing.cartEmptyPrompt',
              'Cart is empty. Search products or choose a preset scenario above.'
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {cartItems.map((item) => {
              const engineItem = evaluatedItemsMap.get(item.product_id)
              const hasDiscount = engineItem && engineItem.discount_amount > 0

              return (
                <div
                  key={item.product_id}
                  className="p-3 sm:px-4 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Name and SKU */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-0.5">
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                        {item.sku}
                      </span>
                      <span>•</span>
                      <span>
                        {t('marketing.basePrice', 'Base Price')}: ${item.unit_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper (Clean, Easy to click) */}
                  <div className="inline-flex items-center h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-card shadow-2xs overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, -1)}
                      className="h-full w-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                      title={t('marketing.decreaseQty', 'Decrease quantity')}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-9 text-center font-mono font-semibold text-xs text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, 1)}
                      className="h-full w-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                      title={t('marketing.increaseQty', 'Increase quantity')}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Pricing / Savings */}
                  <div className="text-right w-24 shrink-0">
                    <span className="font-mono font-bold text-foreground text-sm block">
                      ${((engineItem?.final_unit_price ?? item.unit_price) * item.quantity).toFixed(2)}
                    </span>
                    {hasDiscount ? (
                      <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-semibold block">
                        -${engineItem.discount_amount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        {t('marketing.noDiscount', 'No Discount')}
                      </span>
                    )}
                  </div>

                  {/* Delete Item */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shrink-0"
                    title={t('common.delete', 'Remove')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Coupon / Voucher Bar (Integrated & Easy to Use) ── */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="w-56">
            <Input
              type="text"
              value={couponCode}
              onChange={(e) => onChangeCouponCode(e.target.value.toUpperCase())}
              placeholder={t('marketing.couponVoucherCode', 'COUPON / PROMO CODE')}
              size="md"
              icon={<Tag size={14} />}
              className="font-mono font-semibold uppercase"
            />
          </div>
          <Button
            type="button"
            variant="default"
            size="md"
            onClick={onValidateCoupon}
            className="bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold cursor-pointer shrink-0"
          >
            {t('marketing.apply', 'Apply')}
          </Button>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-1">
            <span>{t('marketing.quickTry', 'Try:')}</span>
            <button
              type="button"
              onClick={() => onChangeCouponCode('KHNY2026')}
              className="text-[#0f766e] dark:text-teal-400 hover:underline font-mono font-semibold cursor-pointer"
            >
              KHNY2026
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onChangeCouponCode('VIPHQ15')}
              className="text-[#0f766e] dark:text-teal-400 hover:underline font-mono font-semibold cursor-pointer"
            >
              VIPHQ15
            </button>
          </div>
        </div>

        {pricingResult?.coupon_applied && (
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 shrink-0">
            <CheckCircle2 size={14} />
            {t('marketing.couponAppliedBadge', 'Coupon {{code}}: -${{amount}}', {
              code: pricingResult.coupon_applied.code,
              amount: pricingResult.coupon_applied.discount_amount.toFixed(2),
            })}
          </span>
        )}
      </div>
    </div>
  )
}

export default PricingCartPanel
