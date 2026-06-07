<?php
namespace App\Http\Requests\ComOrganization;

use Illuminate\Foundation\Http\FormRequest;

class OrganizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'organizationName'        => 'nullable|string',
            'organizationFactoryName' => 'nullable|string',
            'logoUrl'                 => 'nullable|file|mimes:pdf,doc,docx,xlsx,ppt,pptx,jpg,jpeg,png,gif,zip,webp,svg',
            'removeLogo'              => 'nullable|string',
            'colorPallet'             => 'nullable|array',
            'insightImage'            => 'nullable|file|mimes:pdf,doc,docx,xlsx,ppt,pptx,jpg,jpeg,png,gif,zip,webp,svg',
            'removeInsightImage'      => 'nullable|string',
            'insightDescription'      => 'nullable|string',
            'status'                  => 'nullable|string',
            'createdByUser'           => 'nullable|string',
            'updatedBy'               => 'nullable|string',
            'companyWebsite'          => 'nullable|string',
            'supportEmail'            => 'nullable|string',
            'defaultCurrency'         => 'nullable|string',
            'timezone'                => 'nullable|string',
            'dateFormat'              => 'nullable|string',
            'headquartersAddress'     => 'nullable|string',
            'taxId'                   => 'nullable|string',
            'financialYearStart'      => 'nullable|string',
            'sessionTimeout'          => 'nullable|integer',
            'enforce2fa'              => 'nullable|boolean',
            'globalAlertEmails'       => 'nullable|string',
            'enableAutomatedReports'  => 'nullable|boolean',
            'companyPhone'            => 'nullable|string',
            'industry'                => 'nullable|string',
            'passwordMinLength'       => 'nullable|integer|min:4',
            'passwordRequireUppercase'=> 'nullable|boolean',
            'passwordRequireNumbers'  => 'nullable|boolean',
            'passwordRequireSymbols'  => 'nullable|boolean',
            'passwordExpiryDays'      => 'nullable|integer',
            'allowedEmailDomains'     => 'nullable|array',
            'allowSelfRegistration'   => 'nullable|boolean',
            'workingDays'             => 'nullable|array',
            'enabledModules'          => 'nullable|array',
            'kpiWarningThresholdYellow'=> 'nullable|integer',
            'kpiWarningThresholdRed'  => 'nullable|integer',
            'reportHeader'            => 'nullable|string',
            'reportFooter'            => 'nullable|string',
            'reportPrimaryColor'      => 'nullable|string',
            'maintenanceMode'         => 'nullable|boolean',
            'maintenanceMessage'      => 'nullable|string',
            'auditLogRetentionDays'   => 'nullable|integer',
            'defaultExportFormat'          => 'nullable|string',
            'passwordPolicy'               => 'nullable|string|in:Standard,Strict',
            'historicalDataGracePeriod'    => 'nullable|integer|min:1|max:365',
            'dataEntryDeadlineTime'        => 'nullable|string',
            'workingHoursStart'            => 'nullable|string',
            'workingHoursEnd'              => 'nullable|string',
        ];
    }

}
