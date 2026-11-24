# 🖥️ Frontend Architecture (Admin Dashboard & POS)

## 1. Overview & Principles

The Admin Dashboard and Point of Sale (POS) frontend is built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. It follows enterprise UI/UX patterns including:
- **Clean UI & Standardized Components**: Standardized input heights (`h-10`), smooth animations (`framer-motion`), rich popovers, and accessible modals.
- **Global Modular Tabs**: Reusable `WorkspaceTabs.tsx` to standardize top navigation across Catalog, Inventory, Customers, and Orders.
- **Dynamic Columns**: Customizable table column visibility saved in localStorage via `ColumnSettingsPopover.tsx`.
- **Full 5-Language Localization**: React-i18next setup supporting Khmer (`km`), English (`en`), Chinese (`zh`), Thai (`th`), and Vietnamese (`vi`).

---

# 🖥️ Frontend Architecture (Merchant Webclient & POS - `merchant-khposcommerce`)

## 1. Overview & Principles

The Merchant Web Portal and Point of Sale (POS) frontend is located at `webclient/merchant-khposcommerce`. It is built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**, designed for high-performance retail operations, multi-channel inventory management, and omni-channel order fulfillment.

Key architecture principles:
- **Clean UI & Standardized Components**: Standardized input heights (`h-10`), smooth animations (`framer-motion`), rich popovers, and accessible modals (Radix UI & Tailwind).
- **Global Modular Tabs**: Reusable `WorkspaceTabs.tsx` to standardize top navigation across Catalog, Inventory, Customers, Orders, and Settings.
- **Dynamic Columns & Enterprise Tables**: Customizable table column visibility saved in localStorage via `ColumnSettingsPopover.tsx`, unified pagination, and filter drawers.
- **Bakong KHQR & POS Payment Support**: Direct QR code generation (`bakong-khqr`) with sound alerts and instant payment verification.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions checking via `usePermission.ts`, `permissionUtils.ts`, and `ProtectedRoute.tsx`.
- **Full Localization (i18n)**: Modular domain-based translation files supporting Khmer (`km` as primary/default) and English (`en`).
- **High-Performance State Management**: Clean combination of **Zustand** for global client states (Auth, Company, Theme, Toast, Notification) and **TanStack Query** for asynchronous server states.

---

## 2. Directory Structure (`webclient/merchant-khposcommerce/`)

