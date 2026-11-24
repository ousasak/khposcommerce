/**
 * Core Notification Entity Types
 * Enterprise Data Contract for System Alerts, Notification Items, and Channels.
 */

export type NotificationType =
  | 'system'
  | 'inventory'
  | 'purchase'
  | 'sales'
  | 'customer'
  | 'supplier'
  | 'employee'
  | 'attendance'
  | 'payroll'
  | 'finance'
  | 'expense'
  | 'payment'
  | 'security'
  | 'report'
  | 'marketing'
  | 'shipping'
  | 'company'
  | 'setting'
  | 'warning'
  | 'success'
  | 'error'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical'

export type DeliveryChannel =
  | 'database'
  | 'email'
  | 'telegram'
  | 'sms'
  | 'push'
  | 'websocket'
  | 'slack'
  | 'teams'
  | 'discord'

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled'

export interface NotificationItem {
  id: number
  company_id?: number | null
  company_name?: string | null
  branch_id?: number | null
  branch_name?: string | null
  type: NotificationType
  title: string
  message: string
  icon?: string | null
  color?: string | null
  priority: NotificationPriority
  image?: string | null
  action_url?: string | null
  reference_type?: string | null
  reference_id?: string | null
  created_by?: number | null
  creator_name?: string | null
  expires_at?: string | null
  is_global: boolean
  status: NotificationStatus
  is_read: boolean
  read_at?: string | null
  is_archived?: boolean
  read_count?: number
  created_at: string
  updated_at?: string
}

export interface NotificationFilters {
  search?: string
  type?: string
  priority?: string
  status?: string
  tab?: 'all' | 'unread' | 'read' | 'archived' | string
  start_date?: string
  end_date?: string
  company_id?: number
  branch_id?: number
  created_by?: number
  is_global?: boolean
  is_read?: boolean | string
  page?: number
  per_page?: number
}
