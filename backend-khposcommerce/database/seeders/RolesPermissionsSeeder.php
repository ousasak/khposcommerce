<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ─── 1. Specialized & Core Domain Permissions ─────────────────────────
        $specialPermissions = [
            // Dashboard & Navigation
            'dashboard.view',
            'pos.access',

            // Special Inventory Actions
            'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
            'inventory.adjust', 'inventory.transfer', 'inventory.opname', 'inventory.export',
            'stock_adjustment.adjust', 'stock_adjustment.export',
            'stock_transfer.transfer', 'stock_transfer.export',
            'stock_opname.opname', 'stock_opname.export',
            'inventory_movement.export',

            // Purchase Special Actions
            'purchase.approve', 'purchase.export',
            'supplier.export',

            // Sales & POS Special Actions
            'sale.return', 'sale.refund', 'sale.export',
            'order.manage', 'order.refund', 'order.return',
            'cash_register.manage',
            'payment.process', 'payment.refund',

            // Customer Special Actions
            'customer.export',

            // Reports & Analytics
            'report.view', 'report.export',
            'reports.sales.view', 'reports.sales.export', 'reports.sales.detail',

            // Finance & Expenses
            'expense.approve', 'expense.export',
            'transaction.export',

            // Settings & Audit
            'setting.manage',
            'audit_log.export',

            // Catalog & Master Data Export / Import
            'category.export', 'category.import',
            'brand.export', 'brand.import',
            'unit.export', 'unit.import',
            'tax.export', 'tax.import',
            'product.export', 'product.import',
            'customer.import',
            'supplier.import',
            'expense_category.export',
            'currency.export',
            'payment_method.export',
            'role.export',
            'user.export',
            'permission.export',
            'holiday.export',
        ];

        // ─── 2. Standard CRUD Modules ─────────────────────────────────────────
        $tables = [
            'activity_log', 'attendance', 'attributes', 'attribute_values', 'audit_logs', 'banners', 'blogs', 
            'blog_categories', 'blog_tags', 'branches', 'brands', 'carts', 'cart_items', 
            'cash_registers', 'cash_register_transactions', 'categories', 'cities', 'companies', 'countries', 
            'coupons', 'currencies', 'customers', 'customer_addresses', 'customer_groups', 
            'departments', 'employees', 'expenses', 'expense_categories', 'faqs', 'flash_sales', 'holidays', 
            'inventories', 'inventory_movements', 'languages', 'login_histories', 'notification_logs', 'orders', 
            'order_items', 'order_status_histories', 'pages', 'payments', 'payment_methods', 'payrolls', 'permissions', 
            'positions', 'products', 'product_images', 'product_prices', 'product_reviews', 'product_variants', 
            'product_variant_values', 'promotions', 'provinces', 'purchases', 'purchase_items', 'purchase_returns', 
            'purchase_return_items', 'roles', 'sales', 'sale_items', 'sale_returns', 
            'sale_return_items', 'settings', 'shipments', 'shipping_methods', 'shipping_rates', 'shipping_zones', 
            'stock_adjustments', 'stock_adjustment_items', 'stock_opnames', 'stock_opname_items', 'stock_transfers', 
            'stock_transfer_items', 'stores', 'suppliers', 'supplier_contacts', 'taxes', 'transactions', 'units', 
            'users', 'warehouses', 'wishlists', 'shifts', 'leave_requests', 'notification_templates', 'notifications',
        ];

        $permissions = $specialPermissions;

        foreach ($tables as $table) {
            $singular = \Illuminate\Support\Str::singular($table);
            if ($table === 'attendance') $singular = 'attendance';
            $permName = \Illuminate\Support\Str::snake($singular);
            $actions = ['view', 'create', 'update', 'delete'];
            foreach ($actions as $action) {
                $permissions[] = "{$permName}.{$action}";
            }
        }

        $permissions = array_values(array_unique($permissions));

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'api']);
        }

        // ─── Owner (Business Owner - Full Access to All Branches) ─────────────
        // Note: super_admin role is REMOVED. 'owner' is the top-level role for the business owner.
        // If old 'super_admin' exists in DB, it will be left as-is until manually renamed.

        // ─── Owner (Company Owner - Full Access across their Company & All Branches) ─
        $owner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'api'], [
            'display_name'    => 'Owner',
            'display_name_km' => 'ម្ចាស់អាជីវកម្ម',
            'description'     => 'Full business owner privileges, managing store operations and financial scopes.',
            'description_km'  => 'តួនាទីម្ចាស់អាជីវកម្ម មានសិទ្ធិពេញលេញលើការគ្រប់គ្រងហាង និងហិរញ្ញវត្ថុ។',
            'is_system'       => true,
        ]);
        $excludedOwnerExact = [
            'company.create', 'company.delete',
            'currency.create', 'currency.delete',
            'language.create', 'language.delete',
            'country.create', 'country.delete',
        ];
        $ownerPermissions = Permission::where('guard_name', 'api')
            ->get()
            ->filter(function ($permission) use ($excludedOwnerExact) {
                return !in_array($permission->name, $excludedOwnerExact, true);
            });
        $owner->syncPermissions($ownerPermissions);

        // ─── Admin (Branch Admin - Branch Operational Scope, Excluded from System/Company) ─────
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api'], [
            'display_name'    => 'Administrator',
            'display_name_km' => 'អភិបាលប្រព័ន្ធ',
            'description'     => 'Full access to operational modules, store settings, and branch management.',
            'description_km'  => 'សិទ្ធិគ្រប់គ្រងលើម៉ូឌុលប្រតិបត្តិការ ការកំណត់ហាង និងការចាត់ចែងសាខា។',
            'is_system'       => true,
        ]);
        $excludedAdminPrefixes = [
            'role.', 'permission.', 'login_history.',
            'company.', 'setting.', 'platform.',
            'blog.', 'blog_category.', 'blog_tag.', 'page.', 'faq.',
        ];
        $excludedAdminExact = [
            'company.create', 'company.update', 'company.delete',
            'branch.create', 'branch.delete',
            'warehouse.create', 'warehouse.delete',
            'user.delete',
            'setting.create', 'setting.delete', 'setting.manage',
            'currency.create', 'currency.update', 'currency.delete', 'currency.export',
            'language.create', 'language.update', 'language.delete',
            'country.create', 'country.update', 'country.delete',
            'province.create', 'province.update', 'province.delete',
            'city.create', 'city.update', 'city.delete',
            'audit_log.delete',
        ];

        $adminPermissions = Permission::where('guard_name', 'api')
            ->get()
            ->filter(function ($permission) use ($excludedAdminPrefixes, $excludedAdminExact) {
                if (in_array($permission->name, $excludedAdminExact, true)) {
                    return false;
                }
                foreach ($excludedAdminPrefixes as $prefix) {
                    if (str_starts_with($permission->name, $prefix)) {
                        return false;
                    }
                }
                return true;
            });
        $admin->syncPermissions($adminPermissions);

        // ─── Manager (Operational Management) ─────────────────────────────────
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'api'], [
            'display_name'    => 'Manager',
            'display_name_km' => 'អ្នកគ្រប់គ្រង',
            'description'     => 'Store operations oversight, inventory management, and employee management.',
            'description_km'  => 'ត្រួតពិនិត្យប្រតិបត្តិការហាង ការគ្រប់គ្រងស្តុកទំនិញ និងការចាត់ចែងបុគ្គលិក។',
            'is_system'       => true,
        ]);
        $managerPermissions = [
            'dashboard.view',
            'pos.access',
            // Products & Catalog
            'product.view', 'product.create', 'product.update', 'product.export', 'product.import',
            'category.view', 'category.create', 'category.update', 'category.export', 'category.import',
            'brand.view', 'brand.create', 'brand.update', 'brand.export', 'brand.import',
            'unit.view', 'unit.create', 'unit.update', 'unit.export', 'unit.import',
            'tax.view', 'tax.create', 'tax.update', 'tax.export', 'tax.import',
            'attribute.view', 'attribute.create', 'attribute.update',
            // Inventory & Warehouses
            'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.opname', 'inventory.export',
            'stock_adjustment.view', 'stock_adjustment.create', 'stock_adjustment.update', 'stock_adjustment.adjust', 'stock_adjustment.export',
            'stock_transfer.view', 'stock_transfer.create', 'stock_transfer.update', 'stock_transfer.transfer', 'stock_transfer.export',
            'stock_opname.view', 'stock_opname.create', 'stock_opname.update', 'stock_opname.opname', 'stock_opname.export',
            'inventory_movement.view', 'warehouse.view',
            // Purchases & Suppliers
            'purchase.view', 'purchase.create', 'purchase.update', 'purchase.approve', 'purchase.export',
            'supplier.view', 'supplier.create', 'supplier.update', 'supplier.export', 'supplier.import',
            'purchase_return.view', 'purchase_return.create', 'purchase_return.update',
            // Sales, POS & Orders
            'sale.view', 'sale.create', 'sale.update', 'sale.return', 'sale.refund', 'sale.export',
            'order.view', 'order.create', 'order.update', 'order.manage', 'order.refund', 'order.return',
            'cash_register.view', 'cash_register.manage', 'cash_register_transaction.view',
            'payment.view', 'payment.process', 'payment.refund',
            // Customers
            'customer.view', 'customer.create', 'customer.update', 'customer.export', 'customer.import',
            'customer_group.view', 'customer_group.create', 'customer_group.update',
            'customer_address.view',
            // Reports & Analytics
            'report.view', 'report.export',
            'reports.sales.view', 'reports.sales.export', 'reports.sales.detail',
            // Expenses & Finance
            'expense.view', 'expense.create', 'expense.update', 'expense.approve', 'expense.export',
            'expense_category.view', 'transaction.view', 'transaction.export',
            // Marketing
            'coupon.view', 'coupon.create', 'coupon.update',
            'promotion.view', 'promotion.create', 'promotion.update',
            'flash_sale.view', 'banner.view',
            // Company & Employees
            'branch.view', 'store.view', 'shipment.view',
            'employee.view', 'attendance.view', 'holiday.view', 'department.view', 'position.view',
        ];
        $manager->syncPermissions(
            Permission::where('guard_name', 'api')->whereIn('name', $managerPermissions)->get()
        );

        // ─── Cashier ──────────────────────────────────────────────────────────
        $cashier = Role::firstOrCreate(['name' => 'cashier', 'guard_name' => 'api'], [
            'display_name'    => 'Cashier',
            'display_name_km' => 'បេឡាករ',
            'description'     => 'Point of sale order processing, cashier shift balancing, and receipt printing.',
            'description_km'  => 'ដំណើរការការលក់នៅបញ្ជរ POS ការគ្រប់គ្រងវេនបេឡា និងការបោះពុម្ពវិក្កយបត្រ។',
            'is_system'       => true,
        ]);
        $cashierPermissions = [
            'dashboard.view',
            'pos.access',
            'product.view',
            'category.view',
            'brand.view',
            'unit.view',
            'inventory.view',
            'sale.view', 'sale.create', 'sale.return',
            'order.view', 'order.create', 'order.update', 'order.manage',
            'customer.view', 'customer.create',
            'cash_register.view', 'cash_register.manage', 'cash_register_transaction.view',
            'payment.view', 'payment.process',
        ];
        $cashier->syncPermissions(
            Permission::where('guard_name', 'api')->whereIn('name', $cashierPermissions)->get()
        );

        // ─── Warehouse Staff ──────────────────────────────────────────────────
        $warehouse = Role::firstOrCreate(['name' => 'warehouse_staff', 'guard_name' => 'api'], [
            'display_name'    => 'Warehouse Staff',
            'display_name_km' => 'បុគ្គលិកឃ្លាំង',
            'description'     => 'Warehouse stock intake, transfers, inventory adjustments, and supply chain tracking.',
            'description_km'  => 'ទទួលទំនិញចូលស្តុក ការផ្ទេរទំនិញ ការកែតម្រូវចំនួនស្តុក និងតាមដានខ្សែច្រវាក់ផ្គត់ផ្គង់។',
            'is_system'       => true,
        ]);
        $warehousePermissions = [
            'dashboard.view',
            'product.view', 'category.view', 'brand.view', 'unit.view',
            'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.opname',
            'stock_adjustment.view', 'stock_adjustment.create', 'stock_adjustment.update', 'stock_adjustment.adjust',
            'stock_transfer.view', 'stock_transfer.create', 'stock_transfer.update', 'stock_transfer.transfer',
            'stock_opname.view', 'stock_opname.create', 'stock_opname.update', 'stock_opname.opname',
            'inventory_movement.view',
            'warehouse.view',
            'purchase.view', 'purchase_return.view', 'supplier.view', 'shipment.view',
        ];
        $warehouse->syncPermissions(
            Permission::where('guard_name', 'api')->whereIn('name', $warehousePermissions)->get()
        );

        // ─── Staff (General Branch Frontline Staff) ───────────────────────────
        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'api'], [
            'display_name'    => 'Staff',
            'display_name_km' => 'បុគ្គលិកទូទៅ',
            'description'     => 'Standard staff duties, order fulfillment, and basic customer assistance.',
            'description_km'  => 'បំពេញភារកិច្ចបុគ្គលិកទូទៅ ការរៀបចំទំនិញបញ្ជាទិញ និងជួយសម្រួលដល់អតិថិជន។',
            'is_system'       => true,
        ]);
        $staffPermissions = [
            'dashboard.view',
            'product.view', 'category.view', 'brand.view', 'unit.view',
            'inventory.view',
            'sale.view', 'sale.create',
            'order.view', 'order.create',
            'customer.view', 'customer.create',
            'attendance.view',
        ];
        $staff->syncPermissions(
            Permission::where('guard_name', 'api')->whereIn('name', $staffPermissions)->get()
        );

        // ─── Customer (Storefront Only) ───────────────────────────────────────
        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api'], [
            'display_name'    => 'Customer',
            'display_name_km' => 'អតិថិជន',
            'description'     => 'Customer store profile, order history, loyalty points, and delivery addresses.',
            'description_km'  => 'ព័ត៌មានគណនីអតិថិជន ប្រវត្តិបញ្ជាទិញ ពិន្ទុសន្សំ និងអាសយដ្ឋានដឹកជញ្ជូន។',
            'is_system'       => true,
        ]);
        $customerPermissions = [
            'cart.view', 'cart.create', 'cart.update', 'cart.delete',
            'wishlist.view', 'wishlist.create', 'wishlist.delete',
            'customer_address.view', 'customer_address.create', 'customer_address.update', 'customer_address.delete',
            'product_review.create',
        ];
        $customer->syncPermissions(
            Permission::where('guard_name', 'api')->whereIn('name', $customerPermissions)->get()
        );

        // Final cache clear
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('Roles and permissions standardized and seeded successfully.');
    }
}
