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
        Schema::table('users', function (Blueprint $table) {
            $table->string('themePreference')->nullable();
            $table->string('defaultLandingPage')->nullable();
            $table->string('languageOverride')->nullable();
            $table->boolean('personal2faEnabled')->default(false);
            $table->boolean('emailDailyDigest')->default(true);
            $table->boolean('emailImmediateAlerts')->default(true);
            $table->boolean('inAppNotifications')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'themePreference',
                'defaultLandingPage',
                'languageOverride',
                'personal2faEnabled',
                'emailDailyDigest',
                'emailImmediateAlerts',
                'inAppNotifications'
            ]);
        });
    }
};
