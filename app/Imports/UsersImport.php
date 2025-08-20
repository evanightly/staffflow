<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Validators\Failure;
use Spatie\Permission\Models\Role;

class UsersImport implements SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    private $imported = 0;

    private $failed = 0;

    private $errors = [];

    /**
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Skip if email already exists
        if (User::where('email', $row['email'])->exists()) {
            $this->failed++;
            $this->errors[] = "User with email {$row['email']} already exists";

            return null;
        }

        try {
            $user = User::create([
                'name' => $row['name'],
                'email' => $row['email'],
                'gender' => $row['gender'] ?? null,
                'address' => $row['address'] ?? null,
                'phone_number' => isset($row['phone_number']) ? (string) $row['phone_number'] : null,
                'password' => Hash::make($row['password'] ?? 'password123'),
                'email_verified_at' => now(),
            ]);

            // Assign role if provided
            if (! empty($row['role'])) {
                $role = Role::where('name', $row['role'])->first();
                if ($role) {
                    $user->assignRole($role);
                } else {
                    $this->errors[] = "Role '{$row['role']}' not found for user {$row['email']}";
                }
            }

            $this->imported++;

            return $user;
        } catch (\Exception $e) {
            $this->failed++;
            $this->errors[] = "Failed to create user {$row['email']}: ".$e->getMessage();

            return null;
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'gender' => 'nullable|string|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'phone_number' => 'nullable|max:20',
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|string|exists:roles,name',
        ];
    }

    /**
     * @return array
     */
    public function customValidationMessages()
    {
        return [
            'name.required' => 'The name field is required.',
            'email.required' => 'The email field is required.',
            'email.email' => 'The email field must be a valid email address.',
            'email.unique' => 'The email has already been taken.',
            'gender.in' => 'The gender must be one of: male, female, other.',
            'password.min' => 'The password must be at least 8 characters.',
            'role.exists' => 'The selected role does not exist.',
        ];
    }

    /**
     * @param  Failure[]  $failures
     */
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->failed++;
            $this->errors[] = "Row {$failure->row()}: ".implode(', ', $failure->errors());
        }
    }

    /**
     * Get import statistics
     */
    public function getImportStats()
    {
        return [
            'imported' => $this->imported,
            'failed' => $this->failed,
            'errors' => $this->errors,
        ];
    }
}
