import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Ticket,
  Percent,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Loader2,
  Store,
  Globe,
  Layers,
  DollarSign,
  Users,
} from 'lucide-react'
import {
  EnterpriseModal,
  ModalFooter,
  EnterpriseDateTimePicker,
} from '@/components/common'
import type { Coupon, CouponChannelScope } from '../types'

interface CouponFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingCoupon: Coupon | null
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  name: string
  setName: (val: string) => void
  code: string
  setCode: (val: string) => void
  type: 'fixed' | 'percentage' | 'free_shipping'
  setType: (val: 'fixed' | 'percentage' | 'free_shipping') => void
  value: number
  setValue: (val: number) => void
  currency: 'USD' | 'KHR'
  setCurrency: (val: 'USD' | 'KHR') => void
  maxDiscountCap: string
  setMaxDiscountCap: (val: string) => void
  minimumAmount: number | ''
  setMinimumAmount: (val: number | '') => void
  minimumAmountKhr: string
  setMinimumAmountKhr: (val: string) => void
  channelScope: CouponChannelScope
  setChannelScope: (val: CouponChannelScope) => void
  branchIds: string
  setBranchIds: (val: string) => void
  paymentMethods: string[]
  setPaymentMethods: (val: string[]) => void
  customerTargetType: 'all' | 'new_customer_only' | 'vip_tiers' | 'specific_customer'
  setCustomerTargetType: (val: 'all' | 'new_customer_only' | 'vip_tiers' | 'specific_customer') => void
  customerPhone: string
  setCustomerPhone: (val: string) => void
  usageLimit: number | ''
  setUsageLimit: (val: number | '') => void
  perCustomerLimit: string
  setPerCustomerLimit: (val: string) => void
  startsAt: string
  setStartsAt: (val: string) => void
  expiresAt: string
  setExpiresAt: (val: string) => void
  isActive: boolean
  setIsActive: (val: boolean) => void
  generating: boolean
  handleGenerateCode: () => void
}

type ModalTab = 'basic' | 'discount' | 'conditions' | 'limits'

