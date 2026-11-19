<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        // ─── Single Business Mode ──────────────────────────────────────────
        // Seed exactly 1 company (the business owner's company)
        // Branches are physical locations/stores of this single business

        DB::table('companies')->truncate();
        DB::table('companies')->insert([
            'id'            => 1,
            'name'          => 'NexTech Cambodia Co., Ltd.',
            'slug'          => 'nextech-cambodia',
            'email'         => 'info@nextech-cambodia.com',
            'phone'         => '+855 71 888 999',
            'website'       => 'https://www.nextech-cambodia.com',
            'address'       => '#128, មហាវិថីព្រះនរោត្តម, សង្កាត់ចតុមុខ, ខណ្ឌដូនពេញ',
            'city'          => 'Khan Daun Penh',
            'province'      => 'Phnom Penh',
            'country'       => 'KH',
            'postal_code'   => '120200',
            'tax_number'    => 'K000000001',
            'currency_code' => 'USD',
            'timezone'      => 'Asia/Phnom_Penh',
            'language'      => 'km',
            'is_active'     => true,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // ─── Branches (3 physical locations of the same business) ──────────
        DB::table('branches')->truncate();
        $branches = [
            [
                'id'          => 1,
                'company_id'  => 1,
                'name'        => 'NexTech HQ - សាខាកណ្តាល (ភ្នំពេញ)',
                'code'        => 'BR-KH-A',
                'email'       => 'branchA@nextech-cambodia.com',
                'phone'       => '+855 71 888 999',
                'address'     => '#128, មហាវិថីព្រះនរោត្តម, សង្កាត់ចតុមុខ, ខណ្ឌដូនពេញ',
                'city'        => 'Khan Daun Penh',
                'province'    => 'Phnom Penh',
                'postal_code' => '120200',
                'is_main'     => true,
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'id'          => 2,
                'company_id'  => 1,
                'name'        => 'NexTech - សាខាត្បូងឃ្មុំ',
                'code'        => 'BR-KH-B',
                'email'       => 'branchB@nextech-cambodia.com',
                'phone'       => '+855 71 888 991',
                'address'     => 'ផ្លូវជាតិលេខ ៧, ភូមិជើងវត្ត, សង្កាត់សួង, ក្រុងសួង',
                'city'        => 'ក្រុងសួង (Suong)',
                'province'    => 'Tbong Khmum',
                'postal_code' => '030101',
                'is_main'     => false,
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'id'          => 3,
                'company_id'  => 1,
                'name'        => 'NexTech - សាខាសៀមរាប',
                'code'        => 'BR-KH-C',
                'email'       => 'branchC@nextech-cambodia.com',
                'phone'       => '+855 63 963 888',
                'address'     => 'ផ្លូវស៊ីវុត្ថា, សង្កាត់ស្វាយដង្គំ, ក្រុងសៀមរាប',
                'city'        => 'ក្រុងសៀមរាប',
                'province'    => 'Siem Reap',
                'postal_code' => '17252',
                'is_main'     => false,
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];
        DB::table('branches')->insert($branches);

        // ─── Stores (1 per branch — hybrid online+offline) ─────────────────
        DB::table('stores')->truncate();
        $stores = [
            [
                'id'          => 1,
                'company_id'  => 1,
                'branch_id'   => 1,
                'name'        => 'NexTech Store - ភ្នំពេញ',
                'slug'        => 'nextech-store-phnompenh',
                'domain'      => null,
                'email'       => 'store.a@nextech-cambodia.com',
                'phone'       => '+855 71 888 999',
                'address'     => '#128, មហាវិថីព្រះនរោត្តម, ខណ្ឌដូនពេញ',
                'logo'        => 'companies/logo_1789034319_6aa27f4fe25bf.png',
                'banner'      => 'banners/banner_hero_1.webp',
                'description' => 'NexTech Official Smart Retail Store - Phnom Penh',
                'type'        => 'hybrid',
                'is_active'   => true,
                'settings'    => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'id'          => 2,
                'company_id'  => 1,
                'branch_id'   => 2,
                'name'        => 'NexTech Store - ត្បូងឃ្មុំ',
                'slug'        => 'nextech-store-tbongkhmum',
                'domain'      => null,
                'email'       => 'store.b@nextech-cambodia.com',
                'phone'       => '+855 71 888 991',
                'address'     => 'ផ្លូវជាតិលេខ ៧, ក្រុងសួង',
                'logo'        => 'companies/logo_1789034319_6aa27f4fe25bf.png',
                'banner'      => 'banners/banner_hero_1.webp',
                'description' => 'NexTech Official Smart Retail Store - Tbong Khmum',
                'type'        => 'hybrid',
                'is_active'   => true,
                'settings'    => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'id'          => 3,
                'company_id'  => 1,
                'branch_id'   => 3,
                'name'        => 'NexTech Store - សៀមរាប',
                'slug'        => 'nextech-store-siemreap',
                'domain'      => null,
                'email'       => 'store.c@nextech-cambodia.com',
                'phone'       => '+855 63 963 888',
                'address'     => 'ផ្លូវស៊ីវុត្ថា, ក្រុងសៀមរាប',
                'logo'        => 'companies/logo_1789034319_6aa27f4fe25bf.png',
                'banner'      => 'banners/banner_hero_1.webp',
                'description' => 'NexTech Official Smart Retail Store - Siem Reap',
                'type'        => 'hybrid',
                'is_active'   => true,
                'settings'    => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];
        DB::table('stores')->insert($stores);

        // ─── Warehouses (1 per branch) ──────────────────────────────────────
        DB::table('warehouses')->truncate();
        $warehouses = [
            [
                'id'         => 1,
                'company_id' => 1,
                'branch_id'  => 1,
                'name'       => 'Phnom Penh Central Warehouse',
                'code'       => 'WH-KH-A',
                'address'    => '#128, មហាវិថីព្រះនរោត្តម, ខណ្ឌដូនពេញ',
                'city'       => 'Khan Daun Penh',
                'province'   => 'Phnom Penh',
                'phone'      => '+855 71 888 999',
                'pic_name'   => 'Heng Piseth',
                'is_main'    => true,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id'         => 2,
                'company_id' => 1,
                'branch_id'  => 2,
                'name'       => 'Tbong Khmum Regional Warehouse',
                'code'       => 'WH-KH-B',
                'address'    => 'ផ្លូវជាតិលេខ ៧, ក្រុងសួង',
                'city'       => 'ក្រុងសួង',
                'province'   => 'Tbong Khmum',
                'phone'      => '+855 71 888 991',
                'pic_name'   => 'Sok Dara',
                'is_main'    => false,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id'         => 3,
                'company_id' => 1,
                'branch_id'  => 3,
                'name'       => 'Siem Reap Northern Warehouse',
                'code'       => 'WH-KH-C',
                'address'    => 'ផ្លូវស៊ីវុត្ថា, ក្រុងសៀមរាប',
                'city'       => 'ក្រុងសៀមរាប',
                'province'   => 'Siem Reap',
                'phone'      => '+855 63 963 888',
                'pic_name'   => 'Chan Vanna',
                'is_main'    => false,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('warehouses')->insert($warehouses);

        // Reset PostgreSQL sequences
        if (DB::getDriverName() === 'pgsql') {
            foreach (['companies', 'branches', 'stores', 'warehouses'] as $table) {
                try {
                    DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false);");
                } catch (\Throwable $e) {}
            }
        }

        $this->command->info('✅ Single-Business CompanySeeder: 1 company + 3 branches + 3 stores + 3 warehouses seeded.');
    }
}
