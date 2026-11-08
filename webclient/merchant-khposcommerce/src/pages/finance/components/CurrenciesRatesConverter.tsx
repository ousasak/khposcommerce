import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calculator,
  ArrowRightLeft,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from 'lucide-react'
import { sound } from '@/utils/sound'
import type { CurrencyItem } from '../types/currency.types'

export interface CurrenciesRatesConverterProps {
  currencies: CurrencyItem[]
  khrRate: number
}

export const CurrenciesRatesConverter: React.FC<CurrenciesRatesConverterProps> = ({
  currencies,
  khrRate,
}) => {
  const { i18n } = useTranslation(['finance', 'common'])
  const isKhmer = i18n.language === 'km'

  const [fromCode, setFromCode] = useState<string>('USD')
  const [toCode, setToCode] = useState<string>('KHR')
  const [amount, setAmount] = useState<string>('20')

  // Find currencies
  const fromCurrency = useMemo(() => {
    return (
      currencies.find((c) => (c.code || '').toUpperCase() === fromCode.toUpperCase()) || {
        code: fromCode,
        symbol: fromCode === 'USD' ? '$' : '៛',
        exchange_rate: fromCode === 'USD' ? 1 : khrRate,
      }
    )
  }, [currencies, fromCode, khrRate])

  const toCurrency = useMemo(() => {
    return (
      currencies.find((c) => (c.code || '').toUpperCase() === toCode.toUpperCase()) || {
        code: toCode,
        symbol: toCode === 'KHR' ? '៛' : '$',
        exchange_rate: toCode === 'KHR' ? khrRate : 1,
      }
    )
  }, [currencies, toCode, khrRate])

  // Conversion Calculation
  const { convertedValue, effectiveRate } = useMemo(() => {
    const numericAmount = parseFloat(amount.replace(/,/g, ''))
    if (isNaN(numericAmount) || numericAmount < 0) {
      return { convertedValue: '0', effectiveRate: '1.00' }
    }

    const fromRate = Number(fromCurrency.exchange_rate) || 1
    const toRate = Number(toCurrency.exchange_rate) || 1

    // Convert: Amount in Base (USD) = amount / fromRate
    // Amount in Target = (amount / fromRate) * toRate
    const rateRatio = toRate / fromRate
    const rawResult = numericAmount * rateRatio

    let formattedResult = '0'
    if (toCurrency.code === 'KHR') {
      // For KHR, round to integer (or nearest 100 for cash change)
      formattedResult = Math.round(rawResult).toLocaleString('en-US')
    } else {
      formattedResult = rawResult.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
    }

    const rateString =
      rateRatio >= 1
        ? `1 ${fromCurrency.code} = ${rateRatio.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${toCurrency.code}`
        : `1 ${fromCurrency.code} = ${rateRatio.toFixed(6)} ${toCurrency.code}`

    return { convertedValue: formattedResult, effectiveRate: rateString }
  }, [amount, fromCurrency, toCurrency])

  // Swap currencies
  const handleSwap = () => {
    sound.playClick()
    const temp = fromCode
    setFromCode(toCode)
    setToCode(temp)
  }

  // Reset
  const handleReset = () => {
    sound.playClick()
    setAmount('1')
  }

  // Quick Change Grid (USD 1, 5, 10, 20, 50, 100 -> KHR)
  const quickChangeGrid = useMemo(() => {
    const denominations = [1, 5, 10, 20, 50, 100]
    return denominations.map((usd) => {
      const khr = Math.round(usd * khrRate)
      return {
        usd,
        khr: khr.toLocaleString('en-US'),
      }
    })
  }, [khrRate])

  return (
    <div className="space-y-4">
      {/* ─── Converter Panel ─── */}
      <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Calculator size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isKhmer
                  ? 'ម៉ាស៊ីនគិតលេខប្តូរប្រាក់រហ័សសម្រាប់បញ្ជរ POS'
                  : 'Interactive POS Currency Converter'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isKhmer
                  ? 'គណនាប្រាក់ប្តូរ និងប្រាក់អាប់ភ្លាមៗរវាងរូបិយប័ណ្ណដោយស្វ័យប្រវត្តិ'
                  : 'Instant bidirectional currency converter for cashier change calculation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/60">
              {effectiveRate}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title={isKhmer ? 'កំណត់ឡើងវិញ' : 'Reset'}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Inputs & Direction Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* Source Currency & Amount Input (5 cols) */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{isKhmer ? 'ពីប្រាក់ (From)' : 'From Currency'}</span>
              <select
                value={fromCode}
                onChange={(e) => {
                  sound.playClick()
                  setFromCode(e.target.value)
                }}
                className="font-bold text-foreground bg-transparent border-0 outline-none cursor-pointer text-xs"
              >
                {currencies.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                {fromCurrency.symbol}
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                className="w-full h-12 pl-9 pr-14 rounded-xl border border-border/80 bg-background text-lg font-bold font-mono text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground font-mono">
                {fromCurrency.code}
              </span>
            </div>
          </div>

          {/* Swap Button (2 cols) */}
          <div className="md:col-span-2 flex justify-center py-1 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className="w-10 h-10 rounded-xl bg-muted/60 hover:bg-primary hover:text-primary-foreground border border-border/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs text-muted-foreground"
              title={isKhmer ? 'ប្តូរទិសដៅ' : 'Swap currencies'}
            >
              <ArrowRightLeft size={16} />
            </button>
          </div>

          {/* Target Currency & Result Output (5 cols) */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{isKhmer ? 'ទៅជាប្រាក់ (To)' : 'Converted Target'}</span>
              <select
                value={toCode}
                onChange={(e) => {
                  sound.playClick()
                  setToCode(e.target.value)
                }}
                className="font-bold text-foreground bg-transparent border-0 outline-none cursor-pointer text-xs"
              >
                {currencies.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="h-12 px-4 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 flex items-center justify-between font-bold text-foreground shadow-2xs">
              <span className="text-xl font-bold font-mono text-primary truncate">
                {convertedValue}
              </span>
              <span className="text-xs font-bold text-primary/80 font-mono shrink-0 ml-2">
                {toCurrency.symbol} {toCurrency.code}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Amount Preset Chips */}
        <div className="pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {isKhmer ? 'កំណត់ចំនួនរហ័ស:' : 'Quick Presets:'}
            </span>
            {(fromCode === 'USD'
              ? [1, 5, 10, 20, 50, 100]
              : [10000, 20000, 50000, 100000, 200000, 400000]
            ).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  sound.playClick()
                  setAmount(String(preset))
                }}
                className={`h-7 px-3 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer shrink-0 ${
                  Number(amount) === preset
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted/50 hover:bg-muted text-foreground border border-border/60'
                }`}
              >
                {fromCode === 'USD' ? `$${preset}` : `${preset.toLocaleString()} ៛`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Section G: Cashier Quick Change Reference Sheet ─── */}
      <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {isKhmer
                ? 'តារាងផ្ទៀងផ្ទាត់ប្រាក់អាប់រហ័សសម្រាប់បញ្ជរ POS'
                : 'Cashier Quick Change Reference Sheet'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isKhmer
                ? 'ជួយ Cashier ផ្ទៀងផ្ទាត់ការអាប់ក្រដាសប្រាក់ដុល្លារទៅជាប្រាក់រៀលបានរហ័ស (ចុចលើកាតដើម្បីគណនាភ្លាមៗ)'
                : 'Lookup reference for cashiers when giving Riel change for USD notes (click card to convert)'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/60 shrink-0">
            <SlidersHorizontal size={12} />
            <span>{isKhmer ? 'គោលការណ៍បង្គត់កាក់: ត្រឹម 100 ៛' : 'Rounding: Nearest 100 KHR'}</span>
          </div>
        </div>

        {/* 6 Denominations Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickChangeGrid.map((row) => (
            <div
              key={row.usd}
              onClick={() => {
                sound.playClick()
                setFromCode('USD')
                setToCode('KHR')
                setAmount(String(row.usd))
              }}
              className="p-3.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-all text-center space-y-1 group shadow-2xs"
              title={isKhmer ? 'ចុចដើម្បីគណនា' : 'Click to convert'}
            >
              <div className="text-base font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                ${row.usd}.00
              </div>
              <div className="text-xs text-muted-foreground font-mono font-medium">
                = {row.khr} ៛
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CurrenciesRatesConverter

