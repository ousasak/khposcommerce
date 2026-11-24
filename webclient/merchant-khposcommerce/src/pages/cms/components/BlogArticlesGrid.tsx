import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Eye,
  Pencil,
  Trash2,
  FileText,
  User,
  Tag as TagIcon,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppImage, EmptyState, StatusBadge } from '@/components/common'
import { BlogDetailDrawer } from './BlogDetailDrawer'

export interface BlogArticlesGridProps {
  records: any[]
  isLoading: boolean
  isFetching?: boolean
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
}

/**
 * BlogArticlesGrid Component
 * Displays blog articles and stories as modern, interactive cards/boxes (ប្រអប់)
 * with category tags, cover images, author info, view counters, and instant actions.
 */
export const BlogArticlesGrid: React.FC<BlogArticlesGridProps> = ({
  records = [],
  isLoading,
  isFetching = false,
  confirmDelete,
  selectedRows = [],
  onToggleSelectAll,
  onToggleSelectRow,
}) => {
  const { t, i18n } = useTranslation(['cms', 'common', 'buttons'])
  const navigate = useNavigate()
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null)
  const currentLocale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  const handleEdit = (r: any) => {
    navigate(`/cms/blogs/${r.id}/edit`)
  }

  const handleView = (r: any) => {
    setSelectedBlog(r)
  }

  const isAllSelected = records.length > 0 && selectedRows.length === records.length

  // Loading skeleton state (9 cards for 3x3 layout)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 print:hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div
            key={i}
            className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm animate-pulse flex flex-col"
          >
            <div className="w-full aspect-[16/10] bg-muted/70 relative">
              <div className="absolute top-3 left-3 w-20 h-6 rounded-full bg-muted-foreground/20" />
              <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 bg-muted rounded w-24" />
                  <div className="h-3.5 bg-muted rounded w-16" />
                </div>
                <div className="h-5 bg-muted rounded-md w-full" />
                <div className="h-5 bg-muted rounded-md w-3/4" />
                <div className="h-3 bg-muted rounded w-5/6 mt-2" />
              </div>
              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
                <div className="w-8 h-8 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (records.length === 0) {
    return (
      <div className="bg-card rounded-2xl sm:rounded-3xl border border-border p-12 text-center text-muted-foreground space-y-3 shadow-sm print:hidden">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
          <FileText size={28} />
        </div>
        <h4 className="font-bold text-foreground text-base sm:text-lg">
          {t('cms.noBlogs', 'មិនមានអត្ថបទប្លុកនៅឡើយទេ')}
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          {t('cms.noBlogsDesc', 'មិនមានទិន្នន័យអត្ថបទដែលត្រូវគ្នានឹងការស្វែងរក ឬប្រភេទដែលបានជ្រើសរើសឡើយ។')}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* ── Cards Grid (ប្រអប់អត្ថបទ) ── */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 print:hidden transition-opacity duration-200 ${
          isFetching ? 'opacity-70' : 'opacity-100'
        }`}
      >
        {records.map((r, idx) => {
          const isSelected = selectedRows.includes(r.id)
          const st = (r.status || 'published').toLowerCase()
          const coverImage = r.featured_image || r.image || r.image_url
          const blogIndex = typeof r.id === 'number' ? ((r.id - 1) % 10) + 1 : (idx % 10) + 1
          const dynamicFallback = `/images/blogs/blog-${String(blogIndex).padStart(2, '0')}.jpg`
          const categoryName =
            r.blog_category?.name || r.category_name || r.category?.name || t('cms.general', 'ទូទៅ')
          const authorName =
            r.author?.name || r.author_name || r.user?.name || t('cms.systemAdmin', 'Super Admin')
          const cleanAuthorName = authorName.replace(/\s*\([^)]*\)/g, '').trim() || authorName
          const authorAvatar = r.author?.avatar || r.user?.avatar || null
          const views = Number(r.view_count ?? r.views_count ?? r.views ?? 0)
          const dateVal = r.published_at || r.created_at
          const formattedDate = dateVal
            ? new Date(dateVal).toLocaleDateString(currentLocale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '—'

          return (
            <div
              key={r.id}
              className={`group relative bg-card rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/2 dark:bg-primary/5 shadow-md'
                  : 'border-border/80 dark:border-border hover:border-primary/40 dark:hover:border-primary/40'
              }`}
            >
              {/* ── 1. Thumbnail Banner ── */}
              <div
                onClick={() => handleView(r)}
                className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900/60 shrink-0 cursor-pointer"
              >
                <AppImage
                  src={coverImage}
                  alt={r.title}
                  fallbackType="general"
                  fallbackSrc={dynamicFallback}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Subtle scrim gradient for badge contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

                {/* Floating Category Tag (Top-Left) */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-slate-900/90 text-foreground dark:text-white shadow-xs backdrop-blur-md border border-white/40 dark:border-slate-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span className="truncate max-w-[140px] sm:max-w-[160px]">{categoryName}</span>
                  </span>
                </div>
              </div>

              {/* ── 2. Card Content Body ── */}
              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                <div className="space-y-2.5">
                  {/* Meta: Publish Date, Status Badge & Views */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                    <div className="flex items-center gap-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-muted-foreground/70 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                      <StatusBadge status={st} />
                    </div>

                    <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-muted/60 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-border/50 text-muted-foreground">
                      <Eye size={12} className="text-muted-foreground/70" />
                      <span>{views.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => handleView(r)}
                    className="font-bold text-base sm:text-lg text-foreground hover:text-primary cursor-pointer transition-colors line-clamp-2 leading-snug group-hover:text-primary"
                    title={r.title}
                  >
                    {r.title}
                  </h3>

                  {/* Excerpt / Summary */}
                  {r.excerpt ? (
                    <p
                      className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed"
                      title={r.excerpt}
                    >
                      {r.excerpt}
                    </p>
                  ) : r.slug ? (
                    <p className="text-xs font-mono text-muted-foreground/80 truncate">
                      /{r.slug}
                    </p>
                  ) : null}
                </div>

                {/* ── 3. Card Footer: Author & Action Buttons ── */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
                  {/* Author Avatar & Name (Clean without ugly truncation) */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt={cleanAuthorName}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-border shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20 shrink-0">
                        {cleanAuthorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="text-xs font-bold text-foreground truncate"
                      title={authorName}
                    >
                      {cleanAuthorName}
                    </span>
                  </div>

                  {/* ── Action Buttons: Clean Minimalist Circular Buttons (No Gray Box) ── */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* View Button */}
                    <button
                      type="button"
                      onClick={() => handleView(r)}
                      title={t('cms.previewBlog', 'មើលអត្ថបទ')}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-card hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                    >
                      <Eye size={14} />
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleEdit(r)}
                      title={t('common.edit', 'កែសម្រួល')}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-card hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                    >
                      <Pencil size={13} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => confirmDelete(r.id)}
                      title={t('common.delete', 'លុប')}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-card hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Blog Detail Drawer ── */}
      <BlogDetailDrawer
        isOpen={!!selectedBlog}
        onClose={() => setSelectedBlog(null)}
        blog={selectedBlog}
        onEdit={(item) => {
          setSelectedBlog(null)
          handleEdit(item)
        }}
      />
    </>
  )
}

export default BlogArticlesGrid

