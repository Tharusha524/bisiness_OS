<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $insightOnly = json_encode([
            'INSIGHT_VIEW'                            => true,
            'ADMIN_USERS_VIEW'                        => false,
            'ADMIN_USERS_EDIT'                        => false,
            'ADMIN_USERS_DELETE'                      => false,
            'ADMIN_ACCESS_MNG_VIEW'                   => false,
            'ADMIN_ACCESS_MNG_CREATE'                 => false,
            'ADMIN_ACCESS_MNG_EDIT'                   => false,
            'ADMIN_ACCESS_MNG_DELETE'                 => false,
            'CUSTOM_PAGE_VIEW'                        => false,
            'CUSTOM_PAGE_EDIT'                        => false,
            'DASHBOARD_VIEW'                          => false,
            'PRODUCTION_DASHBOARD_VIEW'               => false,
            'INPUT_DATA_VIEW'                         => false,
            'SETTINGS_VIEW'                           => false,
            'SYSTEM_SETUP_VIEW'                       => false,
            'SYSTEM_SETUP_EDIT'                       => false,
            'REPORT_VIEW'                             => false,
            'USER_SETTING_VIEW'                       => false,
            'USER_SETTING_EDIT'                       => false,
            'COMPANY_SETTING_VIEW'                    => false,
            'COMPANY_SETTING_EDIT'                    => false,
            'INPUT_PAGE_VIEW'                         => false,
            'INPUT_PAGE_EDIT'                         => false,
            'CHEMICAL_MNG_REQUEST_REGISTER_CREATE'    => false,
            'CHEMICAL_MNG_REQUEST_REGISTER_EDIT'      => false,
            'CHEMICAL_MNG_REQUEST_REGISTER_DELETE'    => false,
            'CHEMICAL_MNG_ASSIGNED_TASKS_CREATE'      => false,
            'CHEMICAL_MNG_ASSIGNED_TASKS_EDIT'        => false,
            'CHEMICAL_MNG_ASSIGNED_TASKS_DELETE'      => false,
        ]);

        DB::table('com_permissions')
            ->where('userType', 'user')
            ->update(['permissionObject' => $insightOnly]);
    }

    public function down(): void
    {
        // Restore the previous default viewer permissions
        $previous = json_encode([
            'INSIGHT_VIEW'                            => false,
            'DASHBOARD_VIEW'                          => true,
            'PRODUCTION_DASHBOARD_VIEW'               => true,
            'INPUT_DATA_VIEW'                         => true,
            'INPUT_PAGE_VIEW'                         => true,
            'INPUT_PAGE_EDIT'                         => true,
            'REPORT_VIEW'                             => true,
            'ADMIN_USERS_VIEW'                        => false,
            'ADMIN_USERS_EDIT'                        => false,
            'ADMIN_USERS_DELETE'                      => false,
            'ADMIN_ACCESS_MNG_VIEW'                   => false,
            'ADMIN_ACCESS_MNG_CREATE'                 => false,
            'ADMIN_ACCESS_MNG_EDIT'                   => false,
            'ADMIN_ACCESS_MNG_DELETE'                 => false,
            'CUSTOM_PAGE_VIEW'                        => false,
            'CUSTOM_PAGE_EDIT'                        => false,
            'SETTINGS_VIEW'                           => false,
            'SYSTEM_SETUP_VIEW'                       => false,
            'SYSTEM_SETUP_EDIT'                       => false,
            'USER_SETTING_VIEW'                       => false,
            'USER_SETTING_EDIT'                       => false,
            'COMPANY_SETTING_VIEW'                    => false,
            'COMPANY_SETTING_EDIT'                    => false,
            'CHEMICAL_MNG_REQUEST_REGISTER_CREATE'    => false,
            'CHEMICAL_MNG_REQUEST_REGISTER_EDIT'      => false,
            'CHEMICAL_MNG_REQUEST_REGISTER_DELETE'    => false,
            'CHEMICAL_MNG_ASSIGNED_TASKS_CREATE'      => false,
            'CHEMICAL_MNG_ASSIGNED_TASKS_EDIT'        => false,
            'CHEMICAL_MNG_ASSIGNED_TASKS_DELETE'      => false,
        ]);

        DB::table('com_permissions')
            ->where('userType', 'user')
            ->update(['permissionObject' => $previous]);
    }
};
