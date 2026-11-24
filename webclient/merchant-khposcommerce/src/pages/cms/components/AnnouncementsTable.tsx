import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Megaphone,
  Sparkles,
  Eye,
  Tag,
  ExternalLink,
  Ticket,
  Check,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Power,
  Layers,
  X,
  Copy,
  Globe,
  CheckCircle2,
  Search,
  Calendar,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/common'
import { cmsService } from '@/services/cmsService'
import { marketingService } from '@/services/marketingService'
import { useToast } from '@/hooks/useToast'
import { downloadCsv } from '@/utils/export'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { AnnouncementConfig } from '../types/cms.types'

const SEASONAL_PRESETS = [
  {
    nameKm: '🎉 ពិធីបុណ្យអុំទូក',
    nameEn: 'Water Festival Promo',
    messageKm: '🎉 រីករាយព្រះរាជពិធីបុណ្យអុំទូក! បញ្ចុះតម្លៃពិសេស និងកាដូបន្ថែមជាច្រើនសម្រាប់រាល់ការកុម្ម៉ង់!',
    messageEn: '🎉 Happy Water Festival! Special discounts and exclusive free gifts on all orders!',
    badge: 'BON OM TOUK',
    coupon: 'WATERFESTIVAL',
    link: '/promotions',
    bg: 'from-blue-600 to-indigo-700',
  },
  {
    nameKm: 'ពិធីបុណ្យចូលឆ្នាំខ្មែរ',
    nameEn: 'Khmer New Year Mega Sale',
    messageKm: 'រីករាយពិធីបុណ្យចូលឆ្នាំថ្មី! បញ្ចុះតម្លៃពិសេសរហូតដល់ ៣៥% លើគ្រប់មុខទំនិញពេញនិយម!',
    messageEn: 'Happy Khmer New Year! Get up to 35% OFF on all trending items!',
    badge: 'KHMER NEW YEAR',
    coupon: 'KNY2026',
    link: '/promotions',
    bg: 'from-amber-600 to-rose-600',
  },
  {
    nameKm: '⚡ ប្រូម៉ូសិនពាក់កណ្តាលខែ',
    nameEn: 'Mid-Month Super Value Deals',
    messageKm: '⚡ មហោស្រពទិញទំនិញពាក់កណ្តាលខែ! បញ្ចុះបន្ថែម $១០ ភ្លាមៗជាមួយប័ណ្ណ MIDMONTH!',
    messageEn: '⚡ Super Mid-Month Deals! Extra $10 OFF with voucher code MIDMONTH!',
    badge: 'FLASH DEAL',
    coupon: 'MIDMONTH',
    link: '/promotions',
    bg: 'from-purple-600 to-pink-600',
  },
  {
    nameKm: '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃ',
    nameEn: 'Free Nationwide Delivery',
    messageKm: '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃគ្រប់ ២៥ រាជធានី-ខេត្ត សម្រាប់រាល់ការកុម្ម៉ង់ចាប់ពី $៥០ ឡើងទៅ!',
    messageEn: '🚚 Free Nationwide Delivery across Cambodia on all orders over $50!',
    badge: 'FREE DELIVERY',
    coupon: 'FREESHIP50',
    link: '/products',
    bg: 'from-emerald-600 to-teal-700',
  },
]

export interface AnnouncementsTableProps {
  records?: AnnouncementConfig[]
  isLoading?: boolean
  isFetching?: boolean
  onCreateNew?: () => void
  onEdit?: (item: AnnouncementConfig) => void
  onDuplicate?: (item: AnnouncementConfig) => void
  onApplyPreset?: (preset: typeof SEASONAL_PRESETS[0]) => void
  onApplyCoupon?: (coupon: any, discountLabel: string) => void
}

/**
 * Announcements Component (Pure Cards Grid - Clean Blog Style)
 * Displays store announcement campaigns as modern, interactive cards just like BlogArticlesGrid,
 * completely eliminating the cluttered table and offering a unified clean user experience.
 */
