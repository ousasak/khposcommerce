<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('name');
            $table->string('display_name_km')->nullable()->after('display_name');
            $table->text('description')->nullable()->after('display_name_km');
            $table->text('description_km')->nullable()->after('description');
            $table->boolean('is_system')->default(false)->after('description_km');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn([
                'display_name',
                'display_name_km',
                'description',
                'description_km',
                'is_system',
            ]);
        });
    }
};

