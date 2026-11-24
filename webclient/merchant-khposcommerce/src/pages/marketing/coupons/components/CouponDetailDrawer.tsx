import React, { useState } from 'react'
import {
  Copy,
  Printer,
  Barcode,
  Sparkles,
  Ticket,
  Layers,
  Pencil,
  Calendar,
  Store,
  Globe,
  Smartphone,
  DollarSign,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  StatusBadge,
  ActionButton,
} from '@/components/common'
import type { DetailDrawerTabItem } from '@/components/common'
import { formatDisplayDate } from '@/utils/formatters'
import type { Coupon } from '../types'

export interface CouponDetailDrawerProps {
  coupon: Coupon | null
  onClose: () => void
  handleDuplicate: (coupon: Coupon) => void
  openEditModal: (coupon: Coupon) => void
  onOpenVerifier?: (coupon: Coupon) => void
}

type DrawerSubTab = 'general' | 'barcode'

/**
 * CouponDetailDrawer Component
 * Refactored to match EmployeeDetailDrawer:
 * - DetailDrawer (2xl)
 * - DetailDrawerHeader with ID / code badge
 * - Profile Overview Hero Card (Ticket icon, big coupon name + StatusBadge, metadata row, tags)
 * - DetailDrawerTabNav with sub-tabs
 * - DetailDrawerBody with grouped 2-column cards (grid-cols-1 sm:grid-cols-2)
 * - DetailDrawerFooter with Close & Edit buttons
 */
