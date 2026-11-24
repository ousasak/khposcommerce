# 🏬 រចនាសម្ព័ន្ធគម្រោង (Project Structure) - `merchant-khposcommerce`

ឯកសារនេះពិពណ៌នាអំពីស្ថាបត្យកម្ម និងរចនាសម្ព័ន្ធ Folders/Files នៃប្រព័ន្ធ **Merchant Web Portal & POS (`merchant-khposcommerce`)** សម្រាប់គ្រប់គ្រងអាជីវកម្ម កាតាឡុកទំនិញ សន្និធិ ការបញ្ជាទិញ ហិរញ្ញវត្ថុ និងប្រព័ន្ធលក់នៅបញ្ជរ (POS) ជាមួយការទូទាត់តាមរយៈ Bakong KHQR។

---

## 🛠️ បច្ចេកវិទ្យាស្នូល (Tech Stack)

| Category | Technology / Library | Description |
| :--- | :--- | :--- |
| **Framework** | **React 19** + **TypeScript** | UI Component Architecture & Strict Typing |
| **Build Tool** | **Vite 8** | High-speed HMR, ES modules bundler & Proxy |
| **Styling** | **Tailwind CSS 3.4** + `tailwindcss-animate` | Utility-first CSS & Smooth Animations |
| **UI Components** | **Radix UI** + **MUI Date Pickers** | Unstyled accessible primitives & Enterprise Pickers |
| **State Management** | **Zustand 5** + **TanStack Query 5** | Client State (Auth/Theme) & Server Cache/Sync |
| **Icons & Motion** | **Lucide React** + **Framer Motion 12** | Modern iconography & micro-interactions |
| **Forms & Validation** | **React Hook Form** + **Zod** | Performant form controls with schema validation |
| **Payments & Scanning** | `bakong-khqr`, `html5-qrcode`, `@zxing/library` | Cambodian Bakong QR payments & barcode scanner |
| **Internationalization** | **i18next** + **react-i18next** | Multi-language support (Khmer `km` & English `en`) |
| **Charts & Analytics** | **Recharts** | Interactive business metrics & revenue reports |

---

## 📐 រចនាសម្ព័ន្ធមែកធាងទាំងមូល (Full Directory Tree)

```text
webclient/merchant-khposcommerce/
├── Dockerfile                        # Multi-stage production container build
├── nginx.conf                        # Nginx reverse proxy & SPA routing fallback
├── components.json                   # UI component registry configuration
├── index.html                        # Application HTML entry point & font links
├── package.json                      # Dependencies & NPM scripts (dev, build, lint)
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
    ├── services/                     # Business Logic & Backend API Services (35+ Services)
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

## 🧩 ការពន្យល់អំពី Modules សំខាន់ៗ (Core Modules Explanation)

### 1. ស្រទាប់ API & Services (`src/api/` & `src/services/`)
- `api/client.ts`: គ្រប់គ្រង instance របស់ Axios ដោយចាក់បញ្ចូល Header `Authorization: Bearer <token>` និង `x-tenant-id` ដោយស្វ័យប្រវត្តិ ព្រមទាំង interceptors ចាប់យកករណី `401 Unauthorized` ដើម្បីធ្វើ token refresh ឬ auto logout។
- `services/`: ផ្ទុកទៅដោយសេវាកម្មដាច់ដោយឡែកតាម domain និមួយៗ (Product, Order, Inventory, POS, Bakong, ...) ងាយស្រួលក្នុងការ maintain និង reusable។

### 2. ប្រព័ន្ធ POS & ការទូទាត់ (`src/pages/pos/` & `src/services/bakongService.ts`)
- **Cart & Fast Register**: គាំទ្រការ scan barcode, ការបន្ថែមទំនិញលឿន, discount per item/bill។
- **Bakong KHQR**: បង្កើត dynamic/static QR code តាមស្តង់ដារធនាគារជាតិនៃកម្ពុជា ជាមួយ auto-polling status និង sound feedback ពេលទូទាត់ជោគជ័យ។
- **Split Payment**: គាំទ្រការបង់ប្រាក់ចម្រុះ (សាច់ប្រាក់ Cash + KHQR + Card)។

### 3. ការគ្រប់គ្រងសន្និធិ និងកាតាឡុក (`src/pages/products/` & `src/pages/inventory/`)
- គាំទ្រ Varianted Products (ច្រើនទំហំ ពណ៌ និង attributes)។
- ការតាមដានចំនួនស្តុកតាមសាខា (Multi-Branch/Warehouse), ការកែតម្រូវស្តុក (Adjustment), ការផ្ទេរស្តុក (Stock Transfer) និងការជូនដំណឹងពេលជិតអស់ស្តុក (Low Stock Alert)។

### 4. សុវត្ថិភាព និងការកំណត់សិទ្ធិ (`src/pages/roles/` & `src/hooks/usePermission.ts`)
- គ្រប់គ្រង Role-Based Access Control (RBAC) ជាមួយ granular permissions (Read, Create, Update, Delete per module)។
- Route Guard តាមរយៈ `ProtectedRoute.tsx` ការពារមិនឱ្យ User គ្មានសិទ្ធិចូលមើលទំព័រដែលបានកំណត់។

### 5. ពហុភាសា (Localization - `src/locales/`)
- បំបែក JSON files តាម domain ដូចជា `km/` (ភាសាខ្មែរជាភាសាដើម) និង `en/` (ភាសាអង់គ្លេស) ធ្វើឱ្យ file មិនធ្ងន់ និងងាយស្រួល edit ទៅតាមផ្នែកនីមួយៗ (auth, common, pos, orders, products, ...etc.)។
