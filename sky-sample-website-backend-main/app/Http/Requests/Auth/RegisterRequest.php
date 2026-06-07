<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'isCompanyEmployee' => ['required', 'boolean'],
            'name'              => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],

            'email'             => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'          => ['required', 'min:4', 'confirmed', 'max:15'],
            'mobile'            => ['required', 'string', 'max:15', 'unique:users'],
            'userType'          => ['nullable', 'integer', 'exists:com_permissions,id'],

            'department'        => ['nullable', 'string', 'max:255'],
            'jobPosition'       => ['nullable', 'string', 'max:255'],
            'employeeNumber'    => ['nullable', 'string', 'max:255', 'unique:users'],
            'assignedFactory'   => ['nullable', 'array'],
        ];
    }

    public function messages()
    {
        return [
            'name.required'               => 'Name is required.',
            'name.max'                    => 'Name must not exceed 255 characters.',
            'name.regex'                  => 'Name must be letters and spaces only.',

            'email.required'              => 'Email is required.',
            'email.unique'                => 'Email is already taken.',

            'password.required'           => 'Password is required.',
            'password.min'                => 'Password must be at least 4 characters.',
            'password.confirmed'          => 'Password confirmation does not match.',

            'mobile.required'             => 'Mobile is required.',
            'mobile.unique'               => 'Mobile number already exists.',

            'employeeNumber.unique'       => 'Employee number already exists.',
        ];
    }
}
