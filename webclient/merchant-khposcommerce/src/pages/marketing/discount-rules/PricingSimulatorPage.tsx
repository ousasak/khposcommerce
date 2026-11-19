import React from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/common'
import { PricingSimulatorSection } from './components/PricingSimulatorSection'

export const PricingSimulatorPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'nav'])

  return (
    <div className="space-y-4 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.marketingManagement', t('nav.marketing', 'Marketing')), path: '/marketing/promotions' },
          { label: t('marketing.pricingSimulatorTitle', 'Pricing Simulator') },
        ]}
      />

      <PricingSimulatorSection />
    </div>
  )
}

export default PricingSimulatorPage