export const AnnouncementsTable: React.FC<AnnouncementsTableProps> = ({
  records: externalRecords,
  isLoading: isExternalLoading,
  isFetching: isExternalFetching,
  onCreateNew,
  onEdit,
  onDuplicate,
  onApplyPreset,
  onApplyCoupon,
}) => {
  const { t, i18n } = useTranslation(['cms', 'common', 'nav', 'buttons'])
  const toast = useToast()
  const qc = useQueryClient()

  // Search & Filter
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Pagination (6 cards per page for clean 2x3 or 3x2 grid)
  const [page, setPage] = useState(1)
  const perPage = 6

  // Preview language toggle: 'km' | 'en'
  const [previewLang, setPreviewLang] = useState<'km' | 'en'>(i18n.language?.startsWith('km') ? 'km' : 'en')

  useEffect(() => {
    setPreviewLang(i18n.language?.startsWith('km') ? 'km' : 'en')
  }, [i18n.language])
  // Active store coupons modal state
  const [isCouponPickerOpen, setIsCouponPickerOpen] = useState(false)

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // 1. Fetch announcements directly from Database table (if not provided externally)
  const {
    data: announcementsResponse,
    isLoading: isListLoadingInternal,
    isFetching: isFetchingInternal,
  } = useQuery({
    queryKey: ['announcements-db-list'],
    queryFn: () => cmsService.getAnnouncementsList({ per_page: 50 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !externalRecords,
  })

  const rawList: AnnouncementConfig[] = useMemo(() => {
    if (externalRecords) return externalRecords
    if (!announcementsResponse) return []
    const d = announcementsResponse?.data
    if (Array.isArray(d)) return d
    if (Array.isArray(d?.data)) return d.data
    if (Array.isArray(announcementsResponse)) return announcementsResponse
    return []
  }, [externalRecords, announcementsResponse])

  const isListLoading = isExternalLoading ?? isListLoadingInternal
  const isFetching = isExternalFetching ?? isFetchingInternal

  // Find currently active announcement from DB for Live Preview
  const activeAnnouncement = useMemo(() => {
    return rawList.find((a) => a.is_active) || rawList[0] || null
  }, [rawList])

  // 2. Fetch active store coupons dynamically from Database
  const { data: couponsData } = useQuery({
    queryKey: ['store-active-coupons-for-announcement'],
    queryFn: () => marketingService.getCoupons({ per_page: 20 }),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  const liveCoupons = useMemo(() => {
    if (!couponsData) return []
    const d = couponsData?.data
    const list = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : (Array.isArray(couponsData) ? couponsData : []))
    return list.filter((c: any) => c.is_active !== false)
  }, [couponsData])

  // Status counts
  const activeCount = useMemo(() => rawList.filter((r) => r.is_active).length, [rawList])
  const inactiveCount = useMemo(() => Math.max(0, rawList.length - activeCount), [rawList, activeCount])

  // Filtered list
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      // Status filter
      if (filterStatus === 'active' && !item.is_active) return false
      if (filterStatus === 'inactive' && item.is_active) return false

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchTitle = (item.title || '').toLowerCase().includes(q)
        const matchKm = (item.message_km || '').toLowerCase().includes(q)
        const matchEn = (item.message_en || item.message || '').toLowerCase().includes(q)
        const matchCode = (item.coupon_code || item.code || '').toLowerCase().includes(q)
        const matchBadge = (item.badge_text || '').toLowerCase().includes(q)
        if (!matchTitle && !matchKm && !matchEn && !matchCode && !matchBadge) return false
      }

      return true
    }).sort((a: any, b: any) => {
      // Active item always on top, then descending by ID
      if (a.is_active && !b.is_active) return -1
      if (!a.is_active && b.is_active) return 1
      return (b.id || 0) - (a.id || 0)
    })
  }, [rawList, filterStatus, search])

  // Pagination slicing
  const totalItems = filteredList.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedList = useMemo(() => {
    const startIndex = (page - 1) * perPage
    return filteredList.slice(startIndex, startIndex + perPage)
  }, [filteredList, page, perPage])

  // Toggle active announcement mutation (single primary banner)
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => cmsService.toggleAnnouncementActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      toast.success(t('cms.announcementActiveSuccess', 'Storefront announcement updated!'))
    },
    onError: () => {
      toast.error(t('cms.statusChangeFailed', 'Failed to update status'))
    },
  })

  // Delete announcement mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      setDeleteId(null)
      toast.success(t('cms.announcementDeletedSuccess', 'Announcement deleted successfully!'))
    },
    onError: () => {
      toast.error(t('cms.deleteFailed', 'Failed to delete announcement'))
    },
  })

  const handleEditRecord = (item: AnnouncementConfig) => {
    if (onEdit) {
      onEdit(item)
    }
  }

  const handleDuplicateRecord = (item: AnnouncementConfig) => {
    if (onDuplicate) {
      onDuplicate(item)
    }
  }

  const applySeasonalPreset = (preset: typeof SEASONAL_PRESETS[0]) => {
    if (onApplyPreset) {
      onApplyPreset(preset)
    }
  }

  const applyLiveCoupon = (coupon: any) => {
    const isPercent = coupon.type === 'percentage'
    const isFreeShip = coupon.type === 'free_shipping'
    const discountLabel = isFreeShip ? 'Free Delivery' : isPercent ? `${Number(coupon.value)}% OFF` : `$${Number(coupon.value)} OFF`
    setIsCouponPickerOpen(false)
    if (onApplyCoupon) {
      onApplyCoupon(coupon, discountLabel)
    }
  }

  const copyCouponToClipboard = (code: string) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    toast.success(t('cms.copiedCodeSuccess', { code, defaultValue: `បានចម្លងកូដ ${code} រួចរាល់!` }))
  }
  const isStorefrontLive = Boolean(activeAnnouncement?.is_active)

  return (
    <div className="space-y-6">

      {/* ── 1. LIVE STOREFRONT HEADER PREVIEW (Full Width Hero Card) ── */}
      <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow hover:shadow-md p-5 overflow-hidden transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Megaphone size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span>{t('cms.announcementLivePreview', 'Live Storefront Header Preview')}</span>
                {isStorefrontLive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                    {t('cms.activeOnStorefront', 'Active on Storefront')}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                    {t('cms.disabledInactive', 'Inactive')}
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('cms.announcementLiveDesc', 'Real-time rendering of the banner as displayed to shoppers at the top of your store.')}
              </p>
            </div>
          </div>

          {/* Right Controls: Preview Lang Toggle & Master Switch */}
          <div className="flex items-center gap-2.5">

            {/* Master Toggle */}
            {activeAnnouncement && (
              <button
                type="button"
                onClick={() => activeAnnouncement?.id && toggleActiveMutation.mutate(activeAnnouncement.id)}
                disabled={toggleActiveMutation.isPending}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  isStorefrontLive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-muted hover:bg-muted/80 text-foreground border-border'
                }`}
              >
                <Power size={12} />
                <span>{isStorefrontLive ? t('cms.openStorefront', 'កំពុងបើកផ្សាយ') : t('cms.disableStorefront', 'បិទទុក')}</span>
              </button>
            )}

            <a
              href="http://localhost:5172"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground hover:text-primary border border-border text-xs font-semibold transition-all"
            >
              <span>{t('cms.storefront', 'Storefront')}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Live Banner Mockup (Clean, Authentic Preview) */}
        <div className="mt-3.5 rounded-xl border border-border/80 overflow-hidden shadow-xs">
          {/* Mini Browser Bar */}
          <div className="bg-muted/40 border-b border-border/60 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/80 bg-background/80 px-2.5 py-0.5 rounded border border-border/50">
              <span className="text-emerald-600 font-semibold">https://</span>
              <span>optapos.store/</span>
            </div>
            <div className="text-[10px] text-muted-foreground/60 font-medium">Storefront Header</div>
          </div>

          {activeAnnouncement && isStorefrontLive ? (
            <div
              className={`w-full py-2.5 px-4 bg-gradient-to-r ${
                activeAnnouncement.bg_gradient || 'from-indigo-600 to-purple-700'
              } text-white transition-all duration-300 flex flex-wrap items-center justify-between gap-2.5 text-xs`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {activeAnnouncement.badge_text && (
                  <span className="bg-white/20 backdrop-blur-2xs text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-white/20">
                    {activeAnnouncement.badge_text}
                  </span>
                )}
                <span className="font-bold truncate text-xs sm:text-sm">
                  {previewLang === 'km'
                    ? (activeAnnouncement.message_km || activeAnnouncement.message_en)
                    : (activeAnnouncement.message_en || activeAnnouncement.message_km)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeAnnouncement.coupon_code && (
                  <button
                    type="button"
                    onClick={() => copyCouponToClipboard(activeAnnouncement.coupon_code)}
                    className="bg-black/35 hover:bg-black/50 text-amber-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg border border-amber-300/30 flex items-center gap-1 transition-colors cursor-pointer"
                    title={t('cms.clickToCopy', 'ចុចដើម្បីចម្លងកូដ')}
                  >
                    <Tag size={11} />
                    <span>{activeAnnouncement.coupon_code}</span>
                    <Copy size={10} className="opacity-70 ml-0.5" />
                  </button>
                )}
                <span className="text-[11px] font-bold underline flex items-center gap-1 hover:text-white/80 cursor-pointer">
                  <span>{t('cms.shopNow', 'Shop Now')}</span>
                  <ExternalLink size={10} />
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 px-4 text-center text-xs text-muted-foreground italic bg-muted/20 flex items-center justify-center gap-2.5">
              <span>{t('cms.announcementBarHidden', 'The top announcement strip is currently turned off.')}</span>
              {activeAnnouncement && (
                <button
                  type="button"
                  onClick={() => activeAnnouncement?.id && toggleActiveMutation.mutate(activeAnnouncement.id)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-2xs"
                >
                  {t('cms.publishThisCampaign', 'បើកផ្សាយ Banner នេះ')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. ANNOUNCEMENT CARDS GRID (Pure Clean Cards - Just Like BlogArticlesGrid) ── */}
      {isListLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 print:hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm animate-pulse flex flex-col"
            >
              <div className="w-full h-32 bg-muted/70 relative" />
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded-md w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <div className="h-6 bg-muted rounded w-28" />
                  <div className="h-7 bg-muted rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : paginatedList.length === 0 ? (
        <div className="bg-card rounded-2xl sm:rounded-3xl border border-border p-12 text-center text-muted-foreground space-y-3 shadow-sm print:hidden">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
            <Megaphone size={28} />
          </div>
          <h4 className="font-bold text-foreground text-base sm:text-lg">
            {t('cms.noAnnouncementsDesc', 'No announcement campaigns found')}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {t('cms.noAnnouncementsSubtitle', 'មិនមានយុទ្ធនាការដែលត្រូវគ្នានឹងការស្វែងរកឡើយ។ ចុចប៊ូតុងបង្កើតថ្មី ឬជ្រើសរើសគំរូពិធីបុណ្យខាងលើ។')}
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 print:hidden transition-opacity duration-200 ${
            isFetching ? 'opacity-70' : 'opacity-100'
          }`}
        >
          {paginatedList.map((item) => {
            const isActive = Boolean(item.is_active)
            const currentMessage = previewLang === 'km'
              ? (item.message_km || item.message_en || item.message || '')
              : (item.message_en || item.message_km || item.message || '')

            return (
              <div
                key={item.id}
                className={`group relative bg-card rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                  isActive
                    ? 'ring-2 ring-emerald-500/40 border-emerald-500/60 bg-emerald-500/3 dark:bg-emerald-950/15 shadow-md shadow-emerald-500/10'
                    : 'border-border/80 hover:border-primary/40'
                }`}
              >
                {/* ── Card Thumbnail Banner Strip Mockup ── */}
                <div
                  onClick={() => handleEditRecord(item)}
                  className={`relative w-full h-24 px-4 py-2.5 bg-gradient-to-r ${
                    item.bg_gradient || 'from-indigo-600 to-purple-700'
                  } text-white shrink-0 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm group-hover:brightness-105 transition-all`}
                >
                  {/* Top Row: Floating Badge & Subtle Coupon Tag */}
                  <div className="flex items-center justify-between gap-2 z-10">
                    {item.badge_text ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/25 shadow-2xs">
                        {item.badge_text}
                      </span>
                    ) : (
                      <span />
                    )}

                    {item.coupon_code && (
                      <span className="font-mono text-[9px] font-bold text-white/90 bg-black/25 backdrop-blur-xs px-2 py-0.5 rounded border border-white/15">
                        {item.coupon_code}
                      </span>
                    )}
                  </div>

                  {/* Bottom: Announcement Message Preview */}
                  <div className="z-10">
                    <p className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug drop-shadow-xs">
                      {currentMessage}
                    </p>
                  </div>
                </div>

                {/* ── Card Content Body ── */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-2">
                    {/* Campaign Title */}
                    <div>
                      <h3
                        onClick={() => handleEditRecord(item)}
                        className="font-bold text-sm sm:text-base text-foreground hover:text-primary cursor-pointer transition-colors truncate group-hover:text-primary"
                        title={item.title}
                      >
                        {item.title || t('cms.campaignId', { id: item.id, defaultValue: `យុទ្ធនាការ #${item.id}` })}
                      </h3>
                    </div>

                    {/* Attributes: Coupon Code & Target Link */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                      {item.coupon_code && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyCouponToClipboard(item.coupon_code!)
                          }}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer shadow-2xs"
                          title={t('cms.clickToCopy', 'ចុចដើម្បីចម្លងកូដ')}
                        >
                          <Tag size={11} className="stroke-[2.5]" />
                          <span>{item.coupon_code}</span>
                          <Copy size={10} className="opacity-60 ml-0.5" />
                        </button>
                      )}

                      {item.link_url && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                          <ExternalLink size={10} />
                          <span>{item.link_url}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Card Footer: Status Action & Management ── */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-auto select-none">
                    {/* Left: Storefront Activation Status */}
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('cms.broadcastingOnStorefront', 'កំពុងផ្សាយលើ Storefront')}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => item.id && toggleActiveMutation.mutate(item.id)}
                        disabled={toggleActiveMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted hover:bg-primary hover:text-white text-muted-foreground hover:text-primary-foreground border border-border text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                        title={t('cms.publishThisCampaign', 'ផ្សាយយុទ្ធនាការនេះ')}
                      >
                        <Power size={11} />
                        <span>{t('cms.publishThisCampaign', 'ផ្សាយយុទ្ធនាការនេះ')}</span>
                      </button>
                    )}

                    {/* Right: Quick Edit, Duplicate, Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditRecord(item)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground hover:text-primary transition-colors cursor-pointer"
                        title={t('common.edit', 'កែសម្រួល')}
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateRecord(item)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground hover:text-primary transition-colors cursor-pointer"
                        title={t('common.duplicate', 'ចម្លងយុទ្ធនាការ')}
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.id) {
                            setDeleteId(item.id)
                            setConfirmOpen(true)
                          }
                        }}
                        className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/10 text-foreground hover:text-rose-600 transition-colors cursor-pointer"
                        title={t('common.delete', 'លុប')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* ── CREATE NEW CAMPAIGN DASHED CARD (Balances Grid & Quick Action) ── */}
          {onCreateNew && (
            <div
              onClick={onCreateNew}
              className="group relative rounded-2xl sm:rounded-3xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-card/60 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[220px] shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300 mb-3 group-hover:scale-110 shadow-xs">
                <Plus size={22} className="stroke-[2.5]" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                {t('cms.createCampaign', 'បង្កើតយុទ្ធនាការថ្មី')}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[210px] leading-relaxed">
                {t('cms.createCampaignDesc', 'បន្ថែមបដាជូនដំណឹង Flash Deal ឬ Coupon ថ្មីទៅកាន់ Storefront')}
              </p>
              <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
                <span>{t('cms.clickToCreate', 'ចុចដើម្បីបង្កើត')}</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── 4. CENTERED PAGINATION (Matching Blog Page Standard) ── */}
      <Pagination
        currentPage={page}
        lastPage={totalPages}
        total={totalItems}
        perPage={perPage}
        onPageChange={setPage}
        variant="centered"
        isLoading={isListLoading || isFetching}
      />

      {/* ─── STORE COUPONS PICKER MODAL (GLOBAL SHARED MODAL) ─── */}
      <Modal
        isOpen={isCouponPickerOpen}
        onClose={() => setIsCouponPickerOpen(false)}
        title={t('cms.selectStoreCoupon', 'ជ្រើសរើសប័ណ្ណបញ្ចុះតម្លៃពីប្រព័ន្ធ (Store Coupons)')}
        subtitle={t('cms.selectStoreCouponDesc', 'ជ្រើសរើសប័ណ្ណបញ្ចុះតម្លៃណាមួយខាងក្រោមដើម្បីបង្កើត Announcement Campaign ដោយស្វ័យប្រវត្តិ៖')}
        icon={<Ticket size={18} />}
        iconVariant="amber"
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {liveCoupons.map((c: any) => {
            const isPercent = c.type === 'percentage'
            const isFreeShip = c.type === 'free_shipping'
            const discountBadge = isFreeShip ? 'Free Shipping' : isPercent ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => applyLiveCoupon(c)}
                className="text-left p-3 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-black text-foreground group-hover:text-primary">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {discountBadge}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-1">
                  {c.name || 'Coupon'}
                </p>
                <div className="text-[10px] text-primary font-bold mt-2">
                  {t('cms.useInAnnouncement', '+ ប្រើក្នុង Announcement')}
                </div>
              </button>
            )
          })}
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle', 'Confirm Deletion')}
        message={t('confirm.deleteMessage', 'Are you sure you want to delete this announcement campaign?')}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isDanger
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />
    </div>
  )
}

export default AnnouncementsTable