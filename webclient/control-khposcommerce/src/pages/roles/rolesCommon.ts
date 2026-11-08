import { normalizePermission } from '@/utils/permissionUtils'

export interface Role {
  id:                 number
  name:               string
  display_name?:      string
  display_name_km?:   string
  guard_name:         string
  description?:       string
  description_km?:    string
  permissions_count?: number
  users_count?:       number
  is_system?:         boolean
  is_active?:         boolean
  status?:            'active' | 'inactive'
  created_at?:        string
  created_by?:        string
}

export interface PermissionItem {
  id?: number
  name: string
  module?: string
  action_type?: string
  risk_level?: 'low' | 'medium' | 'high'
  guard_name?: string
  [key: string]: any
}

// ── Apex Shadcn Style Helpers ────────────────────────────────────────────────
export const getRoleSlugColor = (name: string): string => {
  const lower = name.toLowerCase()
  if (lower.includes('super')) {
    return 'bg-purple-600 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
  }
  if (lower.includes('admin')) {
    return 'bg-emerald-600 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
  }
  if (lower.includes('cashier')) {
    return 'bg-amber-600 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
  }
  if (lower.includes('manager')) {
    return 'bg-indigo-600 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
  }
  if (lower.includes('warehouse')) {
    return 'bg-teal-600 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
  }
  if (lower.includes('staff')) {
    return 'bg-sky-600 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
  }
  if (lower.includes('customer')) {
    return 'bg-rose-600 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
  }
  if (lower.includes('owner')) {
    return 'bg-violet-600 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
  }
  return 'bg-slate-700 text-white font-mono text-xs font-bold px-2.5 h-6 inline-flex items-center rounded-md shadow-xs'
}

