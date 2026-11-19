import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RotateCcw, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader, HeaderActionsGroup } from '@/components/common'
import { Button } from '@/components/ui/button'
import { marketingService } from '@/services/marketingService'
import { PricingScenarioPresets, type ScenarioPresetConfig } from './PricingScenarioPresets'
import { PricingEnvironmentPanel } from './PricingEnvironmentPanel'
import { PricingCartPanel } from './PricingCartPanel'
import { PricingBreakdownPanel } from './PricingBreakdownPanel'
import { PricingReceiptPreview } from './PricingReceiptPreview'
import { PricingRuleInspector } from './PricingRuleInspector'
import type { CartItemInput, PricingEngineResult } from '../../promotions/types'

const DEFAULT_SAMPLE_ITEMS: CartItemInput[] = [
  {
    product_id: 1,
    name: 'Apple iPhone 15 Pro Max',
    sku: 'SKU-APL-IP15PM',
    unit_price: 1199.0,
    cost_price: 950.0,
    quantity: 1,
  },
  {
    product_id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SKU-SAM-S24U',
    unit_price: 1099.0,
    cost_price: 850.0,
    quantity: 1,
  },
  {
    product_id: 3,
    name: 'Magnetic Silicone Case (Accessory)',
    sku: 'SKU-ACC-CASE',
    unit_price: 25.0,
    cost_price: 10.0,
    quantity: 2,
  },
]

