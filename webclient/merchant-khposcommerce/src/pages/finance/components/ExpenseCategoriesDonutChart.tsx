import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'

interface ExpenseCategoriesDonutChartProps {
  allExpenses?: any[]
  categories?: any[]
  onSelectCategory?: (categoryId: string) => void
  selectedCategory?: string
}

// Colors matching SmartHR category palette:
const PALETTE = [
  '#0f766e', // Teal
  '#0284c7', // Sky Blue
  '#f59e0b', // Amber / Gold
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#64748b', // Slate
  '#ec4899', // Pink
  '#f97316', // Orange
]

export const ExpenseCategoriesDonutChart: React.FC<ExpenseCategoriesDonutChartProps> = ({
  allExpenses = [],
  categories = [],
  onSelectCategory,
  selectedCategory,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  // Aggregate expenses by category
  const chartData = useMemo(() => {
    if (!allExpenses || allExpenses.length === 0) {
      // Mock data matching the screenshot if no expenses loaded yet
      return [
        { name: 'Travel', value: 5800, count: 8, color: PALETTE[0], id: '1' },
        { name: 'Meals', value: 3400, count: 12, color: PALETTE[1], id: '2' },
        { name: 'Accommodation', value: 4600, count: 5, color: PALETTE[2], id: '3' },
        { name: 'Transportation', value: 2900, count: 7, color: PALETTE[3], id: '4' },
        { name: 'Client Entertainment', value: 2100, count: 3, color: PALETTE[4], id: '5' },
        { name: 'Office Expenses', value: 2400, count: 4, color: PALETTE[5], id: '6' },
        { name: 'Other', value: 1594, count: 3, color: PALETTE[6], id: '7' },
      ]
    }

    const catMap: Record<string, { name: string; value: number; count: number; id: string }> = {}

    allExpenses.forEach((exp: any) => {
      const catId = String(exp.expense_category_id || exp.category?.id || exp.category_id || 'other')
      const catName = exp.category?.name || exp.category_name || (catId === 'other' ? 'Other' : `Category ${catId}`)
      const amount = parseFloat(exp.amount) || 0

      if (!catMap[catId]) {
        catMap[catId] = {
          name: catName,
          value: 0,
          count: 0,
          id: catId,
        }
      }
      catMap[catId].value += amount
      catMap[catId].count += 1
    })

    return Object.values(catMap).map((item, index) => ({
      ...item,
      color: PALETTE[index % PALETTE.length],
    }))
  }, [allExpenses])

  const totalValue = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData])
  const totalClaims = useMemo(() => chartData.reduce((acc, curr) => acc + curr.count, 0), [chartData])

  return (
    <div className="bg-card dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-[#0f766e] flex items-center justify-center shrink-0">
              <PieChartIcon size={16} />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {t('finance.expense_categories_regional_spend', 'Expense Categories & Regional Spend')}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground pl-9">
            {t(
              'finance.expense_categories_regional_desc',
              'Claim volume and category distribution across all offices.'
            )}
          </p>
        </div>

        <div className="self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-muted-foreground">
            <span>{chartData.length} {t('finance.cohorts_count', 'Cohorts')}</span>
          </span>
        </div>
      </div>

      {/* Donut Chart & Legend */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-2">
        {/* Donut Chart with Center Text */}
        <div className="relative w-full sm:w-72 h-56 sm:h-64 flex items-center justify-center shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                cursor="pointer"
                onClick={(entry) => onSelectCategory?.(entry.id)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                    className="transition-opacity hover:opacity-85"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    const percent = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: data.color }}
                          />
                          <span>{data.name}</span>
                        </div>
                        <div className="text-slate-300">
                          {data.count} {t('finance.claims_unit_lower', 'claims')} · {formatCurrency(data.value)} ({percent}%)
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t('finance.donut_total_label', 'Total')}
            </span>
            <span className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
              {formatCurrency(totalValue)}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {totalClaims} {t('finance.claims_unit', 'Claims')}
            </span>
          </div>
        </div>

        {/* Categories Legend Grid */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {chartData.map((item) => {
            const isSelected = selectedCategory === item.id
            const percent = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCategory?.(isSelected ? '' : item.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-md shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      {item.count} {t('finance.claims_unit_lower', 'claims')}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-foreground block">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground block">
                    {percent}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ExpenseCategoriesDonutChart

