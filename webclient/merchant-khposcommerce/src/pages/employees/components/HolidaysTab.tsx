import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  CalendarDays,
  Repeat,
  Loader2,
  Sparkles,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Info,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { GlobalFormat } from '@/utils/formatters'
import {
  EnterpriseModal,
  ModalFooter,
  FormField,
  EnterpriseInput,
  EnterpriseTextarea,
  EnterpriseDatePicker,
  ToggleSwitch,
} from '@/components/common'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { usePermission } from '@/hooks/usePermission'
import type { HolidayItem } from '../types/employee.types'

interface HolidaysTabProps {
  createModalOpen?: boolean
  setCreateModalOpen?: (open: boolean) => void
}

const KHMER_MONTH_NAMES_SHORT = [
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
]

const EN_MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const WEEKDAY_NAMES_KM = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ']
const WEEKDAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const HolidaysTab: React.FC<HolidaysTabProps> = ({
  createModalOpen: propModalOpen,
  setCreateModalOpen: propSetModalOpen,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const isKhmer = i18n.language === 'km'
  const toast = useToast()
  const qc = useQueryClient()
  const { hasPermission } = usePermission()

  const canCreateHoliday = hasPermission('holiday.create')
  const canUpdateHoliday = hasPermission('holiday.update')
  const canDeleteHoliday = hasPermission('holiday.delete')

  // Core Calendar Navigation States
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth())
  const [search, setSearch] = useState('')

  // Modal states
  const [internalModalOpen, setInternalModalOpen] = useState(false)
  const modalOpen = Boolean(propModalOpen) || internalModalOpen
  const setModalOpen = (open: boolean) => {
    setInternalModalOpen(open)
    if (propSetModalOpen) {
      propSetModalOpen(open)
    }
  }

  const [editingItem, setEditingItem] = useState<HolidayItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HolidayItem | null>(null)

  // Form inputs
  const [formTitleEn, setFormTitleEn] = useState('')
  const [formTitleKm, setFormTitleKm] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formDescription, setFormDescription] = useState('')
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active')
  const [formRecurring, setFormRecurring] = useState(true)

  // Fetch holidays for selected year
  const { data: holidaysResponse, isLoading, isFetching } = useQuery({
    queryKey: ['holidays', selectedYear],
    queryFn: () =>
      employeeService.holidays({
        page: 1,
        per_page: 200,
        year: selectedYear,
      }),
    staleTime: 30_000,
  })

  const rawRecords: HolidayItem[] = useMemo(() => {
    return holidaysResponse?.data || []
  }, [holidaysResponse])

  // Sort chronologically by date
  const sortedRecords = useMemo(() => {
    return [...rawRecords].sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return da - db
    })
  }, [rawRecords])

  // Month counts for clean month pills
  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    for (let m = 0; m < 12; m++) counts[m] = 0
    sortedRecords.forEach((item) => {
      const m = new Date(item.date).getMonth()
      if (counts[m] !== undefined) counts[m]++
    })
    return counts
  }, [sortedRecords])

  // Filtered by search if active
  const filteredRecords = useMemo(() => {
    if (!search.trim()) return sortedRecords
    const q = search.trim().toLowerCase()
    return sortedRecords.filter((item) => {
      const titleEn = (item.title_en || '').toLowerCase()
      const titleKm = (item.title_km || '').toLowerCase()
      const desc = (item.description || '').toLowerCase()
      return titleEn.includes(q) || titleKm.includes(q) || desc.includes(q)
    })
  }, [sortedRecords, search])

  // Calendar View Matrix Generation
  const calendarDays = useMemo(() => {
    const year = selectedYear
    const month = calendarMonth
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    let startDayOfWeek = firstDayOfMonth.getDay()
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    const days: {
      dayNumber: number
      dateString: string
      isCurrentMonth: boolean
      isWeekend: boolean
      holidays: HolidayItem[]
    }[] = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const prevDate = new Date(year, month - 1, d)
      const ds = prevDate.toISOString().split('T')[0]
      const dayOfWeek = prevDate.getDay()
      days.push({
        dayNumber: d,
        dateString: ds,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        holidays: filteredRecords.filter((h) => String(h.date).startsWith(ds)),
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d)
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayOfWeek = curDate.getDay()
      days.push({
        dayNumber: d,
        dateString: ds,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        holidays: filteredRecords.filter((h) => String(h.date).startsWith(ds)),
      })
    }

    // Next month padding to complete grid
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d)
      const ds = nextDate.toISOString().split('T')[0]
      const dayOfWeek = nextDate.getDay()
      days.push({
        dayNumber: d,
        dateString: ds,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        holidays: filteredRecords.filter((h) => String(h.date).startsWith(ds)),
      })
    }

    return days
  }, [selectedYear, calendarMonth, filteredRecords])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const currentMonthHolidayCount = monthCounts[calendarMonth] || 0

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => employeeService.createHoliday(payload),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.holiday_created_success', 'Holiday created successfully'))
      qc.invalidateQueries({ queryKey: ['holidays'] })
      closeModal()
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to create holiday')
      toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) =>
      employeeService.updateHoliday(id, data),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.holiday_updated_success', 'Holiday updated successfully'))
      qc.invalidateQueries({ queryKey: ['holidays'] })
      closeModal()
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to update holiday')
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => employeeService.deleteHoliday(id),
    onSuccess: () => {
      sound.playDelete()
      toast.success(t('employees.holiday_deleted_success', 'Holiday deleted successfully'))
      qc.invalidateQueries({ queryKey: ['holidays'] })
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to delete holiday')
      toast.error(msg)
    },
  })

  const syncLiveApiMutation = useMutation({
    mutationFn: () => employeeService.syncLiveHolidays(selectedYear),
    onSuccess: (res: any) => {
      sound.playSuccess()
      const count = res?.data?.synced_count ?? 0
      toast.success(
        t('employees.sync_live_success', {
          count,
          year: selectedYear,
          defaultValue: `Successfully synchronized ${count} public holidays for year ${selectedYear}!`,
        })
      )
      qc.invalidateQueries({ queryKey: ['holidays'] })
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to synchronize public holidays')
      toast.error(msg)
    },
  })

  // Modal helpers
  const openCreateModal = (prefilledDate?: string) => {
    sound.playClick()
    setEditingItem(null)
    setFormTitleEn('')
    setFormTitleKm('')
    setFormDate(
      prefilledDate ||
        `${selectedYear}-${String(calendarMonth + 1).padStart(2, '0')}-01`
    )
    setFormDescription('')
    setFormStatus('active')
    setFormRecurring(true)
    setModalOpen(true)
  }

  const openEditModal = (item: HolidayItem) => {
    sound.playClick()
    setEditingItem(item)
    setFormTitleEn(item.title_en || '')
    setFormTitleKm(item.title_km || '')
    setFormDate(item.date ? String(item.date).split('T')[0] : `${selectedYear}-01-01`)
    setFormDescription(item.description || '')
    setFormStatus(item.status || 'active')
    setFormRecurring(Boolean(item.is_recurring))
    setModalOpen(true)
  }

  const closeModal = () => {
    setInternalModalOpen(false)
    if (propSetModalOpen) {
      propSetModalOpen(false)
    }
    setEditingItem(null)
  }

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!formTitleEn.trim() && !formTitleKm.trim()) {
      sound.playWarning()
      toast.warning(t('employees.holiday_title_required', 'Please enter a holiday title'))
      return
    }

    if (!formDate) {
      sound.playWarning()
      toast.warning(t('employees.holiday_date_required', 'Please select a holiday date'))
      return
    }

    const payload = {
      title_en: formTitleEn.trim() || formTitleKm.trim(),
      title_km: formTitleKm.trim() || formTitleEn.trim(),
      date: formDate,
      description: formDescription.trim(),
      status: formStatus,
      is_recurring: formRecurring,
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isCurrentRealMonth =
    calendarMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()

  return (
    <div className="space-y-3.5 print:hidden">
      {/* ─── 1. INTEGRATED YEAR & MONTH FILTER BAR (Harmonious & Frictionless) ─── */}
      <div className="flex items-center gap-2 py-0.5 overflow-x-auto no-scrollbar">
        {/* Year Stepper Pill */}
        <div className="flex items-center rounded-xl border border-border/80 bg-card p-0.5 shadow-2xs h-9 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setSelectedYear((y) => y - 1)
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={isKhmer ? 'ឆ្នាំមុន' : 'Previous Year'}
          >
            <ChevronLeft size={14} />
          </button>
          <div className="px-2 text-xs sm:text-[13px] font-bold text-foreground select-none flex items-center gap-1.5">
            <Calendar size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>{selectedYear}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setSelectedYear((y) => y + 1)
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={isKhmer ? 'ឆ្នាំបន្ទាប់' : 'Next Year'}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="h-5 w-px bg-border/80 shrink-0 mx-0.5" />

        {/* Current Month Quick Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick()
            setCalendarMonth(new Date().getMonth())
            setSelectedYear(new Date().getFullYear())
          }}
          className={`h-9 px-3.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            isCurrentRealMonth
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground border border-border/70 hover:bg-muted hover:text-foreground'
          }`}
        >
          <span>{isKhmer ? 'ខែនេះ' : 'Current'}</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-full font-medium ${
              isCurrentRealMonth
                ? 'bg-white/20 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {sortedRecords.length}
          </span>
        </button>

        {/* 12 Months Buttons */}
        {KHMER_MONTH_NAMES_SHORT.map((kmName, idx) => {
          const count = monthCounts[idx] || 0
          const isSelected = calendarMonth === idx
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                sound.playClick()
                setCalendarMonth(idx)
              }}
              className={`h-9 px-3 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-card text-muted-foreground border border-border/70 hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{isKhmer ? kmName : EN_MONTH_NAMES_SHORT[idx]}</span>
              {count > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ─── 2. MASTER UNIFIED CALENDAR CARD ─── */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Master Calendar Bar: Sleek, Harmonious, Cohesive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 border-b border-border/70 bg-card">
          {/* Left: Stepper + Month Title + Clean Integrated Count Pill */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center rounded-xl border border-border/80 bg-background p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  if (calendarMonth === 0) {
                    setCalendarMonth(11)
                    setSelectedYear((y) => y - 1)
                  } else {
                    setCalendarMonth((m) => m - 1)
                  }
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title={isKhmer ? 'ខែមុន' : 'Previous Month'}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  if (calendarMonth === 11) {
                    setCalendarMonth(0)
                    setSelectedYear((y) => y + 1)
                  } else {
                    setCalendarMonth((m) => m + 1)
                  }
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title={isKhmer ? 'ខែបន្ទាប់' : 'Next Month'}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Month & Year Title */}
            <h3 className="text-base sm:text-lg font-bold text-foreground select-none">
              {isKhmer
                ? `ខែ${KHMER_MONTH_NAMES_SHORT[calendarMonth]}`
                : EN_MONTH_NAMES_SHORT[calendarMonth]}{' '}
              {selectedYear}
            </h3>

            {/* Clean Harmonious Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span>
                {currentMonthHolidayCount} {isKhmer ? 'ថ្ងៃឈប់សម្រាក' : 'holidays'}
              </span>
            </div>

            {!isCurrentRealMonth && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setCalendarMonth(new Date().getMonth())
                  setSelectedYear(new Date().getFullYear())
                }}
                className="text-xs px-2.5 py-1 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-foreground font-medium transition-colors cursor-pointer"
              >
                {isKhmer ? 'ថ្ងៃនេះ' : 'Today'}
              </button>
            )}
          </div>

          {/* Right: Compact Search, Sync Button, Refresh (All h-9 height, perfectly matching) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative w-44 sm:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isKhmer ? 'ស្វែងរកថ្ងៃបុណ្យ...' : 'Search holiday...'}
                className="w-full h-9 pl-8.5 pr-7 rounded-xl bg-background border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sync Public Holidays Button */}
            <button
              type="button"
              onClick={() => syncLiveApiMutation.mutate()}
              disabled={syncLiveApiMutation.isPending}
              className="h-9 px-3.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              title={t('employees.sync_current_year_holidays_tooltip', {
                year: selectedYear,
                defaultValue: `Fetch official Cambodian public holidays for ${selectedYear}`,
              })}
            >
              {syncLiveApiMutation.isPending ? (
                <Loader2 size={13} className="animate-spin text-indigo-600 shrink-0" />
              ) : (
                <CalendarDays size={13} className="text-indigo-600 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {isKhmer ? 'Sync ថ្ងៃបុណ្យជាតិ' : 'Sync Holidays'}
              </span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => {
                sound.playClick()
                qc.invalidateQueries({ queryKey: ['holidays'] })
              }}
              disabled={isFetching}
              className="h-9 w-9 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
              title={isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
            >
              <RefreshCw
                size={14}
                className={isFetching ? 'animate-spin text-indigo-600' : 'text-muted-foreground'}
              />
            </button>
          </div>
        </div>

        {/* Empty Year Notice */}
        {sortedRecords.length === 0 && !isLoading && (
          <div className="p-3 mx-4 my-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <Info size={15} className="shrink-0 text-amber-600" />
              <span>
                {isKhmer
                  ? `មិនទាន់មានទិន្នន័យថ្ងៃឈប់សម្រាកសម្រាប់ឆ្នាំ ${selectedYear} ទេ។ ចុចទាញយកដើម្បីបញ្ចូលថ្ងៃបុណ្យជាតិកម្ពុជា។`
                  : `No holidays found for ${selectedYear}. Click sync to load public holidays.`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => syncLiveApiMutation.mutate()}
              disabled={syncLiveApiMutation.isPending}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <Sparkles size={12} />
              <span>{isKhmer ? 'ទាញយកថ្ងៃបុណ្យឥឡូវនេះ' : 'Sync Holidays'}</span>
            </button>
          </div>
        )}

        {/* Weekday Header Row */}
        <div className="grid grid-cols-7 border-b border-border/70 bg-muted/20 text-center">
          {(isKhmer ? WEEKDAY_NAMES_KM : WEEKDAY_NAMES_EN).map((dayName, idx) => {
            const isWeekend = idx >= 5
            return (
              <div
                key={dayName}
                className={`py-2.5 text-xs font-bold border-r last:border-r-0 border-border/50 ${
                  isWeekend
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/5'
                    : 'text-muted-foreground'
                }`}
              >
                {dayName}
              </div>
            )
          })}
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
          {calendarDays.map((cd, idx) => {
            const isToday = cd.dateString === todayStr
            const hasHolidays = cd.holidays.length > 0

            return (
              <div
                key={idx}
                className={`min-h-[110px] sm:min-h-[130px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors group relative ${
                  cd.isCurrentMonth
                    ? isToday
                      ? 'bg-amber-50/20 dark:bg-amber-950/15'
                      : cd.isWeekend
                      ? 'bg-muted/10'
                      : 'bg-background hover:bg-muted/10'
                    : 'bg-muted/25 opacity-35'
                }`}
              >
                {/* Cell Top: Day Number + Add Button */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isToday
                        ? 'bg-amber-500 text-white shadow-xs'
                        : hasHolidays
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : cd.isWeekend
                        ? 'text-amber-600 dark:text-amber-400 font-bold'
                        : 'text-foreground'
                    }`}
                  >
                    {cd.dayNumber}
                  </span>

                  {cd.isCurrentMonth && canCreateHoliday && (
                    <button
                      type="button"
                      onClick={() => openCreateModal(cd.dateString)}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-muted hover:bg-indigo-600 hover:text-white flex items-center justify-center text-muted-foreground transition-all text-xs cursor-pointer"
                      title={isKhmer ? 'បន្ថែមថ្ងៃបុណ្យចំថ្ងៃនេះ' : 'Add holiday on this date'}
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </div>

                {/* Holiday Event Badges (Soft Pastel Modern Badges) */}
                <div className="space-y-1.5 my-1.5 overflow-y-auto max-h-[80px] no-scrollbar">
                  {cd.holidays.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => openEditModal(h)}
                      className="p-1.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer transition-all flex flex-col gap-0.5 shadow-2xs"
                      title={`${h.title_km || h.title_en} (${GlobalFormat.displayDate(h.date)})`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                          <span className="truncate">{h.title_km || h.title_en}</span>
                        </div>
                        {h.is_recurring && (
                          <Repeat size={9} className="shrink-0 text-indigo-500 opacity-70" />
                        )}
                      </div>

                      {h.title_en && h.title_en !== h.title_km && (
                        <span className="text-[9px] text-muted-foreground truncate font-normal leading-none pl-2.5">
                          {h.title_en}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cell Footer note */}
                <div className="text-[10px] text-muted-foreground/60 text-right">
                  {cd.holidays.length > 1 && (
                    <span>{cd.holidays.length} {isKhmer ? 'បុណ្យ' : 'events'}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── ADD / EDIT HOLIDAY MODAL ─── */}
      <EnterpriseModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingItem
            ? t('employees.edit_holiday', 'Edit Holiday')
            : t('employees.add_holiday', 'Add Holiday')
        }
        subtitle={t('employees.holiday_modal_subtitle', 'Configure public holiday and non-working schedule')}
        icon={<Calendar size={20} />}
        iconVariant="emerald"
        size="2xl"
        badge={
          editingItem?.id ? (
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400 border border-border/60 dark:border-slate-700">
              #{editingItem.id}
            </span>
          ) : undefined
        }
        footer={
          <ModalFooter
            onCancel={closeModal}
            cancelLabel={t('common.cancel', 'Cancel')}
            submitLabel={
              editingItem
                ? t('common.saveChanges', 'Save Changes')
                : t('employees.add_holiday', 'Add Holiday')
            }
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            disabled={createMutation.isPending || updateMutation.isPending}
            isEdit={!!editingItem}
            submitButtonType="submit"
            onSubmit={() => handleFormSubmit()}
          />
        }
      >
        <form id="holiday-modal-form" onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField
              label={t('employees.holiday_title_km', 'Holiday Title (Khmer)')}
              required
            >
              <EnterpriseInput
                value={formTitleKm}
                onChange={(e) => setFormTitleKm(e.target.value)}
                placeholder={t('employees.holiday_title_km_placeholder', 'e.g. Traditional Khmer New Year')}
              />
            </FormField>

            <FormField
              label={t('employees.holiday_title_en', 'Holiday Title (English)')}
            >
              <EnterpriseInput
                value={formTitleEn}
                onChange={(e) => setFormTitleEn(e.target.value)}
                placeholder={t('employees.holiday_title_en_placeholder', 'e.g. Khmer New Year Traditional Holiday')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField
              label={t('employees.holiday_date', 'Date')}
              required
            >
              <EnterpriseDatePicker
                value={formDate}
                onChange={(val) => setFormDate(val || '')}
                placeholder="YYYY-MM-DD"
                clearable={false}
              />
            </FormField>

            <FormField
              label={t('employees.holiday_status', 'Status')}
            >
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                className="form-select"
              >
                <option value="active">{t('employees.active_holidays', 'Active')}</option>
                <option value="inactive">{t('employees.inactive_holidays', 'Inactive')}</option>
              </select>
            </FormField>
          </div>

          <FormField
            label={t('employees.holiday_description', 'Description')}
          >
            <EnterpriseTextarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={t('employees.holiday_description_placeholder', 'Brief description of holiday...')}
            />
          </FormField>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/40">
            <div className="space-y-0.5">
              <label
                onClick={() => setFormRecurring(!formRecurring)}
                className="text-xs font-semibold text-foreground cursor-pointer block select-none"
              >
                {t('employees.holiday_recurring', 'Recurring Yearly')}
              </label>
              <p className="text-[11px] text-muted-foreground select-none">
                {t('employees.holiday_recurring_desc', 'Automatically repeat this holiday every year on the same date')}
              </p>
            </div>
            <ToggleSwitch
              checked={formRecurring}
              onChange={setFormRecurring}
              size="md"
              activeColor="emerald"
            />
          </div>
        </form>
      </EnterpriseModal>

      {/* ─── DELETE CONFIRM DIALOG ─── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        isOpen={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title={t('employees.delete_holiday_title', 'Delete Holiday')}
        itemName={deleteTarget?.title_km || deleteTarget?.title_en || ''}
        message={t('employees.delete_holiday_confirm', {
          title: deleteTarget?.title_km || deleteTarget?.title_en || '',
          defaultValue: `Are you sure you want to delete holiday «${deleteTarget?.title_km || deleteTarget?.title_en}»?`,
        })}
        confirmText={t('common.delete', 'Delete')}
        confirmLabel={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

export default HolidaysTab
