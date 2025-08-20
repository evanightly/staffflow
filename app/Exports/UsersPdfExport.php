<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class UsersPdfExport implements FromView
{
    protected $userIds;

    protected $columns;

    public function __construct(array $userIds, array $columns)
    {
        $this->userIds = $userIds;
        $this->columns = $columns;
    }

    public function view(): View
    {
        $users = User::with('roles')->whereIn('id', $this->userIds)->get();

        $columnLabels = [
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

        return view('exports.users-pdf', [
            'users' => $users,
            'columns' => $this->columns,
            'columnLabels' => $columnLabels,
        ]);
    }
}
