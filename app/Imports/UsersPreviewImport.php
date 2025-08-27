<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Validators\Failure;

class UsersPreviewImport implements SkipsOnFailure, ToCollection, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    private $parsedData = [];

    private $errors = [];

    private $validRows = 0;

    private $invalidRows = 0;

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowArray = $row->toArray();
            $rowNumber = $index + 2; // +2 because of header row and 0-based index

            // Check if email already exists
            $emailExists = User::where('email', $rowArray['email'] ?? '')->exists();

            $this->parsedData[] = [
                'row_number' => $rowNumber,
                'data' => $rowArray,
                'is_valid' => empty($this->getRowErrors($rowArray)) && ! $emailExists,
                'errors' => $this->getRowErrors($rowArray),
                'email_exists' => $emailExists,
            ];

            if (empty($this->getRowErrors($rowArray)) && ! $emailExists) {
                $this->validRows++;
            } else {
                $this->invalidRows++;
            }
        }
    }

    private function getRowErrors(array $row): array
    {
        $errors = [];

        if (empty($row['name'])) {
            $errors[] = 'Name is required';
        }

        if (empty($row['email'])) {
            $errors[] = 'Email is required';
        } elseif (! filter_var($row['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email format';
        }

        if (! empty($row['gender']) && ! in_array($row['gender'], ['male', 'female', 'other'])) {
            $errors[] = 'Gender must be one of: male, female, other';
        }

        if (! empty($row['password']) && strlen($row['password']) < 8) {
            $errors[] = 'Password must be at least 8 characters';
        }

        return $errors;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'gender' => 'nullable|string|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'phone_number' => 'nullable|max:20',
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|string|exists:roles,name',
        ];
    }

    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->errors[] = [
                'row' => $failure->row(),
                'errors' => $failure->errors(),
            ];
        }
    }

    public function getParsedData(): array
    {
        return $this->parsedData;
    }

    public function getStats(): array
    {
        return [
            'total_rows' => count($this->parsedData),
            'valid_rows' => $this->validRows,
            'invalid_rows' => $this->invalidRows,
            'errors' => $this->errors,
        ];
    }
}
