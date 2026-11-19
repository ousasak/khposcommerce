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
  FaqsHelpTable,
  FaqsHelpSearchBar,
} from './components'

export const FaqsHelpPage: React.FC = () => {
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
  } = useServerPagination({ storageKey: 'cms_faqs' })

  // Filters & Sorting
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
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
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [faqCategory, setFaqCategory] = useState('')
  const [sortOrderValue, setSortOrderValue] = useState('0')
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
    title: true,
    category: true,
    sortOrder: true,
    status: true,
    actions: true,
  })

  // Data Fetching
  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: ['faqs', page, debouncedSearch, perPage, filterStatus, filterCategory, sortBy, sortOrder],
    queryFn: () =>
      cmsService.getItemsByTab('faqs', {
        page,
        search: debouncedSearch,
        per_page: perPage,
        sort: sortBy,
        order: sortOrder,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
      }),
    placeholderData: (prev) => prev,
  })

  const { data: cmsStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['cms-stats'],
    queryFn: () => cmsService.getStats(),
  })

  const records = listData?.data ?? []
  const pagination = listData?.pagination ?? { total: records.length, current_page: 1, last_page: 1 }

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

  // Extract unique categories for inline filtering
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    records.forEach((r: any) => {
      if (r.category && typeof r.category === 'string') {
        set.add(r.category.trim())
      }
    })
    return Array.from(set).sort()
  }, [records])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => cmsService.createItemByTab('faqs', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      closeModal()
      toast.success(t('cms.createdSuccess', 'FAQ item created successfully!'))
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
      toast.error(err?.response?.data?.message ?? t('cms.createFailed', 'Failed to create FAQ'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      cmsService.updateItemByTab('faqs', id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      closeModal()
      toast.success(t('cms.updatedSuccess', 'FAQ item updated successfully!'))
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
      toast.error(err?.response?.data?.message ?? t('cms.updateFailed', 'Failed to update FAQ'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteItemByTab('faqs', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      toast.success(t('cms.deletedSuccess', 'FAQ item deleted successfully!'))
      adjustAfterDelete(records.length)
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'Failed to delete FAQ'))
      setConfirmOpen(false)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => cmsService.bulkDeleteItemsByTab('faqs', ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setBulkDeleteConfirmOpen(false)
      toast.success(
        t('cms.bulkDeleteSuccess', {
          count: selectedRows.length,
          defaultValue: `Successfully deleted ${selectedRows.length} items`,
        })
      )
      adjustAfterDelete(records.length - selectedRows.length)
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'Failed to delete FAQs'))
      setBulkDeleteConfirmOpen(false)
    },
  })

  // Handlers
  const openCreateModal = () => {
    setEditingItem(null)
    setQuestion('')
    setAnswer('')
    setFaqCategory('')
    setSortOrderValue('0')
    setIsActive(true)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setQuestion(item.question || item.title || '')
    setAnswer(item.answer || item.content || '')
    setFaqCategory(item.category || '')
    setSortOrderValue(String(item.sort_order ?? 0))
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
    if (!question.trim()) {
      newErrors.question = t('cms.questionRequired', 'សូមបញ្ចូលសំណួរ')
    }
    if (!answer.trim()) {
      newErrors.answer = t('cms.answerRequired', 'សូមបញ្ចូលចម្លើយ')
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }

    const payload = {
      company_id: 1,
      question: question.trim(),
      answer: answer.trim(),
      category: faqCategory.trim(),
      sort_order: parseInt(sortOrderValue) || 0,
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
      toast.error(t('common.noDataToExport', 'No data to export'))
      return
    }
    const headers = ['ID', 'Question', 'Answer', 'Category', 'Order', 'Status']
    const rows = dataToExport.map((f: any) => [
      f.id,
      `"${(f.question || f.title || '').replace(/"/g, '""')}"`,
      `"${(f.answer || f.content || '').replace(/"/g, '""')}"`,
      `"${(f.category || '').replace(/"/g, '""')}"`,
      f.sort_order || 0,
      f.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('cms-faqs.csv', [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n'))
    toast.success(t('common.exportSuccess', 'Export completed successfully'))
  }

  return (
    <div className="space-y-6">
      {/* Standalone Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.contentManagement', 'Content Management'), href: '/cms/blogs' },
          { label: t('nav.cmsFaqs', 'FAQs & Help') },
        ]}
      />

      {/* Frameless Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('cms.faqsTitle', 'Frequently Asked Questions & Help Center')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('cms.faqsSubtitle', 'Manage self-service help answers, troubleshooting guides, and knowledge base items.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCSV}
            disabled={!records.length}
            label={
              selectedRows.length > 0
                ? `${t('common.export', 'Export')} (${selectedRows.length})`
                : t('common.exportCsv', 'Export CSV')
            }
          />
          {canCreate && (
            <AddButton
              label={t('cms.addFaq', 'Add FAQ')}
              onClick={openCreateModal}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Executive KPI Overview */}
      <CMSStatsCards activeTab="faqs" stats={cmsStats} isLoading={isStatsLoading} />

      {/* ── SMARTHR-STYLE PRODUCT-MATCHING SEARCH & FILTER BAR ── */}
      <div className="space-y-4">
        <FaqsHelpSearchBar
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          categoryFilter={filterCategory}
          onCategoryChange={(val) => {
            setFilterCategory(val)
            setPage(1)
          }}
          categories={availableCategories}
          statusFilter={filterStatus}
          onStatusChange={(val) => {
            setFilterStatus(val)
            setPage(1)
          }}
          onReset={() => {
            setFilterStatus('all')
            setFilterCategory('all')
            reset()
          }}
          columns={[
            { key: 'title', label: t('cms.colQuestionAnswer', 'Question & Answer') },
            { key: 'category', label: t('cms.colCategory', 'Category') },
            { key: 'sortOrder', label: t('cms.colOrder', 'Display Order') },
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
        <FaqsHelpTable
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

      {/* FAQ Form Modal */}
      <CMSFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        errors={errors}
        onClearError={handleClearError}
        activeTab="faqs"
        getAddButtonLabel={() => t('cms.addFaq', 'Add FAQ')}
        title=""
        setTitle={() => {}}
        name=""
        setName={() => {}}
        slug=""
        setSlug={() => {}}
        content=""
        setContent={() => {}}
        excerpt=""
        setExcerpt={() => {}}
        status="published"
        setStatus={() => {}}
        description=""
        setDescription={() => {}}
        question={question}
        setQuestion={setQuestion}
        answer={answer}
        setAnswer={setAnswer}
        faqCategory={faqCategory}
        setFaqCategory={setFaqCategory}
        sortOrder={sortOrderValue}
        setSortOrder={setSortOrderValue}
        isActive={isActive}
        setIsActive={setIsActive}
        categoryId=""
        setCategoryId={() => {}}
        metaTitle=""
        setMetaTitle={() => {}}
        metaDescription=""
        setMetaDescription={() => {}}
        testimonialRole=""
        setTestimonialRole={() => {}}
        testimonialCompany=""
        setTestimonialCompany={() => {}}
        testimonialRating={5}
        setTestimonialRating={() => {}}
        testimonialComment=""
        setTestimonialComment={() => {}}
        isFeatured={false}
        setIsFeatured={() => {}}
        selectedFile={null}
        featuredImage=""
        handleFileChange={() => {}}
        handleRemoveImage={() => {}}
        categories={[]}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle', 'Confirm Deletion')}
        message={t('confirm.deleteMessage', 'Are you sure you want to delete this FAQ item? This action cannot be undone.')}
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
        title={t('confirm.bulkDeleteTitle', 'Confirm Bulk Deletion')}
        message={t('confirm.bulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected FAQs?`,
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

export default FaqsHelpPage