```text
webclient/merchant-khposcommerce/
├── Dockerfile                        # Multi-stage production container build
├── nginx.conf                        # Nginx reverse proxy & SPA routing fallback
├── components.json                   # UI component registry configuration
├── index.html                        # Application HTML entry point & font links
├── package.json                      # Dependencies (React 19, Vite, Zustand, etc.)
├── tailwind.config.js                # Custom design system tokens, themes & colors
├── tsconfig.json                     # TypeScript workspace compiler settings
├── vite.config.ts                    # Vite build pipeline, aliases (@/*), proxy rules
│
├── public/                           # Static assets, branding & PWA manifests
│   ├── favicon.ico / favicon.svg     # App favicons
│   ├── images/                       # Default fallback images (product, brand, avatar)
│   ├── logo.png / nexpos-logo.jpg    # Platform branding logos
│   └── site.webmanifest              # Web application manifest
│
└── src/
    ├── App.tsx                       # Root React provider shell & theme wrapper
    ├── main.tsx                      # Vite React entry point & DOM mounting
    ├── index.css                     # Global Tailwind styling, CSS variables & fonts
    │
    ├── api/                          # HTTP Network Layer
    │   └── client.ts                 # Axios instance with auth interceptors, tenant header & refresh
    │
    ├── assets/                       # Bundled static images, SVGs and icons
    │
    ├── components/                   # Modular Component Library
    │   ├── common/                   # Shared Reusable Business Components
    │   │   ├── DataTable.tsx         # Enterprise data table with sort & selection
    │   │   ├── PageHeader.tsx        # Standardized page headers with action buttons
    │   │   ├── FormDrawer.tsx        # Slide-over form drawer for quick create/edit
    │   │   ├── FormField.tsx         # Unified label, input, and error wrapper
    │   │   ├── Modal.tsx             # Accessible dialogs with header/footer
    │   │   ├── ConfirmModal.tsx      # Confirmation dialog for critical operations
    │   │   ├── DeleteConfirmDialog.tsx # Standardized destructive action prompt
    │   │   ├── EmptyState.tsx        # Standard empty state illustration & action
    │   │   ├── Breadcrumb.tsx        # Module navigation trail
    │   │   ├── StatsCard.tsx         # Metric summary card with trends
    │   │   ├── StatusBadge.tsx       # Standardized status chips (Active, Pending...)
    │   │   ├── RichTextEditor.tsx    # WYSIWYG editor for CMS & product descriptions
    │   │   ├── DatePicker.tsx        # Localized calendar date selector
    │   │   ├── FileUpload.tsx        # Drag-and-drop media upload
    │   │   └── ExportDropdown.tsx    # Excel/CSV data exporter
    │   │
    │   ├── layout/                   # Application Shell & Layout Components
    │   │   ├── AdminLayout.tsx       # Master layout with responsive sidebar & topnav
    │   │   ├── Header.tsx            # Global topbar with search, notifications & user menu
    │   │   ├── HeaderSearch.tsx      # Global omnichannel spotlight search
    │   │   ├── HeaderActions.tsx     # Quick action shortcuts bar
    │   │   ├── LanguageDropdown.tsx  # Locale switcher (Khmer / English)
    │   │   ├── NotificationDropdown.tsx # Real-time alerts & activity feed
    │   │   ├── ProfileDropdown.tsx   # User profile menu, preferences & sign out
    │   │   ├── QuickActionDropdown.tsx  # Fast shortcut creation (New Sale, New Product)
    │   │   ├── SwitchAccountModal.tsx   # Branch & store tenant switcher
    │   │   ├── ThemeSwitcher.tsx     # Dark / light / system mode toggle
    │   │   └── Footer.tsx            # Application footer & copyright
    │   │
    │   ├── shared/                   # Enterprise Workspace & Table Widgets
    │   │   ├── WorkspaceTabs.tsx     # Animated module tabs (e.g., Products, Brands, Units)
    │   │   ├── SearchInput.tsx       # Standardized rounded search input (h-10)
    │   │   ├── ModernSelect.tsx      # Custom searchable dropdown selector
    │   │   ├── ColumnSettingsPopover.tsx # Table column visibility manager
    │   │   ├── FilterDrawerShell.tsx # Slide-out comprehensive filter panel
    │   │   ├── TableWrapper.tsx      # Responsive scrollable table container & loader
    │   │   ├── TableActionMenu.tsx   # Row-level actions dropdown (Edit, View, Delete)
    │   │   ├── Pagination.tsx        # Server-side pagination controls
    │   │   ├── BulkSelectionBanner.tsx # Floating bulk action toolbar (Delete, Export)
    │   │   ├── AnimatedCounter.tsx   # Smooth numeric KPI counter animation
    │   │   ├── TopProgressBar.tsx    # Top loading bar during page navigations
    │   │   └── NetworkStatusListener.tsx # Online/offline connectivity listener
    │   │
    │   └── ui/                       # Primitive UI Design System (Radix + Tailwind)
    │       ├── button.tsx            # Button variants (primary, outline, ghost, destructive)
    │       ├── dialog.tsx            # Accessible modal dialog primitive
    │       ├── dropdown-menu.tsx     # Context & trigger dropdown menus
    │       ├── popover.tsx           # Floating popover primitive
    │       ├── sheet.tsx             # Slide-over sheets (Drawers)
    │       ├── tabs.tsx              # Segmented tabs primitive
    │       ├── tooltip.tsx           # Hover tooltips
    │       ├── card.tsx              # Card containers with header/content/footer
    │       ├── badge.tsx             # Numeric and text badges
    │       ├── input.tsx             # Form text inputs
    │       ├── switch.tsx            # Toggle switch
    │       ├── qr-code.tsx           # QR code renderer for Bakong payments
    │       └── ToastContainer.tsx    # Toast notification portal
    │
    ├── config/                       # Application Configuration
    │   └── dashboardWidgets.ts       # Configurable dashboard widget layouts & metrics
    │
    ├── hooks/                        # Custom React Hooks
    │   ├── useAuth.ts                # Current user credentials & login session
    │   ├── usePermission.ts          # Granular RBAC permission checks
    │   ├── useToast.ts               # Programmatic toast dispatchers
    │   ├── useServerPagination.ts    # Unified server-side pagination & sort query hook
    │   ├── useDebounce.ts            # Input debounce hook for search queries
    │   └── usePageTab.ts             # Workspace tab state synchronized with URL
    │
    ├── lib/                          # Third-party Library Initializers
    │   ├── i18n.ts                   # i18next configuration, fallback & namespace loader
    │   └── utils.ts                  # Classnames merge (`cn`) and DOM helpers
    │
    ├── locales/                      # Modular Translation Namespaces
    │   ├── km/                       # Khmer (Default)
    │   └── en/                       # English
    │       (Divided into domain files: auth, common, dashboard, pos, products,
    │        inventory, orders, customers, suppliers, purchases, finance,
    │        sales, marketing, settings, shipping, company, reports, etc.)
    │
    ├── pages/                        # Feature Pages & Domain Modules
    │   ├── dashboard/                # Real-time analytics, KPIs, sales charts & shortcuts
    │   ├── pos/                      # High-speed POS Register, Cart, Bakong KHQR & Split Pay
    │   ├── products/                 # Product Catalog, Variants, Attributes & Barcodes
    │   ├── categories/               # Multi-level Category tree & hierarchy management
    │   ├── brands/                   # Brand catalog & manufacturer directory
    │   ├── attributes/               # Dynamic product variants (Sizes, Colors, Weights)
    │   ├── inventory/                # Stock levels, movements, batch tracking & transfers
    │   ├── orders/                   # Omnichannel order list, invoice generation & status
    │   ├── purchases/                # Supplier purchase orders (PO), receiving & costs
    │   ├── sales/                    # Historical sales records & register shift logs
    │   ├── customers/                # CRM customer directory, purchase history & loyalty
    │   ├── suppliers/                # Vendor management, contacts & purchase terms
    │   ├── finance/                  # Cash flow ledger, income/expense tracking
    │   ├── expenses/                 # Operational expense vouchers & receipt uploads
    │   ├── payroll/                  # Staff payroll, compensation & pay slip records
    │   ├── employees/                # Employee directory, store assignments & schedules
    │   ├── roles/                    # User roles management (Admin, Cashier, Manager)
    │   ├── permissions/              # Granular RBAC capabilities matrix
    │   ├── users/                    # System user accounts, credentials & status
    │   ├── company/                  # Company settings, branches, warehouses & stores
    │   ├── marketing/                # Campaigns, Coupons, Flash Sales, Banners & Rules
    │   ├── cms/                      # Storefront CMS (Static pages, banners, policies)
    │   ├── chatbot/                  # Customer service AI chatbot configuration
    │   ├── reviews/                  # Customer ratings & product reviews moderation
    │   ├── shipping/                 # Delivery carriers, shipping zones & rates
    │   ├── payments/                 # Payment gateways (Bakong KHQR, Cash, Card, Bank)
    │   ├── reports/                  # BI Reports: Sales, Inventory, Tax, Purchases & P&L
    │   ├── notifications/            # Notification center, message templates & channels
    │   ├── logs/                     # System activity audit logs & security traces
    │   ├── security/                 # Two-factor authentication (2FA) & active sessions
    │   ├── recycle-bin/              # Soft-deleted item recovery & purge
    │   ├── settings/                 # General merchant store configurations & tax rules
    │   ├── profile/                  # Personal profile, language & security preferences
    │   └── auth/                     # Sign In, Forgot Password, Reset Password views
    │
    ├── routes/                       # Routing Infrastructure
    │   ├── AppRoutes.tsx             # React Router definitions with lazy-loaded views
    │   ├── guards/                   # Navigation Guards
    │   │   ├── ProtectedRoute.tsx    # Auth and RBAC permission route guard
    │   │   └── PublicRoute.tsx       # Auth redirect guard for login pages
    │   └── components/
    │       └── PageFallback.tsx      # Suspense spinner for lazy route chunks
    │
    ├── services/                     # Business Logic & Backend API Services
    │   ├── authService.ts            # Authentication, refresh token & session API
    │   ├── productService.ts         # Products, variants, barcodes & bulk import
    │   ├── categoryService.ts        # Category hierarchy CRUD
    │   ├── brandService.ts           # Brands CRUD & logo uploads
    │   ├── inventoryService.ts       # Stock adjustments, transfers & audit checks
    │   ├── orderService.ts           # Order creation, status updates & invoicing
    │   ├── posService.ts             # POS cart checkout, register shift & cash drawer
    │   ├── bakongService.ts          # Bakong KHQR payment generation & status polling
    │   ├── customerService.ts        # Customer profiles, groups & loyalty points
    │   ├── supplierService.ts        # Supplier contracts & contact management
    │   ├── purchaseService.ts        # Purchase order processing & receiving
    │   ├── expenseService.ts         # Expense records & categorization
    │   ├── financeService.ts         # Financial reports & cash movements
    │   ├── reportService.ts          # Aggregated sales & inventory analytics
    │   ├── companyService.ts         # Store, warehouse & branch profiles
    │   ├── employeeService.ts        # Employee records & store assignments
    │   ├── roleService.ts            # Roles & permissions management
    │   ├── marketingService.ts       # Promotions, flash sales & coupon vouchers
    │   ├── cmsService.ts             # Storefront page content & banner management
    │   ├── shippingService.ts        # Shipping methods, zones & fee computation
    │   ├── notificationService.ts    # Notification dispatch & read receipts
    │   └── activityLogService.ts     # User audit trails & change logs
    │
    ├── stores/                       # Global Client State Management (Zustand)
    │   ├── authStore.ts              # Authenticated user, tokens & permissions
    │   ├── companyStore.ts           # Current active company, store & branch tenant
    │   ├── themeStore.ts             # Theme mode (light / dark / auto)
    │   ├── toastStore.ts             # Toast notifications queue
    │   ├── notificationStore.ts      # Unread notification counters & incoming alerts
    │   └── navigationProgressStore.ts# Page transition progress bar state
    │
    ├── types/                        # Global TypeScript Type Definitions
    │   └── bakong-khqr.d.ts          # Bakong KHQR SDK type definitions
    │
    └── utils/                        # Shared Utility Functions
        ├── formatters.ts             # Currency (KHR/USD), date, number & phone formatting
        ├── globalFormat.ts           # Global currency symbols & date localization
        ├── formValidation.ts         # Form validation rules & regex schemas
        ├── export.ts                 # CSV / Excel export data conversion
        ├── permissionUtils.ts        # Permission flag checking logic
        ├── sound.ts                  # Audio feedback (POS barcode beep & cash register)
        ├── geofence.ts               # Store location & GPS coordinates calculation
        ├── aiCmsGenerator.ts         # AI helper for SEO meta and page descriptions
        ├── image.ts                  # Image compression, resizing & URL helpers
        └── toast.ts                  # Toast helper functions
```

