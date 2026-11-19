import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { cmsService } from '@/services/cmsService'
import { useToast } from '@/hooks/useToast'
import { downloadCsv } from '@/utils/export'
import { Breadcrumb } from '@/components/common'
import { HeaderActionsGroup, AddButton, ExportButton } from '@/components/common'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { AnnouncementsTable, CMSFormModal } from './components'
import type { AnnouncementConfig } from './types/cms.types'

export const AnnouncementsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['cms', 'common', 'nav'])
  const toast = useToast()
  const qc = useQueryClient()

  // Form Modal States (Global to the page, matching all other CMS pages)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AnnouncementConfig | null>(null)
  const [title, setTitle] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [messageKm, setMessageKm] = useState('')
  const [messageEn, setMessageEn] = useState('')
  const [badgeText, setBadgeText] = useState('SPECIAL PROMO')
  const [couponCode, setCouponCode] = useState('OPTAPOS2026')
  const [linkUrl, setLinkUrl] = useState('/promotions')
  const [bgGradient, setBgGradient] = useState('from-indigo-600 to-purple-700')
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

  // Fetch announcements list directly to ensure accurate, synchronized data
  const { data: announcementsResponse, isLoading: isAnnouncementsLoading, isFetching } = useQuery({
    queryKey: ['announcements-db-list'],
    queryFn: () => cmsService.getAnnouncementsList({ per_page: 50 }),
    staleTime: 5 * 60 * 1000,
  })

  const rawList: AnnouncementConfig[] = useMemo(() => {
    if (!announcementsResponse) return []
    const d = announcementsResponse?.data
    if (Array.isArray(d)) return d
    if (Array.isArray(d?.data)) return d.data
    if (Array.isArray(announcementsResponse)) return announcementsResponse
    return []
  }, [announcementsResponse])

  // Save / Update Mutation via global CMSFormModal
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingItem?.id) {
        return cmsService.updateAnnouncement(editingItem.id, data)
      }
      return cmsService.createAnnouncement(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setModalOpen(false)
      toast.success(
        editingItem?.id
          ? t('cms.announcementUpdated', 'Announcement updated successfully!')
          : t('cms.announcementCreated', 'Announcement created successfully!')
      )
    },
    onError: (err: any) => {
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
      toast.error(err?.response?.data?.message ?? t('cms.announcementSaveFailed', 'Failed to save announcement'))
    },
  })

  const handleCreateNew = () => {
    setEditingItem(null)
    setTitle('')
    setIsActive(true)
    setMessageKm('')
    setMessageEn('')
    setBadgeText('SPECIAL PROMO')
    setCouponCode('')
    setLinkUrl('/promotions')
    setBgGradient('from-indigo-600 to-purple-700')
    setErrors({})
    setModalOpen(true)
  }

  const handleEditRecord = (item: AnnouncementConfig) => {
    setEditingItem(item)
    setTitle(item.title || '')
    setIsActive(item.is_active ?? true)
    setMessageKm(item.message_km || '')
    setMessageEn(item.message_en || item.message || '')
    setBadgeText(item.badge_text || 'SPECIAL PROMO')
    setCouponCode(item.coupon_code || item.code || '')
    setLinkUrl(item.link_url || item.link || '/promotions')
    setBgGradient(item.bg_gradient || 'from-indigo-600 to-purple-700')
    setErrors({})
    setModalOpen(true)
  }

  const handleDuplicateRecord = (item: AnnouncementConfig) => {
    setEditingItem(null)
    setTitle(`${item.title || 'Campaign'} ${t('cms.campaignCopiedSuffix', '(ចម្លង)')}`)
    setIsActive(false)
    setMessageKm(item.message_km || '')
    setMessageEn(item.message_en || item.message || '')
    setBadgeText(item.badge_text || 'SPECIAL PROMO')
    setCouponCode(item.coupon_code || item.code || '')
    setLinkUrl(item.link_url || item.link || '/promotions')
    setBgGradient(item.bg_gradient || 'from-indigo-600 to-purple-700')
    setErrors({})
    setModalOpen(true)
    toast.info(t('cms.duplicatedCampaignNotice', 'បានចម្លងព័ត៌មានយុទ្ធនាការ។ អ្នកអាចកែសម្រួលរួចចុចរក្សាទុក!'))
  }

  const handleApplyPreset = (preset: any) => {
    setEditingItem(null)
    const presetTitle = i18n.language?.startsWith('km') ? preset.nameKm : preset.nameEn
    setTitle(presetTitle)
    setIsActive(true)
    setMessageKm(preset.messageKm)
    setMessageEn(preset.messageEn)
    setBadgeText(preset.badge)
    setCouponCode(preset.coupon)
    setLinkUrl(preset.link)
    setBgGradient(preset.bg)
    setErrors({})
    setModalOpen(true)
    toast.info(t('cms.loadedPresetSuccess', { name: presetTitle, defaultValue: `បានផ្ទុកគំរូ៖ ${presetTitle}` }))
  }

  const handleApplyCoupon = (coupon: any, discountLabel: string) => {
    setEditingItem(null)
    setTitle(`Campaign: ${coupon.name || coupon.code}`)
    setIsActive(true)
    setCouponCode(coupon.code)
    setBadgeText(discountLabel)
    setMessageKm(
      t('cms.couponAnnouncementMsgKm', {
        code: coupon.code,
        discount: discountLabel,
        name: coupon.name || 'Store',
        defaultValue: `🎉 ប្រើកូដ ${coupon.code} ទទួលបានការបញ្ចុះតម្លៃ ${discountLabel} សម្រាប់ការកុម្ម៉ង់!`,
      })
    )
    setMessageEn(
      t('cms.couponAnnouncementMsgEn', {
        code: coupon.code,
        discount: discountLabel,
        name: coupon.name || 'Store',
        defaultValue: `🎉 Use coupon code ${coupon.code} to get ${discountLabel} on your orders!`,
      })
    )
    setLinkUrl('/products')
    setBgGradient('from-indigo-600 to-purple-700')
    setErrors({})
    setModalOpen(true)
    toast.info(t('cms.couponLinkedSuccess', { code: coupon.code, defaultValue: `បានភ្ជាប់ជាមួយប័ណ្ណបញ្ចុះតម្លៃ៖ ${coupon.code}` }))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!title.trim()) {
      newErrors.title = t('cms.campaignTitleRequired', 'សូមបញ្ចូលចំណងជើងយុទ្ធនាការ')
    }
    if (!messageKm.trim()) {
      newErrors.messageKm = t('cms.messageKmRequired', 'សូមបញ្ចូលខ្លឹមសារសេចក្ដីជូនដំណឹងជាភាសាខ្មែរ')
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }

    const payload = {
      title: title.trim(),
      message_km: messageKm.trim(),
      message_en: messageEn.trim(),
      badge_text: badgeText.trim(),
      coupon_code: couponCode.trim(),
      link_url: linkUrl.trim(),
      bg_gradient: bgGradient,
      is_active: isActive,
    }
    saveMutation.mutate(payload)
  }

  return (
    <div className="space-y-5 print:p-0">
      {/* ── 1. BREADCRUMB (Top, by itself) ── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('cms.contentManagement', 'Content Management'), href: '/cms/blogs' },
            { label: t('nav.cmsAnnouncements', 'Announcement Bar') },
          ]}
        />
      </div>

      {/* ── 2. FRAMELESS HERO HEADER (Shopify Polaris Standard) ── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('cms.announcementsTitle', 'Storefront Header Announcement Bar')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('cms.announcementsSubtitle', 'Manage top header notification strips, flash deals, coupon codes, and promo countdowns.')}
          </p>
        </div>
      </div>
      {/* ── 3. ANNOUNCEMENT MANAGEMENT (Live Storefront Preview, Presets, Filtering & Pure Card Grid) ── */}
      <AnnouncementsTable
        records={rawList}
        isLoading={isAnnouncementsLoading}
        isFetching={isFetching}
        onCreateNew={handleCreateNew}
        onEdit={handleEditRecord}
        onDuplicate={handleDuplicateRecord}
        onApplyPreset={handleApplyPreset}
        onApplyCoupon={handleApplyCoupon}
      />

      {/* ── 4. GLOBAL SHARED CMS FORM MODAL (Matching all CMS pages) ── */}
      <CMSFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={saveMutation.isPending}
        errors={errors}
        onClearError={handleClearError}
        activeTab="announcements"
        getAddButtonLabel={() => t('cms.createCampaign', 'New Campaign')}
        title={title}
        setTitle={setTitle}
        name=""
        setName={() => {}}
        slug=""
        setSlug={() => {}}
        content=""
        setContent={() => {}}
        excerpt=""
        setExcerpt={() => {}}
        status=""
        setStatus={() => {}}
        description=""
        setDescription={() => {}}
        question=""
        setQuestion={() => {}}
        answer=""
        setAnswer={() => {}}
        faqCategory=""
        setFaqCategory={() => {}}
        sortOrder=""
        setSortOrder={() => {}}
        isActive={isActive}
        setIsActive={setIsActive}
        categoryId=""
        setCategoryId={() => {}}
        metaTitle=""
        setMetaTitle={() => {}}
        metaDescription=""
        setMetaDescription={() => {}}
        featuredImage=""
        handleFileChange={() => {}}
        handleRemoveImage={() => {}}
        categoriesList={[]}
        messageKm={messageKm}
        setMessageKm={setMessageKm}
        messageEn={messageEn}
        setMessageEn={setMessageEn}
        badgeText={badgeText}
        setBadgeText={setBadgeText}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        bgGradient={bgGradient}
        setBgGradient={setBgGradient}
      />
    </div>
  )
}

export default AnnouncementsPage
