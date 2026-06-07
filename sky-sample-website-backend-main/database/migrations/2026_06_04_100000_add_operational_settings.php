<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('com_organizations', function (Blueprint $table) {
            $table->string('passwordPolicy')->default('Standard');   // 'Standard' | 'Strict'
            $table->integer('historicalDataGracePeriod')->default(30); // days back allowed
            $table->time('dataEntryDeadlineTime')->nullable();
            $table->time('workingHoursStart')->nullable();
            $table->time('workingHoursEnd')->nullable();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('kpiAlertPreference')->default(true);
            $table->boolean('dataEntryReminder')->default(false);
            $table->string('defaultSystemView')->nullable(); // system id or null = all
        });
    }

    public function down(): void
    {
        Schema::table('com_organizations', function (Blueprint $table) {
            $table->dropColumn([
                'passwordPolicy',
                'historicalDataGracePeriod',
                'dataEntryDeadlineTime',
                'workingHoursStart',
                'workingHoursEnd',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['kpiAlertPreference', 'dataEntryReminder', 'defaultSystemView']);
        });
    }
};
