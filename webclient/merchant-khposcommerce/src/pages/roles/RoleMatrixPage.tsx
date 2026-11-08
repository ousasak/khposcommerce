import React, { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key,
  ArrowLeft,
  Search,
  X,
  Loader2,
  Download,
  RefreshCw,
  Check,
  Shield,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Layers,
  Undo2,
  Save,
  CheckCircle2,
  Info,
  SlidersHorizontal,
} from 'lucide-react'
import { roleService } from '@/services/roleService'
import { permissionService } from '@/services/permissionService'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { downloadCsv } from '@/utils/export'
import { usePermission } from '@/hooks/usePermission'
import {
  getPermissionModule,
  getPermissionAction,
  getPermissionRiskLevel,
  normalizePermission,
} from '@/utils/permissionUtils'
import type { Role } from "./rolesCommon"
import {
  getRoleSlugColor,
  formatRoleTitle,
  formatApexPermissionLabel,
  MODULE_ORDER,
  MODULE_HEADINGS,
  MODULE_HEADINGS_KM,
  ACTION_ORDER,
} from './rolesCommon'
import { Breadcrumb } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/themeStore'

const RoleMatrixPage: React.FC = () => {
  const { t, i18n } = useTranslation(['roles', 'common', 'buttons', 'nav'])
  const storeLanguage = useThemeStore((s) => s.language)
  const currentLang = storeLanguage || i18n.language || 'en'
  const isKhmer = currentLang === 'km' || currentLang.startsWith('km') || currentLang.startsWith('kh')
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermission()
  const canUpdateRole = hasPermission('role.update')

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState('all')
  const [filterRiskOnly, setFilterRiskOnly] = useState(false)
  const [filterModifiedOnly, setFilterModifiedOnly] = useState(false)
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({})

  // Local pending changes state: { [roleId]: Set<permissionName> }
  // Only stores roles whose permissions have been altered
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
      toast.success(t('roles.toastPermissionsSuccess', { role: t('roles.rolesCount', { count: totalModifiedRolesCount }), defaultValue: 'Saved permission changes successfully.' }))
      setPendingChanges({})
      queryClient.invalidateQueries({ queryKey: ['roles-permission-matrix-full'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['matrix-roles-list'] })
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('roles.toastPermissionsFailed', 'Failed to update permissions.'))
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

        // Check if currentSet is identical to server baseline
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

  // ── 6. Toggle Entire Module for a Role ─────────────────────────────────────
  const handleToggleModuleForRole = useCallback(
    (roleId: number, modulePerms: any[], roleName: string) => {
      if (roleName.toLowerCase() === 'super_admin' || !canUpdateRole) return

      const permNames = modulePerms.map((p) => p.name)
      const currentSet = new Set(pendingChanges[roleId] || serverMatrixData?.[roleId] || [])
      const allActive = permNames.every((p) => currentSet.has(p))

      if (allActive) {
        permNames.forEach((p) => currentSet.delete(p))
      } else {
        permNames.forEach((p) => currentSet.add(p))
      }

      setPendingChanges((prev) => {
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
    [pendingChanges, serverMatrixData, canUpdateRole]
  )

  // ── 7. Discard All Changes ─────────────────────────────────────────────────
  const handleDiscardChanges = () => {
    setPendingChanges({})
  }

  // ── 8. Group & Filter Permissions ──────────────────────────────────────────
  const permissionModules = useMemo(() => {
    const set = new Set<string>()
    allPermissions.forEach((p: any) => {
      const pName = typeof p === 'string' ? p : p?.name
      if (!pName) return
      const mod = (typeof p === 'object' && p?.module) ? p.module : getPermissionModule(pName)
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
    const query = search.trim().toLowerCase()
    return allPermissions.filter((p: any) => {
      const pName = typeof p === 'string' ? p : p?.name || ''
      const mod = (typeof p === 'object' && p?.module) ? p.module : getPermissionModule(pName)

      // Module filter
      if (selectedModule !== 'all' && mod !== selectedModule) {
        return false
      }

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

      // Search filter
      if (query) {
        const labels = formatApexPermissionLabel(p, isKhmer)
        const matchName = pName.toLowerCase().includes(query)
        const matchEn = labels.en.toLowerCase().includes(query)
        const matchKm = (labels.km || '').toLowerCase().includes(query)
        const matchMod = mod.toLowerCase().includes(query)
        if (!matchName && !matchEn && !matchKm && !matchMod) {
          return false
        }
      }

      return true
    })
  }, [
    allPermissions,
    search,
    selectedModule,
    filterRiskOnly,
    filterModifiedOnly,
    pendingChanges,
    serverMatrixData,
    isKhmer,
  ])

  const groupedPermissions = useMemo(() => {
    const map: Record<string, any[]> = {}
    filteredPermissions.forEach((p: any) => {
      const pName = typeof p === 'string' ? p : p?.name
      const mod = (typeof p === 'object' && p?.module) ? p.module : getPermissionModule(pName)
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

    return map
  }, [filteredPermissions])

  // Toggle Module Collapse
  const toggleCollapseModule = (mod: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [mod]: !prev[mod],
    }))
  }

  const handleExpandAll = () => setCollapsedModules({})
  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {}
    permissionModules.forEach((m) => {
      allCollapsed[m] = true
    })
    setCollapsedModules(allCollapsed)
  }

  // ── 9. Export Matrix as CSV ────────────────────────────────────────────────
  const handleExportMatrixCsv = () => {
    if (!roles.length || !allPermissions.length) return

    const headers = [
      'Permission Key',
      'Module',
      'Capability (EN)',
      'Capability (KM)',
      'Risk Level',
      ...roles.map((r) => `${formatRoleTitle(r, isKhmer)} (${r.name})`),
    ]

    const rows = allPermissions.map((p) => {
      const pName = typeof p === 'string' ? p : p?.name || ''
      const mod = (typeof p === 'object' && p?.module) ? p.module : getPermissionModule(pName)
      const risk = p.risk_level || getPermissionRiskLevel(pName)
      const labels = formatApexPermissionLabel(p, isKhmer)

      const roleFlags = roles.map((r) => {
        const set = effectiveRolePermissions[r.id]
        return set?.has(pName) ? 'YES' : 'NO'
      })

      return [pName, mod, labels.en, labels.km || '', risk, ...roleFlags]
    })

    downloadCsv('permission_matrix', headers, rows)
    toast.success(t('roles.toastExportSuccess', 'Matrix exported successfully to CSV.'))
  }

  const isLoading = isLoadingRoles || isLoadingPerms || isLoadingMatrix

  return (
    <div className="space-y-6 pb-28 max-w-full">
      {/* ── 1. GLOBAL BREADCRUMB ──────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: t('nav.administration', 'Administration') },
          { label: t('roles.title', 'Roles & Permissions'), href: '/roles' },
          { label: t('roles.permissionMatrix', 'Permission Matrix') },
        ]}
      />

      {/* ── 2. PAGE HEADER ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={t('common.back', 'Back to Roles')}
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Key size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t('roles.matrixTitle', 'Permission Matrix')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground ml-10">
            {t(
              'roles.matrixSubtitle',
              'Compare, audit, and customize operational permissions across all system and custom roles.'
            )}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchRoles()
              refetchPerms()
              refetchMatrix()
            }}
            disabled={isLoading || isRefetchingMatrix}
            className="h-9 px-3 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={isRefetchingMatrix ? 'animate-spin' : ''} />
            <span>{t('common.refresh', 'Refresh')}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMatrixCsv}
            disabled={isLoading}
            className="h-9 px-3 text-xs gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>{t('roles.exportCsv', 'Export CSV')}</span>
          </Button>

          {canUpdateRole && (
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={!hasPendingChanges || saveMutation.isPending}
              className={`h-9 px-4 text-xs font-semibold gap-1.5 cursor-pointer ${
                hasPendingChanges
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md ring-2 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {saveMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>{t('roles.saveChanges', 'Save Changes')}</span>
              {hasPendingChanges && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                  {totalModifiedRolesCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── 3. METRIC STATS CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t('roles.assignedUsersLabel', 'Total Roles')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-2 font-mono">
            {roles.length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {t('roles.rolesCount', { count: roles.length })}
          </span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t('roles.permissionsCountLabel', 'Total Permissions')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Key size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-2 font-mono">
            {allPermissions.length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {t('roles.permissionsCount', { count: allPermissions.length })}
          </span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t('roles.moduleLabel', 'Active Modules')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Layers size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-2 font-mono">
            {permissionModules.length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {t('roles.allMatrixModulesCount', { count: permissionModules.length })}
          </span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t('roles.unsavedChanges', 'Pending Updates')}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                hasPendingChanges
                  ? 'bg-amber-500/10 text-amber-600 animate-pulse'
                  : 'bg-slate-500/10 text-slate-500'
              }`}
            >
              <SlidersHorizontal size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-2 font-mono">
            {totalModifiedRolesCount}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {hasPendingChanges
              ? t('roles.rolesModifiedCount', { count: totalModifiedRolesCount, defaultValue: `${totalModifiedRolesCount} roles altered` })
              : t('roles.allRolesInSync', 'All roles in sync')}
          </span>
        </div>
      </div>

      {/* ── 4. SEARCH & FILTER TOOLBAR ────────────────────────────────────── */}
      <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('roles.filterPermissionsPlaceholder', 'Filter permissions by capability, key, or module...')}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Module Selector & Filter Toggles */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {t('roles.moduleLabel', 'Module:')}
              </span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="text-xs py-2 px-3 rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
              >
                <option value="all">
                  {t('roles.allMatrixModulesCount', {
                    count: filteredPermissions.length,
                    defaultValue: `All Modules (${filteredPermissions.length})`,
                  })}
                </option>
                {permissionModules.map((mod) => (
                  <option key={mod} value={mod}>
                    {MODULE_HEADINGS[mod] || mod.toUpperCase()} ({allPermissions.filter((p: any) => (p.module || getPermissionModule(p.name)) === mod).length})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setFilterRiskOnly((v) => !v)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterRiskOnly
                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                  : 'bg-background text-muted-foreground border-border/80 hover:text-foreground'
              }`}
            >
              <AlertTriangle size={13} />
              <span>{t('roles.riskHigh', 'High Risk Only')}</span>
            </button>

            {hasPendingChanges && (
              <button
                type="button"
                onClick={() => setFilterModifiedOnly((v) => !v)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterModifiedOnly
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    : 'bg-background text-muted-foreground border-border/80 hover:text-foreground'
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>{t('roles.modifiedOnly', 'Modified Only')}</span>
              </button>
            )}

            <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={handleExpandAll}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline-offset-2 hover:underline"
            >
              {t('roles.expandAll', 'Expand All')}
            </button>
            <span className="text-muted-foreground/40">•</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline-offset-2 hover:underline"
            >
              {t('roles.collapseAll', 'Collapse All')}
            </button>
          </div>
        </div>

        {/* Notice Info Banner */}
        <div className="rounded-lg bg-muted/40 border border-border/60 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <Info size={15} className="text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t(
              'roles.matrixHelpNotice',
              'Click any role checkbox to grant or revoke that permission directly. Roles with pending modifications are marked with an indicator. Press "Save Changes" to apply modifications to the backend database.'
            )}
          </p>
        </div>
      </div>

      {/* ── 5. FULL MATRIX TABLE ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 size={32} className="animate-spin text-primary" />
            <span className="text-xs sm:text-sm font-medium">
              {t('roles.loadingMatrix', 'Loading permissions matrix across all roles...')}
            </span>
          </div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="py-24 text-center">
            <Key size={36} className="mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">
              {t('roles.noMatrixPermissionsFound', 'No permissions match your search or filter criteria.')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {t('roles.adjustSearchCriteria', 'Try adjusting your search query or module filters above.')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setSelectedModule('all')
                setFilterRiskOnly(false)
                setFilterModifiedOnly(false)
              }}
              className="mt-4 text-xs cursor-pointer"
            >
              {t('roles.resetFilters', 'Reset Filters')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[72vh] relative">
            <table className="w-full text-left border-collapse text-xs">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 z-30 bg-muted/95 backdrop-blur-md border-b border-border/80 shadow-xs">
                <tr>
                  {/* Sticky First Column for Capability / Permission */}
                  <th className="sticky left-0 z-40 bg-muted/95 backdrop-blur-md p-3.5 pl-4 font-semibold text-foreground min-w-[280px] sm:min-w-[340px] border-r border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold">
                        {t('roles.permissionCapability', 'Permission / Capability')}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground font-normal">
                        ({filteredPermissions.length} total)
                      </span>
                    </div>
                  </th>

                  {/* Role Columns */}
                  {roles.map((r) => {
                    const slugColor = getRoleSlugColor(r.name)
                    const rolePermSet = effectiveRolePermissions[r.id]
                    const grantedCount = rolePermSet ? rolePermSet.size : 0
                    const isSuperAdmin = r.name.toLowerCase() === 'super_admin'
                    const isRoleModified = Boolean(pendingChanges[r.id])

                    return (
                      <th
                        key={r.id}
                        className={`p-3 text-center min-w-[150px] max-w-[200px] border-r border-border/40 transition-colors ${
                          isRoleModified ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground text-xs truncate max-w-[130px]">
                              {formatRoleTitle(r, isKhmer)}
                            </span>
                            {isRoleModified && (
                              <span
                                className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                                title="Has unsaved changes"
                              />
                            )}
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${slugColor}`}>
                            {r.name.toLowerCase()}
                          </span>

                          <span className="text-[10px] text-muted-foreground font-mono">
                            {isSuperAdmin ? (
                              <span className="text-purple-600 dark:text-purple-400 font-semibold">ALL ACCESS</span>
                            ) : (
                              `${grantedCount} / ${allPermissions.length}`
                            )}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              {/* Table Body Grouped by Module */}
              <tbody className="divide-y divide-border/40">
                {Object.entries(groupedPermissions).map(([mod, perms]) => {
                  const isCollapsed = Boolean(collapsedModules[mod])
                  const moduleTitleEn = MODULE_HEADINGS[mod] || mod.toUpperCase().replace(/_/g, ' ')
                  const moduleTitleKm = MODULE_HEADINGS_KM[mod] || moduleTitleEn
                  const moduleDisplay = isKhmer ? moduleTitleKm : moduleTitleEn

                  return (
                    <React.Fragment key={mod}>
                      {/* Module Separator Header Row */}
                      <tr className="bg-muted/60 hover:bg-muted/80 transition-colors">
                        <td
                          className="sticky left-0 z-20 bg-muted/95 backdrop-blur-md py-2.5 px-4 font-bold uppercase tracking-wider text-xs text-foreground border-r border-border/60"
                        >
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleCollapseModule(mod)}
                              className="flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors cursor-pointer text-left"
                            >
                              {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                              <span>
                                {moduleDisplay} ({perms.length})
                              </span>
                            </button>
                          </div>
                        </td>

                        {/* Quick module action check buttons for each role */}
                        {roles.map((r) => {
                          const isSuperAdmin = r.name.toLowerCase() === 'super_admin'
                          const permNames = perms.map((p) => p.name)
                          const roleSet = effectiveRolePermissions[r.id]
                          const activeCount = roleSet
                            ? permNames.filter((pn) => roleSet.has(pn)).length
                            : 0
                          const allActive = activeCount === permNames.length && permNames.length > 0

                          return (
                            <td
                              key={r.id}
                              className="py-1 px-2 text-center border-r border-border/40"
                            >
                              {!isSuperAdmin && canUpdateRole && !isCollapsed && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleModuleForRole(r.id, perms, r.name)}
                                  className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-background/80 cursor-pointer"
                                  title={allActive ? 'Deselect all in module' : 'Select all in module'}
                                >
                                  {allActive ? t('roles.deselect', 'Clear') : t('roles.selectAll', 'All')}
                                </button>
                              )}
                            </td>
                          )
                        })}
                      </tr>

                      {/* Module Permissions Rows */}
                      {!isCollapsed &&
                        perms.map((p: any) => {
                          const pName = p.name
                          const risk = p.risk_level || getPermissionRiskLevel(pName)
                          const labels = formatApexPermissionLabel(p, isKhmer)

                          return (
                            <tr
                              key={pName}
                              className="hover:bg-muted/30 transition-colors group"
                            >
                              {/* Sticky First Column */}
                              <td className="sticky left-0 z-20 bg-card group-hover:bg-muted/40 transition-colors p-3 pl-4 border-r border-border/60">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="text-xs font-semibold text-foreground truncate">
                                      {isKhmer ? labels.km || labels.en : labels.en}
                                    </div>
                                    <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-1.5">
                                      <span>{pName}</span>
                                    </div>
                                  </div>

                                  {risk === 'high' && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20 shrink-0">
                                      {t('roles.riskHigh', 'HIGH')}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Role Cells */}
                              {roles.map((r) => {
                                const isSuperAdmin = r.name.toLowerCase() === 'super_admin'
                                const rolePermSet = effectiveRolePermissions[r.id]
                                const hasPerm = isSuperAdmin || Boolean(rolePermSet?.has(pName))

                                // Check if this cell is modified relative to server
                                const serverHas = Boolean(serverMatrixData?.[r.id]?.includes(pName))
                                const isCellModified = !isSuperAdmin && serverHas !== hasPerm

                                return (
                                  <td
                                    key={r.id}
                                    className={`p-2.5 text-center border-r border-border/40 transition-colors ${
                                      isCellModified ? 'bg-amber-500/10' : ''
                                    }`}
                                  >
                                    {isSuperAdmin ? (
                                      <div className="flex items-center justify-center">
                                        <span
                                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/15 text-purple-600 cursor-not-allowed"
                                          title="Super Admin has full unalterable privileges"
                                        >
                                          <Check size={14} className="stroke-[2.5]" />
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center">
                                        <button
                                          type="button"
                                          disabled={!canUpdateRole}
                                          onClick={() => handleTogglePermission(r.id, pName, r.name)}
                                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                                            hasPerm
                                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                                              : 'border border-border/80 bg-background text-transparent hover:border-primary/60 hover:text-muted-foreground/40'
                                          } ${
                                            isCellModified
                                              ? 'ring-2 ring-amber-500 ring-offset-1'
                                              : ''
                                          }`}
                                          title={`${hasPerm ? 'Revoke' : 'Grant'} ${pName} for ${r.name}`}
                                        >
                                          <Check
                                            size={13}
                                            className={`stroke-[2.5] ${hasPerm ? 'opacity-100' : 'opacity-0'}`}
                                          />
                                        </button>
                                      </div>
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
          </div>
        )}
      </div>

      {/* ── 6. FLOATING ACTION SAVE DOCK ──────────────────────────────────── */}
      <AnimatePresence>
        {hasPendingChanges && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md p-3.5 shadow-2xl flex items-center justify-between gap-4 ring-1 ring-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {t('roles.unsavedChangesTitle', 'Unsaved Changes Detected')}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {t('roles.unsavedRolesCount', {
                      count: totalModifiedRolesCount,
                      defaultValue: `${totalModifiedRolesCount} roles have permission updates pending.`,
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
                  className="h-8 px-3 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Undo2 size={13} />
                  <span>{t('roles.discard', 'Discard')}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer shadow-sm"
                >
                  {saveMutation.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
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

export default RoleMatrixPage
