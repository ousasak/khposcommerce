<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipping_zones', function (Blueprint $table) {
            if (!Schema::hasColumn('shipping_zones', 'code')) {
                $table->string('code', 50)->nullable()->after('name');
            }
            if (!Schema::hasColumn('shipping_zones', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('cities');
            }
        });

        // Known mapping for authentic Cambodian shipping zones
        $codeMap = [
            1  => 'ZONE_PP_METRO',
            2  => 'ZONE_KDL_BELT',
            3  => 'ZONE_SRP_TOURISM',
            4  => 'ZONE_BTB_TRADE',
            5  => 'ZONE_SHV_PORT',
            6  => 'ZONE_KPC_MEKONG',
            7  => 'ZONE_KPT_COASTAL',
            8  => 'ZONE_BMC_POIPET',
            9  => 'ZONE_SVR_BAVET',
            10 => 'ZONE_NE_MINING',
        ];

        $zones = DB::table('shipping_zones')->get();
        foreach ($zones as $zone) {
            $code = $codeMap[$zone->id] ?? null;
            if (!$code) {
                $slug = Str::slug($zone->name, '_');
                $code = !empty($slug) ? 'ZONE_' . strtoupper(substr($slug, 0, 15)) : ('ZONE_' . str_pad($zone->id, 3, '0', STR_PAD_LEFT));
            }

            DB::table('shipping_zones')->where('id', $zone->id)->update([
                'code' => $code,
                'is_active' => $zone->is_active ?? true,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('shipping_zones', function (Blueprint $table) {
            if (Schema::hasColumn('shipping_zones', 'code')) {
                $table->dropColumn('code');
            }
            if (Schema::hasColumn('shipping_zones', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
