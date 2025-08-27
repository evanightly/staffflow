<?php

namespace App\Http\Controllers;

use App\Exports\UserImportTemplateExport;
use App\Http\Requests\ImportUsersRequest;
use App\Imports\UsersImport;
use App\Imports\UsersPreviewImport;
use App\Models\ImportExportFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
     * Preview import data before actual import
     */
    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ]);

        $file = $request->file('file');

        try {
            $previewImport = new UsersPreviewImport;
            Excel::import($previewImport, $file);

            $parsedData = $previewImport->getParsedData();
            $stats = $previewImport->getStats();

            // Store file temporarily for actual import
            $filename = 'temp_import_'.time().'_'.$file->getClientOriginalName();
            $tempPath = $file->storeAs('temp/import', $filename);

            return Inertia::render('user/import-preview', [
                'parsedData' => $parsedData,
                'stats' => $stats,
                'tempFilePath' => $tempPath,
                'originalFilename' => $file->getClientOriginalName(),
            ]);

        } catch (\Exception $e) {
            return redirect()->route('users.import.index')
                ->with('error', 'Failed to preview file: '.$e->getMessage());
        }
    }

    /**
     * Import users from uploaded file
     */
    public function import(ImportUsersRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $tempFilePath = $request->input('temp_file_path');

        try {
            // Use temp file if available, otherwise use uploaded file
            if ($tempFilePath && Storage::exists($tempFilePath)) {
                $fileToImport = Storage::path($tempFilePath);
                $originalFilename = $request->input('original_filename', 'imported_file.xlsx');
            } else {
                $fileToImport = $file;
                $originalFilename = $file->getClientOriginalName();
            }

            $import = new UsersImport;
            Excel::import($import, $fileToImport);

            $stats = $import->getImportStats();

            // Store the import file
            $filename = 'users_import_'.now()->format('Y_m_d_H_i_s').'_'.$originalFilename;
            $storedPath = '';

            if ($tempFilePath && Storage::exists($tempFilePath)) {
                $storedPath = Storage::move($tempFilePath, 'data/import/'.$filename);
            } else {
                $storedPath = $file->storeAs('data/import', $filename);
            }

            // Save file record to database
            ImportExportFile::create([
                'filename' => $filename,
                'filepath' => 'storage/'.$storedPath,
                'filetype' => 'import',
                'user_id' => Auth::id(),
            ]);

            // Clean up temp file if it exists
            if ($tempFilePath && Storage::exists($tempFilePath)) {
                Storage::delete($tempFilePath);
            }

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
            // Clean up temp file on error
            if ($tempFilePath && Storage::exists($tempFilePath)) {
                Storage::delete($tempFilePath);
            }

            return redirect()->route('users.import.index')
                ->with('error', 'Import failed: '.$e->getMessage());
        }
    }
}
