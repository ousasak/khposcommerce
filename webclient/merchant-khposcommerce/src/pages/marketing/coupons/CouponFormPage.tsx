import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Ticket,
  Percent,
  CreditCard,
  Calendar,
  Sparkles,
  Loader2,
  Store,
  Globe,
  Layers,
  DollarSign,
  Tag,
  Copy,
  Check,
} from 'lucide-react'
import { marketingService } from '@/services/marketingService'
import { useToast } from '@/hooks/useToast'
import {
  FormLayout,
  FormContent,
  FormCard,
  FormHeader,
  FormFooter,
  FormField,
  Input,
  ToggleSwitch,
  EnterpriseDateTimePicker,
} from '@/components/common'
import type { Coupon, CouponChannelScope } from './types'

export const CouponFormPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'nav'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const couponId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const toast = useToast()

  // Form states
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<'fixed' | 'percentage' | 'free_shipping'>('percentage')
  const [value, setValue] = useState<number | ''>(15)
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD')
  const [maxDiscountCap, setMaxDiscountCap] = useState('')
  const [minimumAmount, setMinimumAmount] = useState<number | ''>(20)
  const [minimumAmountKhr, setMinimumAmountKhr] = useState('')
  const [channelScope, setChannelScope] = useState<CouponChannelScope>('all')
  const [branchIds, setBranchIds] = useState('all')
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['all'])
  const [customerTargetType, setCustomerTargetType] = useState<
    'all' | 'new_customer_only' | 'vip_tiers' | 'specific_customer'
  >('all')
  const [usageLimit, setUsageLimit] = useState<number | ''>(500)
  const [perCustomerLimit, setPerCustomerLimit] = useState('1')
  const [startsAt, setStartsAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch coupon detail if in edit mode
  const { data: couponDetail, isLoading: isLoadingCoupon } = useQuery({
    queryKey: ['coupon-detail', couponId],
    queryFn: () => (couponId ? marketingService.getCoupon(couponId) : null),
    enabled: isEdit && !isNaN(couponId as number),
  })

  // Populate data when editing
  useEffect(() => {
    if (couponDetail) {
      setName(couponDetail.name || '')
      setCode(couponDetail.code || '')
      setType(couponDetail.type || 'percentage')
      setValue(couponDetail.value !== undefined ? couponDetail.value : 15)
      setCurrency(couponDetail.currency || 'USD')
      setMaxDiscountCap(couponDetail.max_discount_cap ? String(couponDetail.max_discount_cap) : '')
      setMinimumAmount(couponDetail.minimum_amount !== undefined ? couponDetail.minimum_amount : '')
      setMinimumAmountKhr(couponDetail.minimum_amount_khr ? String(couponDetail.minimum_amount_khr) : '')
      setChannelScope(couponDetail.channel_scope || 'all')
      setBranchIds(
        typeof couponDetail.branch_ids === 'string'
          ? couponDetail.branch_ids
          : couponDetail.branch_ids?.[0]?.toString() || 'all'
      )
      setPaymentMethods(couponDetail.payment_methods || ['all'])
      setCustomerTargetType(couponDetail.customer_target_type || 'all')
      setUsageLimit(couponDetail.usage_limit !== undefined ? couponDetail.usage_limit : '')
      setPerCustomerLimit(couponDetail.per_customer_limit ? String(couponDetail.per_customer_limit) : '1')
      setStartsAt(couponDetail.starts_at || '')
      setExpiresAt(couponDetail.expires_at || '')
      setIsActive(couponDetail.is_active ?? true)
    }
  }, [couponDetail])

  // Populate data when duplicating
  useEffect(() => {
    if (location.state?.duplicateFrom && !isEdit) {
      const d = location.state.duplicateFrom
      setName(`${d.name || ''} (Copy)`)
      setCode(`${d.code || 'PROMO'}_COPY`)
      setType(d.type || 'percentage')
      setValue(d.value !== undefined ? d.value : 15)
      setCurrency(d.currency || 'USD')
      setMaxDiscountCap(d.max_discount_cap ? String(d.max_discount_cap) : '')
      setMinimumAmount(d.minimum_amount !== undefined ? d.minimum_amount : '')
      setMinimumAmountKhr(d.minimum_amount_khr ? String(d.minimum_amount_khr) : '')
      setChannelScope(d.channel_scope || 'all')
      setPaymentMethods(d.payment_methods || ['all'])
      setCustomerTargetType(d.customer_target_type || 'all')
      setUsageLimit(d.usage_limit !== undefined ? d.usage_limit : '')
      setIsActive(true)
    }
  }, [location.state, isEdit])

  // Auto Generate Coupon Code
  const handleGenerateCode = async () => {
    setGenerating(true)
    try {
      const res = await marketingService.generateCouponCode()
      setCode(res?.code || `PROMO${Math.floor(1000 + Math.random() * 9000)}`)
      toast.success(t('marketing.generatedCodeSuccess', 'បង្កើតកូដប័ណ្ណជោគជ័យ!'))
    } catch {
      setCode(`PROMO${Math.floor(1000 + Math.random() * 9000)}`)
    } finally {
      setGenerating(false)
    }
  }

  // Handle USD Min Spend change and auto compute KHR
  const handleMinSpendUsdChange = (val: string) => {
    const num = val ? parseFloat(val) : ''
    setMinimumAmount(num)
    if (num && !isNaN(num as number)) {
      setMinimumAmountKhr(Math.round((num as number) * 4100).toString())
    } else if (!val) {
      setMinimumAmountKhr('')
    }
  }

  // Toggle payment methods
  const togglePaymentMethod = (method: string) => {
    if (method === 'all') {
      setPaymentMethods(['all'])
      return
    }
    const current = paymentMethods.filter((m) => m !== 'all')
    if (current.includes(method)) {
      const next = current.filter((m) => m !== method)
      setPaymentMethods(next.length === 0 ? ['all'] : next)
    } else {
      setPaymentMethods([...current, method])
    }
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => marketingService.createCoupon(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] })
      toast.success(t('marketing.couponCreatedSuccess', 'បានបង្កើតប័ណ្ណបញ្ចុះតម្លៃថ្មីដោយជោគជ័យ។'))
      navigate('/marketing/coupons')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || t('marketing.failedCreateCoupon', 'បរាជ័យក្នុងការបង្កើតប័ណ្ណ។')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => marketingService.updateCoupon(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] })
      qc.invalidateQueries({ queryKey: ['coupon-detail', couponId] })
      toast.success(t('marketing.couponUpdatedSuccess', 'បានកែប្រែប័ណ្ណបញ្ចុះតម្លៃដោយជោគជ័យ។'))
      navigate('/marketing/coupons')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || t('marketing.failedUpdateCoupon', 'បរាជ័យក្នុងការកែប្រែប័ណ្ណ។')),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = t('marketing.validationNameRequired', 'សូមបញ្ចូលឈ្មោះយុទ្ធនាការ / ប័ណ្ណ')
    }
    if (!code.trim()) {
      newErrors.code = t('marketing.validationCodeRequired', 'សូមបញ្ចូលកូដប័ណ្ណ')
    }
    if (type !== 'free_shipping' && (value === '' || Number(value) <= 0)) {
      newErrors.value = t('marketing.validationValueRequired', 'សូមបញ្ចូលតម្លៃបញ្ចុះឱ្យបានត្រឹមត្រូវ')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error(t('marketing.checkFormErrors', 'សូមពិនិត្យព័ត៌មានដែលខ្វះខាតក្នុងទម្រង់។'))
      return
    }

    setErrors({})

    const payload: Partial<Coupon> = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      value: type === 'free_shipping' ? 0 : Number(value) || 0,
      currency,
      max_discount_cap: maxDiscountCap ? parseFloat(maxDiscountCap) : undefined,
      minimum_amount: minimumAmount !== '' ? Number(minimumAmount) : 0,
      minimum_amount_khr: minimumAmountKhr ? parseInt(minimumAmountKhr, 10) : undefined,
      channel_scope: channelScope,
      branch_ids: branchIds === 'all' ? 'all' : [parseInt(branchIds, 10)],
      payment_methods: paymentMethods,
      customer_target_type: customerTargetType,
      usage_limit: usageLimit !== '' ? Number(usageLimit) : undefined,
      per_customer_limit: perCustomerLimit ? parseInt(perCustomerLimit, 10) : 1,
      starts_at: startsAt || undefined,
      expires_at: expiresAt || undefined,
      is_active: isActive,
    }

    if (isEdit && couponId) {
      updateMutation.mutate({ id: couponId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const selectCls =
    'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer shadow-2xs'

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isLoading={isLoadingCoupon}
      isSubmitting={isSubmitting}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? t('marketing.editCoupon', 'កែប្រែប័ណ្ណបញ្ចុះតម្លៃ')
              : t('marketing.createCouponTitle', 'បង្កើតប័ណ្ណបញ្ចុះតម្លៃថ្មី')
          }
          subtitle={t(
            'marketing.couponFormSubtitle',
            'កំណត់កូដប័ណ្ណ វិសាលភាពបណ្តាញលក់ កាលបរិច្ឆេទ និងកម្រិតប្រើប្រាស់'
          )}
          breadcrumbs={[
            { label: t('nav.marketing', 'Marketing'), path: '/marketing/promotions' },
            { label: t('marketing.coupons', 'Coupons & Vouchers'), path: '/marketing/coupons' },
            {
              label: isEdit ? t('common.edit', 'កែប្រែ') : t('common.create', 'បង្កើតថ្មី'),
            },
          ]}
          statusBadge={
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
                }`}
              />
              {isActive ? t('common.active', 'សកម្ម') : t('common.inactive', 'អសកម្ម')}
            </span>
          }
          backPath="/marketing/coupons"
          backLabel={t('common.back', 'ត្រឡប់ក្រោយ')}
        />
      }
      footer={
        <FormFooter
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/marketing/coupons')}
          cancelPath="/marketing/coupons"
          cancelLabel={t('common.cancel', 'បោះបង់')}
          submitLabel={
            isEdit
              ? t('common.saveChanges', 'រក្សាទុកការផ្លាស់ប្តូរ')
              : t('marketing.createCoupon', 'បង្កើតប័ណ្ណថ្មី')
          }
        />
      }
    >
      <FormContent maxWidth="full" layout="two-column">
        {/* ─── LEFT COLUMN (8 cols): Main Coupon Configuration ─── */}
        <div className="lg:col-span-8 space-y-6">
          {/* CARD 1: GENERAL INFORMATION & CHANNEL */}
          <FormCard
            title={t('marketing.sectionBasic', 'ព័ត៌មានទូទៅ & បណ្តាញលក់')}
            subtitle={t(
              'marketing.sectionBasicDesc',
              'កំណត់ឈ្មោះយុទ្ធនាការ កូដប័ណ្ណ វិសាលភាពបណ្តាញ និងសាខាអនុវត្ត'
            )}
            contentClassName="space-y-5"
          >
            {/* Voucher Campaign Name */}
            <FormField
              label={t('marketing.couponCampaign', 'ឈ្មោះយុទ្ធនាការ / ប័ណ្ណ')}
              required
              error={errors.name}
            >
              <Input
                name="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                }}
                placeholder={t('marketing.namePlaceholder', 'ឧ. ប័ណ្ណបញ្ចុះតម្លៃពិសេសអតិថិជនថ្មី')}
                error={errors.name}
              />
            </FormField>

            {/* Coupon Code with Auto Gen */}
            <FormField
              label={t('marketing.couponCode', 'កូដប័ណ្ណ')}
              required
              error={errors.code}
            >
              <div className="flex gap-2">
                <Input
                  name="code"
                  required
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    if (errors.code) setErrors((prev) => ({ ...prev, code: '' }))
                  }}
                  placeholder="WELCOME2026"
                  className="font-mono uppercase font-bold text-sm tracking-wider"
                  error={errors.code}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="h-10 min-h-[40px] px-3.5 bg-muted hover:bg-muted/80 text-foreground border border-border/80 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  title={t('marketing.generateCode', 'បង្កើតកូដស្វ័យប្រវត្តិ')}
                >
                  {generating ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : (
                    <Sparkles size={14} className="text-amber-500" />
                  )}
                  <span>{t('marketing.generateCode', 'បង្កើតកូដ')}</span>
                </button>
              </div>
            </FormField>

            {/* Sales Channel Scope */}
            <FormField
              label={t('marketing.channelScope', 'វិសាលភាពបណ្តាញលក់')}
              required
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setChannelScope('all')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    channelScope === 'all'
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-2xs'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Layers size={14} className="text-emerald-600" />
                    <span>Omni-Channel</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {t('marketing.omniDesc', 'ទាំង POS ក្នុងហាង & Storefront Web')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannelScope('pos_only')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    channelScope === 'pos_only'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500 shadow-2xs'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Store size={14} className="text-amber-600" />
                    <span>POS Only</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {t('marketing.posDesc', 'បញ្ជរបេឡាក្នុងហាងប៉ុណ្ណោះ')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannelScope('storefront_only')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    channelScope === 'storefront_only'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-1 ring-purple-500 shadow-2xs'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Globe size={14} className="text-purple-600" />
                    <span>Storefront Only</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {t('marketing.webDesc', 'គេហទំព័រលក់ E-Commerce')}
                  </span>
                </button>
              </div>
            </FormField>

            {/* Target Branches */}
            <FormField label={t('marketing.targetBranches', 'សាខាអនុវត្ត')}>
              <select
                value={branchIds}
                onChange={(e) => setBranchIds(e.target.value)}
                className={selectCls}
              >
                <option value="all">{t('marketing.allBranchesNationwide', 'គ្រប់សាខាទូទាំងប្រទេស')}</option>
                <option value="1">Phnom Penh Main HQ</option>
                <option value="2">Toul Kork Branch</option>
                <option value="3">Siem Reap City Branch</option>
                <option value="4">Battambang Branch</option>
              </select>
            </FormField>
          </FormCard>

          {/* CARD 2: DISCOUNT TYPE & REWARD VALUE */}
          <FormCard
            title={t('marketing.sectionDiscount', 'ប្រភេទបញ្ចុះតម្លៃ & តម្លៃ')}
            subtitle={t(
              'marketing.sectionDiscountDesc',
              'ជ្រើសរើសទម្រង់បញ្ចុះតម្លៃ តម្លៃផ្ដល់ជូន និងកំណត់កម្រិតអតិបរមា'
            )}
            contentClassName="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t('marketing.discountType', 'ប្រភេទបញ្ចុះតម្លៃ')}
                required
              >
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className={selectCls}
                >
                  <option value="percentage">{t('marketing.percentageDiscount', 'ភាគរយ (% OFF)')}</option>
                  <option value="fixed">{t('marketing.fixedDiscount', 'ចំនួនទឹកប្រាក់ ($ ឬ ៛)')}</option>
                  <option value="free_shipping">{t('marketing.freeShipping', 'ដឹកជញ្ជូនឥតគិតថ្លៃ')}</option>
                </select>
              </FormField>

              <FormField label={t('marketing.currencyFormat', 'រូបិយប័ណ្ណ')}>
                <select
                  value={currency}
                  onChange={(e: any) => setCurrency(e.target.value)}
                  className={selectCls}
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛ ខ្មែរ)</option>
                </select>
              </FormField>
            </div>

            {/* Discount Value Inputs */}
            {type !== 'free_shipping' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/80">
                <FormField
                  label={
                    type === 'percentage'
                      ? t('marketing.discountPercentage', 'ភាគរយបញ្ចុះ (%)')
                      : t('marketing.discountAmount', 'តម្លៃទឹកប្រាក់បញ្ចុះ')
                  }
                  required
                  error={errors.value}
                >
                  <div className="relative">
                    <Input
                      type="number"
                      required
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value ? parseFloat(e.target.value) : '')
                        if (errors.value) setErrors((prev) => ({ ...prev, value: '' }))
                      }}
                      placeholder="15"
                      className="font-mono font-bold text-sm pr-9"
                      error={errors.value}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      {type === 'percentage' ? (
                        <Percent size={15} />
                      ) : currency === 'KHR' ? (
                        <span className="text-xs font-bold">៛</span>
                      ) : (
                        <DollarSign size={15} />
                      )}
                    </div>
                  </div>
                </FormField>

                {type === 'percentage' && (
                  <FormField label={t('marketing.maxDiscountCap', 'បញ្ចុះអតិបរមា ($ USD)')}>
                    <Input
                      type="number"
                      value={maxDiscountCap}
                      onChange={(e) => setMaxDiscountCap(e.target.value)}
                      placeholder="ឧ. 10.00 (កំណត់កម្រិតសុវត្ថិភាព)"
                      className="font-mono text-xs"
                    />
                  </FormField>
                )}
              </div>
            )}
          </FormCard>

          {/* CARD 3: CONDITIONS & PAYMENT METHODS */}
          <FormCard
            title={t('marketing.sectionConditions', 'លក្ខខណ្ឌ & វិធីសាស្ត្រទូទាត់')}
            subtitle={t(
              'marketing.sectionConditionsDesc',
              'លក្ខខណ្ឌចំណាយអប្បបរមា ក្រុមអតិថិជន និងការកំណត់ការទូទាត់'
            )}
            contentClassName="space-y-6"
          >
            {/* Minimum Spend Thresholds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('marketing.minSpendUsd', 'ទិញអប្បបរមា ($ USD)')}>
                <div className="relative">
                  <Input
                    type="number"
                    value={minimumAmount}
                    onChange={(e) => handleMinSpendUsdChange(e.target.value)}
                    placeholder="0.00"
                    className="font-mono text-xs pr-8"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xs font-bold">
                    $
                  </div>
                </div>
              </FormField>

              <FormField label={t('marketing.minSpendKhr', 'ទិញអប្បបរមា (៛ KHR)')}>
                <div className="relative">
                  <Input
                    type="number"
                    value={minimumAmountKhr}
                    onChange={(e) => setMinimumAmountKhr(e.target.value)}
                    placeholder="0"
                    className="font-mono text-xs pr-8"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xs font-bold">
                    ៛
                  </div>
                </div>
              </FormField>
            </div>

            {/* Target Customer Group */}
            <FormField label={t('marketing.targetCustomerGroup', 'ក្រុមអតិថិជនគោលដៅ')}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'all', label: 'អតិថិជនទាំងអស់' },
                  { id: 'new_customer_only', label: 'អតិថិជនថ្មី (លើកទី១)' },
                  { id: 'vip_tiers', label: 'សមាជិក VIP ប៉ុណ្ណោះ' },
                ].map((target) => {
                  const isSelected = customerTargetType === target.id
                  return (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setCustomerTargetType(target.id as any)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-2xs'
                          : 'border-border/80 bg-card text-foreground/80 hover:bg-muted/50 hover:border-border'
                      }`}
                    >
                      <span>{target.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </FormField>

            {/* Payment Method Restrictions */}
            <FormField
              label={t('marketing.paymentRestriction', 'កំណត់លើវិធីសាស្ត្រទូទាត់')}
              action={
                <span className="text-[10px] text-muted-foreground">
                  មិនទាមទារ (Optional)
                </span>
              }
            >
              <div className="flex flex-wrap gap-2 pt-0.5">
                {[
                  { id: 'all', label: 'គ្រប់វិធីទូទាត់ទាំងអស់' },
                  { id: 'khqr_bakong', label: 'Bakong KHQR' },
                  { id: 'aba_pay', label: 'ABA PAY' },
                  { id: 'wing', label: 'Wing Bank' },
                  { id: 'cash', label: 'សាច់ប្រាក់នៅបញ្ជរ' },
                ].map((method) => {
                  const isSelected = paymentMethods.includes(method.id)
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => togglePaymentMethod(method.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                          : 'bg-card text-foreground/80 border-border/80 hover:bg-muted/50 hover:text-foreground hover:border-border'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={2.5} />}
                      <span>{method.label}</span>
                    </button>
                  )
                })}
              </div>
            </FormField>
          </FormCard>
        </div>

        {/* ─── RIGHT COLUMN (4 cols): Schedule, Limits & Live Preview ─── */}
        <div className="lg:col-span-4 space-y-6">
          {/* CARD 4: STATUS & SCHEDULE */}
          <FormCard
            title={t('marketing.sectionSchedule', 'ស្ថានភាព & កាលបរិច្ឆេទ')}
            subtitle={t('marketing.sectionScheduleDesc', 'គ្រប់គ្រងពេលវេលាដំណើរការប័ណ្ណ')}
            contentClassName="space-y-4"
          >
            {/* Active Status */}
            <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-border/80">
              <div>
                <p className="text-xs font-bold text-foreground">
                  {t('marketing.voucherStatus', 'ស្ថានភាពប័ណ្ណ')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isActive ? t('common.active', 'សកម្ម') : t('common.inactive', 'អសកម្ម')}
                </p>
              </div>
              <ToggleSwitch checked={isActive} onChange={setIsActive} />
            </div>

            {/* Starts At */}
            <EnterpriseDateTimePicker
              label={t('marketing.startsAt', 'កាលបរិច្ឆេទចាប់ផ្តើម')}
              value={startsAt}
              onChange={setStartsAt}
              outputFormat="YYYY-MM-DDTHH:mm"
            />

            {/* Expires At */}
            <EnterpriseDateTimePicker
              label={t('marketing.expiresAt', 'ថ្ងៃ និងម៉ោងផុតកំណត់')}
              value={expiresAt}
              onChange={setExpiresAt}
              outputFormat="YYYY-MM-DDTHH:mm"
            />
          </FormCard>

          {/* CARD 5: USAGE LIMITS */}
          <FormCard
            title={t('marketing.sectionLimits', 'កម្រិតនៃការប្រើប្រាស់')}
            subtitle={t('marketing.sectionLimitsDesc', 'ចំនួនដងប្រើប្រាស់អតិបរមា')}
            contentClassName="space-y-4"
          >
            <FormField
              label={t('marketing.totalUsageLimit', 'ចំនួនប្រើប្រាស់សរុប')}
            >
              <Input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="ឧ. 500 (គ្មានកំណត់)"
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                ទុកទំនេរប្រសិនបើគ្មានកំណត់
              </span>
            </FormField>

            <FormField
              label={t('marketing.limitPerCustomer', 'ចំនួនដងក្នុងម្នាក់')}
            >
              <Input
                type="number"
                value={perCustomerLimit}
                onChange={(e) => setPerCustomerLimit(e.target.value)}
                placeholder="1"
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                ចំនួនដងក្នុងអតិថិជនម្នាក់ ឬលេខទូរស័ព្ទ
              </span>
            </FormField>
          </FormCard>

          {/* CARD 6: LIVE VOUCHER CARD PREVIEW */}
          <FormCard
            title={t('marketing.voucherPreview', 'ផ្ទាំងគំរូប័ណ្ណផ្ទាល់')}
            subtitle={t('marketing.voucherPreviewDesc', 'រូបរាងប័ណ្ណដែលបង្ហាញដល់អតិថិជន')}
            contentClassName="p-4"
          >
            <div className="relative rounded-2xl p-4 bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-sky-500/10 border border-teal-500/30 overflow-hidden shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Ticket size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground line-clamp-1">
                      {name || t('marketing.untitledCoupon', 'ឈ្មោះប័ណ្ណបញ្ចុះតម្លៃ')}
                    </p>
                    <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                      {channelScope === 'pos_only'
                        ? 'POS Only'
                        : channelScope === 'storefront_only'
                        ? 'Web Storefront'
                        : 'Omni-Channel'}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-teal-700 dark:text-teal-400">
                  {type === 'percentage'
                    ? `${value || 0}% OFF`
                    : type === 'fixed'
                    ? `$${Number(value || 0).toFixed(2)}`
                    : 'FREE SHIP'}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-teal-500/20 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-500/15 px-2.5 py-1 rounded-md border border-teal-500/30">
                  <span>{code || 'PROMOCODE'}</span>
                  <Copy size={11} className="opacity-70" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {expiresAt
                      ? new Date(expiresAt).toLocaleDateString()
                      : t('marketing.noExpiry', 'គ្មានកំណត់')}
                  </span>
                </div>
              </div>
            </div>
          </FormCard>
        </div>
      </FormContent>
    </FormLayout>
  )
}

export default CouponFormPage
