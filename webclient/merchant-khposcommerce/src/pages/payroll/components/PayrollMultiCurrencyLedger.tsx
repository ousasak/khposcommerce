import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Banknote, Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'

export interface CurrencyLedgerData {
  currencyCode: string
  flag: string
  name: string
  symbol: string
  grossSum: number
  allowances: number
  overtime: number
  deductions: number
  statutoryTax: number
  netPayout: number
  headcount: number
}

export interface PayrollMultiCurrencyLedgerProps {
  payrolls?: any[]
  selectedCurrency?: string
  onSelectCurrency?: (curr: string) => void
}

const DEFAULT_CURRENCY_PRESETS: Record<string, CurrencyLedgerData> = {
  USD: {
    currencyCode: 'USD',
    flag: '🇺🇸',
    name: 'US Dollar',
    symbol: '$',
    grossSum: 64250,
    allowances: 4200,
    overtime: 1850,
    deductions: 1950,
    statutoryTax: 8850,
    netPayout: 55300,
    headcount: 24,
  },
  KHR: {
    currencyCode: 'KHR',
    flag: '🇰🇭',
    name: 'Cambodian Riel',
    symbol: '៛',
    grossSum: 185000000,
    allowances: 12500000,
    overtime: 6800000,
    deductions: 7200000,
    statutoryTax: 16400000,
    netPayout: 168200000,
    headcount: 36,
  },
  CAD: {
    currencyCode: 'CAD',
    flag: '🇨🇦',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    grossSum: 10165,
    allowances: 640,
    overtime: 205,
    deductions: 261,
    statutoryTax: 1461,
    netPayout: 8443,
    headcount: 2,
  },
  GBP: {
    currencyCode: 'GBP',
    flag: '🇬🇧',
    name: 'British Pound',
    symbol: '£',
    grossSum: 18400,
    allowances: 1100,
    overtime: 480,
    deductions: 620,
    statutoryTax: 3200,
    netPayout: 15060,
    headcount: 4,
  },
  AUD: {
    currencyCode: 'AUD',
    flag: '🇦🇺',
    name: 'Australian Dollar',
    symbol: 'A$',
    grossSum: 14800,
    allowances: 950,
    overtime: 390,
    deductions: 480,
    statutoryTax: 2450,
    netPayout: 12260,
    headcount: 3,
  },
  EUR: {
    currencyCode: 'EUR',
    flag: '🇪🇺',
    name: 'Euro',
    symbol: '€',
    grossSum: 22600,
    allowances: 1400,
    overtime: 650,
    deductions: 820,
    statutoryTax: 4100,
    netPayout: 18330,
    headcount: 5,
  },
  SGD: {
    currencyCode: 'SGD',
    flag: '🇸🇬',
    name: 'Singapore Dollar',
    symbol: 'S$',
    grossSum: 16200,
    allowances: 1050,
    overtime: 410,
    deductions: 510,
    statutoryTax: 2100,
    netPayout: 14090,
    headcount: 3,
  },
  JPY: {
    currencyCode: 'JPY',
    flag: '🇯🇵',
    name: 'Japanese Yen',
    symbol: '¥',
    grossSum: 2850000,
    allowances: 180000,
    overtime: 95000,
    deductions: 110000,
    statutoryTax: 390000,
    netPayout: 2445000,
    headcount: 6,
  },
  AED: {
    currencyCode: 'AED',
    flag: '🇦🇪',
    name: 'UAE Dirham',
    symbol: 'AED',
    grossSum: 24500,
    allowances: 1600,
    overtime: 550,
    deductions: 700,
    statutoryTax: 0,
    netPayout: 23800,
    headcount: 4,
  },
  CHF: {
    currencyCode: 'CHF',
    flag: '🇨🇭',
    name: 'Swiss Franc',
    symbol: 'CHF',
    grossSum: 19800,
    allowances: 1250,
    overtime: 490,
    deductions: 590,
    statutoryTax: 2950,
    netPayout: 16750,
    headcount: 3,
  },
}

const SUPPORTED_CURRENCIES = ['USD', 'KHR', 'CAD', 'GBP', 'AUD', 'EUR', 'SGD', 'JPY', 'AED', 'CHF']

/**
 * PayrollMultiCurrencyLedger Component
 * Exact clone of SmartHR Multi-Currency Breakdown & Ledger section
 */
