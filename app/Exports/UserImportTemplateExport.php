<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UserImportTemplateExport implements FromArray, WithColumnWidths, WithHeadings, WithStyles
{
    public function array(): array
    {
        return [
            [
                'John Doe',
                'john.doe@example.com',
                'male',
                '123 Main St, City, State',
                '+1234567890',
                'password123',
                'team',
            ],
            [
                'Jane Smith',
                'jane.smith@example.com',
                'female',
                '456 Oak Ave, City, State',
                '+1987654321',
                'password123',
                'super_admin',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'name',
            'email',
            'gender',
            'address',
            'phone_number',
            'password',
            'role',
        ];
    }

    /**
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as header
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => Color::COLOR_WHITE],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => '4472C4'],
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20, // name
            'B' => 30, // email
            'C' => 15, // gender
            'D' => 40, // address
            'E' => 20, // phone_number
            'F' => 15, // password
            'G' => 15, // role
        ];
    }
}
