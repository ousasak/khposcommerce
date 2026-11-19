// ── CMS Components Index ──────────────────────────────────────────────────────

// 1. Shared / Common Modals & Cards
export { CMSStatsCards } from './CMSStatsCards'
export { CMSFilterDrawer } from './CMSFilterDrawer'
export { CMSFormModal } from './CMSFormModal'
export { CMSImportModal } from './CMSImportModal'
export { BlogDetailDrawer } from './BlogDetailDrawer'

// 2. Editorial & Content (Blogs, Categories, Tags)
export {
  BlogArticlesGrid,
  BlogArticlesGrid as BlogsGrid,
  BlogArticlesGrid as BlogsCardGrid,
} from './BlogArticlesGrid'
export type { BlogArticlesGridProps } from './BlogArticlesGrid'

export {
  BlogCategoriesTable,
  BlogCategoriesTable as BlogCategoriesTab,
} from './BlogCategoriesTable'
export type { BlogCategoriesTableProps } from './BlogCategoriesTable'

export {
  BlogTagsTable,
  BlogTagsTable as BlogTagsTab,
} from './BlogTagsTable'
export type { BlogTagsTableProps } from './BlogTagsTable'

// 3. Site Presentation & Marketing (Banners, Announcements, Pages)
export {
  BannerSlidersTable,
  BannerSlidersTable as BannersTable,
  BannerSlidersTable as BannersTab,
} from './BannerSlidersTable'
export type { BannerSlidersTableProps } from './BannerSlidersTable'

export {
  AnnouncementsTable,
  AnnouncementsTable as AnnouncementsTab,
} from './AnnouncementsTable'

export {
  PagesPoliciesTable,
  PagesPoliciesTable as PagesTable,
  PagesPoliciesTable as PagesTab,
} from './PagesPoliciesTable'
export type { PagesPoliciesTableProps } from './PagesPoliciesTable'

// 4. Trust & Media (FAQs, Testimonials, Media Library)
export {
  FaqsHelpTable,
  FaqsHelpTable as FaqsTable,
  FaqsHelpTable as FaqsTab,
} from './FaqsHelpTable'
export type { FaqsHelpTableProps } from './FaqsHelpTable'

export {
  TestimonialsTable,
  TestimonialsTable as TestimonialsTab,
} from './TestimonialsTable'
export type { TestimonialsTableProps } from './TestimonialsTable'

// 5. SmartHR-style Unified SearchBars (matching ProductSearchBar)
export { BlogArticlesSearchBar } from './BlogArticlesSearchBar'
export type { BlogArticlesSearchBarProps } from './BlogArticlesSearchBar'

export { BlogCategoriesSearchBar } from './BlogCategoriesSearchBar'
export type { BlogCategoriesSearchBarProps } from './BlogCategoriesSearchBar'

export { BlogTagsSearchBar } from './BlogTagsSearchBar'
export type { BlogTagsSearchBarProps } from './BlogTagsSearchBar'

export { PagesPoliciesSearchBar } from './PagesPoliciesSearchBar'
export type { PagesPoliciesSearchBarProps } from './PagesPoliciesSearchBar'

export { FaqsHelpSearchBar } from './FaqsHelpSearchBar'
export type { FaqsHelpSearchBarProps } from './FaqsHelpSearchBar'

export { AnnouncementsSearchBar } from './AnnouncementsSearchBar'
export type { AnnouncementsSearchBarProps } from './AnnouncementsSearchBar'

export { TestimonialsSearchBar } from './TestimonialsSearchBar'
export type { TestimonialsSearchBarProps } from './TestimonialsSearchBar'

