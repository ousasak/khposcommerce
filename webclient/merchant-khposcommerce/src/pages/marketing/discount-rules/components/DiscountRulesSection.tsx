import React from 'react'
import {
  DiscountRulesTableSection,
  type FlattenedPromotionRule,
} from './DiscountRulesTableSection'
import type { PromotionCampaign } from '../../promotions/types'

interface DiscountRulesSectionProps {
  campaigns: PromotionCampaign[]
  onOpenCampaign: (campaign: PromotionCampaign) => void
  onOpenSimulator?: (campaign?: PromotionCampaign) => void
}

export const DiscountRulesSection: React.FC<DiscountRulesSectionProps> = ({
  campaigns,
  onOpenCampaign,
}) => {
  const allRules: FlattenedPromotionRule[] = React.useMemo(() => {
    const list: FlattenedPromotionRule[] = []
    campaigns.forEach((camp) => {
      ;(camp.rules || []).forEach((rule) => {
        list.push({ ...rule, campaign: camp })
      })
    })
    return list
  }, [campaigns])

  return (
    <DiscountRulesTableSection
      rules={allRules}
      isLoading={false}
      isFetching={false}
      visibleColumns={{
        name: true,
        discount: true,
        scope: true,
        conditions: true,
        priority: true,
        status: true,
        actions: true,
      }}
      onView={(rule) => onOpenCampaign(rule.campaign)}
      onEditCampaign={(camp) => onOpenCampaign(camp)}
    />
  )
}

export default DiscountRulesSection
