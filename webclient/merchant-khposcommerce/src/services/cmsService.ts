import api from '@/api/client'

export const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    author_name: 'សុខ វិបុល',
    role: 'CEO & Founder',
    company: 'Angkor Mart Co., Ltd',
    avatar: '/images/users/user-01.jpg',
    rating: 5,
    comment: 'OptaPOS បានជួយបង្កើនប្រសិទ្ធភាពការលក់ និងគ្រប់គ្រងស្តុកតាមសាខាទាំង ៥ បានយ៉ាងរលូន។ ការបញ្ជាទិញ និងទូទាត់ប្រាក់រហ័ស មិនដែលជួបបញ្ហាខ្វះស្តុកទៀតទេ!',
    is_featured: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    author_name: 'លី ស្រីមុំ',
    role: 'Store Manager',
    company: 'Phnom Penh Tech Hub',
    avatar: '/images/users/user-02.jpg',
    rating: 5,
    comment: 'ការទូទាត់ប្រាក់តាម KHQR លឿនរហ័ស និងប្រព័ន្ធ E-Commerce ធ្វើឱ្យអតិថិជនកុម្ម៉ង់ទិញអនឡាញកាន់តែច្រើន។ ប្រព័ន្ធដំណើរការរលូន និងមិនដែលគាំងឡើយ!',
    is_featured: true,
    is_active: true,
    sort_order: 2,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 3,
    author_name: 'គឹម ហេង',
    role: 'Operations Director',
    company: 'Battambang Retail Express',
    avatar: '/images/users/user-03.jpg',
    rating: 5,
    comment: 'របាយការណ៍ និងស្ថិតិលក់លម្អិតខ្លាំង ងាយស្រួលផ្ទៀងផ្ទាត់ចំណូលចំណាយប្រចាំថ្ងៃ និងតាមដានបុគ្គលិកវេនលក់។ ក្រុមការងារ Support ឆ្លើយតបរហ័សទាន់ចិត្ត!',
    is_featured: true,
    is_active: true,
    sort_order: 3,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 4,
    author_name: 'ចាន់ ធីតា',
    role: 'ម្ចាស់ហាង',
    company: 'Thida Fashion & Cosmetics',
    avatar: '/images/users/user-04.jpg',
    rating: 5,
    comment: 'ប្រព័ន្ធ POS នេះងាយស្រួលប្រើប្រាស់មែនទែន បុគ្គលិកថ្មីរៀនតែ ១០ នាទីចេះប្រើភ្លាម។ មុខងារបោះពុម្ពវិក្កយបត្រ និង Scan Barcode ឆ្លើយតបលឿនបំផុត!',
    is_featured: true,
    is_active: true,
    sort_order: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 5,
    author_name: 'វ៉ាន់ សុភាព',
    role: 'General Manager',
    company: 'Kampot Organic Farm & Cafe',
    avatar: '/images/users/user-05.jpg',
    rating: 5,
    comment: 'អស្ចារ្យណាស់សម្រាប់ការគ្រប់គ្រងសាខាច្រើនកន្លែងក្នុងពេលតែមួយ។ អាចមើលរបាយការណ៍លក់តាមទូរស័ព្ទដៃបានគ្រប់ពេលវេលា និងមានសុវត្ថិភាពខ្ពស់។',
    is_featured: true,
    is_active: true,
    sort_order: 5,
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: 6,
    author_name: 'អ៊ុង វណ្ណដា',
    role: 'Sales Manager',
    company: 'Siem Reap Souvenir & Craft',
    avatar: '/images/users/user-06.jpg',
    rating: 4,
    comment: 'កម្មវិធីជួយសន្សំពេលវេលាគិតលុយបានច្រើនពេលភ្ញៀវចូលច្រើន។ ប្រព័ន្ធផ្ញើសារដំណឹង និងការបញ្ចុះតម្លៃ Promotion ធ្វើការបានល្អឥតខ្ចោះ។',
    is_featured: false,
    is_active: true,
    sort_order: 6,
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: 7,
    author_name: 'ម៉េង ស្រីពៅ',
    role: 'ម្ចាស់អាជីវកម្ម',
    company: 'Sreypov Baby Care & Toys',
    avatar: '/images/users/user-07.jpg',
    rating: 5,
    comment: 'ពេញចិត្តខ្លាំងលើមុខងារគ្រប់គ្រងស្តុក និងកាលបរិច្ឆេទផុតកំណត់នៃទំនិញ។ មិនបារម្ភរឿងទំនិញបាត់បង់ ឬផុតកំណត់ទៀតឡើយ។',
    is_featured: true,
    is_active: true,
    sort_order: 7,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 8,
    author_name: 'សេង ពិសិដ្ឋ',
    role: 'IT Consultant',
    company: 'Mekong Digital Solutions',
    avatar: '/images/users/user-08.jpg',
    rating: 5,
    comment: 'API ស្អាត និងលឿន ងាយស្រួលភ្ជាប់ជាមួយប្រព័ន្ធខាងក្រៅ និង Web Storefront។ Database មានស្ថេរភាពខ្ពស់ និង Backup ស្វ័យប្រវត្តិកក់ក្តៅចិត្ត។',
    is_featured: false,
    is_active: true,
    sort_order: 8,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 9,
    author_name: 'ហេង ចិន្តា',
    role: 'ម្ចាស់ឱសថស្ថាន',
    company: 'Chenda Health & Pharmacy',
    avatar: '/images/users/user-09.jpg',
    rating: 4,
    comment: 'ការស្វែងរកទំនិញតាមលេខកូដ និងឈ្មោះរហ័ស គិតលុយមិនស្ទះជួរ។ វិក្កយបត្រមាន QR Code ងាយស្រួលអតិថិជនស្កេនទូទាត់ប្រាក់ភ្លាមៗ។',
    is_featured: false,
    is_active: true,
    sort_order: 9,
    created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
  },
  {
    id: 10,
    author_name: 'តាំង គង់ស្រ៊ុន',
    role: 'Operations Manager',
    company: 'Sihanoukville Mini Mart',
    avatar: '/images/users/user-10.jpg',
    rating: 5,
    comment: 'សេវាកម្ម និងប្រព័ន្ធពិតជាស្តង់ដារអន្តរជាតិ។ ចាប់តាំងពីប្រើ KHPosCommerce មក ចំណូលកើនឡើងដោយសារមិនបាត់បង់ទិន្នន័យ និងគ្រប់គ្រងលុយច្បាស់លាស់!',
    is_featured: true,
    is_active: true,
    sort_order: 10,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
]

