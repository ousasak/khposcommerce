import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Truck,
  Package,
  MapPin,
  Scale,
  Hash,
  Barcode,
  DollarSign,
  Layers,
  Check,
} from 'lucide-react'
import {
  EnterpriseModal,
  ModalFooter,
  FormField,
  Input,
  ModernSelect,
  ToggleSwitch,
} from '@/components/common'
import type { Tab } from '../types/shipping.types'

interface ShippingFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any
  onSubmit: (e?: React.FormEvent | React.MouseEvent) => void
  isSubmitting: boolean
  activeTab: Tab
  name: string
  setName: (val: string) => void
  code: string
  setCode: (val: string) => void
  provider: string
  setProvider: (val: string) => void
  basePrice: string
  setBasePrice: (val: string) => void
  isActive: boolean
  setIsActive: (val: boolean) => void
  countries: string
  setCountries: (val: string) => void
  provinces: string
  setProvinces: (val: string) => void
  cities: string
  setCities: (val: string) => void
  shippingMethodId: string
  setShippingMethodId: (val: string) => void
  shippingZoneId: string
  setShippingZoneId: (val: string) => void
  minWeight: string
  setMinWeight: (val: string) => void
  maxWeight: string
  setMaxWeight: (val: string) => void
  price: string
  setPrice: (val: string) => void
  orderId: string
  setOrderId: (val: string) => void
  trackingNumber: string
  setTrackingNumber: (val: string) => void
  carrier: string
  setCarrier: (val: string) => void
  shipmentStatus: string
  setShipmentStatus: (val: string) => void
  methodsList: any[]
  zonesList: any[]
}

