import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { cmsService } from '@/services/cmsService'
import { useToast } from '@/hooks/useToast'
import { usePermission } from '@/hooks/usePermission'
import { useServerPagination } from '@/hooks/useServerPagination'
import { downloadCsv } from '@/utils/export'
import { Breadcrumb } from '@/components/common'
import { HeaderActionsGroup, AddButton, ExportButton } from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import { focusFirstInvalidField } from '@/utils/formValidation'

import {
  CMSStatsCards,
  CMSFormModal,
  TestimonialsTable,
  TestimonialsSearchBar,
} from './components'

export const TestimonialsPage: React.FC = () => {
  const { t } = useTranslation(['cms', 'common', 'nav', 'toast', 'confirm'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  const canCreate = hasPermission('page.create')

  // Pagination & Search
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
  } = useServerPagination({ storageKey: 'cms_testimonials' })

  // Filters & Sorting
  const [filterTab, setFilterTab] = useState<string>('all')
  const [filterRating, setFilterRating] = useState<string>('all')
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Selections
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [authorName, setAuthorName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Column Settings
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    author: true,
    feedback: true,
    rating: true,
    featured: true,
    status: true,
    actions: true,
  })

  // Data Fetching
  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: ['testimonials', page, debouncedSearch, perPage, filterTab, filterRating, sortBy, sortOrder],
    queryFn: () => {
      const params: Record<string, any> = {
        page,
        search: debouncedSearch,
        per_page: perPage,
        sort: sortBy,
        order: sortOrder,
      }
      if (filterTab === 'featured') params.is_featured = true
      if (filterTab === 'active') params.is_active = true
      if (filterTab === 'inactive') params.is_active = false
      if (filterRating !== 'all') params.rating = parseInt(filterRating)

      return cmsService.getItemsByTab('testimonials', params)
    },
    placeholderData: (prev) => prev,
  })

  const { data: cmsStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['cms-stats'],
    queryFn: () => cmsService.getStats(),
  })

  const records = useMemo(() => {
    if (!listData) return []
    const d = listData?.data
    if (Array.isArray(d)) return d
    if (Array.isArray(d?.data)) return d.data
    if (Array.isArray(listData)) return listData
    return []
  }, [listData])

  const pagination = useMemo(() => {
    if (listData?.pagination) return listData.pagination
    return {
      total: listData?.total ?? records.length,
      current_page: listData?.current_page ?? page,
      last_page: listData?.last_page ?? 1,
    }
  }, [listData, records.length, page])

  // Sorting Handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1)
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => cmsService.createItemByTab('testimonials', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      closeModal()
      toast.success(t('cms.createdSuccess', 'បានបន្ថែមមតិកែលម្អដោយជោគជ័យ!'))
    },
    onError: (err: any) => {
      const apiErrors = err?.response?.data?.errors
      if (apiErrors && typeof apiErrors === 'object') {
        const fieldErrors: Record<string, string> = {}
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key]
        })
        setErrors(fieldErrors)
        focusFirstInvalidField(fieldErrors)
        return
      }
      toast.error(err?.response?.data?.message ?? t('cms.createFailed', 'បរាជ័យក្នុងការបន្ថែមមតិកែលម្អ'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      cmsService.updateItemByTab('testimonials', id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      closeModal()
      toast.success(t('cms.updatedSuccess', 'បានកែសម្រួលមតិកែលម្អដោយជោគជ័យ!'))
    },
    onError: (err: any) => {
      const apiErrors = err?.response?.data?.errors
      if (apiErrors && typeof apiErrors === 'object') {
        const fieldErrors: Record<string, string> = {}
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key]
        })
        setErrors(fieldErrors)
        focusFirstInvalidField(fieldErrors)
        return
      }
      toast.error(err?.response?.data?.message ?? t('cms.updateFailed', 'បរាជ័យក្នុងការកែសម្រួលមតិកែលម្អ'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteItemByTab('testimonials', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      toast.success(t('cms.deletedSuccess', 'បានលុបមតិកែលម្អដោយជោគជ័យ!'))
      adjustAfterDelete(records.length)
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'បរាជ័យក្នុងការលុបមតិកែលម្អ'))
      setConfirmOpen(false)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => cmsService.bulkDeleteItemsByTab('testimonials', ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setBulkDeleteConfirmOpen(false)
      toast.success(
        t('cms.bulkDeleteSuccess', {
          count: selectedRows.length,
          defaultValue: `បានលុប ${selectedRows.length} មតិកែលម្អដោយជោគជ័យ!`,
        })
      )
      adjustAfterDelete(records.length - selectedRows.length)
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'បរាជ័យក្នុងការលុបមតិកែលម្អ'))
      setBulkDeleteConfirmOpen(false)
    },
  })

  // Handlers
  const openCreateModal = () => {
    setEditingItem(null)
    setAuthorName('')
    setRole('')
    setCompany('')
    setRating(5)
    setComment('')
    setIsFeatured(false)
    setIsActive(true)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setAuthorName(item.author_name || item.name || item.title || '')
    setRole(item.role || item.position || '')
    setCompany(item.company || '')
    setRating(item.rating || 5)
    setComment(item.comment || item.content || '')
    setIsFeatured(item.is_featured ?? false)
    setIsActive(item.is_active ?? true)
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!authorName.trim()) {
      newErrors.authorName = t('cms.authorNameRequired', 'សូមបញ្ចូលឈ្មោះអតិថិជន')
    }
    if (!comment.trim()) {
      newErrors.comment = t('cms.commentRequired', 'សូមបញ្ចូលមតិយោបល់អតិថិជន')
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }

    const payload = {
      company_id: 1,
      author_name: authorName.trim(),
      role: role.trim(),
      company: company.trim(),
      rating,
      comment: comment.trim(),
      is_featured: isFeatured,
      is_active: isActive,
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const toggleSelectAll = () => {
    if (records.length > 0 && selectedRows.length === records.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(records.map((r: any) => r.id))
    }
  }

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleExportCSV = () => {
    const dataToExport = selectedRows.length > 0
      ? records.filter((r: any) => selectedRows.includes(r.id))
      : records

    if (!dataToExport.length) {
      toast.error(t('common.noDataToExport', 'គ្មានទិន្នន័យសម្រាប់នាំចេញទេ'))
      return
    }
    const headers = ['ID', 'Author', 'Role', 'Company', 'Rating', 'Comment', 'Featured', 'Status']
    const rows = dataToExport.map((tm: any) => [
      tm.id,
      `"${(tm.author_name || '').replace(/"/g, '""')}"`,
      `"${(tm.role || '').replace(/"/g, '""')}"`,
      `"${(tm.company || '').replace(/"/g, '""')}"`,
      tm.rating || 5,
      `"${(tm.comment || '').replace(/"/g, '""')}"`,
      tm.is_featured ? 'Yes' : 'No',
      tm.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('cms-testimonials.csv', [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n'))
    toast.success(t('common.exportSuccess', 'បាននាំចេញឯកសារ CSV ដោយជោគជ័យ'))
  }

  return (
    <div className="space-y-6">
      {/* Standalone Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.contentManagement', 'Content Management'), href: '/cms/blogs' },
          { label: t('nav.cmsTestimonials', 'Client Testimonials') },
        ]}
      />

      {/* Frameless Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('cms.testimonialsTitle', 'មតិកែលម្អអតិថិជន')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('cms.testimonialsSubtitle', 'បង្ហាញការវាយតម្លៃ ការផ្ដល់យោបល់ និងសក្ខីកម្មពីអតិថិជននៅលើគេហទំព័រ')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCSV}
            disabled={!records.length}
            label={
              selectedRows.length > 0
                ? `${t('common.export', 'នាំចេញ')} (${selectedRows.length})`
                : t('common.exportCsv', 'នាំចេញ CSV')
            }
          />
          {canCreate && (
            <AddButton
              label={t('cms.addTestimonial', 'បន្ថែមមតិកែលម្អ')}
              onClick={openCreateModal}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Executive KPI Overview */}
      <CMSStatsCards
        activeTab="testimonials"
        records={records}
        pagination={pagination}
        stats={cmsStats}
      />

      {/* ── SMARTHR-STYLE PRODUCT-MATCHING SEARCH & FILTER BAR ── */}
      <div className="space-y-4">
        <TestimonialsSearchBar
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          ratingFilter={filterRating}
          onRatingChange={(val) => {
            setFilterRating(val)
            setPage(1)
          }}
          statusFilter={filterTab}
          onStatusChange={(val) => {
            setFilterTab(val)
            setPage(1)
          }}
          onReset={() => {
            setFilterTab('all')
            setFilterRating('all')
            reset()
          }}
          columns={[
            { key: 'author', label: t('cms.colAuthor', 'Customer') },
            { key: 'feedback', label: t('cms.colFeedback', 'Feedback') },
            { key: 'rating', label: t('cms.colRating', 'Rating') },
            { key: 'featured', label: t('cms.colFeatured', 'Homepage') },
            { key: 'status', label: t('cms.colStatus', 'Status') },
            { key: 'actions', label: t('cms.colActions', 'Actions') },
          ]}
          visibleColumns={visibleColumns}
          onColumnChange={setVisibleColumns}
          selectedCount={selectedRows.length}
          onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
        />

        {/* Bulk Selection Banner */}
        <BulkSelectionBanner
          selectedCount={selectedRows.length}
          onClear={() => setSelectedRows([])}
          onDelete={() => setBulkDeleteConfirmOpen(true)}
        />

        {/* Data Table */}
        <TestimonialsTable
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditModal={openEditModal}
          confirmDelete={(id) => {
            setDeleteId(id)
            setConfirmOpen(true)
          }}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {/* Pagination */}
        <Pagination
          currentPage={page}
          lastPage={pagination.last_page || 1}
          total={pagination.total || 0}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          isLoading={isLoading || isFetching}
        />
      </div>

      {/* Testimonial Form Modal */}
      <CMSFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        errors={errors}
        onClearError={handleClearError}
        activeTab="testimonials"
        getAddButtonLabel={() => t('cms.addTestimonial', 'Add Testimonial')}
        title={authorName}
        setTitle={setAuthorName}
        name={authorName}
        setName={setAuthorName}
        slug=""
        setSlug={() => {}}
        content={comment}
        setContent={setComment}
        excerpt=""
        setExcerpt={() => {}}
        status="published"
        setStatus={() => {}}
        description=""
        setDescription={() => {}}
        question=""
        setQuestion={() => {}}
        answer=""
        setAnswer={() => {}}
        faqCategory=""
        setFaqCategory={() => {}}
        sortOrder="0"
        setSortOrder={() => {}}
        isActive={isActive}
        setIsActive={setIsActive}
        categoryId=""
        setCategoryId={() => {}}
        metaTitle=""
        setMetaTitle={() => {}}
        metaDescription=""
        setMetaDescription={() => {}}
        testimonialRole={role}
        setTestimonialRole={setRole}
        testimonialCompany={company}
        setTestimonialCompany={setCompany}
        testimonialRating={rating}
        setTestimonialRating={setRating}
        testimonialComment={comment}
        setTestimonialComment={setComment}
        isFeatured={isFeatured}
        setIsFeatured={setIsFeatured}
        selectedFile={null}
        featuredImage=""
        handleFileChange={() => {}}
        handleRemoveImage={() => {}}
        categories={[]}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle', 'Confirm Delete')}
        message={t('confirm.deleteMessage', 'Are you sure you want to delete this testimonial? This action cannot be undone.')}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isDanger
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        title={t('confirm.bulkDeleteTitle', 'Confirm Bulk Delete')}
        message={t('confirm.bulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected testimonials?`,
        })}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isDanger
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  )
}

export default TestimonialsPage
