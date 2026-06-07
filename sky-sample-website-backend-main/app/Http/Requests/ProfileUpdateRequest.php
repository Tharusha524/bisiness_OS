<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
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
            'name'                 => 'nullable|string',
            'mobile'               => 'nullable|string',
            'gender'               => 'nullable|string',
            'themePreference'      => 'nullable|string',
            'defaultLandingPage'   => 'nullable|string',
            'languageOverride'     => 'nullable|string',
            'defaultSystemView'    => 'nullable|string',
            'personal2faEnabled'   => 'nullable|boolean',
            'emailDailyDigest'     => 'nullable|boolean',
            'emailImmediateAlerts' => 'nullable|boolean',
            'inAppNotifications'   => 'nullable|boolean',
            'kpiAlertPreference'   => 'nullable|boolean',
            'dataEntryReminder'    => 'nullable|boolean',
            'quietHoursStart'      => 'nullable|string',
            'quietHoursEnd'        => 'nullable|string',
            'removeDoc'            => 'nullable|array',
            'profileImage'         => 'nullable|array',
            'profileImage.*'       => 'file|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ];
    }

}
