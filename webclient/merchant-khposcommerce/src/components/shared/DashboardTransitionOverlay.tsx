import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { OrbitProgress } from 'react-loading-indicators'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'

interface DashboardTransitionOverlayProps {
  message?: string
  subMessage?: string
}

export const DashboardTransitionOverlay: React.FC<DashboardTransitionOverlayProps> = ({
  message,
  subMessage,
}) => {
  const { t } = useTranslation(['auth', 'common'])
  const { branding } = useCompanyStore()
  const endDashboardTransition = useAuthStore((s) => s.endDashboardTransition)

  const [stepIndex, setStepIndex] = useState(0)

  const steps = [
    t('auth.transitionStep1', 'Tuning workspace channels...'),
    t('auth.transitionStep2', 'Configuring permissions & branch profiles...'),
    t('auth.transitionStep3', 'Finalizing dashboard view...'),
  ]

  useEffect(() => {
    const s1 = setTimeout(() => setStepIndex(1), 700)
    const s2 = setTimeout(() => setStepIndex(2), 1400)

    // Safety fallback timeout
    const safetyTimer = setTimeout(() => {
      endDashboardTransition()
    }, 5000)

    return () => {
      clearTimeout(s1)
      clearTimeout(s2)
      clearTimeout(safetyTimer)
    }
  }, [endDashboardTransition])

  const defaultTitle = message || t('auth.preparingDashboard', 'Preparing your dashboard...')
  const defaultSubtitle = subMessage || steps[stepIndex]

  return (
    <motion.div
      key="dashboard-transition-overlay"
      role="status"
      aria-live="polite"
      aria-label={defaultTitle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950 selection:bg-blue-500 overflow-hidden font-sans select-none"
    >
      {/* ── Center Indicator: OrbitProgress Wrapping Central Emblem (OptaPOS Royal Blue) ── */}
      <div className="relative flex items-center justify-center size-[120px]">
        {/* React Loading Indicator: OrbitProgress with track-disc variant matching brand blue */}
        <OrbitProgress
          variant="track-disc"
          color="#2563eb"
          speedPlus={0}
          easing="ease-in-out"
          style={{ fontSize: '21px' }}
        />

        {/* Central Circular Brand Icon Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-[52px] rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
            {branding?.logo_url ? (
              <img
                src={branding.logo_url}
                alt="Brand Emblem"
                className="size-7 object-contain rounded-full"
              />
            ) : (
              /* Modern 3-bar metric chart emblem matching reference */
              <svg
                className="size-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="5" y="13" width="3.5" height="7" rx="1.5" />
                <rect x="10.25" y="5" width="3.5" height="15" rx="1.5" />
                <rect x="15.5" y="9" width="3.5" height="11" rx="1.5" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* ── Typography Section ── */}
      <div className="mt-8 text-center px-4 max-w-md">
        <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white">
          {defaultTitle}
        </h2>
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium mt-2.5 leading-relaxed"
        >
          {defaultSubtitle}
        </motion.p>
      </div>
    </motion.div>
  )
}

export default DashboardTransitionOverlay