---

## 3. Core Component Standards

### 3.1 Global Workspace Tabs (`WorkspaceTabs.tsx`)
Provides smooth tab navigation with active underline animations and optional badge counters.

```tsx
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'

<WorkspaceTabs
  tabs={[
    { id: 'products', label: t('products.allProducts'), icon: Package, count: 1250 },
    { id: 'categories', label: t('products.categories'), icon: FolderTree },
    { id: 'brands', label: t('products.brands'), icon: Tag },
    { id: 'units', label: t('products.units'), icon: Scale },
    { id: 'attributes', label: t('products.attributes'), icon: Sliders },
    { id: 'taxes', label: t('products.taxes'), icon: Percent },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### 3.2 Standardized Search & Filter Bar (`SearchInput.tsx` & `ResetButton.tsx`)
Ensures uniform height (`h-10`), rounded corners (`rounded-xl`), and integrated clear buttons across all modules.

```tsx
<div className="flex items-center gap-2.5">
  <SearchInput
    value={search}
    onChange={(val) => { setSearch(val); setPage(1); }}
    placeholder="products.searchPlaceholder"
  />

  <select
    value={statusFilter}
    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
    className="h-10 px-3.5 text-xs font-semibold rounded-xl border border-border bg-card text-foreground shadow-sm"
  >
    <option value="all">{t('common.allStatus')}</option>
    <option value="active">{t('common.active')}</option>
    <option value="inactive">{t('common.inactive')}</option>
  </select>

  <ResetButton onClick={handleReset} />
</div>
```

---

## 4. Internationalization Architecture (i18n)

Translations are organized into domain namespaces:
- `common.json`: Generic actions (`save`, `cancel`, `delete`, `reset`, `filter`, `status`, `active`, `inactive`).
- `products.json`: Product catalog, categories, brands, variants, SKU, taxes.
- `inventory.json`: Warehouse locations, stock movements, transfers, adjustments, cycle counts.
- `pos.json`: Cart, tender types, split payments, cash drawer, receipt templates.
- `orders.json`: Order statuses, tracking, shipping, fulfillment.
- `customers.json`: Customer profiles, loyalty tiers, transaction histories.