export const CouponDetailDrawer: React.FC<CouponDetailDrawerProps> = ({
  coupon,
  onClose,
  handleDuplicate,
  openEditModal,
  onOpenVerifier,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons'])
  const toast = useToast()
  const [activeSubTab, setActiveSubTab] = useState<DrawerSubTab>('general')
  const [copied, setCopied] = useState(false)

  if (!coupon) return null

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    toast.success(t('common.copiedToClipboard', `Copied code "${coupon.code}" to clipboard!`))
    setTimeout(() => setCopied(false), 1500)
  }

  const handlePrintSlip = () => {
    window.print()
  }

  const getChannelLabel = (scope?: string) => {
    switch (scope) {
      case 'pos_only':
        return t('marketing.channelPos', 'Retail POS Cashier Only')
      case 'storefront_only':
        return t('marketing.channelWeb', 'Online Web Storefront')
      case 'app_only':
        return t('marketing.channelMobile', 'Mobile App')
      default:
        return t('marketing.channelOmni', 'Omni-Channel (POS & Web)')
    }
  }

  const drawerTabs: DetailDrawerTabItem[] = [
    {
      key: 'general',
      label: t('marketing.tabOverview', 'General & Restrictions'),
      icon: Layers,
    },
    {
      key: 'barcode',
      label: t('marketing.posBarcodeTag', 'Barcode & Scan Test'),
      icon: Barcode,
    },
  ]

  return (
    <DetailDrawer
      isOpen={Boolean(coupon)}
      onClose={onClose}
      size="2xl"
    >
      {/* ─── 1. GLOBAL DRAWER HEADER ─── */}
      <DetailDrawerHeader
        title={t('marketing.voucherCampaignDetails', 'Voucher Campaign Details')}
        subtitle={`COUPON-${String(coupon.id || coupon.code).padStart(4, '0')}`}
        badge={
          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
            {coupon.code}
          </span>
        }
        onClose={onClose}
      />

      {/* ─── 2. PROFILE OVERVIEW CARD (Matching Employee Detail Drawer) ─── */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border/80 flex items-center justify-center shrink-0 text-primary shadow-2xs">
            <Ticket size={28} className="text-primary" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {coupon.name}
              </h2>
              <StatusBadge status={coupon.is_active ? 'active' : 'inactive'} />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span className="uppercase font-semibold">{coupon.type?.replace('_', ' ')}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/80">{getChannelLabel(coupon.channel_scope)}</span>
              <span>•</span>
              <span>
                {coupon.expires_at ? formatDisplayDate(coupon.expires_at) : t('marketing.dateNever', 'Never Expires')}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                {coupon.code}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {t('marketing.minSpend', 'Min. Spend')}: ${coupon.minimum_amount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. TAB NAVIGATION (Matching Employee Detail Drawer TabNav) ─── */}
      <DetailDrawerTabNav
        tabs={drawerTabs}
        activeTab={activeSubTab}
        onChange={(tabKey) => setActiveSubTab(tabKey as DrawerSubTab)}
      />

      {/* ─── 4. DRAWER BODY WITH GROUPED 2-COLUMN CARDS ─── */}
      <DetailDrawerBody>
        {activeSubTab === 'general' && (
          <div className="space-y-4">
            {/* Card 1: Voucher Information & Value */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('marketing.voucherDetails', 'Voucher Information & Value')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.couponCode', 'Promo Code')}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-primary text-sm">{coupon.code}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title={t('common.copy', 'Copy')}
                    >
                      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.discountType', 'Discount Type')}</p>
                  <p className="font-semibold uppercase text-foreground mt-0.5">{coupon.type?.replace('_', ' ') || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.minimumSpend', 'Minimum Spend Required')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">${coupon.minimum_amount || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('common.status', 'Campaign Status')}</p>
                  <div className="mt-0.5">
                    <StatusBadge status={coupon.is_active ? 'active' : 'inactive'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Scope & Channel Restrictions */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('marketing.omnichannelScopes', 'Channel & Store Restrictions')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.activeChannels', 'Active Channels')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{getChannelLabel(coupon.channel_scope)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.storeOutlets', 'Target Outlets')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{t('marketing.allBranchesCompany', 'All Branches')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.totalRedemptions', 'Total Redemptions')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">
                    {coupon.used_count || 0} / {coupon.usage_limit || t('marketing.unlimited', 'Unlimited')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('marketing.expiryDate', 'Expiry Date')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {coupon.expires_at ? formatDisplayDate(coupon.expires_at) : t('marketing.dateNever', 'Never Expires')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'barcode' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-4 text-center">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('marketing.posBarcodeTag', 'POS Scannable Code & QR')}
              </h4>
              <div className="p-6 bg-muted/40 rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                <div className="font-mono text-3xl tracking-[0.3em] font-black py-2 text-foreground">
                  ||||| | |||| || ||||| |||
                </div>
                <span className="font-mono text-sm font-bold text-primary">{coupon.code}</span>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <ActionButton
                  variant="outline"
                  size="sm"
                  icon={<Barcode size={14} />}
                  label={t('marketing.scanTest', 'POS Scan Test')}
                  onClick={() => {
                    onClose()
                    onOpenVerifier?.(coupon)
                  }}
                />
                <ActionButton
                  variant="primary"
                  size="sm"
                  icon={<Printer size={14} />}
                  label={t('marketing.printSlip', 'Print Slip')}
                  onClick={handlePrintSlip}
                />
              </div>
            </div>
          </div>
        )}
      </DetailDrawerBody>

      {/* ─── 5. GLOBAL DRAWER FOOTER (Matching Employee Detail Drawer Footer) ─── */}
      <DetailDrawerFooter
        onClose={onClose}
        leftActions={
          <ActionButton
            variant="outline"
            icon={<Copy size={15} />}
            label={t('marketing.duplicate', 'Duplicate')}
            onClick={() => handleDuplicate(coupon)}
          />
        }
        rightActions={
          <ActionButton
            variant="primary"
            icon={<Pencil size={15} />}
            label={t('common.edit', 'Edit')}
            onClick={() => {
              onClose()
              openEditModal(coupon)
            }}
          />
        }
      />
    </DetailDrawer>
  )
}

export default CouponDetailDrawer
