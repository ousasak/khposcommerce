import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ShieldCheck, Info } from 'lucide-react'
import { Modal, ModalFooter, FormField, getFieldClass } from '@/components/common'
import { cn } from '@/lib/utils'
import type { CurrencyForm } from '../types/currency.types'

const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'

export interface CurrenciesRatesFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  currencyForm: CurrencyForm
  setCurrencyForm: React.Dispatch<React.SetStateAction<CurrencyForm>>
  existingCodes?: string[]
  errors?: Record<string, string>
  onClearError?: (key: string) => void
}

export const CurrenciesRatesFormDrawer: React.FC<CurrenciesRatesFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  currencyForm,
  setCurrencyForm,
  existingCodes = [],
  errors = {},
  onClearError,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const isKhmer = i18n.language === 'km'
  const isEdit = Boolean(editingItem)
  const isBaseCurrency = editingItem?.is_default || editingItem?.code?.toUpperCase() === 'USD'

  const [codeError, setCodeError] = useState<string>('')

  // Validate duplicate code on change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().trim()
    setCurrencyForm((p) => ({ ...p, code: val }))

    if (!isEdit && existingCodes.includes(val)) {
      setCodeError(isKhmer ? 'លេខកូដរូបិយប័ណ្ណនេះមានរួចហើយ' : 'Currency code already exists')
    } else {
      setCodeError('')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? isKhmer
            ? 'កែសម្រួលរូបិយប័ណ្ណ'
            : t('finance.edit_currency', 'Edit Currency')
          : isKhmer
          ? 'បន្ថែមរូបិយប័ណ្ណថ្មី'
          : t('finance.add_currency', 'Add Currency')
      }
      subtitle={
        isKhmer
          ? 'កំណត់ឈ្មោះរូបិយប័ណ្ណ លេខកូដ ISO និមិត្តសញ្ញា និងអត្រាប្តូរប្រាក់ធៀបនឹងដុល្លារ'
          : t('finance.currency_subtitle', 'Set currency name, ISO code, symbol, and exchange rate relative to USD')
      }
      icon={<Globe size={20} />}
      iconVariant="cyan"
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          onSubmit={onSubmit}
          isSubmitting={isPending}
          isEdit={isEdit}
          submitLabel={
            isEdit
              ? isKhmer
                ? 'រក្សាទុកការផ្លាស់ប្តូរ'
                : t('common.saveChanges', 'Save Changes')
              : isKhmer
              ? 'រក្សាទុក'
              : t('common.save', 'Save')
          }
        />
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!codeError) {
            onSubmit()
          }
        }}
        className="p-5 sm:p-6 space-y-4"
      >
        {/* Base Currency Protected Notice */}
        {isBaseCurrency && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-700 dark:text-blue-300">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {isKhmer ? 'រូបិយប័ណ្ណគោលរបស់ប្រព័ន្ធ (Base Currency)' : 'System Base Currency'}
              </p>
              <p className="text-[11px] mt-0.5 text-blue-600 dark:text-blue-400">
                {isKhmer
                  ? 'អត្រាប្តូរប្រាក់នៃរូបិយប័ណ្ណគោលត្រូវបានកំណត់ថេរ 1.0000 និងមិនអាចផ្លាស់ប្តូរលេខកូដបានឡើយ។'
                  : 'The exchange rate for the base currency is fixed at 1.0000 and the ISO code cannot be modified.'}
              </p>
            </div>
          </div>
        )}

        {/* Currency Name */}
        <div>
          <FormField
            label={isKhmer ? 'ឈ្មោះរូបិយប័ណ្ណ' : t('finance.currency_name', 'Currency Name')}
            required
            error={errors.name}
          >
            <input
              id="currency-name"
              name="name"
              type="text"
              value={currencyForm.name}
              onChange={(e) => {
                setCurrencyForm((p) => ({ ...p, name: e.target.value }))
                onClearError?.('name')
              }}
              placeholder={
                isKhmer
                  ? 'ឧ. ដុល្លារអាមេរិក ឬ Thai Baht'
                  : t('finance.currency_name_placeholder', 'e.g. US Dollar, Thai Baht')
              }
              className={getFieldClass(errors.name)}
            />
          </FormField>
        </div>

        {/* Code, Symbol & Exchange Rate Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* ISO Code */}
          <div>
            <FormField
              label={isKhmer ? 'លេខកូដ ISO' : t('finance.iso_code', 'ISO Code')}
              required
              error={codeError || errors.code}
            >
              <input
                id="currency-code"
                name="code"
                type="text"
                disabled={isBaseCurrency}
                maxLength={5}
                value={currencyForm.code}
                onChange={(e) => {
                  handleCodeChange(e)
                  onClearError?.('code')
                }}
                placeholder="USD"
                className={cn(
                  getFieldClass(codeError || errors.code),
                  'font-mono uppercase',
                  isBaseCurrency && 'opacity-60 cursor-not-allowed bg-muted'
                )}
              />
            </FormField>
          </div>

          {/* Symbol */}
          <div>
            <FormField
              label={isKhmer ? 'និមិត្តសញ្ញា' : t('finance.symbol_col', 'Symbol')}
              required
              error={errors.symbol}
            >
              <input
                id="currency-symbol"
                name="symbol"
                type="text"
                value={currencyForm.symbol}
                onChange={(e) => {
                  setCurrencyForm((p) => ({ ...p, symbol: e.target.value }))
                  onClearError?.('symbol')
                }}
                placeholder="$"
                className={cn(
                  getFieldClass(errors.symbol),
                  'font-bold text-center font-mono'
                )}
              />
            </FormField>
          </div>

          {/* Exchange Rate */}
          <div>
            <FormField
              label={isKhmer ? 'អត្រាប្តូរប្រាក់' : t('finance.exchange_rate', 'Exchange Rate')}
              required
              error={errors.exchange_rate}
            >
              <input
                id="currency-rate"
                name="exchange_rate"
                type="number"
                step="0.0001"
                disabled={isBaseCurrency}
                value={currencyForm.exchange_rate}
                onChange={(e) => {
                  setCurrencyForm((p) => ({ ...p, exchange_rate: e.target.value }))
                  onClearError?.('exchange_rate')
                }}
                placeholder="1.0000"
                className={cn(
                  getFieldClass(errors.exchange_rate),
                  'font-mono',
                  isBaseCurrency && 'opacity-60 cursor-not-allowed bg-muted'
                )}
              />
            </FormField>
          </div>
        </div>

        {/* Rate Source & Decimal Precision */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              {isKhmer ? 'ប្រភពអត្រា (Rate Source)' : 'Rate Source'}
            </label>
            <select
              value={currencyForm.rate_source || (isBaseCurrency ? 'system' : 'manual')}
              onChange={(e) =>
                setCurrencyForm((p) => ({
                  ...p,
                  rate_source: e.target.value as any,
                }))
              }
              disabled={isBaseCurrency}
              className={`${inputCls} cursor-pointer ${
                isBaseCurrency ? 'opacity-60 cursor-not-allowed bg-muted' : ''
              }`}
            >
              <option value="system">{isKhmer ? 'ប្រព័ន្ធគោល (System Base)' : 'System Base'}</option>
              <option value="manual">{isKhmer ? 'កំណត់ដោយដៃ (Manual / POS)' : 'Manual (POS)'}</option>
              <option value="nbc">{isKhmer ? 'ធនាគារជាតិ (NBC Reference)' : 'NBC Reference'}</option>
              <option value="api">{isKhmer ? 'External API' : 'External API'}</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>
              {isKhmer ? 'ចំនួនខ្ទង់ទសភាគ (Decimal Precision)' : 'Decimal Precision'}
            </label>
            <select
              value={currencyForm.decimal_precision ?? (currencyForm.code === 'KHR' ? 0 : 2)}
              onChange={(e) =>
                setCurrencyForm((p) => ({
                  ...p,
                  decimal_precision: Number(e.target.value),
                }))
              }
              className={`${inputCls} cursor-pointer`}
            >
              <option value="0">{isKhmer ? '0 ខ្ទង់ (ឧ. 4,100 ៛)' : '0 Decimals (e.g. 4,100 ៛)'}</option>
              <option value="2">{isKhmer ? '2 ខ្ទង់ (ឧ. $10.50)' : '2 Decimals (e.g. $10.50)'}</option>
              <option value="4">{isKhmer ? '4 ខ្ទង់ (ឧ. 1.0000)' : '4 Decimals (e.g. 1.0000)'}</option>
            </select>
          </div>
        </div>

        {/* Hints */}
        {currencyForm.code === 'KHR' && (
          <p className="text-[11px] font-medium text-primary dark:text-sky-400">
            💡 {isKhmer ? 'វាយបញ្ចូលចំនួនប្រាក់រៀលស្មើនឹង ១ ដុល្លារ (ឧ. 4,100)' : 'Enter Riel amount equal to 1 USD (e.g. 4100)'}
          </p>
        )}

        {/* Active Status Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/70">
          <div>
            <p className="text-xs font-semibold text-foreground">
              {isKhmer ? 'ស្ថានភាពសកម្ម' : t('finance.active_status', 'Active Status')}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isKhmer
                ? 'អនុញ្ញាតឱ្យប្រើប្រាស់រូបិយប័ណ្ណនេះក្នុងបញ្ជរគិតលុយ POS'
                : t('finance.currency_active_desc', 'Allow this currency for transactions in POS checkout')}
            </p>
          </div>
          <input
            type="checkbox"
            id="currActive"
            disabled={isBaseCurrency}
            checked={currencyForm.is_active}
            onChange={(e) => setCurrencyForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer disabled:opacity-50"
          />
        </div>
      </form>
    </Modal>
  )
}

export { CurrenciesRatesFormDrawer as CurrencyFormDrawer }
export default CurrenciesRatesFormDrawer
