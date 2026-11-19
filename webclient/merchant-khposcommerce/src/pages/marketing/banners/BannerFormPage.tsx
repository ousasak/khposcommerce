import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  UploadCloud,
  Trash2,
  RefreshCw,
  ArrowRight,
  Monitor,
  Smartphone,
  Store,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import { marketingService } from '@/services/marketingService'
import {
  FormLayout,
  FormContent,
  FormCard,
  FormHeader,
  FormFooter,
  FormField,
  Input,
  ToggleSwitch,
  EnterpriseDatePicker,
  LoadingSpinner,
} from '@/components/common'
import { useToast } from '@/hooks/useToast'
import { getAbsoluteImageUrl } from '@/utils/image'
import { focusFirstInvalidField } from '@/utils/formValidation'
import type { Banner, BannerPlacement, BannerTargetType } from './types'

export const BannerFormPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'nav', 'toast'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const bannerId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const backPath = '/marketing/banners'

  // Form states
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [badge, setBadge] = useState('')
  const [discountTag, setDiscountTag] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [base64Image, setBase64Image] = useState<string>('')
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [linkUrl, setLinkUrl] = useState('')
  const [targetType, setTargetType] = useState<BannerTargetType>('flash_sale')
  const [position, setPosition] = useState<BannerPlacement>('hero')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState<boolean>(true)
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mockup device switcher state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'pos_cfd'>('desktop')

  // Set default button text for new banners
  useEffect(() => {
    if (!isEdit && !buttonText) {
      setButtonText(t('marketing.ctaButtonPlaceholder', 'ទិញឥឡូវនេះ'))
    }
  }, [isEdit, t])

  const handleClearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Fetch banner detail when in edit mode
  const {
    data: bannerDetail,
    isLoading: isLoadingDetail,
  } = useQuery({
    queryKey: ['banner-detail', bannerId],
    queryFn: () => (bannerId ? marketingService.getBanner(bannerId) : null),
    enabled: isEdit && !isNaN(bannerId as number),
  })

  // Populate data when editing
  useEffect(() => {
    if (bannerDetail) {
      setTitle(bannerDetail.title || '')
      setSubtitle(bannerDetail.subtitle || '')
      setBadge(bannerDetail.badge || '')
      setDiscountTag(bannerDetail.discount_tag || '')
      setButtonText(bannerDetail.button_text || t('marketing.ctaButtonPlaceholder', 'ទិញឥឡូវនេះ'))
      const img = bannerDetail.image_url || bannerDetail.image || ''
      setImageUrl(img)
      setImageMode(img.startsWith('http') || img.startsWith('/storage') ? 'url' : 'upload')
      setLinkUrl(bannerDetail.link_url || bannerDetail.link || '')
      setPosition((bannerDetail.position as any) || 'hero')
      setSortOrder(bannerDetail.sort_order ?? 0)
      setIsActive(bannerDetail.is_active ?? true)
      setStartsAt(bannerDetail.starts_at ? bannerDetail.starts_at.split(/[T ]/)[0] : '')
      setEndsAt(bannerDetail.ends_at ? bannerDetail.ends_at.split(/[T ]/)[0] : '')
    }
  }, [bannerDetail, t])

  // Populate data when duplicating
  useEffect(() => {
    if (!isEdit && location.state?.duplicateFrom) {
      const d: Banner = location.state.duplicateFrom
      setTitle(d.title ? `${d.title} (ចម្លង)` : '')
      setSubtitle(d.subtitle || '')
      setBadge(d.badge || '')
      setDiscountTag(d.discount_tag || '')
      setButtonText(d.button_text || t('marketing.ctaButtonPlaceholder', 'ទិញឥឡូវនេះ'))
      const img = d.image_url || d.image || ''
      setImageUrl(img)
      setImageMode(img.startsWith('http') || img.startsWith('/storage') ? 'url' : 'upload')
      setLinkUrl(d.link_url || d.link || '')
      setPosition((d.position as any) || 'hero')
      setSortOrder(d.sort_order ?? 0)
      setIsActive(d.is_active ?? true)
      setStartsAt(d.starts_at ? d.starts_at.split(/[T ]/)[0] : '')
      setEndsAt(d.ends_at ? d.ends_at.split(/[T ]/)[0] : '')
    }
  }, [isEdit, location.state, t])

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      handleClearError('image')
      const previewUrl = URL.createObjectURL(file)
      setImageUrl(previewUrl)

      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBase64Image(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setBase64Image('')
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Create & Update mutations
  const createMutation = useMutation({
    mutationFn: (newBanner: any) => marketingService.createBanner(newBanner),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
      toast.success(t('toast.created', { item: t('marketing.banners', 'ផ្ទាំងបដា') }))
      navigate(backPath)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'មិនអាចបង្កើតផ្ទាំងបដាបានទេ។'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => marketingService.updateBanner(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
      qc.invalidateQueries({ queryKey: ['banner-detail', bannerId] })
      toast.success(t('toast.updated', { item: t('marketing.banners', 'ផ្ទាំងបដា') }))
      navigate(backPath)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'មិនអាចកែប្រែផ្ទាំងបដាបានទេ។'))
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!title.trim()) {
      newErrors.title = t('marketing.bannerTitleRequired', 'សូមបញ្ចូលចំណងជើងផ្ទាំងបដា')
    }
    if (!selectedFile && !imageUrl.trim()) {
      newErrors.image = t('marketing.bannerImageRequired', 'សូមជ្រើសរើសរូបភាព ឬបញ្ចូល URL រូបភាព')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }

    const formData = new FormData()
    formData.append('company_id', '1')
    formData.append('title', title.trim())
    formData.append('subtitle', subtitle.trim())
    formData.append('badge', badge.trim())
    formData.append('discount_tag', discountTag.trim())
    formData.append('button_text', buttonText.trim())
    formData.append('position', position)
    formData.append('sort_order', String(sortOrder))
    formData.append('is_active', isActive ? '1' : '0')
    if (startsAt) formData.append('starts_at', startsAt)
    if (endsAt) formData.append('ends_at', endsAt)
    if (linkUrl) formData.append('link', linkUrl.trim())

    if (selectedFile && selectedFile instanceof File) {
      formData.append('image_file', selectedFile)
      if (base64Image) {
        formData.append('image', base64Image)
      }
    } else if (imageUrl && !imageUrl.startsWith('blob:') && !imageUrl.includes('/storage/[]') && imageUrl !== '[]') {
      formData.append('image', imageUrl)
      formData.append('image_url', imageUrl)
    }

    if (isEdit && bannerId) {
      formData.append('_method', 'PUT')
      updateMutation.mutate({ id: bannerId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const resolveDisplayImage = (url?: string): string | null => {
    if (!url || url === '[]' || url === '""' || url.includes('/storage/[]') || url === '/logo.png') {
      return null
    }
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return url
    }
    const resolved = getAbsoluteImageUrl(url)
    if (!resolved || resolved.includes('/logo.png')) {
      return null
    }
    return resolved
  }

  const displayImage = resolveDisplayImage(imageUrl)

  const selectCls =
    'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer shadow-2xs'

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isLoading={isEdit && isLoadingDetail}
      isSubmitting={isSubmitting}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? t('marketing.editBanner', 'កែសម្រួលផ្ទាំងបដា')
              : t('marketing.addBanner', 'បន្ថែមផ្ទាំងបដាថ្មី')
          }
          subtitle={t(
            'marketing.bannerSubtitle',
            'គ្រប់គ្រងផ្ទាំងផ្សព្វផ្សាយពាណិជ្ជកម្ម និងប្រូម៉ូសិនលើគេហទំព័រ អេក្រង់អតិថិជន POS (CFD) កម្មវិធីទូរស័ព្ទ និងផ្ទាំង Popup'
          )}
          breadcrumbs={[
            { label: t('nav.marketing', 'ទីផ្សារ'), path: '/marketing/promotions' },
            { label: t('marketing.banners', 'ផ្ទាំងបដា'), path: backPath },
            {
              label: isEdit ? t('common.edit', 'កែប្រែ') : t('common.create', 'បង្កើតថ្មី'),
            },
          ]}
          statusBadge={
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
                }`}
              />
              {isActive ? t('common.active', 'សកម្ម') : t('common.inactive', 'អសកម្ម')}
            </span>
          }
          backPath={backPath}
          backLabel={t('common.back', 'ត្រឡប់ក្រោយ')}
        />
      }
      footer={
        <FormFooter
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate(backPath)}
          cancelPath={backPath}
          cancelLabel={t('common.cancel', 'បោះបង់')}
          submitLabel={
            isEdit
              ? t('marketing.updateBanner', 'ធ្វើបច្ចុប្បន្នភាពផ្ទាំងបដា')
              : t('marketing.createBanner', 'បង្កើតផ្ទាំងបដា')
          }
        />
      }
    >
      <FormContent maxWidth="full" layout="two-column">
        {/* ══════════════════════════════════════════════════════════
            LEFT COLUMN (7 cols): Main Content, Media & Link
        ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">
          {/* CARD 1: GENERAL INFO & CONTENT */}
          <FormCard
            title={t('marketing.bannerTypographyContent', 'ព័ត៌មានទូទៅ & ខ្លឹមសារបដា')}
            subtitle={t('marketing.bannerTypographySubtitle', 'កំណត់ចំណងជើង អត្ថបទរង ស្លាកសញ្ញា និងប៊ូតុងសកម្មភាព')}
            contentClassName="space-y-4"
          >
            {/* Banner Title */}
            <FormField
              label={t('marketing.bannerTitleLabel', 'ចំណងជើងផ្ទាំងបដា')}
              required
              error={errors.title}
            >
              <Input
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  handleClearError('title')
                }}
                placeholder={t('marketing.bannerTitleFormPlaceholder', 'ឧ. មហោស្រពចូលឆ្នាំថ្មី បញ្ចុះតម្លៃពិសេស ៥០%')}
                error={errors.title}
                className="font-bold"
              />
            </FormField>

            {/* Subtitle / Promotional Body */}
            <FormField
              label={t('marketing.bannerSubtitleLabel', 'ចំណងជើងរង / អត្ថបទផ្សព្វផ្សាយ')}
            >
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
                placeholder={t(
                  'marketing.bannerSubtitleFormPlaceholder',
                  'ឧ. ការបញ្ចុះតម្លៃពិសេសសម្រាប់រដូវកាលបុណ្យ លើឧបករណ៍បច្ចេកវិទ្យាទំនើបៗ...'
                )}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-2xs font-medium placeholder:text-muted-foreground/60 leading-relaxed"
              />
            </FormField>

            {/* 3-Column: Badge, Discount Tag & CTA Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <FormField label={t('marketing.badgeLabelForm', 'ស្លាកសញ្ញា')}>
                <Input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder={t('marketing.badgePlaceholder', 'ឧ. KNY 2026')}
                  size="sm"
                />
              </FormField>

              <FormField label={t('marketing.discountTagForm', 'ស្លាកបញ្ចុះតម្លៃ')}>
                <Input
                  value={discountTag}
                  onChange={(e) => setDiscountTag(e.target.value)}
                  placeholder={t('marketing.discountTagPlaceholder', 'ឧ. បញ្ចុះ 50%')}
                  size="sm"
                />
              </FormField>

              <FormField label={t('marketing.ctaButtonText', 'អត្ថបទប៊ូតុងសកម្មភាព (CTA)')}>
                <Input
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder={t('marketing.ctaButtonPlaceholder', 'ឧ. ទិញឥឡូវនេះ')}
                  size="sm"
                  className="font-semibold"
                />
              </FormField>
            </div>
          </FormCard>

          {/* CARD 2: BANNER GRAPHIC ASSET */}
          <FormCard
            title={t('marketing.bannerGraphicAsset', 'រូបភាព & ឯកសារក្រាហ្វិកបដា')}
            subtitle={t('marketing.bannerGraphicSubtitle', 'បង្ហោះឯកសាររូបភាព ឬភ្ជាប់ជាមួយតំណភ្ជាប់ URL រូបភាពផ្ទាល់')}
            badge={<span className="text-rose-500 font-bold">*</span>}
            action={
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    imageMode === 'upload'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('marketing.uploadFile', 'បង្ហោះឯកសារ')}
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    imageMode === 'url'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('marketing.directImageUrl', 'តំណភ្ជាប់ URL រូបភាពផ្ទាល់')}
                </button>
              </div>
            }
            contentClassName="space-y-3"
          >
            <div id="image">
              {imageMode === 'upload' ? (
                <div>
                  {displayImage ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-24 h-14 rounded-lg overflow-hidden border border-border bg-slate-950 shrink-0 shadow-2xs">
                          <img
                            src={displayImage}
                            alt={title || 'Preview'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-foreground truncate">
                            {selectedFile ? selectedFile.name : (title || t('marketing.bannerGraphicAsset', 'រូបភាពផ្ទាំងបដា'))}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : t('marketing.uploadSupportFormats', 'រូបភាពបច្ចុប្បន្ន')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw size={12} />
                          <span>{t('common.change', 'ប្តូររូបភាព')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 size={12} />
                          <span>{t('common.remove', 'លុប')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className={`border-2 border-dashed ${
                        errors.image
                          ? 'border-rose-500 bg-rose-50/20'
                          : 'border-border/80 hover:border-primary/60 bg-muted/10 hover:bg-muted/30'
                      } rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer transition-all group`}
                    >
                      <UploadCloud
                        size={32}
                        className={`${
                          errors.image ? 'text-rose-500' : 'text-muted-foreground group-hover:text-primary'
                        } transition-colors mb-2`}
                      />
                      <span className="text-xs font-bold text-foreground">
                        {t('marketing.clickToUpload', 'ចុចដើម្បីបង្ហោះរូបភាពផ្ទាំងបដា')}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        {t('marketing.uploadSupportFormats', 'គាំទ្រ PNG, JPG, WEBP, AVIF (ទំហំអតិបរមា 10MB)')}
                      </span>
                    </label>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <FormField
                  label={t('marketing.directImageUrl', 'តំណភ្ជាប់ URL រូបភាពផ្ទាល់')}
                  error={errors.image}
                >
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      handleClearError('image')
                    }}
                    placeholder="https://example.com/banners/promo-hero.webp"
                    error={errors.image}
                  />
                </FormField>
              )}

              {errors.image && !imageMode && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {errors.image}
                </p>
              )}
            </div>
          </FormCard>

          {/* CARD 3: LINK & DESTINATION TARGET */}
          <FormCard
            title={t('marketing.deepLinkingDestination', 'តំណភ្ជាប់ & គោលដៅបញ្ជូន')}
            subtitle={t('marketing.deepLinkingSubtitle', 'កំណត់ទីតាំងដែលអតិថិជននឹងត្រូវបញ្ជូនទៅនៅពេលចុចលើបដា')}
            contentClassName="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('marketing.destinationTargetType', 'ប្រភេទគោលដៅបញ្ជូន')}>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className={selectCls}
                >
                  <option value="flash_sale">{t('marketing.targetFlashSale', 'យុទ្ធនាការ Flash Sale សកម្ម')}</option>
                  <option value="coupon">{t('marketing.targetCoupon', 'ប័ណ្ណបញ្ចុះតម្លៃឌីជីថល')}</option>
                  <option value="product">{t('marketing.targetProduct', 'ទំព័រមុខទំនិញផ្ទាល់')}</option>
                  <option value="category">{t('marketing.targetCategory', 'បណ្តុំប្រភេទមុខទំនិញ')}</option>
                  <option value="custom_url">{t('marketing.targetCustomUrl', 'តំណភ្ជាប់ខាងក្រៅផ្ទាល់ខ្លួន')}</option>
                </select>
              </FormField>

              <FormField label={t('marketing.linkUrlSlug', 'តំណភ្ជាប់ URL / Slug')}>
                <Input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={t('marketing.linkUrlPlaceholder', 'ឧ. /marketing/flash-sales ឬ /catalog')}
                  className="font-mono"
                />
              </FormField>
            </div>
          </FormCard>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT COLUMN (5 cols): Preview, Placement & Schedule
        ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-6">
          {/* CARD 4: LIVE DEVICE MOCKUP */}
          <FormCard
            title={t('marketing.interactiveDeviceMockup', 'ការបង្ហាញគំរូឧបករណ៍ផ្ទាល់')}
            subtitle={t('marketing.interactiveDeviceSubtitle', 'ពិនិត្យមើលទម្រង់បង្ហាញជាក់ស្តែងលើ Desktop, Mobile និង POS CFD')}
            action={
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    previewDevice === 'desktop'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={t('marketing.deviceDesktop', 'កុំព្យូទ័រ')}
                >
                  <Monitor size={13} />
                  <span>{t('marketing.deviceDesktop', 'កុំព្យូទ័រ')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    previewDevice === 'mobile'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={t('marketing.deviceMobile', 'ទូរស័ព្ទ')}
                >
                  <Smartphone size={13} />
                  <span>{t('marketing.deviceMobile', 'ទូរស័ព្ទ')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('pos_cfd')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    previewDevice === 'pos_cfd'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={t('marketing.devicePosCfd', 'អេក្រង់ POS')}
                >
                  <Store size={13} />
                  <span>{t('marketing.devicePosCfd', 'អេក្រង់ POS')}</span>
                </button>
              </div>
            }
            contentClassName="space-y-3"
          >
            {/* Viewport Frame */}
            <div className="rounded-2xl border border-border bg-slate-950 p-2.5 overflow-hidden shadow-inner flex items-center justify-center min-h-[220px]">
              <div
                className={`relative overflow-hidden rounded-xl border border-white/10 transition-all duration-300 ${
                  previewDevice === 'desktop'
                    ? 'w-full aspect-[21/9]'
                    : previewDevice === 'mobile'
                    ? 'w-48 aspect-[9/16]'
                    : 'w-64 aspect-[4/3]'
                }`}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={title || t('marketing.bannerTitleHeadline', 'ចំណងជើងផ្ទាំងបដា')}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center select-none">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-inner">
                      <ImageIcon size={20} className="text-slate-500" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                      {t('marketing.noImagePreview', 'មិនទាន់មានរូបភាពផ្ទាំងបដា')}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 max-w-[200px]">
                      {t('marketing.noImagePreviewHint', 'សូមបង្ហោះរូបភាព ឬភ្ជាប់ URL រូបភាពដើម្បីមើលការបង្ហាញ')}
                    </p>
                  </div>
                )}

                {/* Text Overlay */}
                {(title || subtitle || badge || discountTag || buttonText) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3.5 flex flex-col justify-end text-white pointer-events-none">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      {badge && (
                        <span className="w-fit px-1.5 py-0.5 rounded-md text-[8px] font-extrabold bg-primary text-white uppercase tracking-wider">
                          {badge}
                        </span>
                      )}
                      {discountTag && (
                        <span className="w-fit px-1.5 py-0.5 rounded-md text-[8px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider">
                          {discountTag}
                        </span>
                      )}
                    </div>
                    {title && (
                      <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug">
                        {title}
                      </h4>
                    )}
                    {subtitle && (
                      <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                        {subtitle}
                      </p>
                    )}
                    {buttonText && (
                      <div className="mt-2 w-fit px-2.5 py-1 bg-primary text-white text-[9px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                        <span>{buttonText}</span>
                        <ArrowRight size={9} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FormCard>

          {/* CARD 5: PLACEMENT & PRIORITY */}
          <FormCard
            title={t('marketing.placementScreenPosition', 'ទីតាំងបង្ហាញ & អាទិភាព')}
            subtitle={t('marketing.placementScreenSubtitle', 'កំណត់ទីតាំងបង្ហាញលើប្រព័ន្ធ និងលំដាប់រៀបចំ')}
            contentClassName="space-y-4"
          >
            <FormField label={t('marketing.targetScreenPlacement', 'ទីតាំងអេក្រង់បង្ហាញ')}>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
                className={selectCls}
              >
                <option value="hero">{t('marketing.placementHero', 'ផ្ទាំងធំទំព័រដើម (Hero)')}</option>
                <option value="pos_cfd">{t('marketing.placementPosCfd', 'អេក្រង់អតិថិជន POS (CFD)')}</option>
                <option value="app_splash">{t('marketing.placementMobileApp', 'ផ្ទាំងបើកកម្មវិធីទូរស័ព្ទ (App)')}</option>
                <option value="sidebar">{t('marketing.placementSidebar', 'ផ្ទាំងបដាចំហៀង (Sidebar)')}</option>
                <option value="popup">{t('marketing.placementPopup', 'ផ្ទាំងផុសឡើង (Popup)')}</option>
                <option value="footer">{t('marketing.posFooter', 'ផ្ទាំងបាតក្រោម (Footer)')}</option>
              </select>
            </FormField>

            <FormField
              label={t('marketing.sortPriorityOrder', 'លំដាប់អាទិភាពបង្ហាញ')}
              helper={t('marketing.sortPriorityHint', 'លេខកាន់តែតូច នឹងបង្ហាញមុនគេក្នុងស្លាយ។')}
            >
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="font-bold font-mono"
              />
            </FormField>
          </FormCard>

          {/* CARD 6: SCHEDULE & ACTIVATION */}
          <FormCard
            title={t('marketing.scheduleActivation', 'កាលវិភាគ & ស្ថានភាពដំណើរការ')}
            subtitle={t('marketing.scheduleActivationSubtitle', 'កំណត់កាលបរិច្ឆេទចាប់ផ្តើម បញ្ចប់ និងស្ថានភាពបើកដំណើរការ')}
            contentClassName="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EnterpriseDatePicker
                label={t('marketing.startDate', 'កាលបរិច្ឆេទចាប់ផ្តើម')}
                value={startsAt}
                onChange={setStartsAt}
                placeholder={t('marketing.startDate', 'កាលបរិច្ឆេទចាប់ផ្តើម')}
              />
              <EnterpriseDatePicker
                label={t('marketing.endDate', 'កាលបរិច្ឆេទបញ្ចប់')}
                minDate={startsAt}
                value={endsAt}
                onChange={setEndsAt}
                placeholder={t('marketing.endDate', 'កាលបរិច្ឆេទបញ្ចប់')}
              />
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">
                  {t('marketing.bannerActiveLabel', 'បើកដំណើរការផ្ទាំងបដា (សកម្ម)')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t('marketing.bannerActiveHint', 'អនុញ្ញាតឱ្យអតិថិជនមើលឃើញផ្ទាំងបដានេះលើប្រព័ន្ធលក់')}
                </p>
              </div>
              <ToggleSwitch
                checked={isActive}
                onChange={setIsActive}
                activeColor="emerald"
              />
            </div>
          </FormCard>
        </div>
      </FormContent>
    </FormLayout>
  )
}

export default BannerFormPage