export const PayrollMultiCurrencyLedger: React.FC<PayrollMultiCurrencyLedgerProps> = ({
  payrolls = [],
  selectedCurrency: externalSelectedCurrency,
  onSelectCurrency,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const [internalCurrency, setInternalCurrency] = useState('CAD')

  const activeCurrencyCode = externalSelectedCurrency || internalCurrency

  const handleCurrencyTabClick = (code: string) => {
    setInternalCurrency(code)
    onSelectCurrency?.(code)
  }

  // Calculate dynamic sums from payrolls if matching records exist, otherwise fallback to preset
  const activeData: CurrencyLedgerData = useMemo(() => {
    const matchingPayrolls = payrolls.filter((p) => {
      const pCurr = (p.currency || p.currency_code || 'USD').toUpperCase()
      return pCurr === activeCurrencyCode.toUpperCase()
    })

    if (matchingPayrolls.length > 0) {
      const gross = matchingPayrolls.reduce(
        (sum, p) =>
          sum +
          (Number(p.basic_salary) || 0) +
          (Number(p.allowances) || 0) +
          (Number(p.overtime_pay) || 0) +
          (Number(p.sales_commission) || 0),
        0
      )
      const allowances = matchingPayrolls.reduce((sum, p) => sum + (Number(p.allowances) || 0), 0)
      const overtime = matchingPayrolls.reduce((sum, p) => sum + (Number(p.overtime_pay) || 0), 0)
      const deductions = matchingPayrolls.reduce(
        (sum, p) => sum + (Number(p.deductions) || 0) + (Number(p.nssf_deduction) || 0),
        0
      )
      const tax = matchingPayrolls.reduce((sum, p) => sum + (Number(p.tax_deduction) || 0), 0)
      const net = matchingPayrolls.reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0)

      const preset = DEFAULT_CURRENCY_PRESETS[activeCurrencyCode] || DEFAULT_CURRENCY_PRESETS.CAD
      return {
        ...preset,
        grossSum: gross,
        allowances,
        overtime,
        deductions,
        statutoryTax: tax,
        netPayout: net > 0 ? net : gross - deductions - tax,
        headcount: matchingPayrolls.length,
      }
    }

    return DEFAULT_CURRENCY_PRESETS[activeCurrencyCode] || DEFAULT_CURRENCY_PRESETS.CAD
  }, [payrolls, activeCurrencyCode])

  const formatAmount = (val: number, symbol: string) => {
    if (activeCurrencyCode === 'KHR') {
      return `${Math.round(val).toLocaleString()} ៛`
    }
    if (activeCurrencyCode === 'JPY') {
      return `¥${Math.round(val).toLocaleString()}`
    }
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="bg-card dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 print:hidden">
      {/* Header: Title & Currency Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-[#0f766e] dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
            <Coins size={18} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              {t('employees.multi_currency_breakdown_ledger', 'Multi-Currency Breakdown & Ledger')}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {t(
                'employees.multi_currency_ledger_desc',
                'Standalone compensation sums per regional currency cohort.'
              )}
            </p>
          </div>
        </div>

        {/* Currency Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-thin">
          {SUPPORTED_CURRENCIES.map((code) => {
            const preset = DEFAULT_CURRENCY_PRESETS[code]
            const isSelected = activeCurrencyCode === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleCurrencyTabClick(code)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 select-none ${
                  isSelected
                    ? 'bg-card dark:bg-slate-800 text-foreground border border-slate-300 dark:border-slate-600 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{preset?.flag}</span>
                <span>{code}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Metrics Row for Active Currency */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
        {/* Gross Sum */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.gross_sum', 'Gross Sum')}
          </span>
          <div className="text-sm sm:text-base font-extrabold text-foreground truncate">
            {formatAmount(activeData.grossSum, activeData.symbol)}
          </div>
        </div>

        {/* Allowances */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.allowances_sum', 'Allowances')}
          </span>
          <div className="text-sm sm:text-base font-bold text-foreground truncate">
            {formatAmount(activeData.allowances, activeData.symbol)}
          </div>
        </div>

        {/* Overtime */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.overtime_sum', 'Overtime')}
          </span>
          <div className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 truncate">
            {formatAmount(activeData.overtime, activeData.symbol)}
          </div>
        </div>

        {/* Deductions */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.deductions_sum', 'Deductions')}
          </span>
          <div className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 truncate">
            {formatAmount(activeData.deductions, activeData.symbol)}
          </div>
        </div>

        {/* Statutory Tax */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.statutory_tax_sum', 'Statutory Tax')}
          </span>
          <div className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 truncate">
            {formatAmount(activeData.statutoryTax, activeData.symbol)}
          </div>
        </div>

        {/* Net Payout */}
        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-0.5">
          <span className="block text-[10px] font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
            {t('employees.net_payout', 'Net Payout')}
          </span>
          <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            {formatAmount(activeData.netPayout, activeData.symbol)}
          </div>
        </div>

        {/* Headcount */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
          <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('employees.headcount', 'Headcount')} ({activeData.currencyCode})
          </span>
          <div className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-1.5 truncate">
            <span>{activeData.flag}</span>
            <span>
              {activeData.headcount} {t('employees.staff_fallback', 'Staff')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PayrollMultiCurrencyLedger

