<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop subscription invoices first (FK dependency)
        Schema::dropIfExists('subscription_invoices');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');

        // Remove primary_owner_id column from companies
        if (Schema::hasColumn('companies', 'primary_owner_id')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->dropForeign(['primary_owner_id']);
                $table->dropColumn('primary_owner_id');
            });
        }
    }

    public function down(): void
    {
        // Intentionally left empty - SaaS tables are permanently removed
    }
};
