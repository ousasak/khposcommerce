import React, { useState, useEffect } from 'react'
import { AlertCircle, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModernSelect, Input, type Option } from '@/components/common'
import { companyService } from '@/services/companyService'
import { customerService } from '@/services/customerService'

interface BranchOption {
  id: number
  name: string
  code?: string
  is_active?: boolean
}

interface CustomerOption {
  id: number
  name: string
  phone?: string
  customer_group_id?: number
  customer_group?: { id: number; name: string }
}

interface CustomerGroupOption {
  id: number
  name: string
  discount_percent?: number
}

interface PricingEnvironmentPanelProps {
  branchId: number
  onChangeBranchId: (id: number) => void
  channel: 'pos' | 'web' | 'mobile'
  onChangeChannel: (channel: 'pos' | 'web' | 'mobile') => void
  customerId: number | null
  onChangeCustomerId: (id: number | null) => void
  customerGroupId: number | null
  onChangeCustomerGroupId: (id: number | null) => void
  simulatedAt: string
  onChangeSimulatedAt: (dt: string) => void
  taxRate: number
  onChangeTaxRate: (rate: number) => void
  exchangeRate: number
  onChangeExchangeRate: (rate: number) => void
}

export const PricingEnvironmentPanel: React.FC<PricingEnvironmentPanelProps> = ({
  branchId,
  onChangeBranchId,
  channel,
  onChangeChannel,
  customerId,
  onChangeCustomerId,
  customerGroupId,
  onChangeCustomerGroupId,
  simulatedAt,
  onChangeSimulatedAt,
  taxRate,
  onChangeTaxRate,
  exchangeRate,
  onChangeExchangeRate,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const [branches, setBranches] = useState<BranchOption[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [customerGroups, setCustomerGroups] = useState<CustomerGroupOption[]>([])

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const [branchRes, customerRes, groupRes] = await Promise.allSettled([
          companyService.getBranches(),
          customerService.list({ per_page: 50 }),
          customerService.groups(),
        ])

        if (mounted) {
          if (branchRes.status === 'fulfilled' && branchRes.value) {
            const list = Array.isArray(branchRes.value)
              ? branchRes.value
              : branchRes.value.data || []
            if (list.length > 0) setBranches(list)
          }

          if (customerRes.status === 'fulfilled' && customerRes.value) {
            const list = Array.isArray(customerRes.value)
              ? customerRes.value
              : customerRes.value.data || []
            setCustomers(list)
          }

          if (groupRes.status === 'fulfilled' && groupRes.value) {
            const list = Array.isArray(groupRes.value)
              ? groupRes.value
              : groupRes.value.data || []
            setCustomerGroups(list)
          }
        }
      } catch {
        // Fallback silently
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [])

  const effectiveBranches: BranchOption[] = branches.length > 0
    ? branches
    : [
        { id: 1, name: 'Phnom Penh Flagship (HQ)', code: 'HQ-PP' },
        { id: 3, name: 'Siem Reap Heritage Branch', code: 'BR-SR' },
        { id: 2, name: 'Kampong Cham Branch', code: 'BR-KC' },
      ]

  const selectedBranch = effectiveBranches.find((b) => b.id === branchId)
  const isExcludedBranch = branchId === 2 || selectedBranch?.name.toLowerCase().includes('kampong')

  const resetToCurrentTime = () => {
    onChangeSimulatedAt(new Date().toISOString().slice(0, 16))
  }

  // Branch options for ModernSelect
  const branchOptions: Option[] = effectiveBranches.map((b) => ({
    value: b.id,
    label: `${b.name} ${b.code ? `(${b.code})` : ''}`,
  }))

  // Channel options for ModernSelect
  const channelOptions: Option[] = [
    { value: 'pos', label: t('marketing.channelPosOption', 'POS (In-store Checkout)') },
    { value: 'web', label: t('marketing.channelWebOption', 'Web Storefront') },
    { value: 'mobile', label: t('marketing.channelMobileOption', 'Mobile App') },
  ]

  // Customer options for ModernSelect
  const customerOptions: Option[] = [
    { value: '', label: t('marketing.walkInCustomer', 'Walk-in Customer') },
    ...customers.map((c) => ({
      value: c.id,
      label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`,
    })),
  ]

  // Customer Group options for ModernSelect
  const customerGroupOptions: Option[] = [
    { value: '', label: t('marketing.standardRetailNoTier', 'Standard Retail / No Tier') },
    ...(customerGroups.length > 0
      ? customerGroups.map((g) => ({
          value: g.id,
          label: `${g.name} ${g.discount_percent ? `(${g.discount_percent}%)` : ''}`,
        }))
      : [
          { value: '1', label: t('marketing.regularMember', 'Regular Member') },
          { value: '2', label: t('marketing.vipGoldTier', 'VIP Gold Tier') },
          { value: '3', label: t('marketing.wholesaleMember', 'Wholesale Member') },
        ]),
  ]

  return (
    <div className="space-y-4">
      {/* ── Row 1: Scope & Context Dropdowns (using ModernSelect) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
        {/* Branch Selection */}
        <div>
          <ModernSelect
            label={t('marketing.branchTarget', 'Branch')}
            value={branchId}
            onChange={(val) => onChangeBranchId(Number(val))}
            options={branchOptions}
            size="md"
          />
        </div>

        {/* Channel Selection */}
        <div>
          <ModernSelect
            label={t('marketing.channelScope', 'Sales Channel')}
            value={channel}
            onChange={(val) => onChangeChannel(val as 'pos' | 'web' | 'mobile')}
            options={channelOptions}
            size="md"
          />
        </div>

        {/* Customer Select */}
        <div>
          <ModernSelect
            label={t('marketing.customerContext', 'Customer')}
            value={customerId ?? ''}
            onChange={(val) => {
              const numVal = val ? Number(val) : null
              onChangeCustomerId(numVal)
              if (numVal) {
                const found = customers.find((c) => c.id === numVal)
                if (found?.customer_group_id) {
                  onChangeCustomerGroupId(found.customer_group_id)
                }
              }
            }}
            options={customerOptions}
            size="md"
          />
        </div>

        {/* Customer Group / Tier */}
        <div>
          <ModernSelect
            label={t('marketing.loyaltyTier', 'Loyalty Tier')}
            value={customerGroupId ?? ''}
            onChange={(val) => onChangeCustomerGroupId(val ? Number(val) : null)}
            options={customerGroupOptions}
            size="md"
          />
        </div>
      </div>

      {/* ── Row 2: Simulated Date & Currency Rates ── */}
      <div className="pt-3.5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
        {/* Simulated Datetime */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('marketing.simulatedDateTime', 'Simulated Date & Time')}
            </label>
            <button
              type="button"
              onClick={resetToCurrentTime}
              className="text-xs text-[#0f766e] dark:text-teal-400 hover:underline font-semibold cursor-pointer"
            >
              {t('marketing.resetToNow', 'Current Time')}
            </button>
          </div>
          <Input
            type="datetime-local"
            value={simulatedAt}
            onChange={(e) => onChangeSimulatedAt(e.target.value)}
            size="md"
            icon={<Calendar size={14} />}
          />
        </div>

        {/* Exchange Rate */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            {t('marketing.exchangeRate', 'Exchange Rate')}
          </label>
          <Input
            type="number"
            value={exchangeRate}
            onChange={(e) => onChangeExchangeRate(Number(e.target.value))}
            size="md"
            prefix="1 $ ="
            suffix="KHR"
            placeholder="4100"
          />
        </div>

        {/* Tax Rate */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            {t('marketing.taxRate', 'Tax Rate')}
          </label>
          <Input
            type="number"
            value={taxRate}
            onChange={(e) => onChangeTaxRate(Number(e.target.value))}
            min={0}
            max={100}
            size="md"
            suffix="%"
            placeholder="0"
          />
        </div>
      </div>

      {/* Excluded Branch Alert Banner */}
      {isExcludedBranch && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>
            {t(
              'marketing.branchExcludedNotice',
              'This branch is excluded from active promotion campaigns: all discounts will evaluate to $0.00'
            )}
          </span>
        </div>
      )}
    </div>
  )
}

export default PricingEnvironmentPanel
