import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CloseButton, ResetButton, ActionButton } from '@/components/common'

interface BannerFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  positionFilter: string
  setPositionFilter: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  channelFilter?: string
  setChannelFilter?: (val: string) => void
  onReset: () => void
}

export const BannerFilterDrawer: React.FC<BannerFilterDrawerProps> = ({
  isOpen,
  onClose,
  positionFilter,
  setPositionFilter,
  statusFilter,
  setStatusFilter,
  channelFilter = 'all',
  setChannelFilter,
  onReset,
}) => {
  const { t } = useTranslation(['marketing', 'common', 'buttons'])
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between"
        >
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
            <h2 className="text-base font-bold text-foreground">
              {t('marketing.filterBanners', 'ចម្រោះផ្ទាំងបដា')}
            </h2>
            <CloseButton onClose={onClose} size="md" color="rose" />
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('marketing.activeStatus', 'ស្ថានភាពសកម្ម')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: t('marketing.allStatus', 'គ្រប់ស្ថានភាព') },
                  { id: 'active', label: t('marketing.active', 'សកម្ម') },
                  { id: 'inactive', label: t('marketing.inactive', 'អសកម្ម') },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl capitalize transition-all border cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-card border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Placement / Target Screen Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('marketing.displayPlacementScreen', 'ទីតាំងបង្ហាញ & អេក្រង់គោលដៅ')}
              </label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="form-input w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs"
              >
                <option value="all">{t('marketing.allPositions', 'គ្រប់ទីតាំងទាំងអស់')}</option>
                <option value="hero">{t('marketing.placementHero', 'ស្លាយទំព័រដើម (Hero)')}</option>
                <option value="pos_cfd">{t('marketing.placementPosCfd', 'អេក្រង់អតិថិជន POS (CFD)')}</option>
                <option value="app_splash">{t('marketing.placementMobileApp', 'កម្មវិធីទូរស័ព្ទដៃ (App)')}</option>
                <option value="sidebar">{t('marketing.placementSidebar', 'ចំហៀងទំព័រ (Sidebar)')}</option>
                <option value="popup">{t('marketing.placementPopup', 'ផ្ទាំងផុសផ្សព្វផ្សាយ (Popup)')}</option>
              </select>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3 shrink-0">
            <ResetButton onClick={onReset} label={t('marketing.resetFilters', 'កំណត់ឡើងវិញ')} className="flex-1" />
            <ActionButton
              variant="primary"
              label={t('marketing.applyFilters', 'អនុវត្ត')}
              className="flex-1"
              onClick={onClose}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BannerFilterDrawer
