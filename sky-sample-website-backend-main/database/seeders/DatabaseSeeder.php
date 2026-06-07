<?php
namespace Database\Seeders;

use App\Models\ComAssigneeLevel;
use App\Models\ComOrganization;
use App\Models\ComPermission;
use App\Models\ComResponsibleSection;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        ComPermission::factory()->create([
            'id'               => 1,
            'userType'         => 'Super Admin',
            'description'      => 'Administrator Role with full permissions',
            'permissionObject' => ([
                "INSIGHT_VIEW" => true,
                "ADMIN_USERS_VIEW" => true,
                "ADMIN_USERS_EDIT" => true,
                "ADMIN_USERS_DELETE" => true,
                "ADMIN_ACCESS_MNG_VIEW" => true,
                "ADMIN_ACCESS_MNG_CREATE" => true,
                "ADMIN_ACCESS_MNG_EDIT" => true,
                "ADMIN_ACCESS_MNG_DELETE" => true,
                "DASHBOARD_VIEW" => true,
                "SYSTEM_SETUP_VIEW" => true,
                "SYSTEM_SETUP_EDIT" => true,
                "REPORT_VIEW" => true,
                "USER_SETTING_VIEW" => true,
                "USER_SETTING_EDIT" => true,
                "COMPANY_SETTING_VIEW" => true,
                "COMPANY_SETTING_EDIT" => true,
                "INPUT_PAGE_VIEW" => true,
                "INPUT_PAGE_EDIT" => true,

            ]),
        ]);

        ComPermission::factory()->create([
            'id'               => 2,
            'userType'         => 'guest',
            'description'      => 'guest Role with full permissions',
            'permissionObject' => ([
                "INSIGHT_VIEW" => false,
                "ADMIN_USERS_VIEW" => false,
                "ADMIN_USERS_EDIT" => false,
                "ADMIN_USERS_DELETE" => false,
                "ADMIN_ACCESS_MNG_VIEW" => false,
                "ADMIN_ACCESS_MNG_CREATE" => false,
                "ADMIN_ACCESS_MNG_EDIT" => false,
                "ADMIN_ACCESS_MNG_DELETE" => false,
                "DASHBOARD_VIEW" => true,
                "SYSTEM_SETUP_VIEW" => false,
                "SYSTEM_SETUP_EDIT" => false,
                "REPORT_VIEW" => true,
                "USER_SETTING_VIEW" => false,
                "USER_SETTING_EDIT" => false,
                "COMPANY_SETTING_VIEW" => false,
                "COMPANY_SETTING_EDIT" => false,
                "INPUT_PAGE_VIEW" => true,
                "INPUT_PAGE_EDIT" => true,

            ]),
        ]);

        $adminPermissions = ComPermission::find(1) ? ComPermission::find(1)->permissionObject : [];
        ComPermission::factory()->create([
            'id'               => 3,
            'userType'         => 'Admin User',
            'description'      => 'Admin Role for standard administrators',
            'permissionObject' => $adminPermissions
        ]);

        $guestPermissions = ComPermission::find(2) ? ComPermission::find(2)->permissionObject : [];
        ComPermission::factory()->create([
            'id'               => 4,
            'userType'         => 'Normal User',
            'description'      => 'Normal User Role for regular staff',
            'permissionObject' => $guestPermissions
        ]);

        User::factory()->create([
            'name'          => 'Admin User',
            'email'         => 'admin@suswebapp.com',
            'password'      => Hash::make('Admin@1234'),
            'userType'      => '1',
            'assigneeLevel' => '1',
        ]);

        User::factory()->create([
            'name'          => 'Super Admin',
            'email'         => 'supperadmin@suswebapp.com',
            'password'      => Hash::make('Supperadmin@1234'),
            'userType'      => '1',
            'assigneeLevel' => '1',

        ]);

        ComResponsibleSection::factory()->create([
            'id'            => 1,
            'sectionName'   => 'Hazard And Risk Section',
            'sectionCode'   => 'HRS',
            'responsibleId' => '1',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 2,
            'sectionName'   => 'Accident Section',
            'sectionCode'   => 'As',
            'responsibleId' => '2',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 3,
            'sectionName'   => 'Incident Section',
            'sectionCode'   => 'Is',
            'responsibleId' => '3',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 4,
            'sectionName'   => 'Medicine Request Section',
            'sectionCode'   => 'MRS',
            'responsibleId' => '4',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 5,
            'sectionName'   => 'Internal Audit Section',
            'sectionCode'   => 'IAS',
            'responsibleId' => '5',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 6,
            'sectionName'   => 'External Audit Section',
            'sectionCode'   => 'EAS',
            'responsibleId' => '6',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 7,
            'sectionName'   => 'Internal Question Section',
            'sectionCode'   => 'EQS',
            'responsibleId' => '7',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 8,
            'sectionName'   => 'SDG Reporting Section',
            'sectionCode'   => 'SRS',
            'responsibleId' => '8',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 9,
            'sectionName'   => 'Environment Management Section',
            'sectionCode'   => 'EMS',
            'responsibleId' => '9',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 10,
            'sectionName'   => 'Target Setting Section',
            'sectionCode'   => 'TSS',
            'responsibleId' => '10',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 11,
            'sectionName'   => 'Chemical Management Section',
            'sectionCode'   => 'CMS',
            'responsibleId' => '11',
        ]);
        ComResponsibleSection::factory()->create([
            'id'            => 12,
            'sectionName'   => 'Grievance Section',
            'sectionCode'   => 'GS',
            'responsibleId' => '12',
        ]);
        ComAssigneeLevel::factory()->create([
            'id'        => 1,
            'levelId'   => '1',
            'levelName' => 'Admin',
        ]);
        ComAssigneeLevel::factory()->create([
            'id'        => 2,
            'levelId'   => '2',
            'levelName' => 'Team Member',
        ]);
        ComAssigneeLevel::factory()->create([
            'id'        => 3,
            'levelId'   => '3',
            'levelName' => 'Executive',
        ]);
        ComAssigneeLevel::factory()->create([
            'id'        => 4,
            'levelId'   => '4',
            'levelName' => 'Manager ',
        ]);
        ComAssigneeLevel::factory()->create([
            'id'        => 5,
            'levelId'   => '5',
            'levelName' => 'CEO',
        ]);

        ComOrganization::factory()->create([
            'id'                      => 1,
            'organizationName'        => 'ABA',
            'organizationFactoryName' => 'Corporate',
        ]);

        $this->call(UserSeeder::class);

        // Seed default banks
        \App\Models\Bank::create(['name' => 'BOC', 'balance' => 250000.00]);
        \App\Models\Bank::create(['name' => 'HNB', 'balance' => 170500.00]);

        $bankSum = \App\Models\Bank::sum('balance');
        $bankFormatted = 'Rs. ' . number_format($bankSum);

        $finance = \App\Models\System::create(['name' => 'Finance']);
        $finance->metrics()->createMany([
            ['name' => 'Total Debtors', 'value' => 'Rs. 1,240,000', 'icon' => 'wallet'],
            ['name' => 'Total Creditors', 'value' => 'Rs. 815,000', 'icon' => 'card'],
            ['name' => 'Bank Balance', 'value' => $bankFormatted, 'icon' => 'bank'],
            ['name' => 'Cash Balance', 'value' => 'Rs. 45,200', 'icon' => 'dollar'],
            ['name' => 'Absenteeism', 'value' => '4.2%', 'icon' => 'alert']
        ]);

        $stores = \App\Models\System::create(['name' => 'Stores']);
        $stores->metrics()->createMany([
            ['name' => 'Spare Part Unavailability', 'value' => '142', 'icon' => 'alert']
        ]);

        $safety = \App\Models\System::create(['name' => 'Health & Safety']);
        $safety->metrics()->createMany([
            ['name' => 'No. Of Accidents', 'value' => '00', 'icon' => 'safety'],
            ['name' => 'Response Time', 'value' => '15m', 'icon' => 'clock']
        ]);

        $maintenance = \App\Models\System::create(['name' => 'Maintenance']);
        $maintenance->metrics()->createMany([
            ['name' => 'Number of BD', 'value' => '24', 'icon' => 'chart'],
            ['name' => 'BD Time Duration', 'value' => '142h', 'icon' => 'clock'],
            ['name' => 'MTRF', 'value' => '1.2h', 'icon' => 'clock'],
            ['name' => 'MTBF', 'value' => '248h', 'icon' => 'clock']
        ]);

        $hr = \App\Models\System::create(['name' => 'HR']);
        $hr->metrics()->createMany([
            ['name' => 'Uptime', 'value' => '99.98%', 'icon' => 'check'],
            ['name' => 'Active Metrics', 'value' => 'Optimal', 'icon' => 'check']
        ]);
    }

}