export const ShippingFormModal: React.FC<ShippingFormModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isSubmitting,
  activeTab,
  name,
  setName,
  code,
  setCode,
  provider,
  setProvider,
  basePrice,
  setBasePrice,
  isActive,
  setIsActive,
  countries: _countries,
  setCountries: _setCountries,
  provinces,
  setProvinces,
  cities,
  setCities,
  shippingMethodId,
  setShippingMethodId,
  shippingZoneId,
  setShippingZoneId,
  minWeight,
  setMinWeight,
  maxWeight,
  setMaxWeight,
  price,
  setPrice,
  orderId,
  setOrderId,
  trackingNumber,
  setTrackingNumber,
  carrier,
  setCarrier,
  shipmentStatus,
  setShipmentStatus,
  methodsList = [],
  zonesList = [],
}) => {
  const { t } = useTranslation(['shipping', 'common'])

  const getTitle = () => {
    if (editingItem) {
      if (activeTab === 'shipping-methods') return t('shipping.editMethod', 'Edit Shipping Method')
      if (activeTab === 'shipping-zones') return t('shipping.editZone', 'Edit Delivery Zone')
      if (activeTab === 'shipping-rates') return t('shipping.editRate', 'Edit Freight Rate')
      return t('shipping.editShipment', 'Edit Shipment')
    }
    if (activeTab === 'shipping-methods') return t('shipping.addMethod', 'Add Shipping Method')
    if (activeTab === 'shipping-zones') return t('shipping.addZone', 'Add Delivery Zone')
    if (activeTab === 'shipping-rates') return t('shipping.addRate', 'Add Freight Rate')
    return t('shipping.addShipment', 'Create Shipment')
  }

  const getSubtitle = () => {
    if (activeTab === 'shipping-methods') {
      return t('shipping.methodModalDesc', 'Configure method name, identifier code, carrier provider, and base rate.')
    }
    if (activeTab === 'shipping-zones') {
      return t('shipping.zoneModalDesc', 'Configure geographic delivery zones covering provinces and districts.')
    }
    if (activeTab === 'shipping-rates') {
      return t('shipping.rateModalDesc', 'Configure tiered weight brackets and applicable freight rates.')
    }
    return t('shipping.shipmentModalDesc', 'Manage tracking number, carrier assignment, and parcel delivery status.')
  }

  const getIcon = () => {
    switch (activeTab) {
      case 'shipping-methods':
        return <Package size={20} />
      case 'shipping-zones':
        return <MapPin size={20} />
      case 'shipping-rates':
        return <Scale size={20} />
      default:
        return <Truck size={20} />
    }
  }

  const getIconVariant = () => {
    switch (activeTab) {
      case 'shipping-methods':
        return 'blue'
      case 'shipping-zones':
        return 'purple'
      case 'shipping-rates':
        return 'amber'
      default:
        return 'emerald'
    }
  }

  const carrierOptions = [
    { value: '', label: t('shipping.selectCarrier', 'Select Carrier...') },
    { value: 'J&T Express Cambodia', label: 'J&T Express Cambodia' },
    { value: 'GrabExpress', label: 'GrabExpress' },
    { value: 'Virak Buntham Logistics', label: 'Virak Buntham Logistics' },
    { value: 'DHL Express', label: 'DHL Express' },
    { value: 'FedEx', label: 'FedEx' },
  ]

  const shipmentStatusOptions = [
    { value: 'pending', label: t('shipping.statusPending', 'Pending Pickup') },
    { value: 'in_transit', label: t('shipping.statusShipped', 'In Transit / Shipped') },
    { value: 'delivered', label: t('shipping.statusDelivered', 'Delivered Successfully') },
    { value: 'failed', label: t('shipping.statusFailed', 'Delivery Failed') },
    { value: 'returned', label: t('shipping.statusReturned', 'Returned to Sender') },
  ]

  const methodOptions = [
    { value: '', label: t('shipping.selectMethod', 'Select Shipping Method...') },
    ...methodsList.map((m: any) => ({
      value: String(m.id),
      label: `${m.name} (${m.code})`,
    })),
  ]

  const zoneOptions = [
    { value: '', label: t('shipping.selectZone', 'Select Delivery Zone...') },
    ...zonesList.map((z: any) => ({
      value: String(z.id),
      label: `${z.name} (${z.code})`,
    })),
  ]

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      subtitle={getSubtitle()}
      icon={getIcon()}
      iconVariant={getIconVariant()}
      size="2xl"
      badge={
        editingItem ? (
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400 border border-border/60 dark:border-slate-700">
            #{editingItem.id || editingItem.tracking_number || editingItem.code || ''}
          </span>
        ) : undefined
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          isEdit={Boolean(editingItem)}
          submitLabel={
            editingItem
              ? t('common.saveChanges', 'រក្សាទុកការកែប្រែ')
              : t('common.save', 'រក្សាទុក')
          }
          cancelLabel={t('common.cancel', 'បោះបង់')}
          submitIcon={<Check size={14} strokeWidth={2.5} />}
          form="shippingModalForm"
          onSubmit={onSubmit}
        />
      }
    >
      <form id="shippingModalForm" onSubmit={onSubmit} className="p-5 sm:p-6 space-y-5">
        {/* ─── TAB 1: ORDER SHIPMENTS ─── */}
        {activeTab === 'shipments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('shipping.orderId', 'លេខសម្គាល់ការបញ្ជាទិញ')} required>
                <Input
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="ORD-9021"
                  icon={<Hash size={15} className="text-muted-foreground/60" />}
                />
              </FormField>

              <FormField label={t('shipping.trackingNumber', 'លេខកូដតាមដាន (Tracking Number)')} required>
                <Input
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="TRK-A-07392742"
                  icon={<Barcode size={15} className="text-muted-foreground/60" />}
                  className="font-mono uppercase tracking-wide"
                />
              </FormField>
            </div>

            <FormField label={t('shipping.carrierName', 'Carrier / Courier Name')} required>
              <ModernSelect
                required
                value={carrier}
                onChange={(val) => setCarrier(val)}
                options={carrierOptions}
                placeholder={t('shipping.selectCarrier', 'Select Carrier...')}
                icon={<Truck size={15} className="text-muted-foreground/60" />}
              />
            </FormField>

            <FormField label={t('shipping.shipmentStatus', 'Status')}>
              <ModernSelect
                value={shipmentStatus}
                onChange={(val) => setShipmentStatus(val)}
                options={shipmentStatusOptions}
                icon={<Layers size={15} className="text-muted-foreground/60" />}
              />
            </FormField>
          </div>
        )}

        {/* ─── TAB 2: SHIPPING METHODS ─── */}
        {activeTab === 'shipping-methods' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('shipping.methodName', 'Method Name')} required>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('shipping.methodNamePlaceholder', 'e.g. Standard Delivery')}
                  icon={<Package size={15} className="text-muted-foreground/60" />}
                />
              </FormField>

              <FormField label={t('shipping.methodCode', 'Method Code')} required>
                <Input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EXPRESS_DELIVERY"
                  icon={<Barcode size={15} className="text-muted-foreground/60" />}
                  className="font-mono uppercase tracking-wide"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('shipping.carrierName', 'Carrier / Courier Name')}>
                <Input
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder={t('shipping.carrierNamePlaceholder', 'e.g. J&T Express, Grab')}
                  icon={<Truck size={15} className="text-muted-foreground/60" />}
                />
              </FormField>

              <FormField label={t('shipping.colBasePrice', 'Base Price ($)')}>
                <Input
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="1.50"
                  prefix="$"
                  icon={<DollarSign size={15} className="text-muted-foreground/60" />}
                />
              </FormField>
            </div>

            {/* Global Status Toggle Card */}
            <div className="flex items-center justify-between p-4 bg-muted/30 dark:bg-slate-800/40 rounded-2xl border border-border/70 dark:border-slate-800">
              <div>
                <p className="text-xs sm:text-[13px] font-bold text-foreground">
                  {t('common.status', 'Status')}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t('shipping.activeMethodDesc', 'Enable this shipping method on the storefront and POS.')}
                </p>
              </div>
              <ToggleSwitch
                checked={isActive}
                onChange={setIsActive}
                activeColor="primary"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 3: SHIPPING ZONES ─── */}
        {activeTab === 'shipping-zones' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('shipping.zoneName', 'Zone Name')} required>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('shipping.zoneNamePlaceholder', 'e.g. Phnom Penh Central Zone')}
                  icon={<MapPin size={15} className="text-muted-foreground/60" />}
                />
              </FormField>

              <FormField label={t('shipping.zoneCode', 'Zone Code')} required>
                <Input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ZONE_PP_CENTRAL"
                  icon={<Barcode size={15} className="text-muted-foreground/60" />}
                  className="font-mono uppercase tracking-wide"
                />
              </FormField>
            </div>

            <FormField
              label={t('shipping.province', 'Province / City')}
              action={
                <span className="text-[11px] font-mono text-muted-foreground">JSON array</span>
              }
            >
              <Input
                value={provinces}
                onChange={(e) => setProvinces(e.target.value)}
                placeholder='["Phnom Penh", "Kandal"]'
                className="font-mono text-xs"
              />
            </FormField>

            <FormField
              label={t('shipping.city', 'District / Khan')}
              action={
                <span className="text-[11px] font-mono text-muted-foreground">JSON array</span>
              }
            >
              <Input
                value={cities}
                onChange={(e) => setCities(e.target.value)}
                placeholder='["Khan Daun Penh", "Khan Chamkarmon"]'
                className="font-mono text-xs"
              />
            </FormField>

            {/* Global Status Toggle Card */}
            <div className="flex items-center justify-between p-4 bg-muted/30 dark:bg-slate-800/40 rounded-2xl border border-border/70 dark:border-slate-800">
              <div>
                <p className="text-xs sm:text-[13px] font-bold text-foreground">
                  {t('common.status', 'Status')}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t('shipping.activeZoneDesc', 'Enable this delivery zone for shipping fee calculations.')}
                </p>
              </div>
              <ToggleSwitch
                checked={isActive}
                onChange={setIsActive}
                activeColor="primary"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 4: FREIGHT RATES ─── */}
        {activeTab === 'shipping-rates' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('shipping.tabMethods', 'Shipping Methods')} required>
                <ModernSelect
                  required
                  value={shippingMethodId}
                  onChange={(val) => setShippingMethodId(val)}
                  options={methodOptions}
                  placeholder={t('shipping.selectMethod', 'Select Shipping Method...')}
                  icon={<Package size={15} className="text-muted-foreground/60" />}
                />
              </FormField>

              <FormField label={t('shipping.tabZones', 'Delivery Zones')} required>
                <ModernSelect
                  required
                  value={shippingZoneId}
                  onChange={(val) => setShippingZoneId(val)}
                  options={zoneOptions}
                  placeholder={t('shipping.selectZone', 'Select Delivery Zone...')}
                  icon={<MapPin size={15} className="text-muted-foreground/60" />}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('shipping.minWeight', 'ទម្ងន់អប្បបរមា (kg)')}>
                <Input
                  type="number"
                  step="0.01"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  placeholder="0.00"
                  suffix="kg"
                  icon={<Scale size={15} className="text-muted-foreground/60" />}
                />
              </FormField>

              <FormField label={t('shipping.maxWeight', 'ទម្ងន់អតិបរមា (kg)')}>
                <Input
                  type="number"
                  step="0.01"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  placeholder="5.00"
                  suffix="kg"
                  icon={<Scale size={15} className="text-muted-foreground/60" />}
                />
              </FormField>
            </div>

            <FormField label={t('shipping.shippingPrice', 'តម្លៃដឹកជញ្ជូន ($)')} required>
              <Input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1.50"
                prefix="$"
                icon={<DollarSign size={15} className="text-muted-foreground/60" />}
              />
            </FormField>
          </div>
        )}
      </form>
    </EnterpriseModal>
  )
}

export default ShippingFormModal
