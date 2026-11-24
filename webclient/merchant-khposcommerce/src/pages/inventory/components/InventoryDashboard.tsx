import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  DollarSign, TrendingUp, Boxes, ShieldCheck, AlertTriangle,
  Layers, ArrowLeftRight, Truck, SlidersHorizontal, ClipboardCheck
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { formatCurrency, formatNumber } from '@/utils/formatters'
import {
  FlattenProjectStatCard,
  FlattenStatsGrid,
} from '@/components/common'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#a855f7'
]

const KM_MONTH_MAP: Record<string, string> = {
  'Jan': 'មករា',
  'Feb': 'កុម្ភៈ',
  'Mar': 'មីនា',
  'Apr': 'មេសា',
  'May': 'ឧសភា',
  'Jun': 'មិថុនា',
  'Jul': 'កក្កដា',
  'Aug': 'សីហា',
  'Sep': 'កញ្ញា',
  'Oct': 'តុលា',
  'Nov': 'វិច្ឆិកា',
  'Dec': 'ធ្នូ',
  'January': 'មករា',
  'February': 'កុម្ភៈ',
  'March': 'មីនា',
  'April': 'មេសា',
  'June': 'មិថុនា',
  'July': 'កក្កដា',
  'August': 'សីហា',
  'September': 'កញ្ញា',
  'October': 'តុលា',
  'November': 'វិច្ឆិកា',
  'December': 'ធ្នូ',
}

