<?php

namespace App\Http\Controllers;

use App\Exports\UsersExport;
use App\Http\Resources\UserResource;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class UserExportController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('auth'),
            new Middleware('permission:view_users'),
        ];
    }

    /**
     * Display the export page with checkable datatable.
     */
    public function index()
    {
        $users = User::with('roles')->get();

        $availableColumns = [
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

        return Inertia::render('user/export', [
            'users' => UserResource::collection($users),
            'availableColumns' => $availableColumns,
        ]);
    }

    /**
     * Export selected users to Excel.
     */
    public function exportExcel(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'columns' => 'required|array|min:1',
            'columns.*' => 'string|in:id,name,email,gender,address,phone_number,roles,created_at,updated_at',
        ]);

        $userIds = $validated['user_ids'];
        $columns = $validated['columns'];

        $filename = 'users_export_'.now()->format('Y_m_d_H_i_s').'.xlsx';

        logger()->info('Exporting users to Excel', [
            'user_ids' => $userIds,
            'columns' => $columns,
            'filename' => $filename,
        ]);

        return Excel::download(new UsersExport($userIds, $columns), $filename)->deleteFileAfterSend(true);
    }

    /**
     * Export selected users to PDF.
     */
    public function exportPdf(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'columns' => 'required|array|min:1',
            'columns.*' => 'string|in:id,name,email,gender,address,phone_number,roles,created_at,updated_at',
        ]);

        $userIds = $validated['user_ids'];
        $columns = $validated['columns'];

        $users = User::with('roles')->whereIn('id', $userIds)->get();

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

        $pdf = Pdf::loadView('exports.users-pdf', [
            'users' => $users,
            'columns' => $columns,
            'columnLabels' => $columnLabels,
        ]);

        $filename = 'users_export_'.now()->format('Y_m_d_H_i_s').'.pdf';

        return $pdf->download($filename);
    }
}
