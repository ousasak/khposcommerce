import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  User,
  AlertCircle,
  FileText,
  Building2,
  Edit2,
  Eye,
  X,
  Check,
  Info,
  SlidersHorizontal,
  LayoutGrid,
  List,
  UserCheck,
  CalendarRange,
  CalendarDays,
  RotateCcw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  FlattenStatCard,
  FlattenStatsGrid,
  TableToolbar,
  EmptyState,
  EnterpriseModal,
  ModalHeader,
  ModalFooter,
  FormField,
  ModernSelect,
  EnterpriseDatePicker,
  TableActionMenu,
  InlineFilterSelect,
  FilterPopover,
  ActiveFilterChips,
} from '@/components/common'
import TableWrapper from '@/components/shared/TableWrapper'
import Pagination from '@/components/shared/Pagination'
import type { ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { GlobalFormat } from '@/utils/formatters'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { useAuthStore } from '@/stores/authStore'
import { EmployeeAvatar } from './EmployeeAvatar'
import { LeaveDetailDrawer } from './LeaveDetailDrawer'
import LeaveSearchBar from './LeaveSearchBar'

export interface LeaveRequestsTabProps {
  createModalOpen?: boolean
  setCreateModalOpen?: (open: boolean) => void
  onExport?: () => void
}

export const LeaveRequestsTab: React.FC<LeaveRequestsTabProps> = ({
  createModalOpen: controlledCreateOpen,
  setCreateModalOpen: setControlledCreateOpen,
  onExport,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = useAuthStore()

  const canApprove = hasPermission(['leave_request.approve', 'leave_request.update'])
  const canCreate = hasPermission('leave_request.create')
  const canDelete = hasPermission('leave_request.delete')

  // ─── Pagination & Filtering State ──────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [timeframe, setTimeframe] = useState<'all' | '7days' | 'month' | 'year' | 'custom'>('all')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  // ─── Column Visibility State (Enterprise Standard) ─────────────────────────
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    employee: true,
    leave_type: true,
    start_date: true,
    end_date: true,
    total_days: true,
    reason: true,
    status: true,
  })

  const columnOptions: ColumnOption[] = useMemo(() => [
    { key: 'employee', label: t('employees.employee', 'Employee') },
    { key: 'leave_type', label: t('employees.leave_type', 'Leave Type') },
    { key: 'start_date', label: t('employees.start_date', 'From Date') },
    { key: 'end_date', label: t('employees.end_date', 'To Date') },
    { key: 'total_days', label: t('employees.no_of_days', 'No of Days') },
    { key: 'reason', label: t('employees.reason', 'Reason') },
    { key: 'status', label: t('employees.approval_status', 'Approval Status') },
  ], [t])

  // ─── Modals & Drawers State ────────────────────────────────────────────────
  const [inspectRecord, setInspectRecord] = useState<any | null>(null)
  const [internalCreateOpen, setInternalCreateOpen] = useState(false)
  const isCreateModalOpen = controlledCreateOpen !== undefined ? controlledCreateOpen : internalCreateOpen
  const setIsCreateOpen = setControlledCreateOpen || setInternalCreateOpen

  const [actionModal, setActionModal] = useState<{
    open: boolean
    type: 'approve' | 'reject'
    id: number | null
    employeeName?: string
    notes: string
  }>({
    open: false,
    type: 'approve',
    id: null,
    notes: '',
  })
  const [actionModalError, setActionModalError] = useState('')

  // ─── Create Leave Request Form State ───────────────────────────────────────
  const [formEmployeeId, setFormEmployeeId] = useState('')
  const [formLeaveType, setFormLeaveType] = useState('annual')
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0])
  const [formReason, setFormReason] = useState('')
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  const handleClearCreateError = (key: string) => {
    setCreateErrors(prev => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // ─── Queries ───────────────────────────────────────────────────────────────
  const {
    data: leavesData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      'leave-requests',
      page,
      perPage,
      search,
      filterStatus,
      filterType,
      timeframe,
      startDateFilter,
      endDateFilter,
    ],
    queryFn: () =>
      employeeService.leaveRequests({
        page,
        per_page: perPage,
        search,
        status: filterStatus || undefined,
        leave_type: filterType || undefined,
        timeframe: timeframe !== 'all' ? timeframe : undefined,
        sort_by: 'created_at',
        sort_order: 'desc',
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
      }),
  })

  // Employees for select dropdown
  const { data: empList = [] } = useQuery({
    queryKey: ['employees-for-leave-select'],
    queryFn: () => employeeService.list({ per_page: 150 }).then((r) => r.data ?? []),
  })

  // Global employee stats for KPI tiles
  const { data: statsData } = useQuery({
    queryKey: ['employee-stats-for-leaves'],
    queryFn: () => employeeService.getStats(),
  })

  const records = useMemo(() => {
    return leavesData?.data ?? []
  }, [leavesData])

  const pagination = leavesData?.meta ?? {
    current_page: page,
    last_page: Math.ceil((leavesData?.total || records.length) / perPage) || 1,
    per_page: perPage,
    total: leavesData?.total || records.length,
  }

  const totalRecords = pagination.total || records.length
  const totalPages = pagination.last_page || 1

  // ─── KPI Metrics (SmartHR 4-Tile Ribbon Cards) ─────────────────────────────
  const kpiMetrics = useMemo(() => {
    const total = pagination.total ?? records.length
    const pending = records.filter((r: any) => r.status === 'pending').length
    const approved = records.filter((r: any) => r.status === 'approved').length
    const rejected = records.filter((r: any) => r.status === 'rejected').length

    return {
      totalLeaves: total,
      pendingLeaves: (filterStatus === '' && statsData?.pending_leaves_count !== undefined)
        ? statsData.pending_leaves_count
        : pending,
      approvedLeaves: approved,
      rejectedLeaves: rejected,
    }
  }, [pagination.total, records, statsData, filterStatus])

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number | string; notes: string }) =>
      employeeService.approveLeave(id, { manager_notes: notes }),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.leave_approved_success', 'Leave request approved successfully!'))
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      setActionModal({ open: false, type: 'approve', id: null, notes: '' })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('employees.error_approving_leave', 'Failed to approve leave request'))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number | string; notes: string }) =>
      employeeService.rejectLeave(id, { manager_notes: notes }),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.leave_rejected_success', 'Leave request rejected successfully'))
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      setActionModal({ open: false, type: 'reject', id: null, notes: '' })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('employees.error_rejecting_leave', 'Failed to reject leave request'))
    },
  })


  const createMutation = useMutation({
    mutationFn: (data: any) => employeeService.createLeave(data),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.leave_created_success', 'Leave request created successfully!'))
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      setIsCreateOpen(false)
      // Reset form
      setFormEmployeeId('')
      setFormLeaveType('annual')
      setFormStartDate(new Date().toISOString().split('T')[0])
      setFormEndDate(new Date().toISOString().split('T')[0])
      setFormReason('')
      setCreateErrors({})
    },
    onError: (err: any) => {
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const apiErrors: Record<string, string> = {}
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          apiErrors[k] = Array.isArray(v) ? (v[0] as string) : String(v)
        })
        setCreateErrors(apiErrors)
        focusFirstInvalidField(apiErrors)
        return
      }
      toast.error(err?.response?.data?.message || t('employees.error_creating_leave', 'Failed to submit leave request'))
    },
  })



  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formEmployeeId) {
      newErrors.employee_id = t('employees.errors.employeeRequired', 'Please select an employee')
    }
    if (!formLeaveType) {
      newErrors.leave_type = t('employees.errors.leaveTypeRequired', 'Please select leave type')
    }
    if (!formStartDate) {
      newErrors.start_date = t('employees.errors.startDateRequired', 'Please select start date')
    }
    if (!formEndDate) {
      newErrors.end_date = t('employees.errors.endDateRequired', 'Please select end date')
    } else if (formStartDate && formEndDate && formStartDate > formEndDate) {
      newErrors.end_date = t('employees.errors.endDateAfterStartDate', 'End date cannot be earlier than start date')
    }

    if (Object.keys(newErrors).length > 0) {
      setCreateErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }

    createMutation.mutate({
      employee_id: Number(formEmployeeId),
      leave_type: formLeaveType,
      start_date: formStartDate,
      end_date: formEndDate,
      reason: formReason,
    })
  }

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionModal.id) return

    if (actionModal.type === 'approve') {
      approveMutation.mutate({ id: actionModal.id, notes: actionModal.notes })
    } else {
      if (!actionModal.notes.trim()) {
        setActionModalError(t('employees.rejection_reason_required', 'Rejection reason is required'))
        focusFirstInvalidField({ notes: 'required' })
        return
      }
      rejectMutation.mutate({ id: actionModal.id, notes: actionModal.notes })
    }
  }

  const handleResetFilters = () => {
    sound.playClick()
    setSearch('')
    setFilterStatus('')
    setFilterType('')
    setTimeframe('all')
    setStartDateFilter('')
    setEndDateFilter('')
    setPage(1)
  }

  // Active filters count
  const activeFiltersCount = [
    filterStatus,
    filterType,
    timeframe !== 'all' ? timeframe : '',
    startDateFilter,
    endDateFilter,
  ].filter(Boolean).length

  // Unified Global Date Formatter
  const formatDate = (dateStr?: string) => GlobalFormat.displayDate(dateStr)

  const calculateDays = (item: any) => {
    if (item.total_days) {
      return `${item.total_days} ${t('employees.days_unit', 'days')}`
    }
    if (item.start_date && item.end_date) {
      const s = new Date(item.start_date).getTime()
      const e = new Date(item.end_date).getTime()
      const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1)
      return `${diff} ${t('employees.days_unit', 'days')}`
    }
    return `1 ${t('employees.days_unit', 'day')}`
  }

  const getLeaveTypeDisplay = (type: string) => {
    switch (type) {
      case 'annual':
        return {
          label: t('employees.annual_leave', 'Annual Leave'),
          color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80',
          desc: t('employees.annual_leave_paid_desc', 'Paid annual vacation allocation'),
        }
      case 'sick':
        return {
          label: t('employees.sick_leave', 'Medical Leave'),
          color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
          desc: t('employees.sick_leave_desc', 'Medical & sick leave certificate required'),
        }
      case 'special':
        return {
          label: t('employees.special_leave', 'Casual Leave'),
          color: 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80',
          desc: t('employees.special_leave_desc', 'Personal or family emergency leave'),
        }
      case 'maternity':
        return {
          label: t('employees.maternity_leave', 'Maternity Leave'),
          color: 'text-pink-700 bg-pink-50 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800/80',
          desc: t('employees.maternity_leave_desc', 'Maternity or parental leave'),
        }
      case 'unpaid':
        return {
          label: t('employees.unpaid_leave', 'Unpaid Leave'),
          color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
          desc: t('employees.unpaid_leave_desc', 'Leave without payroll compensation'),
        }
      default:
        return {
          label: type || t('employees.general_leave', 'Standard Leave'),
          color: 'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
          desc: t('employees.general_leave_desc', 'Standard leave request'),
        }
    }
  }


  // Options for ModernSelect in Modal
  const employeeSelectOptions = useMemo(() => {
    return empList.map((emp: any) => ({
      value: String(emp.id),
      label: `${emp.name} ${emp.employee_number ? `(${emp.employee_number})` : ''} - ${emp.department?.name || t('employees.staff_fallback', 'Staff')}`,
    }))
  }, [empList, t])

  const leaveTypeSelectOptions = [
    { value: 'annual', label: t('employees.annual_leave', 'Annual Leave') },
    { value: 'sick', label: t('employees.sick_leave', 'Medical Leave') },
    { value: 'special', label: t('employees.special_leave', 'Casual Leave') },
    { value: 'maternity', label: t('employees.maternity_leave', 'Maternity Leave') },
    { value: 'unpaid', label: t('employees.unpaid_leave', 'Unpaid Leave') },
  ]

  const timeframeOptions = [
    { value: '7days', label: t('employees.last_7_days', 'Last 7 Days') },
    { value: 'month', label: t('employees.this_month', 'This Month') },
    { value: 'year', label: t('employees.this_year', 'This Year') },
    { value: 'all', label: t('employees.all_time', 'All Time') },
  ]

  return (
    <div className="space-y-4">
      {/* ─── 1. Flutter 3 Flatten Style KPI Metric Cards ─── */}
      <FlattenStatsGrid columns={4} className="print:hidden">
        {/* Card 1: Total Leaves */}
        <FlattenStatCard
          title={t('employees.total_leaves', 'Total Requests')}
          value={kpiMetrics.totalLeaves}
          useCounter={true}
          icon={CalendarDays}
          color="teal"
          delay={0.02}
        />

        {/* Card 2: Pending Approval */}
        <FlattenStatCard
          title={t('employees.pending_leaves', 'Pending Approval')}
          value={kpiMetrics.pendingLeaves}
          useCounter={true}
          icon={Clock}
          color="amber"
          delay={0.06}
        />

        {/* Card 3: Approved */}
        <FlattenStatCard
          title={t('employees.approved_leaves', 'Approved')}
          value={kpiMetrics.approvedLeaves}
          useCounter={true}
          icon={CheckCircle2}
          color="emerald"
          delay={0.1}
        />

        {/* Card 4: Rejected */}
        <FlattenStatCard
          title={t('employees.rejected_leaves', 'Rejected')}
          value={kpiMetrics.rejectedLeaves}
          useCounter={true}
          icon={XCircle}
          color="rose"
          delay={0.14}
        />
      </FlattenStatsGrid>



      {/* ─── SmartHR/Product Style Inline Leave Requests Search & Filter Bar ─── */}
      <LeaveSearchBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        statusFilter={filterStatus}
        onStatusChange={(val) => {
          setFilterStatus(val)
          setPage(1)
        }}
        leaveTypeFilter={filterType}
        onLeaveTypeChange={(val) => {
          setFilterType(val)
          setPage(1)
        }}
        timeframeFilter={timeframe}
        onTimeframeChange={(val) => {
          setTimeframe((val as any) || '7days')
          setPage(1)
        }}
        startDateFilter={startDateFilter}
        onStartDateChange={(val) => {
          setStartDateFilter(val)
          setPage(1)
        }}
        endDateFilter={endDateFilter}
        onEndDateChange={(val) => {
          setEndDateFilter(val)
          setPage(1)
        }}
        onApply={() => setPage(1)}
        onReset={handleResetFilters}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        columnSettingsTitle={t('employees.columns_visibility', 'Column Visibility')}
      />

      {/* ─── 4. Active Filter Indicator Chips (1-Click Removal & Clear All) ─── */}
      <ActiveFilterChips
        items={[
          ...(filterStatus
            ? [
                {
                  key: 'status',
                  label: t('employees.approval_status', 'Status'),
                  value: filterStatus,
                  displayValue:
                    filterStatus === 'approved'
                      ? t('employees.approved', 'Approved')
                      : filterStatus === 'rejected'
                      ? t('employees.rejected', 'Rejected')
                      : t('employees.pending', 'Pending'),
                  onRemove: () => setFilterStatus(''),
                },
              ]
            : []),
          ...(filterType
            ? [
                {
                  key: 'type',
                  label: t('employees.leave_type', 'Leave Type'),
                  value: filterType,
                  displayValue: getLeaveTypeDisplay(filterType).label,
                  onRemove: () => setFilterType(''),
                },
              ]
            : []),
          ...(timeframe && timeframe !== 'all'
            ? [
                {
                  key: 'timeframe',
                  label: t('employees.period', 'Period'),
                  value: timeframe,
                  displayValue:
                    timeframe === '7days'
                      ? t('employees.last_7_days', 'Last 7 Days')
                      : timeframe === 'month'
                      ? t('employees.this_month', 'This Month')
                      : timeframe === 'year'
                      ? t('employees.this_year', 'This Year')
                      : t('employees.custom_range', 'Custom Range'),
                  onRemove: () => setTimeframe('all'),
                },
              ]
            : []),
          ...(startDateFilter
            ? [
                {
                  key: 'start_date',
                  label: t('employees.from_date', 'From'),
                  value: startDateFilter,
                  icon: <Calendar size={12} />,
                  onRemove: () => setStartDateFilter(''),
                },
              ]
            : []),
          ...(endDateFilter
            ? [
                {
                  key: 'end_date',
                  label: t('employees.to_date', 'To'),
                  value: endDateFilter,
                  icon: <Calendar size={12} />,
                  onRemove: () => setEndDateFilter(''),
                },
              ]
            : []),
        ]}
        onClearAll={handleResetFilters}
      />

      {/* ─── 5. Main Content: Global Standard Flatten Table ─── */}
      <TableWrapper isFetching={isFetching}>
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <RefreshCw className="animate-spin mb-3 text-teal-600 dark:text-teal-400" size={26} />
            <span className="text-sm font-medium">{t('employees.loading_leaves', 'Loading leave requests...')}</span>
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            variant="subtle"
            icon={<Calendar size={36} className="text-muted-foreground/60 stroke-1.5" />}
            title={
              activeFiltersCount > 0 || search
                ? t('employees.no_matching_leaves', 'No matching leave requests found')
                : t('employees.no_leaves_found', 'No leave requests found')
            }
            description={
              activeFiltersCount > 0 || search
                ? t('employees.no_matching_leaves_desc', 'No records match your active search or filter criteria. Try resetting filters.')
                : t('employees.no_leaves_desc', 'Create a new leave request or adjust filter criteria')
            }
            action={
              activeFiltersCount > 0 || search
                ? {
                    label: t('buttons.reset', 'Reset Filters'),
                    onClick: handleResetFilters,
                    icon: <RotateCcw size={14} />,
                  }
                : canCreate
                ? {
                    label: t('employees.add_leave', 'Request Leave'),
                    onClick: () => setIsCreateOpen(true),
                    icon: <Plus size={14} />,
                  }
                : undefined
            }
            py="py-16"
          />
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                {visibleColumns.employee && (
                  <th className="py-3.5 px-4 font-bold min-w-[220px]">
                    {t('employees.employee', 'Employee')}
                  </th>
                )}

                {visibleColumns.leave_type && (
                  <th className="py-3.5 px-4 font-bold min-w-[170px]">
                    {t('employees.leave_type', 'Leave Type')}
                  </th>
                )}

                {visibleColumns.start_date && (
                  <th className="py-3.5 px-4 font-bold min-w-[130px]">
                    {t('employees.start_date', 'From')}
                  </th>
                )}

                {visibleColumns.end_date && (
                  <th className="py-3.5 px-4 font-bold min-w-[130px]">
                    {t('employees.end_date', 'To')}
                  </th>
                )}

                {visibleColumns.total_days && (
                  <th className="py-3.5 px-4 font-bold min-w-[110px]">
                    {t('employees.no_of_days', 'No of Days')}
                  </th>
                )}

                {visibleColumns.reason && (
                  <th className="py-3.5 px-4 font-bold min-w-[180px]">
                    {t('employees.reason', 'Reason')}
                  </th>
                )}

                {visibleColumns.status && (
                  <th className="py-3.5 px-4 font-bold min-w-[130px] text-center">
                    {t('employees.approval_status', 'Status')}
                  </th>
                )}

                <th className="py-3.5 px-4 font-bold w-28 text-right">
                  {t('common.actions', 'Action')}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {records.map((item: any) => {
                      const typeInfo = getLeaveTypeDisplay(item.leave_type)
                      const daysStr = calculateDays(item)

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setInspectRecord(item)}
                          className="hover:bg-muted/30 transition-colors cursor-pointer group"
                        >

                          {/* Employee: Circle Avatar + Bold Name + Department Subtext */}
                          {visibleColumns.employee && (
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <EmployeeAvatar
                                  name={item.employee?.name || t('employees.staff_fallback', 'Employee')}
                                  photo={item.employee?.photo}
                                  size={36}
                                />
                                <div>
                                  <div className="font-bold text-foreground text-xs sm:text-sm">
                                    {item.employee?.name || `${t('employees.staff_fallback', 'Employee')} #${item.employee_id}`}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground font-normal">
                                    {item.employee?.department?.name || item.employee?.position?.name || t('employees.staff_fallback', 'Staff')}
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Leave Type with Info Icon */}
                          {visibleColumns.leave_type && (
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeInfo.color}`}
                                title={typeInfo.desc}
                              >
                                <span>{typeInfo.label}</span>
                                <Info size={12} className="opacity-70" />
                              </span>
                            </td>
                          )}

                          {/* From Date */}
                          {visibleColumns.start_date && (
                            <td className="py-3 px-4 text-xs font-mono text-foreground whitespace-nowrap">
                              {formatDate(item.start_date)}
                            </td>
                          )}

                          {/* To Date */}
                          {visibleColumns.end_date && (
                            <td className="py-3 px-4 text-xs font-mono text-foreground whitespace-nowrap">
                              {formatDate(item.end_date)}
                            </td>
                          )}

                          {/* No of Days */}
                          {visibleColumns.total_days && (
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="text-xs font-bold text-foreground font-mono">
                                {daysStr}
                              </span>
                            </td>
                          )}

                          {/* Reason */}
                          {visibleColumns.reason && (
                            <td className="py-3 px-4 max-w-[200px] truncate text-muted-foreground text-xs">
                              {item.reason ? (
                                <span title={item.reason}>{item.reason}</span>
                              ) : (
                                <span className="opacity-40">—</span>
                              )}
                            </td>
                          )}

                          {/* Status Badge */}
                          {visibleColumns.status && (
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                                  item.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
                                    : item.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.status === 'approved'
                                      ? 'bg-emerald-500'
                                      : item.status === 'rejected'
                                      ? 'bg-rose-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                {item.status === 'approved'
                                  ? t('employees.approved', 'Approved')
                                  : item.status === 'rejected'
                                  ? t('employees.rejected', 'Rejected')
                                  : t('employees.pending', 'Pending')}
                              </span>
                            </td>
                          )}

                          {/* Actions: Global TableActionMenu (Harmonized with all pages) */}
                          <td
                            className="py-3 px-4 text-right whitespace-nowrap print:hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end">
                              <TableActionMenu
                                variant="hybrid"
                                maxInline={3}
                                buttonSize="sm"
                                align="right"
                                onView={() => {
                                  sound.playClick()
                                  setInspectRecord(item)
                                }}
                                viewLabel={t('employees.view_details', 'View Details')}
                                items={
                                  item.status === 'pending' && canApprove
                                    ? [
                                        {
                                          label: t('employees.approve', 'Approve'),
                                          icon: Check,
                                          onClick: () => {
                                            sound.playClick()
                                            approveMutation.mutate({ id: item.id, notes: '' })
                                          },
                                          variant: 'success',
                                        },
                                        {
                                          label: t('employees.reject', 'Reject'),
                                          icon: X,
                                          onClick: () => {
                                            sound.playPop()
                                            setActionModal({
                                              open: true,
                                              type: 'reject',
                                              id: item.id,
                                              employeeName: item.employee?.name,
                                              notes: '',
                                            })
                                          },
                                          variant: 'danger',
                                        },
                                      ]
                                    : undefined
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
        )}
      </TableWrapper>

      {/* ─── 6. Standard Enterprise Table Pagination Bar ─── */}
      {totalRecords > 0 && (
        <Pagination
          currentPage={page}
          lastPage={totalPages}
          total={totalRecords}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(newPerPage) => {
            sound.playClick()
            setPerPage(newPerPage)
            setPage(1)
          }}
        />
      )}

      {/* ─── 7. Global Slide-Over Detail Drawer ─── */}
      <LeaveDetailDrawer
        isOpen={Boolean(inspectRecord)}
        onClose={() => setInspectRecord(null)}
        record={inspectRecord}
        onApprove={canApprove ? (id) => approveMutation.mutate({ id, notes: '' }) : undefined}
        onReject={canApprove ? (record) => {
          setActionModal({
            open: true,
            type: 'reject',
            id: record.id,
            employeeName: record.employee?.name,
            notes: '',
          })
        } : undefined}
        isApproving={approveMutation.isPending}
      />

      {/* ─── 9. Create Leave Request Enterprise Modal ─── */}
      <EnterpriseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateOpen(false)}
        size="md"
      >
        <ModalHeader
          title={t('employees.add_leave', 'Request Leave')}
          subtitle={t('employees.leavesSubtitle', 'Create and submit a new leave request')}
          icon={<CalendarDays size={20} />}
          onClose={() => setIsCreateOpen(false)}
        />

        <form onSubmit={handleCreateSubmit} noValidate>
          <div className="p-5 space-y-4">
            {/* Employee Selection */}
            <FormField
              label={t('employees.select_employee_label', 'Employee')}
              required
              error={createErrors.employee_id}
            >
              <div id="employee_id">
                <ModernSelect
                  value={formEmployeeId}
                  onChange={(val) => {
                    setFormEmployeeId(val)
                    handleClearCreateError('employee_id')
                  }}
                  options={employeeSelectOptions}
                  placeholder={t('employees.select_employee', '-- Select Employee --')}
                  searchable
                />
              </div>
            </FormField>

            {/* Leave Type */}
            <FormField
              label={t('employees.leave_type', 'Leave Type')}
              required
              error={createErrors.leave_type}
            >
              <div id="leave_type">
                <ModernSelect
                  value={formLeaveType}
                  onChange={(val) => {
                    setFormLeaveType(val)
                    handleClearCreateError('leave_type')
                  }}
                  options={leaveTypeSelectOptions}
                  placeholder={t('employees.select_leave_type', 'Select Leave Type')}
                />
              </div>
            </FormField>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label={t('employees.start_date', 'From Date')}
                required
                error={createErrors.start_date}
              >
                <div id="start_date">
                  <EnterpriseDatePicker
                    value={formStartDate}
                    onChange={(val) => {
                      setFormStartDate(val || '')
                      handleClearCreateError('start_date')
                    }}
                    placeholder="YYYY-MM-DD"
                    clearable={false}
                  />
                </div>
              </FormField>

              <FormField
                label={t('employees.end_date', 'To Date')}
                required
                error={createErrors.end_date}
              >
                <div id="end_date">
                  <EnterpriseDatePicker
                    value={formEndDate}
                    onChange={(val) => {
                      setFormEndDate(val || '')
                      handleClearCreateError('end_date')
                    }}
                    placeholder="YYYY-MM-DD"
                    clearable={false}
                  />
                </div>
              </FormField>
            </div>

            {/* Reason */}
            <FormField
              label={t('employees.reason_notes', 'Reason & Notes')}
            >
              <textarea
                rows={3}
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder={t('employees.reason_placeholder', 'e.g. Vacation, medical appointment, personal matter...')}
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </FormField>
          </div>

          <ModalFooter
            onCancel={() => setIsCreateOpen(false)}
            submitLabel={t('employees.submit_request', 'Submit Request')}
            isLoading={createMutation.isPending}
            submitIcon={<Check size={15} />}
          />
        </form>
      </EnterpriseModal>

      {/* ─── 10. Approve / Reject Notes Modal ─── */}
      <EnterpriseModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: 'approve', id: null, notes: '' })}
        size="sm"
      >
        <ModalHeader
          title={
            actionModal.type === 'approve'
              ? t('employees.approve_leave', 'Approve Leave Request')
              : t('employees.reject_leave', 'Reject Leave Request')
          }
          icon={
            actionModal.type === 'approve' ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <XCircle size={18} className="text-rose-500" />
            )
          }
          onClose={() => setActionModal({ open: false, type: 'approve', id: null, notes: '' })}
        />

        <form onSubmit={handleActionSubmit}>
          <div className="p-5 space-y-4">
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                actionModal.type === 'approve'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
              }`}
            >
              {actionModal.type === 'approve' ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              )}
              <p>
                {actionModal.type === 'approve'
                  ? t(
                      'employees.approve_leave_desc',
                      'Approving this request will automatically mark the employee as ON LEAVE in daily attendance logs and weekly roster.'
                    )
                  : t(
                      'employees.reject_leave_desc',
                      'Please provide a clear reason for rejecting this leave request.'
                    )}
              </p>
            </div>

            <FormField
              label={t('employees.manager_notes', 'Manager / HR Notes')}
              required={actionModal.type === 'reject'}
              error={actionModalError}
            >
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={actionModal.notes}
                onChange={(e) => {
                  setActionModal((prev) => ({ ...prev, notes: e.target.value }))
                  if (actionModalError) setActionModalError('')
                }}
                placeholder={
                  actionModal.type === 'approve'
                    ? t('employees.approval_notes_placeholder', 'Optional approval note...')
                    : t('employees.rejection_notes_placeholder', 'Reason for rejection (required)...')
                }
                className={`w-full p-3 text-xs rounded-xl border ${
                  actionModalError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-border'
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none`}
              />
            </FormField>
          </div>

          <ModalFooter
            onCancel={() => {
              setActionModal({ open: false, type: 'approve', id: null, notes: '' })
              setActionModalError('')
            }}
            submitLabel={
              actionModal.type === 'approve'
                ? t('employees.approve', 'Approve')
                : t('employees.reject', 'Reject')
            }
            submitVariant={actionModal.type === 'approve' ? 'primary' : 'danger'}
            isLoading={approveMutation.isPending || rejectMutation.isPending}
            submitIcon={actionModal.type === 'approve' ? <Check size={14} /> : <X size={14} />}
          />
        </form>
      </EnterpriseModal>

    </div>
  )
}

export default LeaveRequestsTab
