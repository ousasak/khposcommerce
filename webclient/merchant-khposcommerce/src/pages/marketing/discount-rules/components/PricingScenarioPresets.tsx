import React from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { CartItemInput } from '../../promotions/types'

export interface ScenarioPresetConfig {
  id: string
  title: string
  description?: string
  branchId: number
  channel: 'pos' | 'web' | 'mobile'
  couponCode: string
  simulatedAt: string
  customerId: number | null
  customerGroupId: number | null
  items: CartItemInput[]
}

interface PricingScenarioPresetsProps {
  onSelectPreset: (preset: ScenarioPresetConfig) => void
  activePresetId: string | null
}

export const PricingScenarioPresets: React.FC<PricingScenarioPresetsProps> = ({
  onSelectPreset,
  activePresetId,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const presets: ScenarioPresetConfig[] = [
    {
      id: 'holiday_flash_sale',
      title: t('marketing.presetHolidaySale', 'Holiday Flash Sale'),
      description: t('marketing.presetHolidaySaleDesc', 'Phnom Penh HQ • POS • iPhone + Case • KHNY2026'),
      branchId: 1, // Phnom Penh HQ
      channel: 'pos',
      couponCode: 'KHNY2026',
      simulatedAt: new Date().toISOString().slice(0, 16),
      customerId: null,
      customerGroupId: null,
      items: [
        {
          product_id: 1,
          name: 'Apple iPhone 15 Pro Max',
          sku: 'SKU-APL-IP15PM',
          unit_price: 1199.0,
          cost_price: 950.0,
          quantity: 1,
        },
        {
          product_id: 3,
          name: 'Magnetic Silicone Case (Accessory)',
          sku: 'SKU-ACC-CASE',
          unit_price: 25.0,
          cost_price: 10.0,
          quantity: 1,
        },
      ],
    },
    {
      id: 'vip_bulk_purchase',
      title: t('marketing.presetVipBulk', 'VIP Bulk Purchase'),
      description: t('marketing.presetVipBulkDesc', 'Phnom Penh HQ • POS • VIP Gold Tier • 6 Phones'),
      branchId: 1,
      channel: 'pos',
      couponCode: 'VIPHQ15',
      simulatedAt: new Date().toISOString().slice(0, 16),
      customerId: 1,
      customerGroupId: 2,
      items: [
        {
          product_id: 2,
          name: 'Samsung Galaxy S24 Ultra',
          sku: 'SKU-SAM-S24U',
          unit_price: 1099.0,
          cost_price: 850.0,
          quantity: 6,
        },
      ],
    },
    {
      id: 'bogo_bundle',
      title: t('marketing.presetBogoBundle', 'BOGO Bundle'),
      description: t('marketing.presetBogoBundleDesc', '2 Cases + 1 Screen Protector (Free Item)'),
      branchId: 1,
      channel: 'pos',
      couponCode: '',
      simulatedAt: new Date().toISOString().slice(0, 16),
      customerId: null,
      customerGroupId: null,
      items: [
        {
          product_id: 3,
          name: 'Magnetic Silicone Case (Accessory)',
          sku: 'SKU-ACC-CASE',
          unit_price: 25.0,
          cost_price: 10.0,
          quantity: 2,
        },
        {
          product_id: 4,
          name: 'Tempered Glass Screen Protector',
          sku: 'SKU-ACC-SCREEN',
          unit_price: 15.0,
          cost_price: 4.0,
          quantity: 1,
        },
      ],
    },
    {
      id: 'branch_isolation',
      title: t('marketing.presetBranchIsolation', 'Branch Isolation Test'),
      description: t('marketing.presetBranchIsolationDesc', 'Kampong Cham Branch • Excluded from campaigns'),
      branchId: 2, // Kampong Cham (Excluded)
      channel: 'pos',
      couponCode: 'KHNY2026',
      simulatedAt: new Date().toISOString().slice(0, 16),
      customerId: null,
      customerGroupId: null,
      items: [
        {
          product_id: 1,
          name: 'Apple iPhone 15 Pro Max',
          sku: 'SKU-APL-IP15PM',
          unit_price: 1199.0,
          cost_price: 950.0,
          quantity: 1,
        },
      ],
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <Sparkles size={14} className="text-teal-600 dark:text-teal-400" />
        <span>{t('marketing.quickScenarioPresets', 'Quick Presets')}:</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map((preset) => {
          const isActive = activePresetId === preset.id
          return (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant={isActive ? 'default' : 'outline'}
              onClick={() => onSelectPreset(preset)}
              className={`font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0f766e] hover:bg-[#115e59] text-white border-[#0f766e] shadow-xs'
                  : 'border-slate-300 dark:border-slate-700 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
              title={preset.description}
            >
              {preset.title}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default PricingScenarioPresets
