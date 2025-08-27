<?php

namespace App\Http\Controllers;

use App\Exports\UsersExport;
use App\Http\Resources\UserResource;
use App\Models\ImportExportFile;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
            'remove_duplicates' => 'boolean',
        ]);

        $userIds = $validated['user_ids'];
        $columns = $validated['columns'];
        $removeDuplicates = $validated['remove_duplicates'] ?? false;

        // Remove duplicates if requested
        if ($removeDuplicates) {
            $userIds = $this->removeDuplicateUsers($userIds, $columns);
        }

        $filename = 'users_export_'.now()->format('Y_m_d_H_i_s').'.xlsx';

        logger()->info('Exporting users to Excel', [
            'user_ids' => $userIds,
            'columns' => $columns,
            'filename' => $filename,
            'remove_duplicates' => $removeDuplicates,
        ]);

        // Create the Excel file
        $export = new UsersExport($userIds, $columns);
        $filePath = 'data/export/'.$filename;

        // Store the file
        Excel::store($export, $filePath);

        // Save file record to database
        ImportExportFile::create([
            'filename' => $filename,
            'filepath' => 'storage/'.$filePath,
            'filetype' => 'export',
            'user_id' => Auth::id(),
        ]);

        return Storage::download($filePath, $filename);
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
            'remove_duplicates' => 'boolean',
        ]);

        $userIds = $validated['user_ids'];
        $columns = $validated['columns'];
        $removeDuplicates = $validated['remove_duplicates'] ?? false;

        // Remove duplicates if requested
        if ($removeDuplicates) {
            $userIds = $this->removeDuplicateUsers($userIds, $columns);
        }

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
        $filePath = 'data/export/'.$filename;

        // Store the PDF file
        Storage::put($filePath, $pdf->output());

        // Save file record to database
        ImportExportFile::create([
            'filename' => $filename,
            'filepath' => 'storage/'.$filePath,
            'filetype' => 'export',
            'user_id' => Auth::id(),
        ]);

        return $pdf->download($filename);
    }

    /**
     * Remove duplicate users based on selected columns
     */
    private function removeDuplicateUsers(array $userIds, array $columns): array
    {
        // Get all users with the specified columns
        $users = User::whereIn('id', $userIds)->get();

        $uniqueUsers = collect();
        $seenCombinations = collect();

        foreach ($users as $user) {
            // Create a hash based on the selected columns
            $combination = collect($columns)->map(function ($column) use ($user) {
                if ($column === 'roles') {
                    return $user->roles->pluck('name')->sort()->implode(',');
                }

                return (string) $user->{$column};
            })->implode('|');

            // Only add if we haven't seen this combination before
            if (! $seenCombinations->contains($combination)) {
                $seenCombinations->push($combination);
                $uniqueUsers->push($user->id);
            }
        }

        return $uniqueUsers->toArray();
    }
}
