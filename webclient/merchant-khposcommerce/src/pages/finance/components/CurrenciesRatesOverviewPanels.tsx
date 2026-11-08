import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Landmark,
  Save,
  Sparkles,
  Info,
} from 'lucide-react'
import { sound } from '@/utils/sound'
import type { CurrencyItem } from '../types/currency.types'

export interface CurrenciesRatesOverviewPanelsProps {
  usdCurrency: CurrencyItem
  khrCurrency: CurrencyItem
  khrInputRate: string
  setKhrInputRate: (val: string) => void
  isSaving: boolean
  onSaveKhrRate: (newRate: number) => void
  nbcRate?: number
  canUpdateCurrency?: boolean
}

export const CurrenciesRatesOverviewPanels: React.FC<CurrenciesRatesOverviewPanelsProps> = ({
  usdCurrency,
  khrCurrency,
  khrInputRate,
  setKhrInputRate,
  isSaving,
  onSaveKhrRate,
  nbcRate = 4080,
  canUpdateCurrency = true,
}) => {
  const { i18n } = useTranslation(['finance', 'common'])
  const isKhmer = i18n.language === 'km'

  const currentNumericRate = Number(khrCurrency?.exchange_rate || 4100)
  const isInputDifferent = Number(khrInputRate.replace(/,/g, '')) !== currentNumericRate
  const inverse10k = currentNumericRate > 0 ? (10000 / currentNumericRate).toFixed(2) : '2.44'

  const handleApplyNbcRate = () => {
    sound.playClick()
    setKhrInputRate(String(nbcRate))
    onSaveKhrRate(nbcRate)
  }

  const handleSaveInput = () => {
    const val = Number(khrInputRate.replace(/,/g, ''))
    if (!isNaN(val) && val > 0) {
      sound.playClick()
      onSaveKhrRate(val)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ─── Panel 1: Base Currency (USD) ─── */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl shrink-0 shadow-2xs select-none">
              🇺🇸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  {isKhmer ? 'ដុល្លារអាមេរិក' : 'US Dollar'}
                </h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60">
                  {usdCurrency.code || 'USD'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isKhmer ? 'និមិត្តសញ្ញា: $' : 'Currency Symbol: $'} • United States Dollar
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 shrink-0">
            <ShieldCheck size={13} />
            <span>{isKhmer ? 'រូបិយប័ណ្ណគោល' : 'Base Currency'}</span>
          </span>
        </div>

        {/* Rate & Details */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {isKhmer ? 'អត្រាគោលប្រព័ន្ធ (Base Rate):' : 'System Base Rate:'}
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-xl font-bold text-foreground">1.0000</span>
              <span className="text-xs font-semibold text-muted-foreground">USD</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Info size={13} className="text-blue-500 shrink-0" />
              <span>
                {isKhmer
                  ? 'តម្លៃទំនិញក្នុងស្តុក និងការចេញវិក្កយបត្រគិតជាដុល្លារជាគោល'
                  : 'Product catalogue prices & master invoices are anchored to USD'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
              <CheckCircle2 size={11} />
              {isKhmer ? 'អត្រាថេរ' : 'Fixed Rate'}
            </span>
          </div>
        </div>

        {/* Footer info tag */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{isKhmer ? 'ប្រភពអត្រា: ប្រព័ន្ធលំនាំដើម' : 'Rate Source: System Master'}</span>
          <span className="font-mono text-[11px]">ISO: 840 • Minor: 2</span>
        </div>
      </div>

      {/* ─── Panel 2: Local Currency (KHR) ─── */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shrink-0 shadow-2xs select-none">
              🇰🇭
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  {isKhmer ? 'រៀលកម្ពុជា' : 'Cambodian Riel'}
                </h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60">
                  {khrCurrency.code || 'KHR'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isKhmer ? 'និមិត្តសញ្ញា: ៛' : 'Currency Symbol: ៛'} • Khmer Riel
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
            <CheckCircle2 size={13} />
            <span>{isKhmer ? 'រូបិយប័ណ្ណប្រតិបត្តិការ' : 'Operational'}</span>
          </span>
        </div>

        {/* Inline Rate Editor & Quick Sync */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {isKhmer ? 'អត្រាប្តូរប្រាក់ប្រចាំថ្ងៃ (Daily POS Rate):' : 'Active POS Exchange Rate:'}
            </span>

            {/* Quick Inline Edit Box */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs font-bold text-muted-foreground">
                  1 $ =
                </span>
                <input
                  type="text"
                  value={khrInputRate}
                  disabled={!canUpdateCurrency || isSaving}
                  onChange={(e) => setKhrInputRate(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSaveInput()
                    }
                  }}
                  className="w-28 sm:w-32 h-8.5 pl-11 pr-7 text-sm font-bold font-mono text-foreground bg-background rounded-lg border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right shadow-2xs"
                  placeholder="4100"
                />
                <span className="absolute right-2.5 text-xs font-bold text-muted-foreground">
                  ៛
                </span>
              </div>

              {canUpdateCurrency && (
                <button
                  type="button"
                  onClick={handleSaveInput}
                  disabled={isSaving || !isInputDifferent}
                  className={`h-8.5 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    isInputDifferent
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs'
                      : 'bg-muted text-muted-foreground border border-border/60 opacity-60 cursor-not-allowed'
                  }`}
                  title={isKhmer ? 'រក្សាទុកអត្រាថ្មី' : 'Save exchange rate'}
                >
                  {isSaving ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>{isKhmer ? 'រក្សាទុក' : 'Save'}</span>
                </button>
              )}
            </div>
          </div>

          {/* NBC Reference Section */}
          <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Landmark size={14} className="text-amber-500 shrink-0" />
              <span>
                {isKhmer ? 'អត្រាផ្លូវការធនាគារជាតិ NBC:' : 'NBC Reference Rate:'}{' '}
                <strong className="text-foreground font-mono">{nbcRate.toLocaleString()} ៛</strong>
              </span>
            </div>

            {canUpdateCurrency && (
              <button
                type="button"
                onClick={handleApplyNbcRate}
                disabled={isSaving || currentNumericRate === nbcRate}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={isKhmer ? 'ប្តូរទៅតាមអត្រាធនាគារជាតិ' : 'Sync to NBC Reference Rate'}
              >
                <Sparkles size={11} />
                <span>{isKhmer ? 'យកតាមអត្រា NBC' : 'Sync NBC Rate'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info tag */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            {isKhmer
              ? `អត្រាអាប់: 10,000 ៛ = $${inverse10k}`
              : `Change Rate: 10,000 ៛ = $${inverse10k}`}
          </span>
          <span className="font-mono text-[11px]">ISO: 116 • Minor: 0</span>
        </div>
      </div>
    </div>
  )
}

export default CurrenciesRatesOverviewPanels

