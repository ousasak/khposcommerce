/**
 * Users Page Domain Types
 * Re-exports canonical User contracts from global types suite with local UI helpers.
 */

import { getAbsoluteImageUrl } from '@/utils/image'

export * from '@/types/user'

export const getAvatarUrl = (avatar?: string | null): string | null => {
  if (!avatar) return null
  return getAbsoluteImageUrl(avatar)
}

export const defaultPermissionModules = [
  { id: 'dashboard.view', label: 'View Analytics & Dashboard', group: 'Dashboard' },
  { id: 'products.manage', label: 'Manage Products & Inventory Items', group: 'Catalog' },
  { id: 'orders.manage', label: 'Manage POS Orders & Transactions', group: 'Sales POS' },
  { id: 'customers.manage', label: 'Manage Customer Directory & CRM', group: 'Customers' },
  { id: 'finance.manage', label: 'Manage Finance, Expenses & Accounting', group: 'Finance' },
  { id: 'marketing.manage', label: 'Manage Coupons, Flash Sales & Banners', group: 'Marketing' },
  { id: 'shipping.manage', label: 'Manage Shipping & Carrier Rates', group: 'Shipping' },
  { id: 'company.manage', label: 'Manage Companies, Branches & Warehouses', group: 'Company' },
  { id: 'users.manage', label: 'Manage Users, Roles & Security Access', group: 'Administration' },
  { id: 'settings.manage', label: 'Manage Store & System Settings', group: 'Settings' },
]