const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:[color-scheme:dark]'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  editingCoupon,
  onSubmit,
  isPending,
  name,
  setName,
  code,
  setCode,
  type,
  setType,
  value,
  setValue,
  currency,
  setCurrency,
  maxDiscountCap,
  setMaxDiscountCap,
  minimumAmount,
  setMinimumAmount,
  minimumAmountKhr,
  setMinimumAmountKhr,
  channelScope,
  setChannelScope,
  branchIds,
  setBranchIds,
  paymentMethods,
  setPaymentMethods,
  customerTargetType,
  setCustomerTargetType,
  customerPhone: _customerPhone,
  setCustomerPhone: _setCustomerPhone,
  usageLimit,
  setUsageLimit,
  perCustomerLimit,
  setPerCustomerLimit,
  startsAt: _startsAt,
  setStartsAt: _setStartsAt,
  expiresAt,
  setExpiresAt,
  isActive,
  setIsActive,
  generating,
  handleGenerateCode,
}) => {
  const { t } = useTranslation(['marketing', 'common'])
  const [activeTab, setActiveTab] = useState<ModalTab>('basic')
  const isEdit = Boolean(editingCoupon)

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

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? t('marketing.editCoupon', 'កែប្រែប័ណ្ណបញ្ចុះតម្លៃ')
          : t('marketing.createCouponTitle', 'បង្កើតប័ណ្ណបញ្ចុះតម្លៃថ្មី')
      }
      subtitle={t(
        'marketing.couponModalSubtitle',
        'កំណត់កូដប័ណ្ណ វិសាលភាពបណ្តាញលក់ កាលបរិច្ឆេទ និងកម្រិតប្រើប្រាស់'
      )}
      icon={<Ticket size={20} />}
      iconVariant="teal"
      size="2xl"
      badge={
        isEdit && editingCoupon?.id ? (
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
            #{editingCoupon.id}
          </span>
        ) : undefined
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'បោះបង់')}
          onSubmit={(e) => onSubmit(e || ({ preventDefault: () => {} } as any))}
          isSubmitting={isPending}
          isEdit={isEdit}
          submitLabel={
            isEdit
              ? t('common.saveChanges', 'រក្សាទុកការផ្លាស់ប្តូរ')
              : t('marketing.createCoupon', 'បង្កើតប័ណ្ណថ្មី')
          }
        />
      }
    >
      <form onSubmit={onSubmit} noValidate className="p-5 sm:p-6 space-y-5">
        {/* ─── Segmented Section Navigator (Employee Form Style) ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-muted/40 dark:bg-slate-800/60 rounded-xl border border-border/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'basic'
                ? 'bg-card dark:bg-slate-900 text-primary shadow-xs border border-border/60 dark:border-slate-700'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Ticket size={13} />
            <span className="truncate">{t('marketing.basicInfo', 'ព័ត៌មានទូទៅ')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discount')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'discount'
                ? 'bg-card dark:bg-slate-900 text-primary shadow-xs border border-border/60 dark:border-slate-700'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Percent size={13} />
            <span className="truncate">{t('marketing.discountValue', 'តម្លៃបញ្ចុះ')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'conditions'
                ? 'bg-card dark:bg-slate-900 text-primary shadow-xs border border-border/60 dark:border-slate-700'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <CreditCard size={13} />
            <span className="truncate">{t('marketing.conditions', 'លក្ខខណ្ឌ')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('limits')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'limits'
                ? 'bg-card dark:bg-slate-900 text-primary shadow-xs border border-border/60 dark:border-slate-700'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <ShieldCheck size={13} />
            <span className="truncate">{t('marketing.usageLimit', 'កម្រិតប្រើប្រាស់')}</span>
          </button>
        </div>

        {/* ─── 1. TAB: Basic & Channels ─── */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* Voucher Campaign Name */}
            <div>
              <label className={labelCls}>
                {t('marketing.couponCampaign', 'ឈ្មោះយុទ្ធនាការ / ប័ណ្ណ')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('marketing.namePlaceholder', 'ឧ. ប័ណ្ណបញ្ចុះតម្លៃពិសេសអតិថិជនថ្មី')}
                className={inputCls}
              />
            </div>

            {/* Coupon Code with Auto Gen */}
            <div>
              <label className={labelCls}>
                {t('marketing.couponCode', 'កូដប័ណ្ណ')} <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME2026"
                  className={`${inputCls} font-mono uppercase font-bold text-sm tracking-wider`}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="h-10 min-h-[40px] px-3.5 bg-muted hover:bg-muted/80 text-foreground border border-border/80 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
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
            </div>

            {/* Channel Scope Selector */}
            <div>
              <label className={labelCls}>
                {t('marketing.channelScope', 'វិសាលភាពបណ្តាញលក់')} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setChannelScope('all')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    channelScope === 'all'
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-2xs'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Layers size={13} className="text-emerald-600" />
                    <span>Omni-Channel</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {t('marketing.omniDesc', 'ទាំង POS ក្នុងហាង & Storefront Web')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannelScope('pos_only')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    channelScope === 'pos_only'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500 shadow-2xs'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Store size={13} className="text-amber-600" />
                    <span>POS Only</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {t('marketing.posDesc', 'បញ្ជរបេឡាក្នុងហាងប៉ុណ្ណោះ')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannelScope('storefront_only')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    channelScope === 'storefront_only'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-1 ring-purple-500 shadow-2xs'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Globe size={13} className="text-purple-600" />
                    <span>Storefront Only</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {t('marketing.webDesc', 'គេហទំព័រលក់ E-Commerce')}
                  </span>
                </button>
              </div>
            </div>

            {/* Target Branches & Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t('marketing.targetBranches', 'សាខាអនុវត្ត')}</label>
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
              </div>

              <div>
                <EnterpriseDateTimePicker
                  label={t('marketing.expiresAt', 'ថ្ងៃ និងម៉ោងផុតកំណត់')}
                  value={expiresAt}
                  onChange={setExpiresAt}
                  outputFormat="YYYY-MM-DDTHH:mm"
                />
              </div>
            </div>

            {/* Voucher Active Status Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-border/80">
              <div>
                <p className="text-xs font-bold text-foreground">
                  {t('marketing.voucherStatus', 'ស្ថានភាពដំណើរការប័ណ្ណ')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t('marketing.voucherStatusDesc', 'បើក ឬផ្អាកការប្រើប្រាស់ប័ណ្ណនេះក្នុងប្រព័ន្ធ')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        )}

        {/* ─── 2. TAB: Discount & Value ─── */}
        {activeTab === 'discount' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  {t('marketing.discountType', 'ប្រភេទបញ្ចុះតម្លៃ')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className={selectCls}
                >
                  <option value="percentage">{t('marketing.percentageDiscount', 'ភាគរយ (% OFF)')}</option>
                  <option value="fixed">{t('marketing.fixedDiscount', 'ចំនួនទឹកប្រាក់ ($ ឬ ៛)')}</option>
                  <option value="free_shipping">{t('marketing.freeShipping', 'ដឹកជញ្ជូនឥតគិតថ្លៃ')}</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>{t('marketing.currencyFormat', 'រូបិយប័ណ្ណ')}</label>
                <select
                  value={currency}
                  onChange={(e: any) => setCurrency(e.target.value)}
                  className={selectCls}
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛ ខ្មែរ)</option>
                </select>
              </div>
            </div>

            {/* Discount Value Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/80">
              <div>
                <label className={labelCls}>
                  {type === 'percentage'
                    ? t('marketing.discountPercentage', 'ភាគរយបញ្ចុះ (%) *')
                    : t('marketing.discountAmount', 'តម្លៃទឹកប្រាក់បញ្ចុះ *')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    placeholder="15"
                    className={`${inputCls} font-mono font-bold text-sm pr-9`}
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
              </div>

              {type === 'percentage' && (
                <div>
                  <label className={labelCls}>{t('marketing.maxDiscountCap', 'បញ្ចុះអតិបរមា ($ USD)')}</label>
                  <input
                    type="number"
                    value={maxDiscountCap}
                    onChange={(e) => setMaxDiscountCap(e.target.value)}
                    placeholder="ឧ. 10.00 (កំណត់កម្រិតសុវត្ថិភាព)"
                    className={`${inputCls} font-mono text-xs`}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 3. TAB: Conditions & Payments ─── */}
        {activeTab === 'conditions' && (
          <div className="space-y-4">
            {/* Minimum Spend Thresholds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t('marketing.minSpendUsd', 'ទិញអប្បបរមា ($ USD)')}</label>
                <input
                  type="number"
                  value={minimumAmount}
                  onChange={(e) => setMinimumAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="ឧ. 20.00"
                  className={`${inputCls} font-mono text-xs`}
                />
              </div>
              <div>
                <label className={labelCls}>{t('marketing.minSpendKhr', 'ទិញអប្បបរមា (៛ KHR)')}</label>
                <input
                  type="number"
                  value={minimumAmountKhr}
                  onChange={(e) => setMinimumAmountKhr(e.target.value)}
                  placeholder="ឧ. 80,000"
                  className={`${inputCls} font-mono text-xs`}
                />
              </div>
            </div>

            {/* Target Customer Group */}
            <div>
              <label className={labelCls}>{t('marketing.targetCustomerGroup', 'ក្រុមអតិថិជនគោលដៅ')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'អតិថិជនទាំងអស់', icon: Users },
                  { id: 'new_customer_only', label: 'អតិថិជនថ្មី (លើកទី១)', icon: Sparkles },
                  { id: 'vip_tiers', label: 'សមាជិក VIP ប៉ុណ្ណោះ', icon: ShieldCheck },
                ].map((target) => {
                  const Icon = target.icon
                  return (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setCustomerTargetType(target.id as any)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-center gap-2 cursor-pointer ${
                        customerTargetType === target.id
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                          : 'border-border/80 bg-card text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span className="truncate">{target.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Payment Method Restrictions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={labelCls}>{t('marketing.paymentRestriction', 'កំណត់លើវិធីសាស្ត្រទូទាត់')}</label>
                <span className="text-[10px] text-muted-foreground">មិនទាមទារ (Optional)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'គ្រប់វិធីទូទាត់ទាំងអស់' },
                  { id: 'khqr_bakong', label: 'Bakong KHQR តែប៉ុណ្ណោះ' },
                  { id: 'aba_pay', label: 'ABA PAY តែប៉ុណ្ណោះ' },
                  { id: 'wing', label: 'Wing Bank' },
                  { id: 'cash', label: 'សាច់ប្រាក់នៅបញ្ជរ' },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      paymentMethods.includes(method.id)
                        ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold shadow-2xs'
                        : 'border-border/80 bg-card text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className="truncate">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. TAB: Usage Limits ─── */}
        {activeTab === 'limits' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t('marketing.totalUsageLimit', 'ចំនួនប្រើប្រាស់សរុបអតិបរមា')}</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="ឧ. 500 (ទុកទំនេរប្រសិនបើគ្មានកំណត់)"
                  className={`${inputCls} font-mono text-xs`}
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  ចំនួនដងប្រើប្រាស់អតិបរមាក្នុងប្រព័ន្ធ
                </span>
              </div>

              <div>
                <label className={labelCls}>{t('marketing.limitPerCustomer', 'ចំនួនដងក្នុងអតិថិជនម្នាក់')}</label>
                <input
                  type="number"
                  value={perCustomerLimit}
                  onChange={(e) => setPerCustomerLimit(e.target.value)}
                  placeholder="1"
                  className={`${inputCls} font-mono text-xs`}
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  កំណត់ចំនួនដងក្នុងម្នាក់ ឬក្នុងលេខទូរស័ព្ទ
                </span>
              </div>
            </div>
          </div>
        )}
      </form>
    </EnterpriseModal>
  )
}

export default CouponFormModal
