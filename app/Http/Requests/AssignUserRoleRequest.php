<?php

namespace App\Http\Requests;

use App\Enums\RoleEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AssignUserRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('assign_roles');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'role' => [
                'required',
                'string',
                Rule::in(RoleEnum::values()),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'user_id.exists' => 'The selected user does not exist.',
            'role.in' => 'The selected role is invalid.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'user_id' => 'user',
            'role' => 'role',
        ];
    }
}
