import React, { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Loader2,
  Check,
  Undo2,
  Save,
  SlidersHorizontal,
} from 'lucide-react'
import { roleService } from '@/services/roleService'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { downloadCsv } from '@/utils/export'
import { usePermission } from '@/hooks/usePermission'
import {
  getPermissionModule,
  getPermissionAction,
  getPermissionRiskLevel,
} from '@/utils/permissionUtils'
import type { Role } from '../roles/rolesCommon'
import {
  getRoleSlugColor,
  formatRoleTitle,
  formatApexPermissionLabel,
  MODULE_ORDER,
  MODULE_HEADINGS,
  MODULE_HEADINGS_KM,
  ACTION_ORDER,
} from '../roles/rolesCommon'
import {
  Breadcrumb,
} from '@/components/common'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'

export const RoleMatrixView: React.FC = () => {
  const { t, i18n } = useTranslation(['roles', 'common', 'buttons', 'nav'])
  const storeLanguage = useThemeStore((s) => s.language)
  const currentLang = storeLanguage || i18n.language || 'en'
  const isKhmer = currentLang === 'km' || currentLang.startsWith('km') || currentLang.startsWith('kh')
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermission()
  const canUpdateRole = hasPermission('role.update')
  const canCreateRole = hasPermission('role.create')

  const authUser = useAuthStore((s) => s.user)
  const currentRoleName = authUser?.roles?.[0]
    ? formatRoleTitle(authUser.roles[0])
    : 'Admin'

  // Filter State
  const [filterRiskOnly, setFilterRiskOnly] = useState(false)
  const [filterModifiedOnly, setFilterModifiedOnly] = useState(false)

  // Local pending changes state: { [roleId]: Set<permissionName> }
  const [pendingChanges, setPendingChanges] = useState<Record<number, Set<string>>>({})

  // ── 1. Fetch Roles List ────────────────────────────────────────────────────
  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['matrix-roles-list'],
    queryFn: async () => {
      const res = await roleService.list({ per_page: 100 })
      return Array.isArray(res) ? res : res?.data ?? []
    },
  })

  const roles: Role[] = useMemo(() => {
    const list = Array.isArray(rolesData) ? rolesData : rolesData?.data ?? []
    return list.filter((r: Role) => r.status !== 'inactive')
  }, [rolesData])

  // ── 2. Fetch All Permissions ───────────────────────────────────────────────
  const {
    data: allPermsData,
    isLoading: isLoadingPerms,
    refetch: refetchPerms,
  } = useQuery({
    queryKey: ['matrix-all-permissions'],
    queryFn: async () => {
      const res = await roleService.permissions({ per_page: 'all' })
      return Array.isArray(res) ? res : res?.data ?? []
    },
  })

  const allPermissions: any[] = useMemo(() => {
    return Array.isArray(allPermsData) ? allPermsData : allPermsData?.data ?? []
  }, [allPermsData])

  // ── 3. Fetch Role Permissions Matrix ───────────────────────────────────────
  const roleIdsKey = roles.map((r) => r.id).join(',')
  const {
    data: serverMatrixData,
    isLoading: isLoadingMatrix,
    isRefetching: isRefetchingMatrix,
    refetch: refetchMatrix,
  } = useQuery({
    queryKey: ['roles-permission-matrix-full', roleIdsKey],
    queryFn: async () => {
      const results: Record<number, string[]> = {}
      await Promise.all(
        roles.map(async (r) => {
          try {
            const res = await roleService.getRolePermissions(r.id)
            const list = Array.isArray(res) ? res : res?.permissions ?? res?.data ?? []
            results[r.id] = list.map((p: any) => (typeof p === 'string' ? p : p.name))
          } catch {
            results[r.id] = []
          }
        })
      )
      return results
    },
    enabled: roles.length > 0,
  })

  // Current active permission set per role (incorporates pending local edits)
  const effectiveRolePermissions = useMemo(() => {
    const map: Record<number, Set<string>> = {}
    roles.forEach((r) => {
      if (pendingChanges[r.id]) {
        map[r.id] = new Set(pendingChanges[r.id])
      } else {
        map[r.id] = new Set(serverMatrixData?.[r.id] || [])
      }
    })
    return map
  }, [roles, serverMatrixData, pendingChanges])

  // Total modified changes count
  const totalModifiedRolesCount = Object.keys(pendingChanges).length
  const hasPendingChanges = totalModifiedRolesCount > 0

  // ── 4. Save Permissions Mutation ───────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const roleIds = Object.keys(pendingChanges).map(Number)
      for (const roleId of roleIds) {
        const perms = Array.from(pendingChanges[roleId] || [])
        await roleService.assignPermissions(roleId, perms)
      }
    },
    onSuccess: () => {
      toast.success(
        t('roles.toastPermissionsSuccess', {
          role: t('roles.rolesCount', { count: totalModifiedRolesCount }),
          defaultValue: 'Saved permission changes successfully.',
        })
      )
      setPendingChanges({})
      queryClient.invalidateQueries({ queryKey: ['roles-permission-matrix-full'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['matrix-roles-list'] })
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] })
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t('roles.toastPermissionsFailed', 'Failed to update permissions.')
      )
    },
  })

  // ── 5. Permission Toggle Handler ───────────────────────────────────────────
  const handleTogglePermission = useCallback(
    (roleId: number, permName: string, roleName: string) => {
      if (roleName.toLowerCase() === 'super_admin' || !canUpdateRole) return

      setPendingChanges((prev) => {
        const currentSet = new Set(prev[roleId] || serverMatrixData?.[roleId] || [])
        if (currentSet.has(permName)) {
          currentSet.delete(permName)
        } else {
          currentSet.add(permName)
        }

        const serverBaseline = new Set(serverMatrixData?.[roleId] || [])
        const isIdentical =
          currentSet.size === serverBaseline.size &&
          Array.from(currentSet).every((p) => serverBaseline.has(p))

        if (isIdentical) {
          const next = { ...prev }
          delete next[roleId]
          return next
        }

        return {
          ...prev,
          [roleId]: currentSet,
        }
      })
    },
    [serverMatrixData, canUpdateRole]
  )

  // ── 6. Discard All Changes ─────────────────────────────────────────────────
  const handleDiscardChanges = () => {
    setPendingChanges({})
  }

  // ── 7. Group & Filter Permissions ──────────────────────────────────────────
  const permissionModules = useMemo(() => {
    const set = new Set<string>()
    allPermissions.forEach((p: any) => {
      const pName = typeof p === 'string' ? p : p?.name
      if (!pName) return
      const mod = typeof p === 'object' && p?.module ? p.module : getPermissionModule(pName)
      if (mod) set.add(mod)
    })
    return Array.from(set).sort((a, b) => {
      const idxA = MODULE_ORDER.indexOf(a)
      const idxB = MODULE_ORDER.indexOf(b)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.localeCompare(b)
    })
  }, [allPermissions])

  const filteredPermissions = useMemo(() => {
    return allPermissions.filter((p: any) => {
      const pName = typeof p === 'string' ? p : p?.name || ''

      // Risk level filter
      const risk = p.risk_level || getPermissionRiskLevel(pName)
      if (filterRiskOnly && risk !== 'high') {
        return false
      }

      // Modified only filter
      if (filterModifiedOnly) {
        const isModified = Object.keys(pendingChanges).some((rId) => {
          const roleId = Number(rId)
          const baselineHas = (serverMatrixData?.[roleId] || []).includes(pName)
          const currentHas = (pendingChanges[roleId] || new Set()).has(pName)
          return baselineHas !== currentHas
        })
        if (!isModified) return false
      }

      return true
    })
  }, [
    allPermissions,
    filterRiskOnly,
    filterModifiedOnly,
    pendingChanges,
    serverMatrixData,
  ])

  const groupedPermissions = useMemo(() => {
    const map: Record<string, any[]> = {}
    filteredPermissions.forEach((p: any) => {
      const pName = typeof p === 'string' ? p : p?.name
      const mod = typeof p === 'object' && p?.module ? p.module : getPermissionModule(pName)
      if (!map[mod]) map[mod] = []
      map[mod].push(typeof p === 'string' ? { name: p, module: mod } : p)
    })

    Object.keys(map).forEach((mod) => {
      map[mod].sort((a, b) => {
        const actA = getPermissionAction(a?.name || '')
        const actB = getPermissionAction(b?.name || '')
        const weightA = ACTION_ORDER[actA] ?? 50
        const weightB = ACTION_ORDER[actB] ?? 50
        return weightA - weightB
      })
    })

    // Sort modules by MODULE_ORDER so USERS, ORDERS, PRODUCTS, CUSTOMERS, BILLING, INVOICES appear first
    const sortedMap: Record<string, any[]> = {}
    const sortedKeys = Object.keys(map).sort((a, b) => {
      const idxA = MODULE_ORDER.indexOf(a)
      const idxB = MODULE_ORDER.indexOf(b)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.localeCompare(b)
    })

    sortedKeys.forEach((key) => {
      sortedMap[key] = map[key]
    })

    return sortedMap
  }, [filteredPermissions])

  // ── 8. Export Matrix to CSV ────────────────────────────────────────────────
  const handleExportMatrixCsv = () => {
    const headers = [
      'Permission Name',
      'Module',
      'Display Name (EN)',
      'Display Name (KM)',
      'Risk Level',
      ...roles.map((r) => r.name),
    ]

    const rows = filteredPermissions.map((p: any) => {
      const pName = typeof p === 'string' ? p : p?.name || ''
      const mod = typeof p === 'object' && p?.module ? p.module : getPermissionModule(pName)
      const labels = formatApexPermissionLabel(p, false)
      const risk = p.risk_level || getPermissionRiskLevel(pName)

      const roleFlags = roles.map((r) => {
        const isSuperAdmin = r.name.toLowerCase() === 'super_admin'
        if (isSuperAdmin) return 'YES'
        const has = effectiveRolePermissions[r.id]?.has(pName)
        return has ? 'YES' : 'NO'
      })

      return [pName, mod, labels.en, labels.km || '', risk, ...roleFlags]
    })

    downloadCsv('permission_matrix', headers, rows)
    toast.success(t('roles.toastExportSuccess', 'Matrix exported successfully to CSV.'))
  }

  const isLoading = isLoadingRoles || isLoadingPerms || isLoadingMatrix

  return (
    <div className="space-y-4 pb-20 w-full">
      {/* ── 1. GLOBAL BREADCRUMB (Matches Apex Dashboard 100%) ─────────────── */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Permissions' },
        ]}
      />

      {/* ── 2. GLOBAL HERO HEADER (Matches Apex Dashboard 100%) ────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">
            Permissions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Every permission the dashboard recognises, and which roles grant it.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/roles')}
            className="h-9 px-3.5 text-xs font-semibold gap-2 border-border/80 bg-background hover:bg-muted text-foreground cursor-pointer shadow-2xs rounded-lg"
          >
            <Shield size={14} className="text-foreground/80" />
            <span>Manage roles</span>
          </Button>

          {canUpdateRole && hasPendingChanges && (
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="h-9 px-3.5 rounded-lg text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
            >
              {saveMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              <span>Save Changes</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {totalModifiedRolesCount}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* ── 3. ROLE × PERMISSION CARD (Apex Style - Clean & Continuous) ───── */}
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Card Header Toolbar (Matches Apex Dashboard 100%) */}
        <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Role × permission
            </h2>
            <p className="text-xs text-muted-foreground">
              Switch the acting role from the theme customizer to watch these take effect across the dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">
              Acting as
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-600 text-white shadow-xs">
              Admin
            </span>
          </div>
        </div>

        {/* ── Table: Flows continuously downward with 0 inner scrollbars ──── */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="text-xs font-medium">
              {t('roles.loadingMatrix', 'Loading permissions matrix...')}
            </span>
          </div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs text-muted-foreground">
              {t('roles.noMatrixPermissionsFound', 'No permissions match your search criteria.')}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-auto sm:table-fixed">
            {/* Table Header: Sleek Role Badges matching Apex Dashboard */}
            <thead>
              <tr className="border-b border-border/60 bg-card">
                {/* First Column: Permission Label */}
                <th className="py-3.5 px-6 font-medium text-xs text-muted-foreground w-[38%] sm:w-[44%]">
                  Permission
                </th>

                {/* Role Column Badges */}
                {roles.map((r) => {
                  const slug = r.name.toLowerCase()
                  const isEmerald = slug === 'admin' || slug === 'super_admin'
                  const isAmber = slug === 'moderator' || slug === 'cashier'

                  return (
                    <th key={r.id} className="py-3.5 px-2 text-center font-medium">
                      <div className="flex items-center justify-center">
                        {isEmerald ? (
                          <span className="px-3.5 py-0.5 rounded-full text-xs font-medium bg-emerald-600 text-white shadow-xs">
                            {formatRoleTitle(r, false)}
                          </span>
                        ) : isAmber ? (
                          <span className="px-3.5 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-white shadow-xs">
                            {formatRoleTitle(r, false)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {formatRoleTitle(r, false)}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {Object.entries(groupedPermissions).map(([mod, perms]) => {
                const moduleHeading = MODULE_HEADINGS[mod] || mod.toUpperCase().replace(/_/g, ' ')

                return (
                  <React.Fragment key={mod}>
                    {/* Module Separator Heading (USERS, ORDERS, PRODUCTS...) */}
                    <tr className="border-b-0 bg-transparent">
                      <td
                        colSpan={roles.length + 1}
                        className="pt-7 pb-2 px-6 font-bold uppercase tracking-wider text-[11px] text-muted-foreground/80 select-none"
                      >
                        {moduleHeading}
                      </td>
                    </tr>

                    {/* Permissions list rows under module */}
                    {perms.map((p: any) => {
                      const pName = p.name
                      const labels = formatApexPermissionLabel(p, false)

                      return (
                        <tr
                          key={pName}
                          className="border-b border-border/40 hover:bg-muted/15 transition-colors"
                        >
                          {/* Permission title + key */}
                          <td className="py-3 px-6 align-middle">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground tracking-tight">
                                {labels.en}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground/50 font-normal">
                                {pName}
                              </span>
                            </div>
                          </td>

                          {/* Role Cells: Clean Checkmark ✓ or Dash — matching Apex */}
                          {roles.map((r) => {
                            const isSuperAdmin = r.name.toLowerCase() === 'super_admin'
                            const rolePermSet = effectiveRolePermissions[r.id]
                            const hasPerm =
                              isSuperAdmin || Boolean(rolePermSet?.has(pName))

                            const serverHas = Boolean(
                              serverMatrixData?.[r.id]?.includes(pName)
                            )
                            const isCellModified =
                              !isSuperAdmin && serverHas !== hasPerm

                            return (
                              <td key={r.id} className="py-3 px-2 text-center align-middle">
                                {isSuperAdmin ? (
                                  <div className="flex items-center justify-center">
                                    <Check
                                      size={16}
                                      strokeWidth={1.8}
                                      className="text-emerald-600/90 dark:text-emerald-400"
                                    />
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={!canUpdateRole}
                                    onClick={() =>
                                      handleTogglePermission(r.id, pName, r.name)
                                    }
                                    className={cn(
                                      'w-full py-1.5 flex items-center justify-center rounded transition-colors group/cell',
                                      canUpdateRole
                                        ? 'hover:bg-muted/60 cursor-pointer'
                                        : 'cursor-default',
                                      isCellModified &&
                                        'bg-amber-500/15 ring-1 ring-amber-500/50 rounded'
                                    )}
                                    title={`${hasPerm ? 'Revoke' : 'Grant'} ${pName} for ${r.name}`}
                                  >
                                    {hasPerm ? (
                                      <Check
                                        size={16}
                                        strokeWidth={1.8}
                                        className="text-emerald-600/90 dark:text-emerald-400 group-hover/cell:scale-110 transition-transform"
                                      />
                                    ) : (
                                      <span className="text-muted-foreground/30 font-normal text-sm select-none group-hover/cell:text-muted-foreground/60">
                                        —
                                      </span>
                                    )}
                                  </button>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Floating Save Dock when pending changes exist ── */}
      <AnimatePresence>
        {hasPendingChanges && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md p-3 shadow-2xl flex items-center justify-between gap-4 ring-1 ring-primary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {t('roles.unsavedChangesTitle', 'Unsaved Changes')}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {t('roles.unsavedRolesCount', {
                      count: totalModifiedRolesCount,
                      defaultValue: `${totalModifiedRolesCount} roles altered`,
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscardChanges}
                  disabled={saveMutation.isPending}
                  className="h-8 px-2.5 text-xs gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Undo2 size={12} />
                  <span>{t('roles.discard', 'Discard')}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="h-8 px-3.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer shadow-sm"
                >
                  {saveMutation.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  <span>{t('roles.saveChanges', 'Save Changes')}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RoleMatrixView