export const cmsService = {
  // CMS Dashboard Stats
  getStats: () =>
    api.get('/cms/stats').then(r => r.data.data),

  // Blogs
  getBlogs: (params: Record<string, any> = {}) =>
    api.get('/blogs', { params }).then(r => r.data),

  getBlog: (id: number) =>
    api.get(`/blogs/${id}`).then(r => r.data.data || r.data),

  createBlog: (data: any) =>
    api.post('/blogs', data).then(r => r.data.data || r.data),

  updateBlog: (id: number, data: any) =>
    api.put(`/blogs/${id}`, data).then(r => r.data.data || r.data),

  deleteBlog: (id: number) =>
    api.delete(`/blogs/${id}`).then(r => r.data),

  // Blog Categories
  getCategories: (params: Record<string, any> = {}) =>
    api.get('/blog-categories', { params }).then(r => r.data.data ?? r.data),

  getCategory: (id: number) =>
    api.get(`/blog-categories/${id}`).then(r => r.data.data),

  createCategory: (payload: any) =>
    api.post('/blog-categories', payload).then(r => r.data.data),

  updateCategory: (id: number, payload: any) =>
    api.put(`/blog-categories/${id}`, payload).then(r => r.data.data),

  deleteCategory: (id: number) =>
    api.delete(`/blog-categories/${id}`).then(r => r.data),

  // Banners & Sliders
  getBanners: (params: Record<string, any> = {}) =>
    api.get('/banners', { params }).then(r => r.data),

  getBanner: (id: number) =>
    api.get(`/banners/${id}`).then(r => r.data.data || r.data),

  createBanner: (formData: FormData | Record<string, any>) =>
    api.post('/banners', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }).then(r => r.data.data || r.data),

  updateBanner: (id: number, payload: FormData | Record<string, any>) => {
    if (payload instanceof FormData) {
      if (!payload.has('_method')) {
        payload.append('_method', 'PUT')
      }
      return api.post(`/banners/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data.data || r.data)
    }
    return api.put(`/banners/${id}`, payload).then(r => r.data.data || r.data)
  },

  deleteBanner: (id: number) =>
    api.delete(`/banners/${id}`).then(r => r.data),

  bulkDeleteBanners: (ids: number[]) =>
    api.post('/banners/bulk-delete', { ids }).then(r => r.data),

  // Top Announcement Bar Settings & Database Records
  getAnnouncements: () =>
    api.get('/announcements', { params: { is_active: true } }).then(r => {
      const records = r.data?.data?.data || r.data?.data || []
      return records.length > 0 ? records[0] : null
    }).catch(() => null),

  getAnnouncementsList: (params: Record<string, any> = {}) =>
    api.get('/announcements', { params }).then(r => r.data),

  createAnnouncement: (data: any) =>
    api.post('/announcements', data).then(r => r.data.data || r.data),

  updateAnnouncement: (id: number, data: any) =>
    api.put(`/announcements/${id}`, data).then(r => r.data.data || r.data),

  deleteAnnouncement: (id: number) =>
    api.delete(`/announcements/${id}`).then(r => r.data),

  toggleAnnouncementActive: (id: number) =>
    api.post(`/announcements/${id}/toggle-active`).then(r => r.data.data || r.data),

  updateAnnouncements: (data: any) => {
    if (data.id) {
      return api.put(`/announcements/${data.id}`, data).then(r => r.data)
    }
    return api.post('/announcements', data).then(r => r.data)
  },

  // Testimonials / Social Proof
  getTestimonials: (params: Record<string, any> = {}) => {
    const filterFallback = () => {
      let filtered = [...DEFAULT_TESTIMONIALS]
      if (params.search) {
        const s = String(params.search).toLowerCase()
        filtered = filtered.filter(item =>
          item.author_name.toLowerCase().includes(s) ||
          (item.company && item.company.toLowerCase().includes(s)) ||
          item.comment.toLowerCase().includes(s)
        )
      }
      if (params.is_featured !== undefined) {
        filtered = filtered.filter(item => Boolean(item.is_featured) === Boolean(params.is_featured))
      }
      if (params.is_active !== undefined) {
        filtered = filtered.filter(item => Boolean(item.is_active) === Boolean(params.is_active))
      }
      if (params.rating) {
        filtered = filtered.filter(item => item.rating === Number(params.rating))
      }
      return {
        success: true,
        data: filtered,
        pagination: { total: filtered.length, current_page: 1, last_page: 1 },
        total: filtered.length,
        current_page: 1,
        last_page: 1,
      }
    }

    return api.get('/testimonials', { params })
      .then(r => {
        const res = r.data
        if (Array.isArray(res?.data) && res.data.length > 0) {
          return res
        }
        return filterFallback()
      })
      .catch(() => filterFallback())
  },

  // Broadcast to Telegram Channel
  broadcastToTelegram: (payload: {
    title: string
    message: string
    category?: string
    read_time?: string
    link?: string
    image_url?: string
    channel_id?: string
    locale?: 'km' | 'en'
  }) => api.post('/telegram/broadcast', payload).then(r => r.data),

  // Dynamic Tab CRUD (ContentManagementPage)
  getItemsByTab: (tab: string, params: Record<string, any> = {}) => {
    if (tab === 'testimonials') {
      return cmsService.getTestimonials(params)
    }
    return api.get(`/${tab}`, { params }).then(r => r.data)
  },

  createItemByTab: (tab: string, payload: any) =>
    api.post(`/${tab}`, payload).then(r => r.data.data || r.data),

  updateItemByTab: (tab: string, id: number, payload: any) =>
    api.put(`/${tab}/${id}`, payload).then(r => r.data.data || r.data),

  deleteItemByTab: (tab: string, id: number) =>
    api.delete(`/${tab}/${id}`).then(r => r.data),

  bulkDeleteItemsByTab: (tab: string, ids: number[]) =>
    api.post(`/${tab}/bulk-delete`, { ids }).then(r => r.data),
}

export default cmsService