interface InventoryDashboardProps {
  stats?: any
  statsData?: any
  loadingStats?: boolean
  warehouses?: any[]
  selectedWarehouseId?: string
  onWarehouseChange?: (warehouseId: string) => void
  onRefresh?: () => void
  onTabChange: (tabId: any) => void
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  stats,
  statsData,
  loadingStats,
  warehouses = [],
  onTabChange,
}) => {
  const { t } = useTranslation(['inventory', 'common'])
  const { language } = useThemeStore()
  const [warehouseViewMode, setWarehouseViewMode] = useState<'chart' | 'list'>('chart')

  const currentStats = statsData || stats || {}
  const summary = currentStats.summary || {}
  const rawCharts = currentStats.charts || {}

  // Quantitative Metrics from Backend Database
  const totalItems = Number(summary.total_items ?? summary.total_products ?? 0)
  const totalQty = Number(summary.total_qty ?? 0)
  const availableQty = Number(summary.available_qty ?? 0)
  const reservedQty = Number(summary.reserved_qty ?? 0)
  const lowStock = Number(summary.low_stock ?? summary.low_stock_alert ?? 0)
  const outOfStock = Number(summary.out_of_stock ?? 0)
  const overstock = Number(summary.overstock ?? 0)
  const totalWarehouses = Number(summary.warehouses ?? summary.total_warehouses ?? warehouses.length ?? 0)
  const inventoryCost = Number(summary.inventory_cost ?? 0)
  const inventoryValue = Number(summary.inventory_value ?? summary.selling_value ?? 0)
  const profitPotential = Number(summary.profit_potential ?? (inventoryValue - inventoryCost))
  const turnoverRate = Number(summary.turnover_rate ?? 0)

  // Calculations for cost vs profit progress ratio
  const profitMarginPercent = inventoryCost > 0
    ? ((profitPotential / inventoryCost) * 100).toFixed(1)
    : '0.0'
  const costRatio = inventoryValue > 0
    ? Math.min(100, Math.max(0, (inventoryCost / inventoryValue) * 100)).toFixed(0)
    : '60'

  // Monthly Movement Chart Data
  const monthlyMovementData = useMemo(() => {
    const list = Array.isArray(rawCharts.monthly_movement) ? rawCharts.monthly_movement : []
    return list.map((d: any) => {
      const rawMonth = (d.month || '').trim()
      const displayMonth =
        language === 'km' && KM_MONTH_MAP[rawMonth]
          ? KM_MONTH_MAP[rawMonth]
          : t(`dashboard_months.${rawMonth}`, { defaultValue: rawMonth })
      return {
        ...d,
        displayMonth,
      }
    })
  }, [rawCharts.monthly_movement, t, language])

  // Warehouse Stock Breakdown Data
  const warehouseData = useMemo(() => {
    const rawList = Array.isArray(rawCharts.by_warehouse) ? rawCharts.by_warehouse : []
    const totalVolume = rawList.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0)

    return [...rawList]
      .sort((a: any, b: any) => (Number(b.value) || 0) - (Number(a.value) || 0))
      .map((d: any) => {
        const val = Number(d.value) || 0
        const pct = totalVolume > 0 ? ((val / totalVolume) * 100).toFixed(1) : '0.0'
        const rawName = String(d.name || '').trim()

        const words = rawName.split(/\s+/)
        const shortLabel =
          words.length > 2 && rawName.length > 15
            ? words.slice(0, 2).join(' ')
            : rawName

        return {
          ...d,
          value: val,
          pct,
          shortLabel,
          fullName: rawName,
          name: rawName,
        }
      })
  }, [rawCharts.by_warehouse])

  // Category Distribution Data
  const categoryData = useMemo(() => {
    const data = Array.isArray(rawCharts.by_category) ? rawCharts.by_category : []
    return data.map((d: any) => ({
      ...d,
      name: String(d.name || ''),
      value: Number(d.value) || 0,
    }))
  }, [rawCharts.by_category])

  // Brand Distribution Data
  const brandData = useMemo(() => {
    const data = Array.isArray(rawCharts.by_brand) ? rawCharts.by_brand : []
    return data.map((d: any) => ({
      ...d,
      name: String(d.name || ''),
      value: Number(d.value) || 0,
    }))
  }, [rawCharts.by_brand])

  // Loading Skeleton State
  if (loadingStats && !currentStats.summary) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        {/* KPI Skeleton matching FlattenStatsGrid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-7 w-36 rounded-lg" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            </div>
          ))}
        </div>

        {/* Operational Strip Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-2.5 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((idx) => (
            <Card key={idx} className="p-5 space-y-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-3 w-64 rounded-md" />
              </div>
              <Skeleton className="h-72 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none print:hidden">
      {/* ─── 1. EXECUTIVE KPI HERO CARDS (FLATTEN PROJECT STANDARD - GLOBAL REUSABLE) ─── */}
      <FlattenStatsGrid columns={4}>
        {/* Card 1: Valuation */}
        <FlattenProjectStatCard
          title={language === 'km' ? 'តម្លៃស្តុកទំនិញសរុប' : 'Total Inventory Value'}
          value={inventoryValue}
          prefix="$"
          decimals={2}
          useCounter={true}
          color="emerald"
          icon={<DollarSign size={18} className="text-white stroke-[2.2]" />}
          subtitle={
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
              <span>{language === 'km' ? 'ថ្លៃដើម:' : 'Cost:'} <strong className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{formatCurrency(inventoryCost)}</strong></span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{100 - Number(costRatio)}% {language === 'km' ? 'ចំណេញ' : 'Margin'}</span>
            </div>
          }
        />

        {/* Card 2: Expected Profit */}
        <FlattenProjectStatCard
          title={language === 'km' ? 'ប្រាក់ចំណេញរំពឹងទុក' : 'Profit Potential'}
          value={profitPotential}
          prefix="$"
          decimals={2}
          useCounter={true}
          color="blue"
          icon={<TrendingUp size={18} className="text-white stroke-[2.2]" />}
          trend={{
            value: `${profitMarginPercent}%`,
            label: language === 'km' ? 'ចំណេញធៀបដើមទុន' : 'Margin ROI',
            direction: 'up',
          }}
        />

        {/* Card 3: Total Stock Volume & SKUs */}
        <FlattenProjectStatCard
          title={language === 'km' ? 'បរិមាណទំនិញក្នុងស្តុក' : 'Stock Quantity'}
          value={totalQty}
          suffix={language === 'km' ? ' ឯកតា' : ' units'}
          useCounter={true}
          color="indigo"
          icon={<Boxes size={18} className="text-white stroke-[2.2]" />}
          onClick={() => onTabChange('levels')}
          subtitle={
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
              <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{formatNumber(totalItems)}</span>
              <span>{language === 'km' ? 'មុខទំនិញ' : 'SKUs'}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{formatNumber(availableQty)}</span>
              <span>{language === 'km' ? 'អាចប្រើបាន' : 'available'}</span>
            </div>
          }
        />

        {/* Card 4: Stock Health & Alerts */}
        <FlattenProjectStatCard
          title={language === 'km' ? 'សុវត្ថិភាពស្តុកទំនិញ' : 'Stock Health & Alerts'}
          value={
            lowStock + outOfStock === 0
              ? (language === 'km' ? '១០០% ល្អប្រសើរ' : '100% Optimal')
              : (lowStock + outOfStock)
          }
          suffix={
            lowStock + outOfStock === 0
              ? ''
              : (language === 'km' ? ' មុខទំនិញ' : ' alerts')
          }
          useCounter={lowStock + outOfStock > 0}
          color={lowStock + outOfStock > 0 ? 'rose' : 'teal'}
          icon={lowStock + outOfStock > 0 ? <AlertTriangle size={18} className="text-white stroke-[2.2]" /> : <ShieldCheck size={18} className="text-white stroke-[2.2]" />}
          onClick={() => onTabChange('levels')}
          subtitle={
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
              {lowStock + outOfStock > 0 ? (
                <>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono">{formatNumber(outOfStock)}</span>
                  <span>{language === 'km' ? 'អស់ស្តុក' : 'out of stock'}</span>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold font-mono">{formatNumber(lowStock)}</span>
                  <span>{language === 'km' ? 'ស្តុកទាប' : 'low'}</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{formatNumber(overstock)}</span>
                  <span>{language === 'km' ? 'ស្តុកលើស (>100)' : 'overstock'}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{totalWarehouses}</span>
                  <span>{language === 'km' ? 'ឃ្លាំង' : 'hubs'}</span>
                </>
              )}
            </div>
          }
        />
      </FlattenStatsGrid>

      {/* ─── 2. OPERATIONAL SUMMARY STRIP (CLEAN & MINIMALIST) ─── */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 dark:divide-slate-800">
          {/* Item 1: Total SKUs */}
          <div className="p-4 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              {language === 'km' ? 'មុខទំនិញ (SKUs)' : 'Total SKUs'}
            </span>
            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white font-mono tabular-nums">
              {formatNumber(totalItems)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
              {language === 'km' ? 'ផលិតផលសកម្មក្នុងកាតាឡុក' : 'Active catalog items'}
            </span>
          </div>

          {/* Item 2: Total Quantity */}
          <div className="p-4 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              {language === 'km' ? 'បរិមាណសរុប' : 'Total Quantity'}
            </span>
            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white font-mono tabular-nums">
              {formatNumber(totalQty)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
              {language === 'km' ? 'ចំនួនឯកតាក្នុងឃ្លាំង' : 'Physical units stored'}
            </span>
          </div>

          {/* Item 3: Available Stock */}
          <div className="p-4 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              {language === 'km' ? 'អាចប្រើប្រាស់បាន' : 'Available Stock'}
            </span>
            <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {formatNumber(availableQty)}
            </div>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium block truncate">
              {language === 'km' ? 'រួចរាល់សម្រាប់លក់' : 'Ready for order/sale'}
            </span>
          </div>

          {/* Item 4: Reserved Stock */}
          <div className="p-4 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              {language === 'km' ? 'បានកក់ទុក' : 'Reserved Stock'}
            </span>
            <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              {formatNumber(reservedQty)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
              {language === 'km' ? 'ជាប់ការកក់ ឬរង់ចាំផ្ទេរ' : 'Pending orders/transfers'}
            </span>
          </div>

          {/* Item 5: Overstock */}
          <div className="p-4 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              {language === 'km' ? 'ស្តុកលើស (>100)' : 'Overstock (>100)'}
            </span>
            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white font-mono tabular-nums">
              {formatNumber(overstock)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
              {language === 'km' ? 'បរិមាណលើសកម្រិតធម្មតា' : 'High inventory volume'}
            </span>
          </div>

          {/* Item 6: Turnover Rate */}
          <div className="p-4 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              {language === 'km' ? 'អត្រាបង្វិលស្តុក' : 'Turnover Rate'}
            </span>
            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white font-mono tabular-nums">
              {turnoverRate}x
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
              {language === 'km' ? 'ល្បឿននៃការចរាចរស្តុក' : 'Inventory velocity'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. ANALYTICAL CHARTS (CLEAN TYPOGRAPHY - NO DECORATIVE ICONS) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Stock Movement */}
        <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">
                {language === 'km' ? 'ចលនាស្តុកប្រចាំខែ (ចូល vs ចេញ)' : 'Monthly Stock Movement (In vs Out)'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km'
                  ? 'ប្រៀបធៀបបរិមាណទំនិញនាំចូល និងការលក់ចេញតាមខែ'
                  : 'Comparison of stock-in arrivals versus sales outbound'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                {language === 'km' ? 'ចូល:' : 'In:'} {formatNumber(summary.stock_in || 0)}
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                {language === 'km' ? 'ចេញ:' : 'Out:'} {formatNumber(summary.stock_out || 0)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-72 w-full notranslate" translate="no">
              {monthlyMovementData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                  <span>{language === 'km' ? 'មិនមានកំណត់ត្រាចលនាស្តុក' : 'No stock movement records'}</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyMovementData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="stockInGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="stockOutGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                    <XAxis
                      dataKey="displayMonth"
                      stroke="currentColor"
                      className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                      tickLine={false}
                    />
                    <YAxis
                      width={45}
                      stroke="currentColor"
                      className="text-xs text-slate-500 dark:text-slate-400 font-mono"
                      tickLine={false}
                      tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : val)}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${Number(value).toLocaleString()} ${language === 'km' ? 'ឯកតា' : 'units'}`,
                        name === 'in'
                          ? language === 'km' ? 'ស្តុកចូល' : 'Stock In'
                          : language === 'km' ? 'ស្តុកចេញ' : 'Stock Out',
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(val) =>
                        val === 'in'
                          ? language === 'km' ? 'ស្តុកចូល' : 'Stock In'
                          : language === 'km' ? 'ស្តុកចេញ' : 'Stock Out'
                      }
                    />
                    <Bar
                      dataKey="in"
                      fill="url(#stockInGrad)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      name={language === 'km' ? 'ស្តុកចូល' : 'Stock In'}
                    />
                    <Bar
                      dataKey="out"
                      fill="url(#stockOutGrad)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      name={language === 'km' ? 'ស្តុកចេញ' : 'Stock Out'}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Stock by Warehouse with Mode Toggle */}
        <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">
                {language === 'km' ? 'បរិមាណស្តុកតាមឃ្លាំង' : 'Stock by Warehouse'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km'
                  ? 'សមាមាត្រការបែងចែកទំនិញតាមទីតាំងឃ្លាំងនីមួយៗ'
                  : 'Inventory volume allocated across warehouses'}
              </CardDescription>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setWarehouseViewMode('chart')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer',
                  warehouseViewMode === 'chart'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                )}
              >
                {language === 'km' ? 'ក្រាហ្វិក' : 'Chart'}
              </button>
              <button
                type="button"
                onClick={() => setWarehouseViewMode('list')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer',
                  warehouseViewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                )}
              >
                {language === 'km' ? 'បញ្ជី' : 'List'}
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-72 w-full notranslate" translate="no">
              {warehouseData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                  <span>{language === 'km' ? 'មិនមានទិន្នន័យឃ្លាំង' : 'No warehouse stock records'}</span>
                </div>
              ) : warehouseViewMode === 'list' ? (
                <div className="h-full overflow-y-auto pr-1 space-y-2">
                  {warehouseData.map((item: any, idx: number) => {
                    const maxVal = Number(warehouseData[0]?.value) || 1
                    const fillPct = Math.min(100, Math.max(4, (item.value / maxVal) * 100))
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-slate-800 dark:text-slate-100 truncate" title={item.fullName}>
                            {item.fullName}
                          </span>
                          <div className="flex items-center gap-2 shrink-0 font-mono">
                            <span className="font-semibold text-slate-900 dark:text-white">{formatNumber(item.value)}</span>
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-slate-300 dark:border-slate-700">
                              {item.pct}%
                            </Badge>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-teal-600 dark:bg-teal-500"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={warehouseData}
                    layout="vertical"
                    margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                    <XAxis
                      type="number"
                      stroke="currentColor"
                      className="text-xs text-slate-500 dark:text-slate-400 font-mono"
                      tickLine={false}
                      tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : val)}
                    />
                    <YAxis
                      dataKey="shortLabel"
                      type="category"
                      stroke="currentColor"
                      className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                      width={100}
                      interval={0}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: any, _name: any, entry: any) => [
                        `${Number(value).toLocaleString()} ${language === 'km' ? 'ឯកតា' : 'units'} (${entry.payload.pct}%)`,
                        entry.payload.fullName,
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#0e5a77"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                      name={language === 'km' ? 'បរិមាណ' : 'Quantity'}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Stock Distribution by Category */}
        <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">
                {language === 'km' ? 'ចំណែកស្តុកតាមប្រភេទ' : 'Stock by Category'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km'
                  ? 'សមាមាត្របរិមាណស្តុកតាមប្រភេទមុខទំនិញ'
                  : 'Proportion of inventory catalog grouped by category'}
              </CardDescription>
            </div>
            {categoryData.length > 0 && (
              <Badge variant="outline" className="font-mono text-[11px] font-semibold px-2 py-0.5 border-slate-300 dark:border-slate-700">
                {categoryData.length} {language === 'km' ? 'ប្រភេទ' : 'Categories'}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-72 flex items-center justify-center notranslate" translate="no">
              {categoryData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                  <span>{language === 'km' ? 'មិនទាន់មានទិន្នន័យប្រភេទ' : 'No category stock records'}</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((_: any, index: number) => (
                        <Cell key={`cell-cat-${index}`} fill={PALETTE[index % PALETTE.length]} stroke="hsl(var(--card))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${Number(value).toLocaleString()} ${language === 'km' ? 'ឯកតា' : 'units'}`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Stock Distribution by Brand */}
        <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">
                {language === 'km' ? 'ចំណែកស្តុកតាមម៉ាកសញ្ញា' : 'Stock by Brand'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km'
                  ? 'សមាមាត្របរិមាណស្តុកតាមប្រភពម៉ាកផលិតផល'
                  : 'Brand allocation across the inventory spectrum'}
              </CardDescription>
            </div>
            {brandData.length > 0 && (
              <Badge variant="outline" className="font-mono text-[11px] font-semibold px-2 py-0.5 border-slate-300 dark:border-slate-700">
                {brandData.length} {language === 'km' ? 'ម៉ាក' : 'Brands'}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-72 flex items-center justify-center notranslate" translate="no">
              {brandData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                  <span>{language === 'km' ? 'មិនទាន់មានទិន្នន័យម៉ាក' : 'No brand stock records'}</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={brandData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {brandData.map((_: any, index: number) => (
                        <Cell key={`cell-brand-${index}`} fill={PALETTE[(index + 3) % PALETTE.length]} stroke="hsl(var(--card))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${Number(value).toLocaleString()} ${language === 'km' ? 'ឯកតា' : 'units'}`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 4. QUICK SHORTCUTS ACTIONS (CLEAN & SUBTLE) ─── */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">
              {language === 'km' ? 'ផ្លូវកាត់ទៅកាន់មុខងារសារពើភ័ណ្ឌ' : 'Inventory Quick Actions'}
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {language === 'km'
                ? 'ចូលដំណើរការរហ័សទៅកាន់កម្រិតស្តុក ការផ្ទេរ ការកែសម្រួល ឬការត្រួតពិនិត្យស្តុក'
                : 'Directly manage stock levels, transfers, adjustments, and audits'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onTabChange('levels')}
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:border-slate-400 active:scale-98"
            >
              <Layers className="size-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              <span>{language === 'km' ? 'កម្រិតស្តុក' : 'Stock Levels'}</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('movements')}
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:border-slate-400 active:scale-98"
            >
              <ArrowLeftRight className="size-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              <span>{language === 'km' ? 'ចលនាស្តុក' : 'Movements'}</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('transfers')}
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:border-slate-400 active:scale-98"
            >
              <Truck className="size-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              <span>{language === 'km' ? 'ការផ្ទេរស្តុក' : 'Transfers'}</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('adjustments')}
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:border-slate-400 active:scale-98"
            >
              <SlidersHorizontal className="size-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              <span>{language === 'km' ? 'ការកែសម្រួលស្តុក' : 'Adjustments'}</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('opnames')}
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:border-slate-400 active:scale-98"
            >
              <ClipboardCheck className="size-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              <span>{language === 'km' ? 'ការត្រួតពិនិត្យស្តុក' : 'Audits'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryDashboard
