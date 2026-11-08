import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Edit2,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import { EmptyState, RowActionGroup, EditRowButton, DeleteRowButton } from '@/components/common'
import type { CurrencyItem, RateSource } from '../types/currency.types'

export interface CurrenciesRatesTableProps {
  currencies?: CurrencyItem[]
  isLoading?: boolean
  isFetching?: boolean
  search: string
  setSearch: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  sourceFilter: string
  setSourceFilter: (val: string) => void
  onRefresh: () => void
  openEditDrawer: (item: CurrencyItem) => void
  onDeleteCurrency: (id: number, name?: string) => void
  canUpdateCurrency?: boolean
  canDeleteCurrency?: boolean
  nbcRate?: number
}

const getCurrencyVisual = (code: string) => {
  const c = (code || '').toUpperCase()
  switch (c) {
    case 'USD':
      return { flag: '🇺🇸', country: 'United States' }
    case 'KHR':
      return { flag: '🇰🇭', country: 'Cambodia' }
    case 'THB':
      return { flag: '🇹🇭', country: 'Thailand' }
    case 'EUR':
      return { flag: '🇪🇺', country: 'European Union' }
    case 'CNY':
      return { flag: '🇨🇳', country: 'China' }
    case 'SGD':
      return { flag: '🇸🇬', country: 'Singapore' }
    case 'JPY':
      return { flag: '🇯🇵', country: 'Japan' }
    case 'VND':
      return { flag: '🇻🇳', country: 'Vietnam' }
    case 'GBP':
      return { flag: '🇬🇧', country: 'United Kingdom' }
    default:
      return { flag: '💵', country: 'Global' }
  }
}

