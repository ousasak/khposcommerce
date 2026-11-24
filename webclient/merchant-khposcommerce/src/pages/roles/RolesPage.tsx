import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Key, Activity, Plus, Search, Filter,
  Pencil, Trash2, RefreshCw, X, Loader2, Download, Upload, Printer,
  Settings, Eye, Clock, UserCheck, AlertTriangle, Sliders,
  Lock, Unlock, ArrowUpRight, ShieldCheck, Zap, Globe, CheckCircle2,
  Users, Copy, Check, ShieldAlert, Award, FileText, Layers, RefreshCcw,
  LayoutGrid, Table as TableIcon
} from 'lucide-react'
import { roleService } from '@/services/roleService'
import { permissionService } from '@/services/permissionService'
import { cn } from '@/lib/utils'
import { usePermission } from '@/hooks/usePermission'
import {
  normalizePermission,
  getPermissionModule,
  getPermissionAction,
  getPermissionRiskLevel,
  formatPermissionLabel,
} from '@/utils/permissionUtils'
import { useToast } from '@/hooks/useToast'
import { focusFirstInvalidField } from '@/utils/formValidation'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import {
  FieldError,
  getFieldClass,
  TableToolbar,
  EnterpriseDatePicker,
  Breadcrumb,
  HeaderActionsGroup,
  AddButton,
  ActionButton,
  ResetButton,
  EnterpriseModal,
} from '@/components/common'
import { Button } from '@/components/ui/button'
import CsvImportModal from '@/components/shared/CsvImportModal'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { downloadCsv } from '@/utils/export'
import TableActionMenu from '@/components/shared/TableActionMenu'
import type { Role } from "./rolesCommon"
import {
  getRoleSlugColor,
  formatRoleSlug,
  ROLE_TITLE_KH,
  ROLE_DESCRIPTION_KH,
  formatRoleTitle,
  isBuiltInRole,
  getRoleDescription,
  MODULE_ORDER,
  MODULE_HEADINGS,
  MODULE_HEADINGS_KM,
  ACTION_ORDER,
  formatApexPermissionLabel,
} from './rolesCommon'

// ── Sub-component: Circular Progress Ring// ── Sub-component: Circular Progress Ring ────────────────────────────────────
const CircularProgressRing: React.FC<{ percentage: number; colorClass: string; size?: number }> = ({
  percentage,
  colorClass,
  size = 48,
}) => {
  const strokeWidth = 4.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={colorClass}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground">
        {Math.round(clampedPercentage)}%
      </span>
    </div>
  )
}

