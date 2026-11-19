<?php

namespace Database\Seeders;

use App\Models\CMS\Testimonial;
use App\Models\Company\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;

        if (Schema::hasTable('testimonials')) {
            if (DB::getDriverName() === 'pgsql') {
                DB::statement('TRUNCATE TABLE testimonials RESTART IDENTITY CASCADE');
            } else {
                DB::statement('SET FOREIGN_KEY_CHECKS=0');
                DB::table('testimonials')->truncate();
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
        }

        $records = [
            [
                'company_id'  => $companyId,
                'author_name' => 'សុខ វិបុល',
                'role'        => 'CEO & Founder',
                'company'     => 'Angkor Mart Co., Ltd',
                'avatar'      => '/images/users/user-01.jpg',
                'rating'      => 5,
                'comment'     => 'OptaPOS បានជួយបង្កើនប្រសិទ្ធភាពការលក់ និងគ្រប់គ្រងស្តុកតាមសាខាទាំង ៥ បានយ៉ាងរលូន។ ការបញ្ជាទិញ និងទូទាត់ប្រាក់រហ័ស មិនដែលជួបបញ្ហាខ្វះស្តុកទៀតទេ!',
                'is_featured' => true,
                'is_active'   => true,
                'sort_order'  => 1,
                'created_at'  => now()->subDays(2),
                'updated_at'  => now()->subDays(2),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'លី ស្រីមុំ',
                'role'        => 'Store Manager',
                'company'     => 'Phnom Penh Tech Hub',
                'avatar'      => '/images/users/user-02.jpg',
                'rating'      => 5,
                'comment'     => 'ការទូទាត់ប្រាក់តាម KHQR លឿនរហ័ស និងប្រព័ន្ធ E-Commerce ធ្វើឱ្យអតិថិជនកុម្ម៉ង់ទិញអនឡាញកាន់តែច្រើន។ ប្រព័ន្ធដំណើរការរលូន និងមិនដែលគាំងឡើយ!',
                'is_featured' => true,
                'is_active'   => true,
                'sort_order'  => 2,
                'created_at'  => now()->subDays(3),
                'updated_at'  => now()->subDays(3),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'គឹម ហេង',
                'role'        => 'Operations Director',
                'company'     => 'Battambang Retail Express',
                'avatar'      => '/images/users/user-03.jpg',
                'rating'      => 5,
                'comment'     => 'របាយការណ៍ និងស្ថិតិលក់លម្អិតខ្លាំង ងាយស្រួលផ្ទៀងផ្ទាត់ចំណូលចំណាយប្រចាំថ្ងៃ និងតាមដានបុគ្គលិកវេនលក់។ ក្រុមការងារ Support ឆ្លើយតបរហ័សទាន់ចិត្ត!',
                'is_featured' => true,
                'is_active'   => true,
                'sort_order'  => 3,
                'created_at'  => now()->subDays(5),
                'updated_at'  => now()->subDays(5),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'ចាន់ ធីតា',
                'role'        => 'ម្ចាស់ហាង',
                'company'     => 'Thida Fashion & Cosmetics',
                'avatar'      => '/images/users/user-04.jpg',
                'rating'      => 5,
                'comment'     => 'ប្រព័ន្ធ POS នេះងាយស្រួលប្រើប្រាស់មែនទែន បុគ្គលិកថ្មីរៀនតែ ១០ នាទីចេះប្រើភ្លាម។ មុខងារបោះពុម្ពវិក្កយបត្រ និង Scan Barcode ឆ្លើយតបលឿនបំផុត!',
                'is_featured' => true,
                'is_active'   => true,
                'sort_order'  => 4,
                'created_at'  => now()->subDays(7),
                'updated_at'  => now()->subDays(7),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'វ៉ាន់ សុភាព',
                'role'        => 'General Manager',
                'company'     => 'Kampot Organic Farm & Cafe',
                'avatar'      => '/images/users/user-05.jpg',
                'rating'      => 5,
                'comment'     => 'អស្ចារ្យណាស់សម្រាប់ការគ្រប់គ្រងសាខាច្រើនកន្លែងក្នុងពេលតែមួយ។ អាចមើលរបាយការណ៍លក់តាមទូរស័ព្ទដៃបានគ្រប់ពេលវេលា និងមានសុវត្ថិភាពខ្ពស់។',
                'is_featured' => true,
                'is_active'   => true,
                'sort_order'  => 5,
                'created_at'  => now()->subDays(9),
                'updated_at'  => now()->subDays(9),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'អ៊ុង វណ្ណដា',
                'role'        => 'Sales Manager',
                'company'     => 'Siem Reap Souvenir & Craft',
                'avatar'      => '/images/users/user-06.jpg',
                'rating'      => 4,
                'comment'     => 'កម្មវិធីជួយសន្សំពេលវេលាគិតលុយបានច្រើនពេលភ្ញៀវចូលច្រើន។ ប្រព័ន្ធផ្ញើសារដំណឹង និងការបញ្ចុះតម្លៃ Promotion ធ្វើការបានល្អឥតខ្ចោះ។',
                'is_featured' => false,
                'is_active'   => true,
                'sort_order'  => 6,
                'created_at'  => now()->subDays(11),
                'updated_at'  => now()->subDays(11),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'ម៉េង ស្រីពៅ',
                'role'        => 'ម្ចាស់អាជីវកម្ម',
                'company'     => 'Sreypov Baby Care & Toys',
                'avatar'      => '/images/users/user-07.jpg',
                'rating'      => 5,
                'comment'     => 'ពេញចិត្តខ្លាំងលើមុខងារគ្រប់គ្រងស្តុក និងកាលបរិច្ឆេទផុតកំណត់នៃទំនិញ។ មិនបារម្ភរឿងទំនិញបាត់បង់ ឬផុតកំណត់ទៀតឡើយ។',
                'is_featured' => true,
                'is_active'   => true,
                'sort_order'  => 7,
                'created_at'  => now()->subDays(12),
                'updated_at'  => now()->subDays(12),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'សេង ពិសិដ្ឋ',
                'role'        => 'IT Consultant',
                'company'     => 'Mekong Digital Solutions',
                'avatar'      => '/images/users/user-08.jpg',
                'rating'      => 5,
                'comment'     => 'API ស្អាត និងលឿន ងាយស្រួលភ្ជាប់ជាមួយប្រព័ន្ធខាងក្រៅ និង Web Storefront។ Database មានស្ថេរភាពខ្ពស់ និង Backup ស្វ័យប្រវត្តិកក់ក្តៅចិត្ត។',
                'is_featured' => false,
                'is_active'   => true,
                'sort_order'  => 8,
                'created_at'  => now()->subDays(14),
                'updated_at'  => now()->subDays(14),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'ហេង ចិន្តា',
                'role'        => 'ម្ចាស់ឱសថស្ថាន',
                'company'     => 'Chenda Health & Pharmacy',
                'avatar'      => '/images/users/user-09.jpg',
                'rating'      => 4,
                'comment'     => 'ការស្វែងរកទំនិញតាមលេខកូដ និងឈ្មោះរហ័ស គិតលុយមិនស្ទះជួរ។ វិក្កយបត្រមាន QR Code ងាយស្រួលអតិថិជនស្កេនទូទាត់ប្រាក់ភ្លាមៗ។',
                'is_featured' => false,
                'is_active'   => true,
                'sort_order'  => 9,
                'created_at'  => now()->subDays(16),
                'updated_at'  => now()->subDays(16),
            ],
            [
                'company_id'  => $companyId,
                'author_name' => 'តាំង គង់ស្រ៊ុន',
                'role'        => 'Operations Manager',
                'company'     => 'Sihanoukville Mini Mart',
                'avatar'      => '/images/users/user-10.jpg',
                'rating'      => 5,
                'comment'     => 'សេវាកម្ម និងប្រព័ន្ធពិតជាស្តង់ដារអន្តរជាតិ។ ចាប់តាំងពីប្រើ KHPosCommerce មក ចំណូលកើនឡើងដោយសារមិនបាត់បង់ទិន្នន័យ និងគ្រប់គ្រងលុយច្បាស់លាស់!',
                'is_featured' => true,
                'is_active'   => true,
                'sort_order'  => 10,
                'created_at'  => now()->subDays(18),
                'updated_at'  => now()->subDays(18),
            ],
        ];

        DB::table('testimonials')->insert($records);
    }
}

