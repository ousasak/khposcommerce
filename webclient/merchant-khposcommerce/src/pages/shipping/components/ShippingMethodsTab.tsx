import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Truck,
  Clock,
  DollarSign,
  Pencil,
  Trash2,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { EmptyState } from '@/components/common'

interface ShippingMethodsTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns?: Record<string, boolean>
  openEditModal: (item: any) => void
  setDeleteId: (id: number) => void
  setConfirmOpen: (val: boolean) => void
  setDetailDrawerItem: (item: any) => void
}

export const ShippingMethodsTab: React.FC<ShippingMethodsTabProps> = ({
  records = [],
  isLoading,
  isFetching,
  openEditModal,
  setDeleteId,
  setConfirmOpen,
  setDetailDrawerItem,
}) => {
  const { t } = useTranslation(['shipping', 'common', 'buttons'])

  // Helper to format code nicely (e.g. vet_express -> VET-EXPRESS)
  const formatCode = (rawCode?: string, id?: number) => {
    if (!rawCode) return `METHOD-${String(id ?? 1).padStart(3, '0')}`
    return rawCode.toUpperCase().replace(/_/g, '-')
  }

  return (
    <div className="space-y-4 print:hidden relative">
      {/* Background fetching indicator */}
      {isFetching && !isLoading && (
        <div className="absolute top-2 right-2 z-10 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-primary">
          <Loader2 size={13} className="animate-spin" />
          <span>{t('common.updating', 'កំពុងធ្វើបច្ចុប្បន្នភាព...')}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5 animate-pulse shadow-[0_2px_8px_-1px_rgba(0,0,0,0.06),0_1px_3px_0_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
                <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
                <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
              <div className="pt-2 mt-3 flex justify-between items-center">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <EmptyState message={t('shipping.noMethodsFound', 'មិនទាន់មានវិធីសាស្ត្រដឹកជញ្ជូននៅឡើយទេ។')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {records.map((r) => {
            const codeDisplay = formatCode(r.code, r.id)
            const providerName = r.provider || r.carrier || t('shipping.standardCarrier', 'ដៃគូដឹកជញ្ជូនទូទៅ')
            const deliveryDays = r.description || t('shipping.defaultDeliveryTime', '១ ដល់ ៣ ថ្ងៃធ្វើការ')

            return (
              <div
                key={r.id}
                onClick={() => setDetailDrawerItem(r)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.06),0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.55)] hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
              >
                <div>
                  {/* ── Top Row: Code Badge + Quick Edit/Delete Actions ── */}
                  <div className="flex items-center justify-between pb-3">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 tracking-wider">
                      {codeDisplay}
                    </span>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={t('common.edit', 'កែប្រែ')}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteId(r.id)
                          setConfirmOpen(true)
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title={t('common.delete', 'លុប')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* ── Title: Method Name ── */}
                  <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight group-hover:text-primary transition-colors line-clamp-1 pb-2.5">
                    {r.name}
                  </h3>

                  {/* ── Clean Data Display Rows (Matching Reference Design) ── */}
                  <div className="space-y-2 text-xs">
                    {/* Row 1: Carrier / Provider */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Truck size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="line-clamp-1">
                        {t('shipping.courierProvider', 'សេវាដឹកជញ្ជូន')} ៖{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {providerName}
                        </span>
                      </span>
                    </div>

                    {/* Row 2: Delivery Duration / Time */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Clock size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="line-clamp-1">
                        {t('shipping.estimatedDuration', 'រយៈពេលដឹក')} ៖{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {deliveryDays}
                        </span>
                      </span>
                    </div>

                    {/* Row 3: Base Price */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <DollarSign size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>
                        {t('shipping.colBasePrice', 'តម្លៃគោល')} ៖{' '}
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                          ${Number(r.base_price || 0).toFixed(2)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Footer: Status Badge + Detail Action Link ── */}
                <div
                  className="pt-2 mt-3 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t('common.active', 'សកម្ម')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {t('common.inactive', 'អសកម្ម')}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailDrawerItem(r)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link cursor-pointer"
                  >
                    <span>{t('common.viewDetails', 'មើលលម្អិត')}</span>
                    <ArrowRight size={13} className="transition-transform group-hover/link:translate-x-0.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ShippingMethodsTab