// ── Main Roles Management Page Component ─────────────────────────────────────
const RolesPage: React.FC = () => {
  const { t, i18n } = useTranslation(['roles', 'common', 'buttons'])
  const qc = useQueryClient()
  const toast = useToast()

  const storeLanguage = useThemeStore((s) => s.language)
  const currentLang = storeLanguage || i18n.language || 'en'
  const isKhmer = currentLang === 'km' || currentLang.startsWith('km') || currentLang.startsWith('kh')

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'roles' })

  // Modal & Drawer States
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [viewRole, setViewRole] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [cloneRoleTarget, setCloneRoleTarget] = useState<Role | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  // RBAC Permission Access Checks
  const { hasPermission } = usePermission()
  const canCreate = hasPermission('role.create')
  const canEdit = hasPermission('role.update')
  const canDelete = hasPermission('role.delete')
  const canExport = hasPermission('role.export')
  const canImport = hasPermission('role.import') || canCreate

  // Dedicated Manage Role Permissions Drawer State
  const [permDrawerRole, setPermDrawerRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [permDrawerSearch, setPermDrawerSearch] = useState<string>('')
  const [permDrawerModule, setPermDrawerModule] = useState<string>('all')

  // CSV Import States
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreviewData, setImportPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Advanced Filter Drawer States
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterGuard, setFilterGuard] = useState<string>('all')
  const [filterPermLevel, setFilterPermLevel] = useState<string>('all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')
  const [filterMinUsers, setFilterMinUsers] = useState<string>('')
  const [filterMaxUsers, setFilterMaxUsers] = useState<string>('')

  // Form States for Role Create/Edit
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [displayNameKm, setDisplayNameKm] = useState('')
  const [guardName, setGuardName] = useState('api')
  const [description, setDescription] = useState('')
  const [descriptionKm, setDescriptionKm] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['roles', page, debouncedSearch, perPage],
    queryFn: () => roleService.list({ page, search: debouncedSearch, per_page: perPage }),
    placeholderData: (prev) => prev,
  })

  const { data: statsData } = useQuery({
    queryKey: ['roles-dashboard-stats'],
    queryFn: () => roleService.getStats(),
    staleTime: 30000,
  })

  const { data: allPermissionsData, isLoading: isLoadingAllPerms } = useQuery({
    queryKey: ['all-permissions-list'],
    queryFn: () => roleService.permissions({ per_page: 'all' }).then(r => r.data ?? []),
  })
  const allPermissions: any[] = useMemo(() => allPermissionsData ?? [], [allPermissionsData])

  // Query permissions assigned to the current role in drawer
  const { data: rolePermsData, isLoading: isLoadingRolePerms } = useQuery({
    queryKey: ['role-permissions', permDrawerRole?.id],
    queryFn: () => roleService.getRolePermissions(permDrawerRole!.id),
    enabled: !!permDrawerRole?.id,
  })

  useEffect(() => {
    if (rolePermsData?.permissions) {
      setSelectedPermissions(rolePermsData.permissions)
    }
  }, [rolePermsData])

  // Unique modules extracted from all permissions
  const permissionModules = useMemo(() => {
    const modulesSet = new Set<string>()
    allPermissions.forEach((p: any) => {
      const mod = p.module || getPermissionModule(p.name)
      if (mod) modulesSet.add(mod)
    })
    return Array.from(modulesSet).sort()
  }, [allPermissions])

  // Permissions filtered inside the drawer by search and module
  const drawerFilteredPermissions = useMemo(() => {
    return allPermissions.filter((p: any) => {
      const pName = (p.name || '').toLowerCase()
      const mod = (p.module || getPermissionModule(p.name)).toLowerCase()
      if (permDrawerModule !== 'all' && mod !== permDrawerModule.toLowerCase()) {
        return false
      }
      if (permDrawerSearch.trim()) {
        const query = permDrawerSearch.trim().toLowerCase()
        if (!pName.includes(query) && !mod.includes(query)) {
          return false
        }
      }
      return true
    })
  }, [allPermissions, permDrawerModule, permDrawerSearch])

  // Group filtered drawer permissions by module
  const groupedDrawerPermissions = useMemo(() => {
    const map: Record<string, any[]> = {}
    drawerFilteredPermissions.forEach((p: any) => {
      const mod = p.module || getPermissionModule(p.name)
      if (!map[mod]) map[mod] = []
      map[mod].push(p)
    })
    return map
  }, [drawerFilteredPermissions])

  const handleSelectAll = () => {
    const names = drawerFilteredPermissions.map((p: any) => p.name)
    setSelectedPermissions(prev => Array.from(new Set([...prev, ...names])))
  }

  const handleDeselectAll = () => {
    const namesSet = new Set(drawerFilteredPermissions.map((p: any) => p.name))
    setSelectedPermissions(prev => prev.filter(name => !namesSet.has(name)))
  }

  const toggleModuleAll = (modPerms: any[]) => {
    const modNames = (modPerms || []).map(p => (typeof p === 'string' ? p : p?.name)).filter(Boolean)
    setSelectedPermissions(prev => {
      const list = Array.isArray(prev) ? prev : []
      const allSelected = modNames.length > 0 && modNames.every(n => list.includes(n))
      if (allSelected) {
        const modSet = new Set(modNames)
        return list.filter(n => !modSet.has(n))
      } else {
        return Array.from(new Set([...list, ...modNames]))
      }
    })
  }

  const togglePermission = (name: string) => {
    if (!name) return
    setSelectedPermissions(prev => {
      const list = Array.isArray(prev) ? prev : []
      return list.includes(name) ? list.filter(n => n !== name) : [...list, name]
    })
  }

  const rolesRaw: Role[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: rolesRaw.length, current_page: 1, last_page: 1 }

  const navigate = useNavigate()
  const location = useLocation()
  const { id: routeRoleId } = useParams<{ id?: string }>()

  const isCreateRoute = location.pathname.endsWith('/create')
  const isEditRoute = location.pathname.endsWith('/edit') || (Boolean(routeRoleId) && location.pathname.includes('/roles/'))

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [isLoadingPerms, setIsLoadingPerms] = useState(false)
  const isFormView = formMode !== null || isCreateRoute || isEditRoute

  const groupedPermissions = useMemo(() => {
    const map: Record<string, any[]> = {}
    allPermissions.forEach((p: any) => {
      const pName = typeof p === 'string' ? p : p?.name
      if (!pName) return
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
  }, [allPermissions])

  const sortedFormModules = useMemo(() => {
    const existingModules = Object.keys(groupedPermissions)
    return existingModules.sort((a, b) => {
      const idxA = MODULE_ORDER.indexOf(a)
      const idxB = MODULE_ORDER.indexOf(b)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.localeCompare(b)
    })
  }, [groupedPermissions])

  // Direct lookup for edit route when role is not yet in local state
  const isDirectEdit = Boolean(isEditRoute && routeRoleId && !editingRole)
  const { data: directRoleData, isLoading: isLoadingDirectRole } = useQuery({
    queryKey: ['role-direct-lookup', routeRoleId],
    queryFn: async () => {
      if (!routeRoleId) return null
      const found = rolesRaw.find(
        (r) => r.id.toString() === routeRoleId || r.name.toLowerCase() === routeRoleId.toLowerCase()
      )
      if (found) return found

      try {
        const res = await roleService.list({ per_page: 100 })
        const list: Role[] = res?.data ?? []
        const matched = list.find(
          (r) => r.id.toString() === routeRoleId || r.name.toLowerCase() === routeRoleId.toLowerCase()
        )
        if (matched) return matched
      } catch (err) {
        console.error('Failed to query roles list for lookup', err)
      }

      if (!isNaN(Number(routeRoleId))) {
        try {
          return await roleService.show(routeRoleId)
        } catch (err) {
          console.error('Failed to fetch role by id', err)
        }
      }
      return null
    },
    enabled: isDirectEdit,
  })

  useEffect(() => {
    const roleToEdit = editingRole || directRoleData || rolesRaw.find(
      (r) => r.id.toString() === routeRoleId || r.name.toLowerCase() === routeRoleId?.toLowerCase()
    )

    if (isCreateRoute) {
      setFormMode('create')
      setEditingRole(null)
      setName('')
      setGuardName('api')
      setDisplayName('')
      setDisplayNameKm('')
      setDescription('')
      setDescriptionKm('')
      setSelectedPermissions([])
      setFormErrors({})
    } else if (isEditRoute && routeRoleId) {
      setFormMode('edit')
      if (roleToEdit && roleToEdit.id !== editingRole?.id) {
        setEditingRole(roleToEdit)
        setName(roleToEdit.name)
        setGuardName(roleToEdit.guard_name || 'api')
        const initialDisplayNameEn = roleToEdit.display_name || formatRoleSlug(roleToEdit.name)
        const initialDisplayNameKm = roleToEdit.display_name_km || ROLE_TITLE_KH[roleToEdit.name.toLowerCase()] || ''
        const initialDescEn = roleToEdit.description || ''
        const initialDescKm = roleToEdit.description_km || ROLE_DESCRIPTION_KH[roleToEdit.name.toLowerCase()] || ''
        setDisplayName(initialDisplayNameEn)
        setDisplayNameKm(initialDisplayNameKm)
        setDescription(initialDescEn)
        setDescriptionKm(initialDescKm)
        setIsLoadingPerms(true)
        roleService.getRolePermissions(roleToEdit.id)
          .then((res) => {
            const perms = Array.isArray(res) ? res : (res?.permissions ?? [])
            setSelectedPermissions(perms.map((p: any) => (typeof p === 'string' ? p : p.name)))
          })
          .catch(() => {})
          .finally(() => setIsLoadingPerms(false))
      }
    } else if (!isCreateRoute && !isEditRoute && formMode) {
      setFormMode(null)
      setEditingRole(null)
    }
  }, [location.pathname, routeRoleId, isCreateRoute, isEditRoute, rolesRaw, directRoleData])

  // Reset scroll whenever route or form mode changes
  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (mainEl) {
      mainEl.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname, isFormView])

  // ── Client-side Filter Logic ────────────────────────────────────────────────
  const roles = useMemo(() => {
    return rolesRaw.filter((r: Role) => {
      if (filterStatus !== 'all') {
        const isAct = r.is_active ?? (r.status !== 'inactive')
        if (filterStatus === 'active' && !isAct) return false
        if (filterStatus === 'inactive' && isAct) return false
      }

      if (filterType !== 'all') {
        const isSys = r.is_system || ['super-admin', 'admin', 'manager', 'staff'].includes(r.name.toLowerCase())
        if (filterType === 'system' && !isSys) return false
        if (filterType === 'custom' && isSys) return false
      }

      if (filterGuard !== 'all') {
        if ((r.guard_name || 'api') !== filterGuard) return false
      }

      if (filterStartDate && r.created_at && new Date(r.created_at) < new Date(filterStartDate)) return false
      if (filterEndDate && r.created_at && new Date(r.created_at) > new Date(filterEndDate)) return false

      if (filterMinUsers && (r.users_count || 0) < Number(filterMinUsers)) return false
      if (filterMaxUsers && (r.users_count || 0) > Number(filterMaxUsers)) return false

      return true
    })
  }, [rolesRaw, filterStatus, filterType, filterGuard, filterStartDate, filterEndDate, filterMinUsers, filterMaxUsers])

  // ── Enterprise Dynamic Stats Calculation ──────────────────────────────────
  const analytics = useMemo(() => {
    const totalRoles = statsData?.total_roles ?? pagination.total ?? rolesRaw.length ?? 0
    const activeRoles = statsData?.active_roles ?? rolesRaw.filter(r => r.is_active ?? (r.status !== 'inactive')).length ?? 0
    const systemRoles = statsData?.system_roles ?? rolesRaw.filter(r => r.is_system).length ?? 4
    const customRoles = statsData?.custom_roles ?? (totalRoles - systemRoles)
    const assignedUsers = statsData?.assigned_users ?? 38
    const avgPermissionsPerRole = statsData?.avg_permissions_per_role ?? 18
    const totalPermissions = statsData?.total_permissions ?? (allPermissions?.length || 45)
    const highRiskRoles = statsData?.high_risk_roles ?? 2
    const apiGuarded = statsData?.api_guarded ?? rolesRaw.filter(r => r.guard_name === 'api').length ?? totalRoles
    const webGuarded = statsData?.web_guarded ?? (totalRoles - apiGuarded)
    const activeSecurityScore = totalRoles > 0 ? ((activeRoles / totalRoles) * 100).toFixed(1) : '98.5'
    const recentModifications = statsData?.recent_modifications ?? 6

    const inactiveRoles = Math.max(0, totalRoles - activeRoles)
    const permissionCoverage = totalPermissions > 0 ? Math.min(100, Number(((avgPermissionsPerRole / totalPermissions) * 100).toFixed(1))) : 85.0
    const assignedPermissions = Math.round(totalPermissions * 0.82)
    const unusedPermissions = Math.max(0, totalPermissions - assignedPermissions)
    const accessEvents = statsData?.access_events ?? 1420
    const permissionChanges = statsData?.permission_changes ?? 24
    const roleUpdates = statsData?.role_updates ?? 12
    const failedAttempts = statsData?.failed_attempts ?? 0
    const usersAssigned = statsData?.users_assigned ?? assignedUsers
    const mostUsedRole = statsData?.most_used_role ?? 'Cashier / Staff'
    const averagePermissions = avgPermissionsPerRole
    const roleChangesToday = statsData?.role_changes_today ?? 3
    const newRolesCount = statsData?.new_roles_count ?? 1
    const newPermissionsCount = statsData?.new_permissions_count ?? 5
    const activeSessions = statsData?.active_sessions ?? 42
    const securityAlerts = statsData?.security_alerts ?? 0
    const permissionReviews = statsData?.permission_reviews ?? 4

    return {
      totalRoles,
      activeRoles,
      inactiveRoles,
      systemRoles,
      customRoles,
      assignedUsers,
      avgPermissionsPerRole,
      totalPermissions,
      permissionCoverage,
      assignedPermissions,
      unusedPermissions,
      accessEvents,
      permissionChanges,
      roleUpdates,
      failedAttempts,
      usersAssigned,
      mostUsedRole,
      averagePermissions,
      roleChangesToday,
      newRolesCount,
      newPermissionsCount,
      activeSessions,
      securityAlerts,
      permissionReviews,
      highRiskRoles,
      apiGuarded,
      webGuarded,
      activeSecurityScore,
      recentModifications,
    }
  }, [statsData, pagination.total, rolesRaw, allPermissions])

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: any) => roleService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['roles-dashboard-stats'] })
      toast.success(t('roles.toastCreateSuccess', 'Role created successfully.'))
      handleCancelForm()
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('roles.toastCreateFailed', 'Failed to create role.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => roleService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['roles-dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['role-permissions'] })
      toast.success(t('roles.toastUpdateSuccess', 'Role updated successfully.'))
      handleCancelForm()
      closeModal()
      setPermDrawerRole(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('roles.toastUpdateFailed', 'Failed to update role.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roleService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['roles-dashboard-stats'] })
      toast.success(t('roles.toastDeleteSuccess', 'Role deleted successfully.'))
      setDeleteTarget(null)
      adjustAfterDelete(roles.length)
    },
    onError: () => {
      toast.error(t('roles.toastDeleteFailed', 'Failed to delete role. It may be assigned to active users.'))
      setDeleteTarget(null)
    },
  })

  const assignPermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) =>
      roleService.assignPermissions(roleId, permissions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['roles-dashboard-stats'] })
      if (permDrawerRole) {
        qc.invalidateQueries({ queryKey: ['role-permissions', permDrawerRole.id] })
      }
      toast.success(t('roles.toastPermissionsSuccess', {
        role: formatRoleTitle(permDrawerRole, isKhmer),
        defaultValue: `Updated permissions for role ${permDrawerRole?.name?.toUpperCase()}`
      }))
      setPermDrawerRole(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('roles.toastPermissionsFailed', 'Failed to update permissions.'))
    },
  })

  // ── Modal & Drawer Handlers ────────────────────────────────────────────────
  const handleOpenCreateForm = () => {
    setEditingRole(null)
    setFormErrors({})
    setName('')
    setDisplayName('')
    setDisplayNameKm('')
    setGuardName('api')
    setDescription('')
    setDescriptionKm('')
    setSelectedPermissions([])
    setFormMode('create')
    navigate('/roles/create')
  }

  const handleOpenEditForm = (role: Role) => {
    setEditingRole(role)
    setFormErrors({})
    setName(role.name)
    setGuardName(role.guard_name || 'api')
    const initialDisplayNameEn = role.display_name || formatRoleSlug(role.name)
    const initialDisplayNameKm = role.display_name_km || ROLE_TITLE_KH[role.name.toLowerCase()] || ''
    const initialDescEn = role.description || ''
    const initialDescKm = role.description_km || ROLE_DESCRIPTION_KH[role.name.toLowerCase()] || ''
    setDisplayName(initialDisplayNameEn)
    setDisplayNameKm(initialDisplayNameKm)
    setDescription(initialDescEn)
    setDescriptionKm(initialDescKm)
    setFormMode('edit')
    setIsLoadingPerms(true)
    roleService.getRolePermissions(role.id)
      .then((res) => {
        const perms = Array.isArray(res) ? res : (res?.permissions ?? [])
        setSelectedPermissions(perms.map((p: any) => (typeof p === 'string' ? p : p.name)))
      })
      .catch(() => {})
      .finally(() => setIsLoadingPerms(false))
    navigate(`/roles/${role.name}/edit`)
  }

  const handleCancelForm = () => {
    setFormMode(null)
    setEditingRole(null)
    setFormErrors({})
    setName('')
    setDisplayName('')
    setDisplayNameKm('')
    setGuardName('api')
    setDescription('')
    setDescriptionKm('')
    setSelectedPermissions([])
    navigate('/roles')
  }

  const openCreateModal = handleOpenCreateForm
  const openEditModal = handleOpenEditForm

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('action') === 'new') {
      handleOpenCreateForm()
    }
  }, [])

  const openPermissionDrawer = (role: Role) => {
    setPermDrawerRole(role)
    setSelectedPermissions([])
    setPermDrawerSearch('')
    setPermDrawerModule('all')
  }

  const handleCloneRole = (role: Role) => {
    setFormErrors({})
    setName(`${role.name}_copy`)
    setDisplayName(`${role.display_name || formatRoleSlug(role.name)} (Copy)`)
    setDisplayNameKm(role.display_name_km ? `${role.display_name_km} (ចម្លង)` : (ROLE_TITLE_KH[role.name.toLowerCase()] ? `${ROLE_TITLE_KH[role.name.toLowerCase()]} (ចម្លង)` : ''))
    setGuardName(role.guard_name || 'api')
    setDescription(role.description ? `Copy of ${role.description}` : '')
    setDescriptionKm(role.description_km ? `ចម្លងចេញពី ${role.description_km}` : (ROLE_DESCRIPTION_KH[role.name.toLowerCase()] ? `ចម្លងចេញពី ${ROLE_DESCRIPTION_KH[role.name.toLowerCase()]}` : ''))
    setEditingRole(null)
    setFormMode('create')
    toast.info(t('roles.toastCloneInfo', { role: role.name.toUpperCase(), defaultValue: `Cloning role "${role.name.toUpperCase()}".` }))
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingRole(null)
    setFormErrors({})
    setName('')
    setDisplayName('')
    setDisplayNameKm('')
    setGuardName('api')
    setDescription('')
    setDescriptionKm('')
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = t('settings.errors.roleNameRequired', 'Please enter role key name')
    }
    return errors
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    const payload = {
      name: editingRole?.name === 'super_admin' ? 'super_admin' : (name.trim().toLowerCase().replace(/[\s-]+/g, '_') || name.trim()),
      display_name: displayName.trim() || undefined,
      display_name_km: displayNameKm.trim() || undefined,
      guard_name: guardName || 'api',
      description: description.trim() || undefined,
      description_km: descriptionKm.trim() || undefined,
      permissions: selectedPermissions,
    }
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  // ── CSV Export & Import Handlers ─────────────────────────────────────────
  const handleExportCSV = () => {
    const toastId = toast.info(t('common.exportDownloading', 'កំពុងរៀបចំ និងទាញយកទិន្នន័យ...'))
    setTimeout(() => {
      const headers = ['ID', 'Role Name', 'Guard Scope', 'Permissions Count', 'Status']
      const rows = (roles.length > 0 ? roles : rolesRaw).map((r) => [
        r.id || '',
        r.name || '',
        r.guard_name || 'api',
        r.permissions_count || 12,
        r.is_active !== false ? t('common.active', 'Active') : t('common.inactive', 'Inactive'),
      ])
      downloadCsv('system_roles_permissions', headers, rows)
      toast.dismiss(toastId)
      toast.success(t('common.exportSuccess', 'បានទាញយកទិន្នន័យជាឯកសារ CSV ដោយជោគជ័យ!'))
    }, 400)
  }

  const handleFileSelectForImport = (file: File) => {
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return
      const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0)
      if (lines.length === 0) return

      const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim())
      const rows = lines.slice(1, 6).map((line) => line.split(',').map((c) => c.replace(/^"|"$/g, '').trim()))
      setImportPreviewData({ headers, rows })
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      await new Promise((res) => setTimeout(res, 800))
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['roles-dashboard-stats'] })
      toast.success(t('roles.toastImportSuccess', 'Successfully imported system roles dataset!'))
      setImportModalOpen(false)
      setImportFile(null)
      setImportPreviewData(null)
    } catch {
      toast.error(t('roles.toastImportFailed', 'Failed to import roles dataset.'))
    } finally {
      setIsImporting(false)
    }
  }

  const hasActiveFilters =
    filterStatus !== 'all' ||
    filterType !== 'all' ||
    filterPermLevel !== 'all' ||
    filterStartDate !== '' ||
    filterEndDate !== '' ||
    filterMinUsers !== '' ||
    filterMaxUsers !== ''

  const resetAllFilters = () => {
    setFilterStatus('all')
    setFilterType('all')
    setFilterPermLevel('all')
    setFilterStartDate('')
    setFilterEndDate('')
    setFilterMinUsers('')
    setFilterMaxUsers('')
    reset()
  }

  if (isFormView && isEditRoute && !editingRole) {
    if (isLoading || isLoadingDirectRole) {
      return (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-sm font-medium">{t('roles.loadingRoles', 'Loading role details...')}</span>
        </div>
      )
    }
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle size={40} className="text-amber-500" />
        <div>
          <h2 className="text-lg font-bold text-foreground">{t('roles.noRolesFound', 'Role not found')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('roles.noRolesDescription', 'The requested role could not be found.')}
          </p>
        </div>
        <Button onClick={() => navigate('/roles')} variant="outline">
          {t('roles.title', 'Roles')}
        </Button>
      </div>
    )
  }

  if (isFormView) {
    return (
      <div className="space-y-6 max-w-4xl pb-16 print:p-0">
        {/* ── 1. GLOBAL BREADCRUMB ──────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {t('common.dashboard', 'Dashboard')}
          </button>
          <span className="text-slate-400 dark:text-slate-600">›</span>
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {t('roles.title', 'Roles')}
          </button>
          <span className="text-slate-400 dark:text-slate-600">›</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {editingRole ? formatRoleTitle(editingRole, isKhmer) : t('roles.newRole', 'New Role')}
          </span>
          <span className="text-slate-400 dark:text-slate-600">›</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            {editingRole ? t('roles.edit', 'Edit') : t('roles.create', 'Create')}
          </span>
        </nav>

        {/* ── 2. HERO HEADER ────────────────────────────────────────────────── */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {editingRole
              ? t('roles.editRoleHeading', {
                  role: formatRoleTitle(editingRole, isKhmer),
                  defaultValue: `Edit ${formatRoleSlug(editingRole.name)}`
                })
              : t('roles.newRole', 'New Role')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('roles.editSubtitle', 'Change what this role grants.')}
          </p>
        </div>

        {/* ── 3. APEX SHADCN CARD ───────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6 sm:p-8 shadow-xs">
          {/* Role Details */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('roles.roleDetails', 'Role Details')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {t('roles.roleDetailsDesc', "Permissions granted here apply to every user holding this role. A user's own grants are added on top of these — nothing listed below can be taken away per-user.")}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Row 1: Role Key & Guard Scope ─────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Role Key (Slug) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('roles.roleKey', 'Role Key / Slug')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.toLowerCase().replace(/[\s-]+/g, '_'))
                    handleClearError('name')
                  }}
                  disabled={editingRole?.name === 'super_admin'}
                  placeholder="e.g. warehouse_staff"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:bg-slate-50 dark:disabled:bg-slate-800/40 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-500 mt-1.5 font-semibold">{formErrors.name}</p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {t('roles.roleKeyHelp', 'Unique system identifier (e.g. cashier, manager, admin).')}
                </p>
              </div>

              {/* Guard Scope */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('roles.guardScopeLabel', 'Guard Scope')}
                </label>
                <select
                  value={guardName}
                  onChange={(e) => setGuardName(e.target.value)}
                  disabled={editingRole?.name === 'super_admin'}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer disabled:bg-slate-50 dark:disabled:bg-slate-800/40 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="api">{t('roles.guardApiOption', 'api (REST API Guard - Standard)')}</option>
                  <option value="web">{t('roles.guardWebOption', 'web (Session Guard)')}</option>
                </select>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {t('roles.guardScopeHelp', 'Authentication driver used to verify permissions (Default: api).')}
                </p>
              </div>
            </div>

            {/* ── Row 2: Display Title (EN) & Display Title (KH) ─────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('roles.displayNameEn', 'Display Title (English)')}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value)
                    if (!editingRole && !name) {
                      setName(e.target.value.toLowerCase().replace(/[\s-]+/g, '_'))
                    }
                  }}
                  placeholder={t('roles.displayNameEnPlaceholder', 'e.g. Store Manager')}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('roles.displayNameKm', 'Display Title (Khmer)')}
                </label>
                <input
                  type="text"
                  value={displayNameKm}
                  onChange={(e) => setDisplayNameKm(e.target.value)}
                  placeholder={t('roles.displayNameKmPlaceholder', 'ឧ. អ្នកគ្រប់គ្រងហាង')}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* ── Row 3: Description (EN) & Description (KH) ────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('roles.descriptionEn', 'Description (English)')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={t('roles.descriptionEnPlaceholder', 'Full access to store operations and inventory...')}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[84px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('roles.descriptionKm', 'Description (Khmer)')}
                </label>
                <textarea
                  value={descriptionKm}
                  onChange={(e) => setDescriptionKm(e.target.value)}
                  rows={3}
                  placeholder={t('roles.descriptionKmPlaceholder', 'មានសិទ្ធិគ្រប់គ្រងលើការលក់ និងទំនិញក្នុងស្តុក...')}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[84px]"
                />
              </div>
            </div>

            {/* Permissions Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {t('roles.permissions', 'Permissions')}
                </label>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions(allPermissions.map((p: any) => p.name))}
                    className="font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer"
                  >
                    {t('roles.selectAll', 'Select all')}
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([])}
                    className="font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    {t('roles.clearAll', 'Clear all')}
                  </button>
                </div>
              </div>

              {isLoadingPerms ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="text-sm font-medium">{t('roles.loadingPermissions', 'Loading permissions...')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-6">
                  {sortedFormModules.map((mod) => {
                    const perms = groupedPermissions[mod] || []
                    if (perms.length === 0) return null

                    const modPermNames = perms.map((p: any) => (typeof p === 'string' ? p : p?.name)).filter(Boolean)
                    const isAllModSelected = modPermNames.length > 0 && modPermNames.every((n: string) => (Array.isArray(selectedPermissions) ? selectedPermissions : []).includes(n))

                    return (
                      <div key={mod} className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            {MODULE_HEADINGS[mod] || mod.toUpperCase().replace(/_/g, ' ')}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleModuleAll(perms)}
                            className="text-[11px] font-normal text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary transition-colors cursor-pointer select-none"
                          >
                            {isAllModSelected
                              ? t('roles.deselectModuleAll', 'Deselect')
                              : t('roles.selectModuleAll', 'Select all')}
                          </button>
                        </div>
                        <div className="space-y-2">
                          {perms.map((p: any) => {
                            const isChecked = (Array.isArray(selectedPermissions) ? selectedPermissions : []).includes(p.name)
                            const labels = formatApexPermissionLabel(p)

                            return (
                              <div
                                key={p.name}
                                role="checkbox"
                                aria-checked={isChecked}
                                tabIndex={0}
                                onClick={() => togglePermission(p.name)}
                                onKeyDown={(e) => {
                                  if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault()
                                    togglePermission(p.name)
                                  }
                                }}
                                className="flex items-center gap-2.5 cursor-pointer select-none group py-0.5 outline-none"
                              >
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all shrink-0",
                                    isChecked
                                      ? "bg-primary border-primary text-primary-foreground shadow-xs"
                                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-primary"
                                  )}
                                >
                                  {isChecked && <Check size={14} strokeWidth={3.5} className="text-primary-foreground" />}
                                </div>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                  {labels.en}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="flex flex-wrap items-center gap-3 pt-6 mt-8 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="animate-spin size-4" />
                )}
                <span>{editingRole ? t('roles.saveChanges', 'Save Changes') : t('roles.createRole', 'Create Role')}</span>
              </button>

              <button
                type="button"
                onClick={handleCancelForm}
                className="h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>{t('roles.cancel', 'Cancel')}</span>
              </button>

              {editingRole && isBuiltInRole(editingRole) && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 dark:text-slate-500 ml-2">
                  <Lock size={14} className="shrink-0 text-slate-400" />
                  <span>{t('roles.builtInHint', 'Built-in role — it can be changed but not deleted.')}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 print:p-0">
      {/* ── 1. GLOBAL BREADCRUMB ──────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: t('roles.administration', 'Administration'), path: '/users' },
          { label: t('roles.title', 'Roles & Permissions') },
        ]}
      />

      {/* ── 2. GLOBAL FRAMELESS HERO HEADER ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {t('roles.title', 'Roles & Permissions')}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {t('roles.rolesCount', { count: roles.length, defaultValue: `${roles.length} roles` })}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('roles.subtitle', 'What each role can do, and who holds it.')}
          </p>
        </div>

        <HeaderActionsGroup>
          <ActionButton
            onClick={() => navigate('/permissions')}
            icon={<Key className="size-4 text-primary" />}
            label={t('roles.permissionMatrix', 'Permission Matrix')}
          />

          {canCreate && (
            <AddButton
              onClick={openCreateModal}
              label={t('roles.newRole', 'New Role')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* ── 3. CARDS VIEW (APEX SHADCN 2-COLUMN CARDS GRID) ──────────────────── */}
      <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 size={28} className="animate-spin text-primary" />
              <span className="text-xs font-medium">{t('roles.loadingRoles', 'Loading roles...')}</span>
            </div>
          ) : roles.length === 0 ? (
            <div className="py-16 text-center rounded-xl border border-dashed border-border p-8 bg-card/50">
              <Shield size={36} className="mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                {t('roles.noRolesFound', 'No roles found')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {t('roles.noRolesDescription', 'No roles available in the system.')}
              </p>
              {canCreate && (
                <Button
                  size="sm"
                  onClick={openCreateModal}
                  className="mt-4 h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                >
                  <Plus size={14} className="mr-1" />
                  {t('roles.newRole', 'New Role')}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const isSys = isBuiltInRole(role)
                const permsCount = role.permissions_count ?? 0
                const usersCount = role.users_count ?? 0
                const slugColor = getRoleSlugColor(role.name)

                return (
                  <div
                    key={role.id}
                    className="rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-card p-6 shadow-md hover:shadow-lg dark:shadow-neutral-950/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Title, slug badge, built-in badge, pencil edit */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            {formatRoleTitle(role, isKhmer)}
                          </h3>
                          <span className={slugColor}>
                            {role.name.toLowerCase()}
                          </span>
                          {isSys ? (
                            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md text-xs font-bold bg-blue-600 text-white shadow-xs">
                              <Lock size={12} className="stroke-[2.5]" />
                              <span>{t('roles.builtIn', 'Built-in')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md text-xs font-bold bg-amber-600 text-white shadow-xs">
                              <Unlock size={12} className="stroke-[2.5]" />
                              <span>{t('roles.custom', 'Custom')}</span>
                            </span>
                          )}
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => openEditModal(role)}
                            title={t('roles.editRole', 'Edit role')}
                            className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6 leading-relaxed">
                        {getRoleDescription(role, isKhmer, t)}
                      </p>
                    </div>

                    {/* Bottom stats & View action */}
                    <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-auto">
                      <div className="flex items-center gap-6">
                        <span className="inline-flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-neutral-400 dark:text-neutral-500 stroke-[2]" />
                          <span>{t('roles.permissionsCount', { count: permsCount, defaultValue: `${permsCount} permissions` })}</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Users size={16} className="text-neutral-400 dark:text-neutral-500 stroke-[2]" />
                          <span>{t('roles.usersCount', { count: usersCount, defaultValue: `${usersCount} users` })}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPermissionDrawer(role)}
                        className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer"
                      >
                        {t('roles.view', 'View')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination for Cards View */}
          {pagination.last_page > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
              />
            </div>
          )}
        </div>

      {/* ── APEX SHADCN INFORMATIONAL NOTICE ─────────────────────────────────── */}
      <div className="pt-6 pb-2 text-[12px] text-muted-foreground/80 leading-relaxed border-t border-border/40 mt-6 print:hidden">
        {t('roles.notice', 'These checks gate what the interface offers, not what the data allows. This template exports as static files with no server, so every fixture under /api is publicly readable regardless of role — enforce permissions in your backend as well. Roles you create are held in memory for the session, like every other change in this demo — see the data-provider docs for where to swap in a real backend.')}
      </div>

      {/* ── 8. VIEW ROLE DETAILS MODAL ────────────────────────────────────────── */}
      {viewRole && (
        <EnterpriseModal
          isOpen={!!viewRole}
          onClose={() => setViewRole(null)}
          size="md"
          title={t('roles.roleDetailsTitle', 'Role Specification Details')}
          subtitle={formatRoleTitle(viewRole, isKhmer)}
          icon={<Shield className="h-5 w-5 text-primary" />}
          iconVariant="indigo"
          footer={
            canEdit ? (
              <div className="p-4 border-t border-border bg-muted/20 flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => { const r = viewRole; setViewRole(null); openEditModal(r) }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  <Pencil size={14} /> {t('roles.editRoleBtn', 'Edit Role')}
                </button>
                <button
                  type="button"
                  onClick={() => { const r = viewRole; setViewRole(null); openPermissionDrawer(r) }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Shield size={14} /> {t('roles.permissionsBtn', 'Permissions')}
                </button>
              </div>
            ) : undefined
          }
        >
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col items-center gap-3 py-4 bg-muted/30 rounded-2xl border border-border/60">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shadow-xs">
                <ShieldAlert size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-base">{formatRoleTitle(viewRole, isKhmer)}</p>
                <p className="text-muted-foreground text-xs font-mono">{t('roles.guardScope', 'Guard Scope')}: {viewRole.guard_name}</p>
                <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {isBuiltInRole(viewRole) ? t('roles.systemRole', 'System Role') : t('roles.customRole', 'Custom Role')}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: t('roles.roleName', 'Role Name'), value: formatRoleTitle(viewRole, isKhmer) },
                { label: t('roles.guardScope', 'Guard Scope'), value: viewRole.guard_name || 'api' },
                { label: t('roles.permissionsCountLabel', 'Permissions Count'), value: t('roles.permissionsGranted', { count: viewRole.permissions_count ?? 12, defaultValue: `${viewRole.permissions_count ?? 12} Granted` }) },
                { label: t('roles.assignedUsersLabel', 'Assigned Users'), value: t('roles.activeUsersCount', { count: viewRole.users_count ?? 15, defaultValue: `${viewRole.users_count ?? 15} Active Users` }) },
                { label: t('roles.securityLevel', 'Security Level'), value: t('roles.highPrivilege', 'High Privilege') },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-border/60">
                  <span className="text-muted-foreground font-medium">{row.label}</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </EnterpriseModal>
      )}

      {/* ── 10. MANAGE PERMISSIONS DRAWER (SLIDE FROM RIGHT) ─────────────────── */}
      <AnimatePresence>
        {permDrawerRole && (
          <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPermDrawerRole(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-xl sm:max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">
                          {t('roles.managePermissionsTitle', 'Role Permissions Assignment')}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary uppercase">
                          {formatRoleTitle(permDrawerRole, isKhmer)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('roles.guardLabel', 'Guard')}: <span className="font-mono text-foreground font-semibold">{permDrawerRole.guard_name || 'api'}</span> • {t('roles.permissionsCountGranted', { selected: selectedPermissions.length, total: allPermissions.length, defaultValue: `${selectedPermissions.length} / ${allPermissions.length} permissions granted` })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPermDrawerRole(null)}
                    className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Search & Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="text"
                        value={permDrawerSearch}
                        onChange={(e) => setPermDrawerSearch(e.target.value)}
                        placeholder={t('roles.searchPermissionsPlaceholder', 'Search permissions or modules...')}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {permDrawerSearch && (
                        <button
                          onClick={() => setPermDrawerSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <select
                      value={permDrawerModule}
                      onChange={(e) => setPermDrawerModule(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="all">{t('roles.allModulesCount', { count: permissionModules.length, defaultValue: `All Modules (${permissionModules.length})` })}</option>
                      {permissionModules.map((m) => (
                        <option key={m} value={m}>
                          {MODULE_HEADINGS[m] || m.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between py-1 border-b border-border/50 text-xs">
                    <span className="font-medium text-muted-foreground">
                      {t('roles.showingPermissionsCount', { count: drawerFilteredPermissions.length, defaultValue: `Showing ${drawerFilteredPermissions.length} permissions` })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-2.5 py-1 rounded-lg text-primary hover:bg-primary/10 font-semibold transition-colors cursor-pointer"
                      >
                        {t('roles.selectAllVisible', 'Select All Visible')}
                      </button>
                      <span className="text-muted-foreground/40">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition-colors cursor-pointer"
                      >
                        {t('roles.deselectAllVisible', 'Deselect All Visible')}
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {(isLoadingRolePerms || isLoadingAllPerms) ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <span className="text-xs font-medium">{t('roles.loadingMatrix', 'Loading permissions matrix...')}</span>
                    </div>
                  ) : Object.keys(groupedDrawerPermissions).length === 0 ? (
                    <div className="py-16 text-center text-xs text-muted-foreground">
                      {t('roles.noPermissionsMatch', 'No permissions match your search or filter criteria.')}
                    </div>
                  ) : (
                    /* Module Groups Accordion / Cards */
                    <div className="space-y-4">
                      {Object.entries(groupedDrawerPermissions).map(([mod, perms]) => {
                        const modPermNames = perms.map((p: any) => p.name)
                        const selectedInMod = modPermNames.filter((n: string) => selectedPermissions.includes(n)).length
                        const isAllModSelected = selectedInMod === modPermNames.length && modPermNames.length > 0

                        return (
                          <div
                            key={mod}
                            className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-2xs"
                          >
                            {/* Module Header */}
                            <div className="px-4 py-3 bg-muted/40 border-b border-border/70 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                                  {MODULE_HEADINGS[mod] || mod.toUpperCase().replace(/_/g, ' ')}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                                  {selectedInMod} / {modPermNames.length}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleModuleAll(perms)}
                                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                              >
                                {isAllModSelected
                                  ? t('roles.deselectModuleAll', 'Deselect')
                                  : t('roles.selectModuleAll', 'Select all')}
                              </button>
                            </div>

                            {/* Module Permissions Grid */}
                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {perms.map((p: any) => {
                                const isChecked = selectedPermissions.includes(p.name)
                                const risk = p.risk_level || getPermissionRiskLevel(p.name)
                                const labels = formatApexPermissionLabel(p)

                                return (
                                  <div
                                    key={p.name}
                                    onClick={() => togglePermission(p.name)}
                                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                                      isChecked
                                        ? 'bg-primary/5 border-primary/40 shadow-2xs'
                                        : 'bg-card border-border/60 hover:bg-muted/40'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={cn(
                                          "w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all shrink-0",
                                          isChecked
                                            ? "bg-primary border-primary text-primary-foreground shadow-xs"
                                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-primary"
                                        )}
                                      >
                                        {isChecked && <Check size={14} strokeWidth={3.5} className="text-primary-foreground" />}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-semibold text-foreground truncate">
                                          {labels.en}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-mono">
                                          {p.name}
                                        </div>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                                        risk === 'high'
                                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                          : risk === 'medium'
                                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                      }`}
                                    >
                                      {risk === 'high' ? t('roles.riskHigh', 'HIGH') : risk === 'medium' ? t('roles.riskMedium', 'MED') : t('roles.riskLow', 'LOW')}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPermDrawerRole(null)}
                    disabled={assignPermissionsMutation.isPending}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {t('roles.cancel', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={assignPermissionsMutation.isPending || isLoadingRolePerms}
                    onClick={() => {
                      if (permDrawerRole) {
                        assignPermissionsMutation.mutate({
                          roleId: permDrawerRole.id,
                          permissions: selectedPermissions,
                        })
                      }
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {assignPermissionsMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                    <span>{assignPermissionsMutation.isPending ? t('roles.savingPermissions', 'Saving Permissions...') : t('roles.savePermissions', 'Save Permissions')}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 11. CSV IMPORT MODAL ────────────────────────────────────────────────── */}
      <CsvImportModal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false)
          setImportFile(null)
          setImportPreviewData(null)
        }}
        resourceName={t('roles.resourceName', 'Roles')}
        expectedHeaders={['name', 'guard_name', 'description']}
        importFile={importFile}
        setImportFile={(file) => {
          setImportFile(file)
          if (file) handleFileSelectForImport(file)
        }}
        isImporting={isImporting}
        onSubmit={(e) => {
          e.preventDefault()
          handleConfirmImport()
        }}
      />

      {/* ── 12. CONFIRM DELETE DIALOG ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('roles.deleteRoleTitle', 'Delete Role')}
        message={t('roles.deleteRoleConfirmMessage', {
          role: formatRoleTitle(deleteTarget, isKhmer),
          defaultValue: `Are you sure you want to delete role "${formatRoleTitle(deleteTarget, false)}"? Users assigned to this role will lose their privileges.`
        })}
        confirmText={t('roles.deleteRoleBtn', 'Delete Role')}
        cancelText={t('roles.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default RolesPage
