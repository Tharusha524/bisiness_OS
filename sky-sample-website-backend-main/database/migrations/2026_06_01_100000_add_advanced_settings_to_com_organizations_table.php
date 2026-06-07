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
        Schema::table('com_organizations', function (Blueprint $table) {
            $table->string('companyWebsite')->nullable();
            $table->string('supportEmail')->nullable();
            $table->string('defaultCurrency')->nullable();
            $table->string('timezone')->nullable();
            $table->string('dateFormat')->nullable();
            $table->text('headquartersAddress')->nullable();
            $table->string('taxId')->nullable();
            $table->string('financialYearStart')->nullable();
            $table->integer('sessionTimeout')->nullable();
            $table->boolean('enforce2fa')->default(false);
            $table->text('globalAlertEmails')->nullable();
            $table->boolean('enableAutomatedReports')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('com_organizations', function (Blueprint $table) {
            $table->dropColumn([
                'companyWebsite',
                'supportEmail',
                'defaultCurrency',
                'timezone',
                'dateFormat',
                'headquartersAddress',
                'taxId',
                'financialYearStart',
                'sessionTimeout',
                'enforce2fa',
                'globalAlertEmails',
                'enableAutomatedReports'
            ]);
        });
    }
};
