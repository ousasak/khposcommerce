import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CreditCard,
  Lock,
  Sparkles,
  Store,
  Globe,
  Settings2,
  DollarSign,
  Percent,
} from 'lucide-react'
import { Modal, ModalFooter, ToggleSwitch } from '@/components/common'
import type { PaymentMethodForm } from '../types/finance.types'
import { PAYMENT_METHOD_PRESETS } from '../utils/paymentMethodHelpers'
import { cn } from '@/lib/utils'

export interface PaymentMethodsGatewaysFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  paymentMethodForm: PaymentMethodForm
  setPaymentMethodForm: React.Dispatch<React.SetStateAction<PaymentMethodForm>>
}

export const PaymentMethodsGatewaysFormDrawer: React.FC<PaymentMethodsGatewaysFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  paymentMethodForm,
  setPaymentMethodForm,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  // Fee Mode State: 'free' | 'percent' | 'fixed' | 'mixed'
  const [feeMode, setFeeMode] = useState<'free' | 'percent' | 'fixed' | 'mixed'>('free')

  // Synchronize Fee Mode whenever the form changes or drawer opens
  useEffect(() => {
    const p = Number(paymentMethodForm.fee_percent) || 0
    const f = Number(paymentMethodForm.fee_fixed) || 0

    if (p === 0 && f === 0) {
      setFeeMode('free')
    } else if (p > 0 && f > 0) {
      setFeeMode('mixed')
    } else if (p > 0) {
      setFeeMode('percent')
    } else {
      setFeeMode('fixed')
    }
  }, [editingItem, isOpen])

  const handleFeeModeChange = (mode: 'free' | 'percent' | 'fixed' | 'mixed') => {
    setFeeMode(mode)
    if (mode === 'free') {
      setPaymentMethodForm((prev) => ({ ...prev, fee_percent: '0.00', fee_fixed: '0.00' }))
    } else if (mode === 'percent') {
      setPaymentMethodForm((prev) => ({
        ...prev,
        fee_percent: Number(prev.fee_percent) > 0 ? prev.fee_percent : '2.00',
        fee_fixed: '0.00',
      }))
    } else if (mode === 'fixed') {
      setPaymentMethodForm((prev) => ({
        ...prev,
        fee_percent: '0.00',
        fee_fixed: Number(prev.fee_fixed) > 0 ? prev.fee_fixed : '0.50',
      }))
    } else if (mode === 'mixed') {
      setPaymentMethodForm((prev) => ({
        ...prev,
        fee_percent: Number(prev.fee_percent) > 0 ? prev.fee_percent : '2.50',
        fee_fixed: Number(prev.fee_fixed) > 0 ? prev.fee_fixed : '0.25',
      }))
    }
  }

  const handleApplyPreset = (preset: typeof PAYMENT_METHOD_PRESETS[0]) => {
    setPaymentMethodForm({
      name: preset.name,
      code: preset.code,
      type: preset.type,
      fee_percent: preset.fee_percent,
      fee_fixed: preset.fee_fixed,
      available_pos: preset.available_pos,
      available_online: preset.available_online,
      is_active: true,
      description: preset.description,
    })
  }

  // Calculate live preview fee on an example $100 transaction
  const exampleBill = 100
  const calcFee =
    exampleBill * (Number(paymentMethodForm.fee_percent || 0) / 100) +
    Number(paymentMethodForm.fee_fixed || 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? t('finance.configure_payment_method', 'Configure Payment Method')
          : t('finance.add_payment_method', 'Add Payment Method')
      }
      subtitle={
        isEdit
          ? t('finance.config_method_subtitle', 'Configure processing fees, POS/Online channels, and method parameters.')
          : t('finance.add_method_subtitle', 'Select a preset template or configure a custom payment method.')
      }
      icon={isEdit ? <Settings2 size={20} /> : <CreditCard size={20} />}
      iconVariant="indigo"
      size="xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          onSubmit={onSubmit}
          isSubmitting={isPending}
          isEdit={isEdit}
          submitLabel={
            isEdit
              ? t('common.saveChanges', 'Save Changes')
              : t('common.save', 'Save')
          }
        />
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="p-5 sm:p-6 space-y-5"
      >
        {/* Quick Presets (Only when Adding) */}
        {!isEdit && (
          <div className="space-y-2 p-3.5 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {t('finance.quick_templates', 'Quick Presets:')}
              </span>
              <span className="text-[10px] text-muted-foreground">{t('finance.click_to_autofill', 'Click to autofill')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHOD_PRESETS.map((preset) => {
                const isSelected = paymentMethodForm.code === preset.code
                return (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-2xs font-bold'
                        : 'border-border/70 bg-background text-muted-foreground hover:text-foreground hover:border-primary/40'
                    )}
                  >
                    {preset.name.split('(')[0].trim()}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Section 1: General Info */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('finance.general_info', '1. General Information')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Method Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                {t('finance.method_name', 'Method Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={paymentMethodForm.name}
                onChange={(e) => setPaymentMethodForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={t('finance.pm_name_placeholder', 'e.g. Bakong KHQR / Cash')}
                className="w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            {/* Method Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  {t('finance.method_code', 'Method Code')} <span className="text-rose-500">*</span>
                </span>
                {isEdit && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal">
                    <Lock className="w-2.5 h-2.5" /> {t('finance.cannot_be_changed', 'Cannot be modified')}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  readOnly={isEdit}
                  value={paymentMethodForm.code}
                  onChange={(e) =>
                    setPaymentMethodForm((p) => ({
                      ...p,
                      code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                    }))
                  }
                  placeholder="e.g. bakong_khqr"
                  className={cn(
                    'w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border font-mono transition-all',
                    isEdit
                      ? 'border-border/50 bg-muted/60 text-muted-foreground cursor-not-allowed select-none'
                      : 'border-border/80 bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                  )}
                />
                {isEdit && (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground absolute right-3.5 top-3.5 opacity-60 pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          {/* Gateway Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              {t('finance.gateway_type', 'Gateway Type')} <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethodForm.type}
              onChange={(e) => setPaymentMethodForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
            >
              <option value="cash">{t('finance.pm_type_cash', 'Cash (Cash / COD)')}</option>
              <option value="qris">{t('finance.pm_type_qris', 'Bakong KHQR / Static QR')}</option>
              <option value="credit_card">{t('finance.pm_type_credit_card', 'Credit Card (Visa/MC)')}</option>
              <option value="debit_card">{t('finance.pm_type_debit_card', 'Debit Card')}</option>
              <option value="bank_transfer">{t('finance.pm_type_bank_transfer', 'Bank Transfer')}</option>
              <option value="ewallet">{t('finance.pm_type_ewallet', 'E-Wallet (Wing, TrueMoney)')}</option>
              <option value="other">{t('finance.pm_type_other', 'Other Custom Method')}</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              {t('finance.description_col', 'Description')}
            </label>
            <textarea
              rows={2}
              value={paymentMethodForm.description || ''}
              onChange={(e) => setPaymentMethodForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={t('finance.description_placeholder', 'Payment instructions or cashier notes...')}
              className="w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="h-[1px] w-full bg-border/60 shrink-0" />

        {/* Section 2: Fee Structure */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('finance.fee_structure', '2. Processing Fee')}
            </h4>
            <span className="text-[11px] font-semibold text-primary">
              {calcFee === 0 ? t('finance.free_fee', 'Free (0%)') : `+$${calcFee.toFixed(2)} / $100`}
            </span>
          </div>

          {/* Fee Mode Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'free', label: t('finance.fee_free', 'Free (0%)') },
              { id: 'percent', label: t('finance.fee_percent_type', 'Percentage (%)') },
              { id: 'fixed', label: t('finance.fee_fixed_type', 'Fixed ($)') },
              { id: 'mixed', label: t('finance.fee_mixed_type', 'Mixed (% + $)') },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleFeeModeChange(m.id as any)}
                className={cn(
                  'h-9 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer',
                  feeMode === m.id
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'border-border/70 bg-background text-muted-foreground hover:text-foreground hover:border-primary/40'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Detailed Fee Input Fields */}
          {feeMode !== 'free' && (
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-3">
              {(feeMode === 'percent' || feeMode === 'mixed') && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground">
                    {t('finance.fee_percent', 'Fee Percent (%)')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={paymentMethodForm.fee_percent}
                      onChange={(e) =>
                        setPaymentMethodForm((p) => ({ ...p, fee_percent: e.target.value }))
                      }
                      placeholder="2.00"
                      className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-border/80 bg-background text-foreground font-mono"
                    />
                    <Percent className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  </div>
                </div>
              )}

              {(feeMode === 'fixed' || feeMode === 'mixed') && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground">
                    {t('finance.fee_fixed', 'Fee Fixed ($)')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentMethodForm.fee_fixed}
                      onChange={(e) =>
                        setPaymentMethodForm((p) => ({ ...p, fee_fixed: e.target.value }))
                      }
                      placeholder="0.50"
                      className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-border/80 bg-background text-foreground font-mono"
                    />
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-[1px] w-full bg-border/60 shrink-0" />

        {/* Section 3: Channels & Status */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('finance.channels_and_status', '3. Channels & Status')}
          </h4>

          {/* Channels toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* POS Channel */}
            <div
              onClick={() =>
                setPaymentMethodForm((p) => ({ ...p, available_pos: !p.available_pos }))
              }
              className={cn(
                'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                paymentMethodForm.available_pos
                  ? 'border-blue-500/40 bg-blue-500/5 dark:bg-blue-950/20'
                  : 'border-border/60 bg-muted/10 opacity-70 hover:opacity-100'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {t('finance.pos_counter', 'POS Counter')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t('finance.pos_counter_desc', 'Accept payments at physical POS counter')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={paymentMethodForm.available_pos}
                onChange={(val) =>
                  setPaymentMethodForm((p) => ({ ...p, available_pos: val }))
                }
                activeColor="blue"
              />
            </div>

            {/* Online Channel */}
            <div
              onClick={() =>
                setPaymentMethodForm((p) => ({ ...p, available_online: !p.available_online }))
              }
              className={cn(
                'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                paymentMethodForm.available_online
                  ? 'border-purple-500/40 bg-purple-500/5 dark:bg-purple-950/20'
                  : 'border-border/60 bg-muted/10 opacity-70 hover:opacity-100'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {t('finance.online_store', 'Online Store')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t('finance.online_store_desc', 'Accept payments on eCommerce store')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={paymentMethodForm.available_online}
                onChange={(val) =>
                  setPaymentMethodForm((p) => ({ ...p, available_online: val }))
                }
                activeColor="purple"
              />
            </div>
          </div>

          {/* Active Status Row */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">
                {t('finance.enable_method', 'Active Status')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('finance.enable_method_desc', 'Allow cashier and customers to use this payment method')}
              </p>
            </div>
            <ToggleSwitch
              checked={paymentMethodForm.is_active}
              onChange={(val) =>
                setPaymentMethodForm((p) => ({ ...p, is_active: val }))
              }
              activeColor="emerald"
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}

export { PaymentMethodsGatewaysFormDrawer as PaymentMethodFormDrawer }
export default PaymentMethodsGatewaysFormDrawer
