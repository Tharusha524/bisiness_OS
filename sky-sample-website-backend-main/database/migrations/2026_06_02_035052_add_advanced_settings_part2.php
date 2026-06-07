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
            $table->time('quietHoursStart')->nullable();
            $table->time('quietHoursEnd')->nullable();
        });

        Schema::table('com_organizations', function (Blueprint $table) {
            $table->string('companyPhone')->nullable();
            $table->string('industry')->nullable();
            $table->integer('passwordMinLength')->default(8);
            $table->boolean('passwordRequireUppercase')->default(false);
            $table->boolean('passwordRequireNumbers')->default(false);
            $table->boolean('passwordRequireSymbols')->default(false);
            $table->integer('passwordExpiryDays')->nullable();
            $table->json('allowedEmailDomains')->nullable();
            $table->boolean('allowSelfRegistration')->default(true);
            $table->json('workingDays')->nullable();
            $table->json('enabledModules')->nullable();
            $table->integer('kpiWarningThresholdYellow')->nullable();
            $table->integer('kpiWarningThresholdRed')->nullable();
            $table->string('reportHeader')->nullable();
            $table->string('reportFooter')->nullable();
            $table->string('reportPrimaryColor')->nullable();
            $table->boolean('maintenanceMode')->default(false);
            $table->text('maintenanceMessage')->nullable();
            $table->integer('auditLogRetentionDays')->default(90);
            $table->string('defaultExportFormat')->default('CSV');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['quietHoursStart', 'quietHoursEnd']);
        });

        Schema::table('com_organizations', function (Blueprint $table) {
            $table->dropColumn([
                'companyPhone', 'industry', 'passwordMinLength', 'passwordRequireUppercase',
                'passwordRequireNumbers', 'passwordRequireSymbols', 'passwordExpiryDays',
                'allowedEmailDomains', 'allowSelfRegistration', 'workingDays', 'enabledModules',
                'kpiWarningThresholdYellow', 'kpiWarningThresholdRed', 'reportHeader',
                'reportFooter', 'reportPrimaryColor', 'maintenanceMode', 'maintenanceMessage',
                'auditLogRetentionDays', 'defaultExportFormat'
            ]);
        });
    }
};
