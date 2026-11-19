import React from 'react'
import { Shield, Key, Lock, Mail, Phone, MapPin, Calendar, Clock, UserCheck } from 'lucide-react'
import {
  StatusBadge,
  UserAvatar,
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
  ActionButton,
} from '@/components/common'
import { GlobalFormat } from '@/utils/formatters'
import type { User } from '../types/user.types'

interface UserDetailDrawerProps {
  user: User | null
  onClose: () => void
  getAvatarUrl?: (avatar?: string | null) => string | null
  openResetPasswordModal: (user: User) => void
  openPermissionModal: (user: User) => void
  canEdit?: boolean
  canManageRole?: boolean
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  user,
  onClose,
  openResetPasswordModal,
  openPermissionModal,
  canEdit = true,
  canManageRole = true,
}) => {
  if (!user) return null

  const roleName = user.roles?.[0]?.name ?? 'Staff'
  const fullAddress = [user.address, user.city, user.province, user.country].filter(Boolean).join(', ')

  return (
    <DetailDrawer
      isOpen={!!user}
      onClose={onClose}
      size="2xl"
    >
      {/* ── 1. DRAWER TOP HEADER ── */}
      <DetailDrawerHeader
        title="User Profile & Access Control"
        subtitle={user.email}
        badge={
          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
            USR-#{String(user.id).padStart(4, '0')}
          </span>
        }
        onClose={onClose}
      />

      {/* ── 2. HERO OVERVIEW CARD (MATCHING EMPLOYEE PROFILE BANNER) ── */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={user.avatar}
            name={user.name}
            sizeClassName="w-14 h-14"
            className="shadow-xs"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {user.name}
              </h2>
              <StatusBadge status={user.is_active} />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {roleName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span className="font-mono">{user.email}</span>
              {user.phone && (
                <>
                  <span>•</span>
                  <span>{GlobalFormat.phone(user.phone)}</span>
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                Role: {roleName}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {user.last_login ? `Active: ${GlobalFormat.displayDate(user.last_login)}` : 'No Recent Login'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. DRAWER BODY (GROUPED 2-COLUMN CARDS) ── */}
      <DetailDrawerBody className="p-6 space-y-4">
        {/* Card 1: Personal & Contact Information */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Personal & Contact Info
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">Full Name</p>
              <p className="font-semibold text-foreground mt-0.5">{user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">Email Address</p>
              <p className="font-semibold text-foreground font-mono mt-0.5">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">Phone Number</p>
              <p className="font-semibold text-foreground font-mono mt-0.5">{user.phone ? GlobalFormat.phone(user.phone) : '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">Assigned Role</p>
              <p className="font-semibold text-foreground mt-0.5">{roleName}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-[11px] font-medium">Location Address</p>
              <p className="font-semibold text-foreground mt-0.5 leading-relaxed">{fullAddress || '—'}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Access Logs */}
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Security & Access Logs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">Last Login Activity</p>
              <p className="font-semibold font-mono text-foreground mt-0.5">
                {user.last_login ? GlobalFormat.displayDate(user.last_login, { includeTime: true }) : 'Never Logged In'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">Account Created</p>
              <p className="font-semibold font-mono text-foreground mt-0.5">
                {user.created_at ? GlobalFormat.displayDate(user.created_at) : '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">Account Status</p>
              <p className="font-semibold text-foreground mt-0.5 capitalize">
                {user.is_active ? 'Active & Enabled' : 'Disabled / Suspended'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium">Authentication Type</p>
              <p className="font-semibold text-foreground mt-0.5">Standard Password / 2FA</p>
            </div>
          </div>
        </div>
      </DetailDrawerBody>

      {/* ── 4. DRAWER FOOTER ACTIONS ── */}
      <DetailDrawerFooter
        onClose={onClose}
        leftActions={
          canEdit ? (
            <ActionButton
              variant="outline"
              icon={<Key size={15} className="text-amber-500" />}
              label="Reset Password"
              onClick={() => openResetPasswordModal(user)}
            />
          ) : undefined
        }
        rightActions={
          canManageRole ? (
            <ActionButton
              variant="primary"
              icon={<Lock size={15} />}
              label="Manage Permissions"
              onClick={() => openPermissionModal(user)}
            />
          ) : undefined
        }
      />
    </DetailDrawer>
  )
}

export default UserDetailDrawer
