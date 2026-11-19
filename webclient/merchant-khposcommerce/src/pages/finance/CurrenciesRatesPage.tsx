import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Coins,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  SlidersHorizontal,
} from 'lucide-react'
import { financeService } from '@/services/financeService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { usePermission } from '@/hooks/usePermission'
import { Breadcrumb } from '@/components/common'
import {
  HeaderActionsGroup,
  AddButton,
  ConfirmModal,
} from '@/components/common'
import { focusFirstInvalidField } from '@/utils/formValidation'
import type { CurrencyForm, CurrencyItem } from './types/currency.types'
import {
  CurrenciesRatesStatsCards,
  CurrenciesRatesOverviewPanels,
  CurrenciesRatesTable,
  CurrenciesRatesConverter,
  CurrenciesRatesFormDrawer,
  CurrencySearchBar,
} from './components'

// Official National Bank of Cambodia indicative daily reference rate
const NBC_REFERENCE_RATE = 4080

export const CurrenciesRatesPage: React.FC = () => {
  const { t, i18n } = useTranslation(['finance', 'common', 'nav'])
  const isKhmer = i18n.language === 'km'
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  // Permissions
  const canCreateCurrency = hasPermission('currency.create')
  const canUpdateCurrency = hasPermission('currency.update')
  const canDeleteCurrency = hasPermission('currency.delete')

  // Search & Filter State for Table
  const [search, setSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sourceFilter, setSourceFilter] = useState<string>('')

  // Drawer / Modal State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CurrencyItem | null>(null)
  const [currencyForm, setCurrencyForm] = useState<CurrencyForm>({
    name: '',
    code: '',
    symbol: '',
    exchange_rate: '1.00',
    is_active: true,
    is_default: false,
    rate_source: 'manual',
    decimal_precision: 2,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    id: number | null
    name?: string
  }>({
    open: false,
    id: null,
    name: '',
  })

  // Fetch Currencies from API
  const {
    data: currenciesData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['currencies-tab'],
    queryFn: () => financeService.getCurrencies({ per_page: 50 }),
    staleTime: 30_000,
  })

  const currencies: CurrencyItem[] = useMemo(() => {
    return currenciesData?.data ?? []
  }, [currenciesData])

  // Existing ISO codes for uniqueness check
  const existingCodes = useMemo(() => {
    return currencies.map((c) => (c.code || '').toUpperCase())
  }, [currencies])

  // Identify Core Currencies (USD & KHR)
  const usdCurrency: CurrencyItem = useMemo(() => {
    return (
      currencies.find((c) => (c.code || '').toUpperCase() === 'USD') || {
        id: 1,
        code: 'USD',
        symbol: '$',
        name: isKhmer ? 'ដុល្លារអាមេរិក (US Dollar)' : 'US Dollar',
        exchange_rate: 1,
        is_active: true,
        is_default: true,
      }
    )
  }, [currencies, isKhmer])

  const khrCurrency: CurrencyItem = useMemo(() => {
    return (
      currencies.find((c) => (c.code || '').toUpperCase() === 'KHR') || {
        id: 2,
        code: 'KHR',
        symbol: '៛',
        name: isKhmer ? 'រៀលកម្ពុជា (Cambodian Riel)' : 'Cambodian Riel',
        exchange_rate: 4100,
        is_active: true,
        is_default: false,
      }
    )
  }, [currencies, isKhmer])

  // Inline Rate Editor State for KHR Panel
  const [khrInputRate, setKhrInputRate] = useState<string>('4100')

  useEffect(() => {
    if (khrCurrency?.exchange_rate) {
      setKhrInputRate(String(Number(khrCurrency.exchange_rate) || 4100))
    }
  }, [khrCurrency?.exchange_rate])

  // Quick Currency Rate Update Mutation (1-click inline or NBC sync)
  const quickUpdateRateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      financeService.updateCurrency(id, payload),
    onSuccess: (_, variables) => {
      sound.playSuccess()
      qc.invalidateQueries({ queryKey: ['currencies-tab'] })
      toast.success(
        isKhmer
          ? `បានកែសម្រួលអត្រាប្តូរប្រាក់ 1 USD = ${Number(variables.payload.exchange_rate).toLocaleString()} ៛ ដោយជោគជ័យ!`
          : `Successfully updated exchange rate to 1 USD = ${Number(variables.payload.exchange_rate).toLocaleString()} KHR!`
      )
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(
        err?.response?.data?.message ||
          (isKhmer ? 'មិនអាចកែប្រែអត្រាប្តូរប្រាក់បានទេ' : 'Failed to update exchange rate.')
      )
    },
  })

  const handleSaveKhrRate = (newRate: number) => {
    if (!khrCurrency?.id) return
    quickUpdateRateMutation.mutate({
      id: khrCurrency.id,
      payload: {
        name: khrCurrency.name,
        code: khrCurrency.code,
        symbol: khrCurrency.symbol,
        exchange_rate: newRate,
        is_active: khrCurrency.is_active,
        is_default: false,
      },
    })
  }

  // Full Save Mutation (from Drawer)
  const saveMutation = useMutation({
    mutationFn: (payload: CurrencyForm) => {
      if (editingItem) {
        return financeService.updateCurrency(editingItem.id, payload)
      } else {
        return financeService.createCurrency({ ...payload, company_id: 1 })
      }
    },
    onSuccess: () => {
      sound.playSuccess()
      qc.invalidateQueries({ queryKey: ['currencies-tab'] })
      toast.success(
        editingItem
          ? isKhmer
            ? 'បានកែសម្រួលរូបិយប័ណ្ណដោយជោគជ័យ'
            : 'Currency updated successfully'
          : isKhmer
          ? 'បានបង្កើតរូបិយប័ណ្ណថ្មីដោយជោគជ័យ'
          : 'Currency created successfully'
      )
      setDrawerOpen(false)
      setEditingItem(null)
    },
    onError: (err: any) => {
      sound.playError()
      const apiErrors = err?.response?.data?.errors
      if (apiErrors && typeof apiErrors === 'object') {
        const fieldErrors: Record<string, string> = {}
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key]
        })
        setErrors(fieldErrors)
        focusFirstInvalidField(fieldErrors)
        return
      }
      toast.error(
        err?.response?.data?.message ||
          (isKhmer ? 'ប្រតិបត្តិការបរាជ័យ' : 'Operation failed')
      )
    },
  })

  // Delete Mutation (for non-core currencies)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deleteCurrency(id),
    onSuccess: () => {
      sound.playSuccess()
      qc.invalidateQueries({ queryKey: ['currencies-tab'] })
      toast.success(
        isKhmer ? 'បានលុបរូបិយប័ណ្ណដោយជោគជ័យ' : 'Currency deleted successfully'
      )
      setDeleteConfirm({ open: false, id: null, name: '' })
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(
        err?.response?.data?.message ||
          (isKhmer ? 'មិនអាចលុបរូបិយប័ណ្ណបានទេ' : 'Failed to delete currency')
      )
    },
  })

  // Open Drawer for Add
  const handleOpenAdd = () => {
    sound.playClick()
    setEditingItem(null)
    setCurrencyForm({
      name: '',
      code: '',
      symbol: '',
      exchange_rate: '1.00',
      is_active: true,
      is_default: false,
      rate_source: 'manual',
      decimal_precision: 2,
    })
    setErrors({})
    setDrawerOpen(true)
  }

  // Open Drawer for Edit
  const handleOpenEdit = (item: CurrencyItem) => {
    sound.playClick()
    setEditingItem(item)
    setCurrencyForm({
      name: item.name,
      code: item.code,
      symbol: item.symbol,
      exchange_rate: String(item.exchange_rate),
      is_active: item.is_active,
      is_default: item.is_default,
      rate_source: item.rate_source || 'manual',
      decimal_precision: item.decimal_precision ?? (item.code === 'KHR' ? 0 : 2),
    })
    setErrors({})
    setDrawerOpen(true)
  }

  const handleSaveCurrency = () => {
    const newErrors: Record<string, string> = {}
    if (!currencyForm.name.trim()) {
      newErrors.name = isKhmer ? 'សូមបញ្ចូលឈ្មោះរូបិយប័ណ្ណ' : t('finance.currency_name_required', 'Please enter currency name')
    }
    if (!currencyForm.code.trim()) {
      newErrors.code = isKhmer ? 'សូមបញ្ចូលលេខកូដ ISO រូបិយប័ណ្ណ' : t('finance.currency_code_required', 'Please enter ISO currency code')
    }
    if (!currencyForm.symbol.trim()) {
      newErrors.symbol = isKhmer ? 'សូមបញ្ចូលនិមិត្តសញ្ញារូបិយប័ណ្ណ' : t('finance.currency_symbol_required', 'Please enter currency symbol')
    }
    if (!currencyForm.exchange_rate || isNaN(Number(currencyForm.exchange_rate)) || Number(currencyForm.exchange_rate) <= 0) {
      newErrors.exchange_rate = isKhmer ? 'សូមបញ្ចូលអត្រាប្តូរប្រាក់ត្រឹមត្រូវ' : t('finance.currency_rate_required', 'Please enter exchange rate')
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }
    saveMutation.mutate(currencyForm)
  }

  // Trigger Delete Modal
  const handleDeleteTrigger = (id: number, name?: string) => {
    sound.playClick()
    setDeleteConfirm({ open: true, id, name })
  }

  // Handle Refresh
  const handleRefresh = () => {
    sound.playClick()
    refetch()
    toast.success(
      isKhmer
        ? 'បានទាញយកទិន្នន័យអត្រាប្តូរប្រាក់ចុងក្រោយ'
        : 'Exchange rates refreshed successfully'
    )
  }

  const khrNumericRate = Number(khrCurrency?.exchange_rate || 4100)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* ─── SECTION A: PAGE HEADER ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: isKhmer ? 'ហិរញ្ញវត្ថុ' : 'Finance', href: '/finance' },
              { label: isKhmer ? 'រូបិយប័ណ្ណ' : 'Currencies' },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isKhmer ? 'រូបិយប័ណ្ណ & អត្រាប្តូរប្រាក់' : 'Currencies'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
              {isKhmer ? 'រូបិយប័ណ្ណទ្វេ (Dual-Currency)' : 'Dual Currency Hub'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isKhmer
              ? 'គ្រប់គ្រងរូបិយប័ណ្ណប្រតិបត្តិការ និងអត្រាប្តូរប្រាក់ប្រចាំថ្ងៃសម្រាប់ប្រព័ន្ធ POS'
              : 'Manage currencies and daily exchange rates for POS operations'}
          </p>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-2">
          {/* Secondary Action: Refresh Rates */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="h-9 px-3.5 rounded-lg border border-border/80 bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            title={isKhmer ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh Rates'}
          >
            <RefreshCw
              size={14}
              className={isFetching ? 'animate-spin text-primary' : 'text-muted-foreground'}
            />
            <span>{isKhmer ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh Rates'}</span>
          </button>

          {/* Primary Action: + Add Currency */}
          {canCreateCurrency && (
            <AddButton
              onClick={handleOpenAdd}
              label={isKhmer ? 'បន្ថែមរូបិយប័ណ្ណ' : 'Add Currency'}
              className="h-9 text-xs font-semibold shadow-2xs"
            />
          )}
        </div>
      </div>

      {/* ─── SECTION B: COMPACT SUMMARY CARDS (4 CARDS) ─── */}
      <CurrenciesRatesStatsCards currencies={currencies} isLoading={isLoading} />

      {/* ─── SECTION C: BASE CURRENCY (USD) & LOCAL CURRENCY (KHR) OVERVIEW PANELS ─── */}
      <CurrenciesRatesOverviewPanels
        usdCurrency={usdCurrency}
        khrCurrency={khrCurrency}
        khrInputRate={khrInputRate}
        setKhrInputRate={setKhrInputRate}
        isSaving={quickUpdateRateMutation.isPending}
        onSaveKhrRate={handleSaveKhrRate}
        nbcRate={NBC_REFERENCE_RATE}
        canUpdateCurrency={canUpdateCurrency}
      />

      {/* ─── SECTION D: ALL CURRENCIES MANAGEMENT (ENTERPRISE TABLE) ─── */}
      <div className="space-y-3">
        <CurrencySearchBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sourceFilter={sourceFilter}
          onSourceChange={setSourceFilter}
          onReset={() => {
            setSearch('')
            setStatusFilter('')
            setSourceFilter('')
          }}
        />

        <CurrenciesRatesTable
          currencies={currencies}
          isLoading={isLoading}
          isFetching={isFetching}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          onRefresh={handleRefresh}
          openEditDrawer={handleOpenEdit}
          onDeleteCurrency={handleDeleteTrigger}
          canUpdateCurrency={canUpdateCurrency}
          canDeleteCurrency={canDeleteCurrency}
          nbcRate={NBC_REFERENCE_RATE}
        />
      </div>

      {/* ─── SECTION F & G: INTERACTIVE POS CONVERTER & QUICK CHANGE REFERENCE ─── */}
      <CurrenciesRatesConverter
        currencies={currencies.length > 0 ? currencies : [usdCurrency, khrCurrency]}
        khrRate={khrNumericRate}
      />

      {/* ─── SECTION E: ADD / EDIT CURRENCY DRAWER / MODAL ─── */}
      <CurrenciesRatesFormDrawer
        isOpen={drawerOpen}
        onClose={() => {
          sound.playClick()
          setDrawerOpen(false)
          setEditingItem(null)
          setErrors({})
        }}
        editingItem={editingItem}
        onSubmit={handleSaveCurrency}
        isPending={saveMutation.isPending}
        currencyForm={currencyForm}
        setCurrencyForm={setCurrencyForm}
        existingCodes={existingCodes}
        errors={errors}
        onClearError={handleClearError}
      />

      {/* ─── DELETE CONFIRM MODAL ─── */}
      <ConfirmModal
        isOpen={deleteConfirm.open}
        variant="danger"
        actionType="delete"
        title={isKhmer ? 'លុបរូបិយប័ណ្ណ?' : 'Delete Currency?'}
        message={
          isKhmer
            ? `តើអ្នកពិតជាចង់លុបរូបិយប័ណ្ណ "${deleteConfirm.name}" មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានឡើយ។`
            : `Are you sure you want to delete the currency "${deleteConfirm.name}"? This action cannot be undone.`
        }
        confirmLabel={isKhmer ? 'លុបចេញ' : 'Delete'}
        cancelLabel={isKhmer ? 'បោះបង់' : 'Cancel'}
        onConfirm={() => {
          if (deleteConfirm.id) {
            deleteMutation.mutate(deleteConfirm.id)
          }
        }}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default CurrenciesRatesPage
