<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComOrganization extends Model
{
    use HasFactory;

    protected $fillable = [
        'organizationName',
        'organizationFactoryName',
        'logoUrl',
        'colorPallet',
        'insightImage',
        'insightDescription',
        'status',
        'createdByUser',
        'updatedBy',
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
        'enableAutomatedReports',
        'companyPhone',
        'industry',
        'passwordMinLength',
        'passwordRequireUppercase',
        'passwordRequireNumbers',
        'passwordRequireSymbols',
        'passwordExpiryDays',
        'allowedEmailDomains',
        'allowSelfRegistration',
        'workingDays',
        'enabledModules',
        'kpiWarningThresholdYellow',
        'kpiWarningThresholdRed',
        'reportHeader',
        'reportFooter',
        'reportPrimaryColor',
        'maintenanceMode',
        'maintenanceMessage',
        'auditLogRetentionDays',
        'defaultExportFormat',
        'passwordPolicy',
        'historicalDataGracePeriod',
        'dataEntryDeadlineTime',
        'workingHoursStart',
        'workingHoursEnd',
    ];

    protected $casts = [
        'colorPallet' => 'array',
        'enforce2fa' => 'boolean',
        'enableAutomatedReports' => 'boolean',
        'allowedEmailDomains' => 'array',
        'workingDays' => 'array',
        'enabledModules' => 'array',
        'passwordRequireUppercase' => 'boolean',
        'passwordRequireNumbers' => 'boolean',
        'passwordRequireSymbols' => 'boolean',
        'allowSelfRegistration' => 'boolean',
        'maintenanceMode' => 'boolean',
    ];
}