export const formatRoleSlug = (rawName: string): string => {
  if (!rawName) return ''
  return rawName
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export const ROLE_TITLE_KH: Record<string, string> = {
  super_admin: 'អភិបាលជាន់ខ្ពស់',
  admin: 'អភិបាលប្រព័ន្ធ',
  manager: 'អ្នកគ្រប់គ្រង',
  cashier: 'បេឡាធិការ',
  warehouse_staff: 'បុគ្គលិកឃ្លាំង',
  staff: 'បុគ្គលិកទូទៅ',
  customer: 'អតិថិជន',
  owner: 'ម្ចាស់អាជីវកម្ម',
}

export const ROLE_DESCRIPTION_KH: Record<string, string> = {
  super_admin: 'មានសិទ្ធិចូលដំណើរការគ្រប់ផ្នែកទាំងអស់ រួមទាំងការទូទាត់ប្រាក់ និងការកំណត់ប្រព័ន្ធ។',
  owner: 'តួនាទីម្ចាស់អាជីវកម្ម មានសិទ្ធិពេញលេញលើការគ្រប់គ្រងហាង និងហិរញ្ញវត្ថុ។',
  admin: 'សិទ្ធិគ្រប់គ្រងលើការធ្វើអាជីវកម្ម ការលក់ ការទិញ និងការចាត់ចែងធនធាន។',
  manager: 'ត្រួតពិនិត្យប្រតិបត្តិការហាង ការគ្រប់គ្រងបុគ្គលិក និងការចាត់ចែងទំនិញលក់។',
  cashier: 'ដំណើរការការលក់នៅបញ្ជរ POS ការប្រមូលប្រាក់ និងការចេញបង្កាន់ដៃទូទាត់។',
  warehouse_staff: 'ទទួលខុសត្រូវលើស្តុកទំនិញ ការកែសម្រួលទិន្នន័យ និងការផ្ទេរទំនិញរវាងសាខា។',
  staff: 'បំពេញការងារទូទៅក្នុងហាង តាមការបែងចែកពីអ្នកគ្រប់គ្រង។',
  customer: 'ព័ត៌មានគណនីអតិថិជន ប្រវត្តិទិញទំនិញ ពិន្ទុរង្វាន់ និងការឆ្លើយតប។',
}

export const formatRoleTitle = (roleOrName: Role | string | undefined | null, isKhmer: boolean = false): string => {
  if (!roleOrName) return ''

  if (typeof roleOrName === 'object' && roleOrName !== null) {
    const rawKey = roleOrName.name?.toLowerCase() || ''
    if (isKhmer) {
      if (roleOrName.display_name_km?.trim()) {
        return roleOrName.display_name_km
      }
      if (ROLE_TITLE_KH[rawKey]) {
        return ROLE_TITLE_KH[rawKey]
      }
    }
    if (roleOrName.display_name?.trim()) {
      return roleOrName.display_name
    }
    return formatRoleSlug(roleOrName.name)
  }

  const rawKey = String(roleOrName).toLowerCase()
  if (isKhmer && ROLE_TITLE_KH[rawKey]) {
    return ROLE_TITLE_KH[rawKey]
  }

  return formatRoleSlug(roleOrName)
}

export const isBuiltInRole = (role: Role): boolean => {
  return Boolean(role.is_system)
}

export const getRoleDescription = (
  role: Role,
  isKhmer: boolean = false,
  t?: (key: string, options?: any) => string
): string => {
  const rawKey = role.name?.toLowerCase() || ''
  if (isKhmer) {
    if (role.description_km?.trim()) {
      return role.description_km
    }
    if (ROLE_DESCRIPTION_KH[rawKey]) {
      return ROLE_DESCRIPTION_KH[rawKey]
    }
  }
  if (role.description?.trim()) {
    return role.description
  }
  const title = formatRoleTitle(role, isKhmer)
  if (t) {
    return t('roles.fallbackDescription', {
      title,
      guard: role.guard_name || 'api',
      count: role.permissions_count ?? 0,
      defaultValue: `${title} role configured for ${role.guard_name || 'api'} scope with ${role.permissions_count ?? 0} assigned permissions.`,
    })
  }
  return `${title} role configured for ${role.guard_name || 'api'} scope with ${role.permissions_count ?? 0} assigned permissions.`
}

export const MODULE_ORDER = [
  'user',
  'order',
  'product',
  'customer',
  'billing',
  'invoice',
  'sale',
  'purchase',
  'role',
  'permission',
  'inventory',
  'setting',
  'supplier',
  'employee',
  'branch',
  'category',
  'brand',
  'pos',
  'report',
  'expense',
  'support',
  'finance',
  'shipment',
  'promotion',
  'coupon',
  'banner',
  'department',
  'position',
  'warehouse',
  'tax',
  'currency',
  'attendance',
  'activity_log',
  'audit_log',
]

export const MODULE_HEADINGS: Record<string, string> = {
  billing: 'BILLING',
  setting: 'SETTINGS',
  inventory: 'INVENTORY',
  sale: 'SALES',
  purchase: 'PURCHASES',
  supplier: 'SUPPLIERS',
  employee: 'EMPLOYEES',
  branch: 'BRANCHES',
  role: 'ROLES',
  permission: 'PERMISSIONS',
  user: 'USERS',
  order: 'ORDERS',
  product: 'PRODUCTS',
  customer: 'CUSTOMERS',
  invoice: 'INVOICES',
  support: 'SUPPORT',
  finance: 'FINANCE',
  report: 'REPORTS',
  shipment: 'SHIPPING',
  category: 'CATEGORIES',
  brand: 'BRANDS',
  promotion: 'PROMOTIONS',
  coupon: 'COUPONS',
  banner: 'BANNERS',
  attendance: 'ATTENDANCE',
  attribute: 'ATTRIBUTES',
  audit_log: 'AUDIT LOGS',
  cart: 'CART',
  cash_register: 'CASH REGISTERS',
  cash_register_transaction: 'CASH TRANSACTIONS',
  city: 'CITIES',
  company: 'COMPANY',
  country: 'COUNTRIES',
  currency: 'CURRENCIES',
  customer_address: 'ADDRESSES',
  customer_group: 'CUSTOMER GROUPS',
  dashboard: 'DASHBOARD',
  department: 'DEPARTMENTS',
  expense: 'EXPENSES',
  expense_category: 'EXPENSE CATEGORIES',
  flash_sale: 'FLASH SALES',
  holiday: 'HOLIDAYS',
  inventory_movement: 'STOCK MOVEMENTS',
  language: 'LANGUAGES',
  payment: 'PAYMENTS',
  payment_method: 'PAYMENT METHODS',
  plan: 'PLANS',
  platform: 'PLATFORM',
  pos: 'POS',
  position: 'POSITIONS',
  product_review: 'REVIEWS',
  province: 'PROVINCES',
  purchase_return: 'PURCHASE RETURNS',
  stock_adjustment: 'STOCK ADJUSTMENTS',
  stock_opname: 'STOCK OPNAME',
  stock_transfer: 'STOCK TRANSFERS',
  store: 'STORE',
  subscription: 'SUBSCRIPTIONS',
  tax: 'TAXES',
  transaction: 'TRANSACTIONS',
  unit: 'UNITS',
  warehouse: 'WAREHOUSES',
  wishlist: 'WISHLISTS',
}

export const MODULE_HEADINGS_KM: Record<string, string> = {
  billing: 'វិក្កយបត្រ',
  setting: 'ការកំណត់',
  inventory: 'ស្តុកទំនិញ',
  sale: 'ការលក់',
  purchase: 'ការបញ្ជាទិញ',
  supplier: 'អ្នកផ្គត់ផ្គង់',
  employee: 'បុគ្គលិក',
  branch: 'សាខា',
  role: 'តួនាទី',
  permission: 'សិទ្ធិអនុញ្ញាត',
  user: 'អ្នកប្រើប្រាស់',
  order: 'ការបញ្ជាទិញ',
  product: 'ទំនិញ',
  customer: 'អតិថិជន',
  invoice: 'ប័ណ្ណទូទាត់',
  support: 'ជំនួយ',
  finance: 'ហិរញ្ញវត្ថុ',
  report: 'របាយការណ៍',
  shipment: 'ការដឹកជញ្ជូន',
  category: 'ប្រភេទ',
  brand: 'ម៉ាកយីហោ',
  promotion: 'ប្រូម៉ូសិន',
  coupon: 'ប័ណ្ណបញ្ចុះតម្លៃ',
  banner: 'បដា',
  attendance: 'វត្តមាន',
  attribute: 'គុណលក្ខណៈ',
  audit_log: 'កំណត់ហេតុសវនកម្ម',
  cart: 'កន្ត្រកទំនិញ',
  cash_register: 'ប្រអប់ថតលុយ',
  cash_register_transaction: 'ប្រតិបត្តិការថតលុយ',
  city: 'ទីក្រុង',
  company: 'ក្រុមហ៊ុន',
  country: 'ប្រទេស',
  currency: 'រូបិយប័ណ្ណ',
  customer_address: 'អាសយដ្ឋានអតិថិជន',
  customer_group: 'ក្រុមអតិថិជន',
  dashboard: 'ផ្ទាំងគ្រប់គ្រង',
  department: 'ដេប៉ាតឺម៉ង់',
  expense: 'ចំណាយ',
  expense_category: 'ប្រភេទចំណាយ',
  flash_sale: 'ការលក់បញ្ចុះតម្លៃពិសេស',
  holiday: 'ថ្ងៃឈប់សម្រាក',
  inventory_movement: 'ចលនាស្តុក',
  language: 'ភាសា',
  payment: 'ការទូទាត់',
  payment_method: 'វិធីសាស្ត្រទូទាត់',
  plan: 'គម្រោង',
  platform: 'វេទិកា',
  pos: 'ប្រព័ន្ធលក់ POS',
  position: 'តួនាទីការងារ',
  product_review: 'ការវាយតម្លៃទំនិញ',
  province: 'ខេត្ត-ក្រុង',
  purchase_return: 'ការបង្វិលទំនិញទិញចូល',
  stock_adjustment: 'ការសម្រួលស្តុក',
  stock_opname: 'ការត្រួតពិនិត្យស្តុក',
  stock_transfer: 'ការផ្ទេរស្តុក',
  store: 'ហាង',
  subscription: 'កញ្ចប់សេវា',
  tax: 'ពន្ធដារ',
  transaction: 'ប្រតិបត្តិការ',
  unit: 'ឯកតា',
  warehouse: 'ឃ្លាំង',
  wishlist: 'បញ្ជីចង់បាន',
}

export const ACTION_ORDER: Record<string, number> = {
  manage: 1,
  update: 2,
  edit: 3,
  view: 4,
  show: 5,
  index: 6,
  create: 7,
  store: 8,
  delete: 9,
  destroy: 10,
}

export const formatApexPermissionLabel = (perm: any, _isKhmer: boolean = false): { en: string; km?: string } => {
  const name = typeof perm === 'string' ? perm : perm?.name || ''
  if (!name) return { en: '', km: '' }
  const norm = normalizePermission(name)
  const parts = norm.split('.')
  const mod = parts[0] || ''
  const act = parts.length > 1 ? parts.slice(1).join('.') : 'view'

  const actionDisplay: Record<string, string> = {
    view: 'View',
    index: 'View',
    show: 'View',
    manage: 'Manage',
    update: 'Manage',
    edit: 'Manage',
    create: 'Create',
    store: 'Create',
    delete: 'Delete',
    destroy: 'Delete',
    export: 'Export',
    import: 'Import',
    approve: 'Approve',
    refund: 'Refund',
    return: 'Return',
    access: 'Access',
    process: 'Process',
    adjust: 'Adjust',
    transfer: 'Transfer',
    opname: 'Opname',
    cancel: 'Cancel',
    restore: 'Restore',
    print: 'Print',
    assign: 'Assign',
  }

  const moduleDisplay: Record<string, string> = {
    user: 'Users',
    role: 'Roles',
    permission: 'Permissions',
    order: 'Orders',
    product: 'Products',
    customer: 'Customers',
    billing: 'Billing',
    invoice: 'Invoices',
    sale: 'Sales',
    purchase: 'Purchases',
    inventory: 'Inventory',
    setting: 'Settings',
    support: 'Support',
    employee: 'Employees',
    report: 'Reports',
    expense: 'Expenses',
    branch: 'Branches',
    category: 'Categories',
    brand: 'Brands',
    coupon: 'Coupons',
    banner: 'Banners',
    promotion: 'Promotions',
    supplier: 'Suppliers',
    shipment: 'Shipments',
    attendance: 'Attendance',
    department: 'Departments',
    position: 'Positions',
    warehouse: 'Warehouses',
    pos: 'POS',
    tax: 'Taxes',
    currency: 'Currencies',
    activity_log: 'Activity Logs',
    audit_log: 'Audit Logs',
    cart: 'Cart',
    cash_register: 'Cash Registers',
    cash_register_transaction: 'Cash Transactions',
    customer_address: 'Addresses',
    customer_group: 'Customer Groups',
    expense_category: 'Expense Categories',
    inventory_movement: 'Stock Movements',
    stock_adjustment: 'Stock Adjustments',
    stock_transfer: 'Stock Transfers',
  }

  const actionKm: Record<string, string> = {
    view: 'មើល',
    index: 'មើល',
    show: 'មើល',
    manage: 'កែសម្រួល',
    update: 'កែសម្រួល',
    edit: 'កែសម្រួល',
    create: 'បង្កើត',
    store: 'បង្កើត',
    delete: 'លុប',
    destroy: 'លុប',
    export: 'នាំចេញ',
    import: 'នាំចូល',
    approve: 'អនុម័ត',
    refund: 'សងប្រាក់',
    return: 'ប្តូរទំនិញ',
    access: 'ចូលប្រើ',
    process: 'ដំណើរការ',
    adjust: 'សម្រួលស្តុក',
    transfer: 'ផ្ទេរ',
    opname: 'ត្រួតពិនិត្យ',
    cancel: 'បោះបង់',
    restore: 'ស្តារឡើងវិញ',
    print: 'បោះពុម្ព',
    assign: 'ចាត់តាំង',
  }

  const moduleKm: Record<string, string> = {
    user: 'អ្នកប្រើប្រាស់',
    role: 'តួនាទី',
    permission: 'សិទ្ធិអនុញ្ញាត',
    order: 'ការបញ្ជាទិញ',
    product: 'ទំនិញ',
    customer: 'អតិថិជន',
    billing: 'វិក្កយបត្រ',
    invoice: 'ប័ណ្ណទូទាត់',
    sale: 'ការលក់',
    purchase: 'ការបញ្ជាទិញ',
    inventory: 'ស្តុកទំនិញ',
    setting: 'ការកំណត់',
    support: 'ជំនួយ',
    employee: 'បុគ្គលិក',
    report: 'របាយការណ៍',
    expense: 'ចំណាយ',
    branch: 'សាខា',
    category: 'ប្រភេទ',
    brand: 'ម៉ាកយីហោ',
    coupon: 'ប័ណ្ណបញ្ចុះតម្លៃ',
    banner: 'បដា',
    promotion: 'ប្រូម៉ូសិន',
    supplier: 'អ្នកផ្គត់ផ្គង់',
    shipment: 'ការដឹកជញ្ជូន',
    attendance: 'វត្តមាន',
    department: 'ដេប៉ាតឺម៉ង់',
    position: 'តួនាទីការងារ',
    warehouse: 'ឃ្លាំង',
    pos: 'ប្រព័ន្ធលក់ POS',
    tax: 'ពន្ធដារ',
    currency: 'រូបិយប័ណ្ណ',
  }

  const actLabel = actionDisplay[act] || (act.charAt(0).toUpperCase() + act.slice(1))
  const cleanModFallback = mod.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const modLabel = moduleDisplay[mod] || (cleanModFallback.endsWith('s') ? cleanModFallback : `${cleanModFallback}s`)
  const en = `${actLabel} ${modLabel}`

  const actKm = actionKm[act] || (act.charAt(0).toUpperCase() + act.slice(1))
  const modKm = moduleKm[mod] || MODULE_HEADINGS_KM[mod] || modLabel
  const km = `${actKm} ${modKm}`

  return { en, km: km || en }
}