export const PricingSimulatorSection: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'buttons'])

  // Simulation Context
  const [branchId, setBranchId] = useState<number>(1)
  const [channel, setChannel] = useState<'pos' | 'web' | 'mobile'>('pos')
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [customerGroupId, setCustomerGroupId] = useState<number | null>(null)
  const [simulatedAt, setSimulatedAt] = useState<string>(() => new Date().toISOString().slice(0, 16))
  const [taxRate, setTaxRate] = useState<number>(0.0)
  const [exchangeRate, setExchangeRate] = useState<number>(4100.0)

  // Cart & Coupon
  const [cartItems, setCartItems] = useState<CartItemInput[]>(DEFAULT_SAMPLE_ITEMS)
  const [couponCode, setCouponCode] = useState<string>('KHNY2026')
  const [activePresetId, setActivePresetId] = useState<string | null>(null)

  // Diagnostics & Results
  const [pricingResult, setPricingResult] = useState<PricingEngineResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [rightTab, setRightTab] = useState<'diagnostics' | 'receipt'>('diagnostics')

  const lastRequestTimestamp = useRef<number>(0)

  const runSimulation = useCallback(async () => {
    const currentTimestamp = Date.now()
    lastRequestTimestamp.current = currentTimestamp

    setIsLoading(true)
    setErrorMsg(null)

    try {
      const payload = {
        company_id: 1,
        branch_id: branchId,
        channel: channel,
        customer_id: customerId ?? undefined,
        customer_group_id: customerGroupId ?? undefined,
        simulated_at: simulatedAt ? new Date(simulatedAt).toISOString() : undefined,
        exchange_rate: exchangeRate,
        tax_rate: taxRate,
        coupon_code: couponCode.trim() || undefined,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      }

      const response = await marketingService.calculatePricing(payload)

      if (lastRequestTimestamp.current === currentTimestamp) {
        if (response && response.summary) {
          setPricingResult(response)
          if (response.currency?.exchange_rate) {
            setExchangeRate(response.currency.exchange_rate)
          }
        } else {
          setPricingResult(null)
        }
      }
    } catch (err: any) {
      if (lastRequestTimestamp.current === currentTimestamp) {
        setErrorMsg(err?.response?.data?.message || err.message || 'Pricing Engine evaluation error')
      }
    } finally {
      if (lastRequestTimestamp.current === currentTimestamp) {
        setIsLoading(false)
      }
    }
  }, [branchId, channel, customerId, customerGroupId, simulatedAt, exchangeRate, taxRate, couponCode, cartItems])

  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation()
    }, 150)
    return () => clearTimeout(timer)
  }, [runSimulation])

  const handleSelectPreset = (preset: ScenarioPresetConfig) => {
    setActivePresetId(preset.id)
    setBranchId(preset.branchId)
    setChannel(preset.channel)
    setCouponCode(preset.couponCode)
    setCartItems(preset.items)
    setSimulatedAt(preset.simulatedAt)
    setCustomerId(preset.customerId)
    setCustomerGroupId(preset.customerGroupId)
  }

  const handleQuickFixDiagnostic = (reasonCode: string) => {
    setActivePresetId(null)
    switch (reasonCode) {
      case 'customer_group_mismatch':
      case 'customer_mismatch':
        setCustomerGroupId(2) // Switch to VIP Gold Tier
        break
      case 'branch_restriction':
        setBranchId(1) // Switch to Phnom Penh Flagship (HQ)
        break
      case 'channel_mismatch':
        setChannel('pos')
        break
      case 'promotion_expired':
      case 'promotion_not_started':
        setSimulatedAt(new Date().toISOString().slice(0, 16))
        break
      case 'bogo_criteria_unmet':
        // Ensure at least 2 Phone Cases in cart
        setCartItems((prev) => {
          const caseIdx = prev.findIndex((it) => it.product_id === 3 || it.name.toLowerCase().includes('case'))
          if (caseIdx >= 0) {
            const next = [...prev]
            next[caseIdx].quantity = Math.max(next[caseIdx].quantity, 2)
            return next
          }
          return [
            ...prev,
            {
              product_id: 3,
              name: 'Magnetic Silicone Case (Accessory)',
              sku: 'SKU-ACC-CASE',
              unit_price: 25.0,
              cost_price: 10.0,
              quantity: 2,
            },
          ]
        })
        break
      case 'bogo_get_item_missing':
        // Add Free Screen Protector to cart
        setCartItems((prev) => {
          if (prev.some((it) => it.product_id === 4 || it.name.toLowerCase().includes('screen'))) {
            return prev
          }
          return [
            ...prev,
            {
              product_id: 4,
              name: 'Tempered Glass Screen Protector',
              sku: 'SKU-ACC-SCREEN',
              unit_price: 15.0,
              cost_price: 4.0,
              quantity: 1,
            },
          ]
        })
        break
      case 'min_subtotal_not_met':
        // Add more quantities to reach min spend
        setCartItems((prev) => {
          if (prev.length === 0) return prev
          const next = [...prev]
          next[0].quantity = Math.max(next[0].quantity + 1, 2)
          return next
        })
        break
      case 'coupon_invalid':
        setCouponCode('KHNY2026')
        break
      default:
        break
    }
  }

  const handleResetSimulation = () => {
    setActivePresetId(null)
    setBranchId(1)
    setChannel('pos')
    setCustomerId(null)
    setCustomerGroupId(null)
    setSimulatedAt(new Date().toISOString().slice(0, 16))
    setTaxRate(0.0)
    setExchangeRate(4100.0)
    setCouponCode('')
    setCartItems(DEFAULT_SAMPLE_ITEMS)
  }

  const handleExportJson = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      simulation_context: {
        branch_id: branchId,
        channel: channel,
        customer_id: customerId,
        customer_group_id: customerGroupId,
        simulated_at: simulatedAt,
        tax_rate: taxRate,
        exchange_rate: exchangeRate,
        coupon_code: couponCode,
      },
      cart_inputs: cartItems,
      engine_results: pricingResult,
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute(
      'download',
      `pricing-simulation-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const branchName =
    branchId === 1
      ? t('marketing.branchHqFallback', 'Phnom Penh Flagship (HQ)')
      : branchId === 3
      ? t('marketing.branchSrFallback', 'Siem Reap Heritage Branch')
      : t('marketing.branchKcFallback', 'Kampong Cham Branch')

  return (
    <div className="space-y-5">
      {/* ── Top PageHeader with HeaderActionsGroup (100% Matching Other Pages) ── */}
      <PageHeader
        title={t('marketing.pricingSimulatorTitle', 'Central Pricing Engine Simulator')}
        subtitle={t(
          'marketing.pricingSimulatorSubtitle',
          'Test real-time discount calculations, verify stacking rules, branch scope, channel validation, and vouchers before launch.'
        )}
        action={
          <HeaderActionsGroup>
            {/* 1. កំណត់ឡើងវិញ (Reset) */}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleResetSimulation}
              className="font-semibold cursor-pointer gap-2"
              title={t('marketing.resetSimulation', 'Reset')}
            >
              <RotateCcw size={15} />
              <span>{t('marketing.resetSimulation', 'Reset')}</span>
            </Button>

            {/* 2. នាំចេញ JSON (Export JSON) */}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleExportJson}
              className="font-semibold cursor-pointer gap-2"
              title={t('marketing.exportJson', 'Export JSON')}
            >
              <Download size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>{t('marketing.exportJson', 'Export JSON')}</span>
            </Button>
          </HeaderActionsGroup>
        }
      />

      {/* ── 2-Column Responsive Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Configuration & Cart (8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Section: Configuration & Presets (Integrated together) */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('marketing.simulationContextScope', 'Simulation Context & Scope')}
              </h3>
            </div>

            {/* Quick Presets Selector directly inside context */}
            <PricingScenarioPresets activePresetId={activePresetId} onSelectPreset={handleSelectPreset} />

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <PricingEnvironmentPanel
                branchId={branchId}
                onChangeBranchId={(id) => {
                  setActivePresetId(null)
                  setBranchId(id)
                }}
                channel={channel}
                onChangeChannel={(ch) => {
                  setActivePresetId(null)
                  setChannel(ch)
                }}
                customerId={customerId}
                onChangeCustomerId={(id) => {
                  setActivePresetId(null)
                  setCustomerId(id)
                }}
                customerGroupId={customerGroupId}
                onChangeCustomerGroupId={(id) => {
                  setActivePresetId(null)
                  setCustomerGroupId(id)
                }}
                simulatedAt={simulatedAt}
                onChangeSimulatedAt={(dt) => {
                  setActivePresetId(null)
                  setSimulatedAt(dt)
                }}
                taxRate={taxRate}
                onChangeTaxRate={(rate) => setTaxRate(rate)}
                exchangeRate={exchangeRate}
                onChangeExchangeRate={(rate) => setExchangeRate(rate)}
              />
            </div>
          </div>

          {/* Section: Cart & Products */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('marketing.cartItemsAndProducts', 'Cart Items & Products')}
              </h3>
            </div>
            <PricingCartPanel
              cartItems={cartItems}
              onChangeCartItems={(items) => {
                setActivePresetId(null)
                setCartItems(items)
              }}
              couponCode={couponCode}
              onChangeCouponCode={(code) => {
                setActivePresetId(null)
                setCouponCode(code)
              }}
              onValidateCoupon={runSimulation}
              pricingResult={pricingResult}
              isSimulating={isLoading}
            />
          </div>
        </div>

        {/* Right Column: Sticky Summary & Diagnostics (4 cols on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* Summary Totals & Margin */}
          <PricingBreakdownPanel
            pricingResult={pricingResult}
            isLoading={isLoading}
            errorMsg={errorMsg}
          />

          {/* Secondary Panel: Diagnostics or Receipt Preview */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs text-xs font-medium w-full h-10">
              <button
                type="button"
                onClick={() => setRightTab('diagnostics')}
                className={`flex-1 h-full rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  rightTab === 'diagnostics'
                    ? 'bg-card text-[#0f766e] dark:text-teal-400 font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-foreground font-semibold'
                }`}
              >
                {t('marketing.ruleDiagnostics', 'Rule Diagnostics')}
              </button>
              <button
                type="button"
                onClick={() => setRightTab('receipt')}
                className={`flex-1 h-full rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  rightTab === 'receipt'
                    ? 'bg-card text-[#0f766e] dark:text-teal-400 font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-foreground font-semibold'
                }`}
              >
                {t('marketing.receiptPreview', 'Receipt Preview')}
              </button>
            </div>

            {rightTab === 'diagnostics' ? (
              <PricingRuleInspector
                pricingResult={pricingResult}
                isLoading={isLoading}
                onQuickFix={handleQuickFixDiagnostic}
              />
            ) : (
              <PricingReceiptPreview
                branchName={branchName}
                channel={channel}
                cartItems={cartItems}
                pricingResult={pricingResult}
                simulatedAt={simulatedAt}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingSimulatorSection
