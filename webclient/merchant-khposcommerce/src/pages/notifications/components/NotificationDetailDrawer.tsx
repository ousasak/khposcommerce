import React, { useEffect, useState } from 'react'
import {
  ExternalLink,
  Mail,
  Send,
  Smartphone,
  Database,
  Activity,
  Users,
  Loader2,
  Bell,
  Globe,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  ActionButton,
} from '@/components/common'
import type { DetailDrawerTabItem } from '@/components/common'
import type { NotificationItem, NotificationLogsResponse } from '../types/notification.types'
import notificationService from '@/services/notificationService'

interface NotificationDetailDrawerProps {
  open: boolean
  notification: NotificationItem | null
  onClose: () => void
}

type NotifTabKey = 'details' | 'delivery' | 'recipients'

const NotificationDetailDrawer: React.FC<NotificationDetailDrawerProps> = ({
  open,
  notification,
  onClose,
}) => {
  const { t } = useTranslation(['notifications', 'common'])
  const [loading, setLoading] = useState(false)
  const [logData, setLogData] = useState<NotificationLogsResponse | null>(null)
  const [activeTab, setActiveTab] = useState<NotifTabKey>('details')

  useEffect(() => {
    if (open && notification) {
      fetchLogs(notification.id)
    }
  }, [open, notification])

  const fetchLogs = async (id: number) => {
    setLoading(true)
    try {
      const res = await notificationService.getNotificationLogs(id)
      setLogData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!notification) return null

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'critical':
        return (
          <span className="font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Critical
          </span>
        )
      case 'high':
        return (
          <span className="font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            High
          </span>
        )
      case 'normal':
        return (
          <span className="font-medium text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Normal
          </span>
        )
      default:
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Low
          </span>
        )
    }
  }

  const drawerTabs: DetailDrawerTabItem[] = [
    {
      key: 'details',
      label: t('details', 'Message & Scope'),
      icon: Bell,
    },
    {
      key: 'delivery',
      label: t('delivery', 'Delivery Logs'),
      icon: Activity,
      badge: logData?.logs?.length || undefined,
    },
    {
      key: 'recipients',
      label: t('recipients', 'Read Audit'),
      icon: Users,
      badge: logData ? `${logData.read_count || 0}/${logData.recipient_count || 0}` : undefined,
    },
  ]

  return (
    <DetailDrawer
      isOpen={open}
      onClose={onClose}
      size="2xl"
    >
      {/* ── 1. DRAWER TOP HEADER ── */}
      <DetailDrawerHeader
        title={t('notificationDetails', 'Notification Details')}
        subtitle={
          notification.created_at
            ? format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')
            : '—'
        }
        badge={
          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
            NOTIF-#{String(notification.id).padStart(4, '0')}
          </span>
        }
        onClose={onClose}
      />

      {/* ── 2. HERO OVERVIEW CARD (MATCHING EMPLOYEE PROFILE BANNER) ── */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0 shadow-xs">
            <Bell size={26} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {notification.title}
              </h2>
              <span className="capitalize font-bold rounded-lg text-xs px-2.5 py-0.5 bg-muted text-foreground border border-border">
                {notification.type}
              </span>
              {getPriorityBadge(notification.priority)}
              {notification.is_global && (
                <span className="font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Global Broadcast
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{notification.company_name || 'All Companies'}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/80">{notification.branch_name || 'All Branches'}</span>
              <span>•</span>
              <span>By {notification.creator_name || 'System'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border uppercase font-mono">
                Priority: {notification.priority}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {logData?.logs?.length || 0} Delivery Channels
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                {logData ? `${logData.read_count || 0}/${logData.recipient_count || 0} Read` : '0 Read'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. TAB NAVIGATION ── */}
      <DetailDrawerTabNav
        tabs={drawerTabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as NotifTabKey)}
      />

      {/* ── 4. DRAWER BODY ── */}
      <DetailDrawerBody className="p-6 space-y-4">
        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Notification Body Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('messageBody', 'Message Content')}
              </h4>
              <p className="text-xs font-medium text-foreground leading-relaxed p-4 rounded-xl bg-muted/30 border border-border/60">
                {notification.message}
              </p>
              {notification.action_url && (
                <div className="pt-2">
                  <a
                    href={notification.action_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    <span>{t('notification.action_url', 'Open Action Link URL')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Scope & Metadata Card */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('notificationScope', 'Broadcast Scope & Author')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('createdBy', 'Created By')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{notification.creator_name || 'System Engine'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('createdDate', 'Creation Date & Time')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">
                    {notification.created_at ? format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm:ss') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('companyScope', 'Company Scope')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{notification.company_name || 'All Companies (HQ)'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('branchScope', 'Branch Scope')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{notification.branch_name || 'All Branches'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Delivery Logs */}
        {activeTab === 'delivery' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('channelLogs', 'Multi-channel Dispatch Logs')}
              </h4>
              {loading ? (
                <div className="py-8 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {logData?.logs && logData.logs.length > 0 ? (
                    logData.logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 text-xs"
                      >
                        <div className="p-2 bg-card rounded-lg text-primary mt-0.5 shadow-2xs">
                          {log.channel === 'email' ? (
                            <Mail className="w-4 h-4 text-blue-500" />
                          ) : log.channel === 'telegram' ? (
                            <Send className="w-4 h-4 text-sky-500" />
                          ) : log.channel === 'sms' ? (
                            <Smartphone className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Database className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold uppercase text-[10px] text-foreground">
                              {log.channel} Channel
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                log.status === 'sent'
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              }`}
                            >
                              {log.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{log.response}</p>
                          <span className="text-[10px] text-muted-foreground block mt-1 font-mono">
                            {log.sent_at ? format(new Date(log.sent_at), 'HH:mm:ss dd/MM/yyyy') : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No delivery logs recorded
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Recipients */}
        {activeTab === 'recipients' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('readAudit', 'Recipient Read Audit')}
              </h4>
              {loading ? (
                <div className="py-8 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2 pt-1 max-h-80 overflow-y-auto no-scrollbar">
                  {logData?.read_users && logData.read_users.length > 0 ? (
                    logData.read_users.map((ru) => (
                      <div
                        key={ru.user_id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/40 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shadow-2xs">
                            {ru.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">{ru.name}</span>
                            {ru.email && <span className="text-[10px] text-muted-foreground font-mono">{ru.email}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          {ru.is_read ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Read {ru.read_at ? format(new Date(ru.read_at), 'HH:mm') : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      Global notification / No direct recipient list
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DetailDrawerBody>

      {/* ── 5. DRAWER FOOTER ACTIONS ── */}
      <DetailDrawerFooter
        onClose={onClose}
        rightActions={
          notification.action_url ? (
            <ActionButton
              variant="primary"
              icon={<ExternalLink size={15} />}
              label={t('openAction', 'Open Link')}
              onClick={() => window.open(notification.action_url, '_blank')}
            />
          ) : undefined
        }
      />
    </DetailDrawer>
  )
}

export default NotificationDetailDrawer
