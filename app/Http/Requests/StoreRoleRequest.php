<?php

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('create_roles');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:roles,name',
                'regex:/^[a-z0-9_]+$/', // Only lowercase letters, numbers, and underscores
            ],
            'permissions' => 'array',
            'permissions.*' => [
                'string',
                Rule::in(PermissionEnum::values()),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.regex' => 'The role name may only contain lowercase letters, numbers, and underscores.',
            'permissions.*.in' => 'One or more selected permissions are invalid.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'role name',
            'permissions' => 'permissions',
        ];
    }
}
