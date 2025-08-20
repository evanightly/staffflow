<?php

namespace App\Http\Controllers;

use App\Exports\UserImportTemplateExport;
use App\Http\Requests\ImportUsersRequest;
use App\Imports\UsersImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class UserImportController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            // new Middleware('permission:import_users', only: ['index', 'import', 'downloadTemplate']),
            new Middleware('role:super_admin'),
        ];
    }

    /**
     * Show the import page
     */
    public function index(): Response
    {
        return Inertia::render('user/import', [
            'templateDownloadUrl' => route('users.import.template'),
        ]);
    }

    /**
     * Download the import template
     */
    public function downloadTemplate(): BinaryFileResponse
    {
        return Excel::download(
            new UserImportTemplateExport,
            'user_import_template.xlsx'
        );
    }

    /**
     * Import users from uploaded file
     */
    public function import(ImportUsersRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        try {
            $import = new UsersImport;
            Excel::import($import, $file);

            $stats = $import->getImportStats();

            if ($stats['failed'] > 0) {
                // If there are failures, show detailed error message
                $errorDetails = [];
                if (! empty($stats['errors'])) {
                    $errorDetails = array_slice($stats['errors'], 0, 10); // Show first 10 errors
                }

                $message = "Import completed with issues: {$stats['imported']} users imported successfully, {$stats['failed']} failed.";
                if (! empty($errorDetails)) {
                    $message .= "\n\nErrors:\n• ".implode("\n• ", $errorDetails);
                    if (count($stats['errors']) > 10) {
                        $message .= "\n• ... and ".(count($stats['errors']) - 10).' more errors';
                    }
                }

                return redirect()->route('users.import.index')
                    ->with('warning', $message);
            } else {
                // All successful
                $message = "Import completed successfully! {$stats['imported']} users imported.";

                return redirect()->route('users.import.index')
                    ->with('success', $message);
            }

        } catch (\Exception $e) {
            return redirect()->route('users.import.index')
                ->with('error', 'Import failed: '.$e->getMessage());
        }
    }
}
