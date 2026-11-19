import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { cmsService } from '@/services/cmsService'
import { useToast } from '@/hooks/useToast'
import { usePermission } from '@/hooks/usePermission'
import { useServerPagination } from '@/hooks/useServerPagination'
import { downloadCsv } from '@/utils/export'
import { Breadcrumb } from '@/components/common'
import { HeaderActionsGroup, AddButton, ExportButton, ImportButton } from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'

import {
  CMSFilterDrawer,
  CMSImportModal,
  BlogArticlesGrid,
} from './components'

const PER_PAGE = 9

export const BlogArticlesPage: React.FC = () => {
  const { t } = useTranslation(['cms', 'common', 'nav', 'toast', 'confirm'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  const canCreate = hasPermission('blog.create')

  // Pagination & Search (9 cards per page for clean 3x3 grid)
  const {
    page,
    setPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'cms_blogs_grid_v9', defaultPerPage: PER_PAGE })

  // Filters & Sorting
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category_id') || searchParams.get('category') || 'all'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>(initialCategory)
  const [filterAuthor, setFilterAuthor] = useState<string>('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const cat = searchParams.get('category_id') || searchParams.get('category')
    if (cat && cat !== filterCategory) {
      setFilterCategory(cat)
      setPage(1)
    }
  }, [searchParams])

  // Selections
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // CSV Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Data Fetching: always fetch 9 items per page
  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: ['blogs', page, debouncedSearch, PER_PAGE, filterStatus, filterCategory, sortBy, sortOrder],
    queryFn: () =>
      cmsService.getItemsByTab('blogs', {
        page,
        search: debouncedSearch,
        per_page: PER_PAGE,
        sort: sortBy,
        order: sortOrder,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCategory !== 'all' && { category_id: filterCategory }),
      }),
    placeholderData: (prev) => prev,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['blog-categories-list'],
    queryFn: () => cmsService.getCategories({ per_page: 100 }),
  })

  const records = listData?.data ?? []
  const pagination = listData?.pagination ?? { total: records.length, current_page: 1, last_page: 1 }

  // Sorting Handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
    }
    setPage(1)
  }

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteBlog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      toast.success(t('cms.deletedSuccess'))
      adjustAfterDelete(records.length)
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed'))
      setConfirmOpen(false)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => cmsService.bulkDeleteItemsByTab('blogs', ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setBulkDeleteConfirmOpen(false)
      toast.success(
        t('cms.bulkDeleteSuccess', {
          count: selectedRows.length,
        })
      )
      adjustAfterDelete(records.length - selectedRows.length)
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed'))
      setBulkDeleteConfirmOpen(false)
    },
  })

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
    const isExportingSelected = selectedRows.length > 0
    const exportItems = isExportingSelected
      ? records.filter((r: any) => selectedRows.includes(r.id))
      : records

    if (!exportItems.length) {
      toast.error(t('common.noDataToExport'))
      return
    }

    const headers = ['ID', 'Title', 'Slug', 'Category', 'Status', 'Views', 'Created At']
    const rows = exportItems.map((b: any) => [
      b.id,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      b.slug || '',
      `"${(b.category_name || b.blog_category?.name || b.category?.name || '').replace(/"/g, '""')}"`,
      b.status || 'published',
      b.views_count || b.view_count || 0,
      b.created_at || '',
    ])
    downloadCsv('cms-blogs.csv', headers, rows)
    toast.success(
      isExportingSelected
        ? t('cms.exportSelectedSuccess')
        : t('common.exportSuccess')
    )
  }

  const handleProcessImport = () => {
    setIsImporting(true)
    setTimeout(() => {
      setIsImporting(false)
      setImportModalOpen(false)
      setImportFile(null)
      toast.success(t('cms.importSuccess'))
      qc.invalidateQueries({ queryKey: ['blogs'] })
    }, 1000)
  }

  const resetAllFilters = () => {
    setFilterStatus('all')
    setFilterCategory('all')
    setFilterAuthor('all')
    reset()
  }

  const categories = categoriesData?.data ?? []

  return (
    <div className="space-y-5 print:p-0">
      {/* ── 1. BREADCRUMB ── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('cms.contentManagement'), href: '/cms/blogs' },
            { label: t('cms.tabBlogs') },
          ]}
        />
      </div>

      {/* ── 2. HERO HEADER ── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('cms.blogsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('cms.blogsSubtitle')}
          </p>
        </div>

        <HeaderActionsGroup className="w-full sm:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <ExportButton
            onClick={handleExportCSV}
            disabled={!records.length}
            label={
              selectedRows.length > 0
                ? `${t('common.exportSelected')} (${selectedRows.length})`
                : t('common.exportCsv')
            }
          />
          <ImportButton
            onClick={() => setImportModalOpen(true)}
            label={t('common.importCsv')}
          />
          {canCreate && (
            <AddButton
              label={t('cms.addBlog')}
              onClick={() => navigate('/cms/blogs/create')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* ── 3. CARDS GRID (9 Articles Per Page) ── */}
      <BlogArticlesGrid
        records={records}
        isLoading={isLoading}
        isFetching={isFetching}
        confirmDelete={(id) => {
          setDeleteId(id)
          setConfirmOpen(true)
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* ── 4. CENTERED PAGINATION (Matching LMS reference) ── */}
      <Pagination
        currentPage={page}
        lastPage={pagination.last_page || 1}
        total={pagination.total || 0}
        perPage={PER_PAGE}
        onPageChange={setPage}
        variant="centered"
      />

      {/* Filter Drawer */}
      <CMSFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterAuthor={filterAuthor}
        setFilterAuthor={setFilterAuthor}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        onReset={resetAllFilters}
      />

      {/* CSV Import Modal */}
      <CMSImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        importFile={importFile}
        setImportFile={setImportFile}
        isImporting={isImporting}
        handleConfirmImport={handleProcessImport}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle')}
        message={t('confirm.deleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        title={t('confirm.bulkDeleteTitle')}
        message={t('confirm.bulkDeleteMessage', {
          count: selectedRows.length,
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  )
}

export default BlogArticlesPage