const formatRate = (rate: number | string): string => {
  const num = Number(rate)
  if (isNaN(num)) return '1.0000'
  if (num === 1) return '1.0000'
  if (num % 1 === 0) {
    return num.toLocaleString('en-US')
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

export const CurrenciesRatesTable: React.FC<CurrenciesRatesTableProps> = ({
  currencies = [],
  isLoading = false,
  isFetching = false,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  onRefresh,
  openEditDrawer,
  onDeleteCurrency,
  canUpdateCurrency = true,
  canDeleteCurrency = true,
  nbcRate = 4080,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const isKhmer = i18n.language === 'km'

  // Resolve rate source tag
  const getRateSource = (item: CurrencyItem): { label: string; variant: 'blue' | 'emerald' | 'amber' | 'slate' } => {
    const code = (item.code || '').toUpperCase()
    if (code === 'USD' || item.is_default) {
      return { label: isKhmer ? 'ប្រព័ន្ធគោល' : 'System Base', variant: 'blue' }
    }
    const numericRate = Number(item.exchange_rate)
    if (code === 'KHR' && numericRate === nbcRate) {
      return { label: isKhmer ? 'ធនាគារជាតិ NBC' : 'NBC Reference', variant: 'amber' }
    }
    if (item.rate_source === 'nbc') {
      return { label: isKhmer ? 'ធនាគារជាតិ NBC' : 'NBC Reference', variant: 'amber' }
    }
    if (item.rate_source === 'api') {
      return { label: 'Live API', variant: 'emerald' }
    }
    return { label: isKhmer ? 'កំណត់ដោយដៃ' : 'Manual (POS)', variant: 'slate' }
  }

  // Filter list locally based on search & filters
  const filteredCurrencies = useMemo(() => {
    return currencies.filter((item) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesName = (item.name || '').toLowerCase().includes(query)
        const matchesCode = (item.code || '').toLowerCase().includes(query)
        if (!matchesName && !matchesCode) return false
      }

      // Status
      if (statusFilter === 'active' && !item.is_active) return false
      if (statusFilter === 'inactive' && item.is_active) return false

      // Rate Source
      if (sourceFilter) {
        const sourceInfo = getRateSource(item)
        if (sourceFilter === 'system' && !item.is_default && item.code !== 'USD') return false
        if (sourceFilter === 'nbc' && !sourceInfo.label.includes('NBC')) return false
        if (sourceFilter === 'manual' && (item.is_default || item.code === 'USD' || sourceInfo.label.includes('NBC')))
          return false
      }

      return true
    })
  }, [currencies, search, statusFilter, sourceFilter, nbcRate, isKhmer])

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs space-y-0">
      {/* ─── Table Header ─── */}
      <div className="p-4 sm:p-5 border-b border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>{isKhmer ? 'តារាងគ្រប់គ្រងរូបិយប័ណ្ណទាំងអស់' : 'All Currencies Management'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono font-medium">
              {filteredCurrencies.length}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isKhmer
              ? 'រាល់អត្រាប្តូរប្រាក់ទាំងអស់គណនាធៀបនឹងរូបិយប័ណ្ណគោល (1.0000 USD)'
              : 'All exchange rates are calculated relative to the Base Currency (1.0000 USD)'}
          </p>
        </div>
      </div>

      {/* ─── Table Content ─── */}
      <TableWrapper isFetching={isFetching} className="print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse text-left">
            <thead className="bg-muted/40 sticky top-0 border-b border-border/70 z-10">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                  {isKhmer ? 'រូបិយប័ណ្ណ' : 'Currency'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                  {isKhmer ? 'លេខកូដ ISO' : 'ISO Code'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-muted-foreground text-center">
                  {isKhmer ? 'និមិត្តសញ្ញា' : 'Symbol'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-muted-foreground text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>{isKhmer ? 'អត្រាប្តូរប្រាក់' : 'Exchange Rate'}</span>
                    <span className="text-[11px] font-normal text-muted-foreground font-mono">
                      (vs 1 USD)
                    </span>
                  </div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                  {isKhmer ? 'ប្រភពអត្រា' : 'Rate Source'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-muted-foreground text-center">
                  {isKhmer ? 'ស្ថានភាព' : 'Status'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                  {isKhmer ? 'កាលបរិច្ឆេទកែប្រែ' : 'Last Updated'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-muted-foreground text-right">
                  {isKhmer ? 'សកម្មភាព' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <LoadingSkeleton cols={8} />
              ) : filteredCurrencies.length === 0 ? (
                <EmptyState
                  cols={8}
                  message={
                    search || statusFilter || sourceFilter
                      ? isKhmer
                        ? 'រកមិនឃើញរូបិយប័ណ្ណដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ។'
                        : 'No currencies match the selected filters.'
                      : isKhmer
                      ? 'មិនទាន់មានរូបិយប័ណ្ណក្នុងប្រព័ន្ធនៅឡើយទេ។'
                      : 'No currencies found.'
                  }
                />
              ) : (
                filteredCurrencies.map((row) => {
                  const code = (row.code || '').toUpperCase()
                  const isBase = code === 'USD' || Boolean(row.is_default)
                  const isCoreKhr = code === 'KHR'
                  const visual = getCurrencyVisual(code)
                  const source = getRateSource(row)
                  const localizedName =
                    code === 'USD'
                      ? isKhmer
                        ? 'ដុល្លារអាមេរិក (US Dollar)'
                        : 'US Dollar'
                      : code === 'KHR'
                      ? isKhmer
                        ? 'រៀលកម្ពុជា (Cambodian Riel)'
                        : 'Cambodian Riel'
                      : row.name

                  const lastUpdatedFormatted = row.updated_at
                    ? new Date(row.updated_at).toLocaleDateString(isKhmer ? 'km-KH' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : isKhmer
                    ? 'បច្ចុប្បន្នភាព'
                    : 'Current'

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isBase
                          ? 'bg-blue-500/5 dark:bg-blue-500/10 hover:bg-blue-500/10'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      {/* 1. Flag & Currency Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted border border-border/80 flex items-center justify-center text-lg shrink-0 shadow-2xs select-none">
                            {visual.flag}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground text-xs sm:text-sm">
                                {localizedName}
                              </span>
                              {isBase && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                  {isKhmer ? 'គោល' : 'Base'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground block">
                              {visual.country}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. ISO Code */}
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-foreground">
                        <span className="px-2 py-0.5 rounded bg-muted/60 border border-border/60">
                          {code}
                        </span>
                      </td>

                      {/* 3. Symbol */}
                      <td className="px-4 py-3.5 text-center font-bold text-sm text-foreground">
                        <span className="inline-block w-7 h-7 leading-7 rounded-md bg-muted/40 border border-border/60 text-center font-mono">
                          {row.symbol}
                        </span>
                      </td>

                      {/* 4. Exchange Rate */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-xs sm:text-sm text-foreground">
                        <span className={isBase ? 'text-blue-600 dark:text-blue-400' : ''}>
                          {formatRate(row.exchange_rate)}
                        </span>
                        <span className="text-[11px] font-normal text-muted-foreground ml-1">
                          {row.symbol}
                        </span>
                      </td>

                      {/* 5. Rate Source */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            source.variant === 'blue'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                              : source.variant === 'amber'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                              : source.variant === 'emerald'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border-border/60'
                          }`}
                        >
                          {source.label}
                        </span>
                      </td>

                      {/* 6. Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            row.is_active
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                              : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.is_active ? 'bg-emerald-500' : 'bg-zinc-400'
                            }`}
                          />
                          {row.is_active
                            ? isKhmer
                              ? 'សកម្ម'
                              : 'Active'
                            : isKhmer
                            ? 'អសកម្ម'
                            : 'Inactive'}
                        </span>
                      </td>

                      {/* 7. Last Updated */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {lastUpdatedFormatted}
                      </td>

                      {/* 8. Actions (SmartHR shadow card action buttons) */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <RowActionGroup>
                          {/* Edit Action */}
                          {canUpdateCurrency && (
                            <EditRowButton
                              onClick={() => openEditDrawer(row)}
                              title={isKhmer ? 'កែសម្រួល' : 'Edit Currency'}
                            />
                          )}

                          {/* Delete Action (Protected for USD and KHR) */}
                          {canDeleteCurrency && (
                            <>
                              {isBase || isCoreKhr ? (
                                <span
                                  className="h-8 w-8 min-w-[32px] min-h-[32px] rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/60 text-slate-400 flex items-center justify-center cursor-not-allowed select-none opacity-60"
                                  title={
                                    isKhmer
                                      ? 'រូបិយប័ណ្ណគោល និងរៀលត្រូវបានការពារ មិនអាចលុបបានឡើយ'
                                      : 'Base and core local currencies are protected and cannot be deleted'
                                  }
                                >
                                  <Lock size={13} />
                                </span>
                              ) : (
                                <DeleteRowButton
                                  onClick={() => onDeleteCurrency(row.id, row.name)}
                                  title={isKhmer ? 'លុប' : 'Delete Currency'}
                                />
                              )}
                            </>
                          )}
                        </RowActionGroup>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default CurrenciesRatesTable
