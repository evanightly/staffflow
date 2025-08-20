<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UsersExport implements FromCollection, WithColumnWidths, WithHeadings, WithMapping, WithStyles
{
    protected $userIds;

    protected $columns;

    public function __construct(array $userIds, array $columns)
    {
        $this->userIds = $userIds;
        $this->columns = $columns;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return User::with('roles')->whereIn('id', $this->userIds)->get();
    }

    public function headings(): array
    {
        $headingMap = [
            'id' => 'ID',
            'name' => 'Name',
            'email' => 'Email',
            'gender' => 'Gender',
            'address' => 'Address',
            'phone_number' => 'Phone Number',
            'roles' => 'Roles',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];

        return array_map(fn ($column) => $headingMap[$column] ?? $column, $this->columns);
    }

    /**
     * @param  User  $user
     */
    public function map($user): array
    {
        $data = [];

        foreach ($this->columns as $column) {
            switch ($column) {
                case 'id':
                    $data[] = $user->id;
                    break;
                case 'name':
                    $data[] = $user->name;
                    break;
                case 'email':
                    $data[] = $user->email;
                    break;
                case 'gender':
                    $data[] = $user->gender ?? '';
                    break;
                case 'address':
                    $data[] = $user->address ?? '';
                    break;
                case 'phone_number':
                    $data[] = $user->phone_number ?? '';
                    break;
                case 'roles':
                    $data[] = $user->roles->pluck('name')->join(', ');
                    break;
                case 'created_at':
                    $data[] = $user->created_at?->format('Y-m-d H:i:s') ?? '';
                    break;
                case 'updated_at':
                    $data[] = $user->updated_at?->format('Y-m-d H:i:s') ?? '';
                    break;
                default:
                    $data[] = '';
                    break;
            }
        }

        return $data;
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
        $widthMap = [
            'id' => 10,
            'name' => 25,
            'email' => 30,
            'gender' => 15,
            'address' => 40,
            'phone_number' => 20,
            'roles' => 25,
            'created_at' => 20,
            'updated_at' => 20,
        ];

        $widths = [];
        foreach ($this->columns as $index => $column) {
            $excelColumn = chr(65 + $index); // A, B, C, ...
            $widths[$excelColumn] = $widthMap[$column] ?? 15;
        }

        return $widths;
    }
}
