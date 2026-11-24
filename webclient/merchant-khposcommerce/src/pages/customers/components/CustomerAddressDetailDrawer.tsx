import React, { useState } from 'react'
import {
  MapPin,
  Phone,
  Copy,
  Check,
  Pencil,
  User,
  Building,
  Globe,
  Home,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Image } from '@/components/ui/image'
import { getCustomerAvatarUrl, DEFAULT_AVATAR_IMAGE } from '@/utils/image'
import {
  EnterpriseModal,
  ActionButton,
  type CustomerAddress,
} from '@/components/common'
import { GlobalFormat } from '@/utils/formatters'

interface CustomerAddressDetailDrawerProps {
  address: CustomerAddress | null
  isOpen: boolean
  onClose: () => void
  onEdit: (addr: CustomerAddress) => void
  onDelete?: (addr: CustomerAddress) => void
}

export const CustomerAddressDetailDrawer: React.FC<CustomerAddressDetailDrawerProps> = ({
  address,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation(['customers', 'common'])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!isOpen || !address) return null

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const renderLabelBadge = (label?: string) => {
    if (!label) return <span className="text-muted-foreground">—</span>
    const norm = (label || '').trim().toLowerCase()
    let labelText = label || t('customers.labelOther', 'Other')

    if (norm === 'home' || norm.startsWith('home')) {
      labelText = t('customers.labelHome', 'Home')
    } else if (norm === 'office' || norm === 'work' || norm === 'hq') {
      labelText = t('customers.labelOffice', 'Office')
    } else if (norm === 'warehouse') {
      labelText = t('customers.labelWarehouse', 'Warehouse')
    } else if (norm === 'store' || norm === 'shop') {
      labelText = t('customers.labelStore', 'Store')
    } else if (norm === 'branch') {
      labelText = t('customers.labelBranch', 'Branch')
    } else if (norm === 'condo' || norm === 'apartment') {
      labelText = norm === 'condo' ? t('customers.labelCondo', 'Condo') : t('customers.labelApartment', 'Apartment')
    } else if (norm === 'villa') {
      labelText = t('customers.labelVilla', 'Villa')
    } else if (norm === 'factory') {
      labelText = t('customers.labelFactory', 'Factory')
    } else if (norm === 'hotel') {
      labelText = t('customers.labelHotel', 'Hotel')
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted/60 text-foreground border border-border/70 whitespace-nowrap">
        {labelText}
      </span>
    )
  }

  const fullAddressString = [
    address.address,
    address.city,
    address.province,
    address.country,
    address.postal_code ? `(${address.postal_code})` : '',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <EnterpriseModal
      isOpen={isOpen && !!address}
      onClose={onClose}
      size="xl"
      title={t('customers.addressDetails', 'Address Details')}
      subtitle={fullAddressString}
      icon={<MapPin size={20} />}
      iconVariant="blue"
      badge={
        <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
          ADDR-#{String(address.id).padStart(4, '0')}
        </span>
      }
      footer={
        <div className="flex items-center justify-between p-4 border-t border-border/80 bg-muted/20 w-full shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {t('common.close', 'Close')}
          </button>
          <ActionButton
            variant="primary"
            icon={<Pencil size={15} />}
            label={t('common.edit', 'Edit Address')}
            onClick={() => {
              onClose()
              onEdit(address)
            }}
          />
        </div>
      }
    >
      <div className="p-5 sm:p-6 space-y-4">
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0 shadow-xs">
            <MapPin size={26} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {address.name || t('customers.recipient', 'Recipient')}
              </h2>
              {renderLabelBadge(address.label)}
              {address.is_default ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  {t('customers.defaultAddress', 'Default Address')}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border whitespace-nowrap">
                  {t('customers.secondaryAddress', 'Secondary Address')}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{address.city || address.province || 'Phnom Penh'}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/80">{address.customer?.name || `Customer #${address.customer_id || ''}`}</span>
              <span>•</span>
              <span>{address.country || 'Cambodia'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {address.phone && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border font-mono">
                  {GlobalFormat.phone(address.phone)}
                </span>
              )}
              {address.postal_code && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border font-mono">
                  ZIP: {address.postal_code}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. DRAWER BODY (GROUPED 2-COLUMN CARDS) ── */}
      <div className="space-y-4">
        {/* Recipient Information Card */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t('customers.recipientInfo', 'Recipient & Customer Information')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('customers.recipient', 'Recipient Name')}</p>
              <p className="font-semibold text-foreground mt-0.5">{address.name || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('customers.phone', 'Phone Number')}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-semibold font-mono text-foreground">{address.phone || '—'}</p>
                {address.phone && (
                  <button
                    onClick={() => copyToClipboard(address.phone, 'phone')}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Copy phone"
                  >
                    {copiedKey === 'phone' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-border/50">
              <p className="text-muted-foreground text-[11px] font-medium mb-1.5">{t('customers.customerAccount', 'Linked Customer Account')}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden shadow-2xs">
                  <Image
                    src={getCustomerAvatarUrl(address.customer?.photo || address.customer?.avatar, address.customer?.id || address.customer_id || address.customer?.name)}
                    alt={address.customer?.name || 'Customer'}
                    className="w-full h-full object-cover"
                    rootClassName="w-full h-full !flex items-center justify-center cursor-pointer"
                    preview={{ mask: null }}
                    fallback={DEFAULT_AVATAR_IMAGE}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">
                    {address.customer?.name || (address.customer_id ? `Customer #${address.customer_id}` : '—')}
                  </p>
                  {address.customer?.email && (
                    <span className="text-xs text-muted-foreground font-mono truncate block">{address.customer.email}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Address Details Card */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {t('customers.locationDetails', 'Location & Address Details')}
            </h4>
            <button
              onClick={() => copyToClipboard(fullAddressString, 'fullAddress')}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              {copiedKey === 'fullAddress' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copiedKey === 'fullAddress' ? t('common.copied', 'Copied') : t('customers.copyAddress', 'Copy Address')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-[11px] font-medium">{t('customers.streetAddress', 'Street Address')}</p>
              <p className="font-semibold text-foreground mt-0.5 leading-relaxed">{address.address || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('customers.city', 'City / Khan')}</p>
              <p className="font-semibold text-foreground mt-0.5">{address.city || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('customers.province', 'Province / State')}</p>
              <p className="font-semibold text-foreground mt-0.5">{address.province || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('customers.country', 'Country')}</p>
              <p className="font-semibold text-foreground mt-0.5">{address.country || 'Cambodia'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">{t('customers.postalCode', 'Postal Code')}</p>
              <p className="font-semibold font-mono text-foreground mt-0.5">{address.postal_code || '—'}</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </EnterpriseModal>
  )
}

export { CustomerAddressDetailDrawer as CustomerAddressDetailModal }
export default CustomerAddressDetailDrawer
