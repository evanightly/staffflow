<?php

namespace App\Http\Controllers;

use App\Models\ImportExportFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DataFileController extends Controller
{
    /**
     * Display the data files dashboard
     */
    public function index()
    {

        return redirect(route('dashboard'));

        $user = Auth::user();

        if ($user->hasRole('super_admin')) {
            // Super admin sees all import files and their own export files
            $importFiles = ImportExportFile::with('user')
                ->where('filetype', 'import')
                ->orderBy('created_at', 'desc')
                ->get();

            $exportFiles = ImportExportFile::with('user')
                ->where('filetype', 'export')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Team members see only their export files
            $importFiles = collect();
            $exportFiles = ImportExportFile::with('user')
                ->where('filetype', 'export')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('data/files', [
            'importFiles' => $importFiles,
            'exportFiles' => $exportFiles,
            'userRole' => $user->roles->first()?->name ?? 'team',
        ]);
    }

    /**
     * Download a file
     */
    public function download(ImportExportFile $file)
    {
        $user = Auth::user();

        // Check permissions
        if ($file->filetype === 'import' && ! $user->hasRole('super_admin')) {
            abort(403, 'You do not have permission to download import files.');
        }

        // if ($file->filetype === 'export' && $file->user_id !== $user->id) {
        //     abort(403, 'You can only download your own export files.');
        // }

        // Check if file exists
        $filePath = $file->filepath;
        if (! Storage::disk('public')->exists($filePath)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($filePath, $file->filename);
    }

    /**
     * Delete a file
     */
    public function destroy(ImportExportFile $file)
    {
        $user = Auth::user();

        // Check permissions - only super admin can delete import files, users can delete their own export files
        if ($file->filetype === 'import' && ! $user->hasRole('super_admin')) {
            abort(403, 'You do not have permission to delete import files.');
        }

        if ($file->filetype === 'export' && $file->user_id !== $user->id && ! $user->hasRole('super_admin')) {
            abort(403, 'You can only delete your own export files.');
        }

        // Delete the actual file
        $filePath = str_replace('storage/', '', $file->filepath);
        if (Storage::exists($filePath)) {
            Storage::delete($filePath);
        }

        // Delete the record
        $file->delete();

        return redirect()->route('data.files.index')
            ->with('success', 'File deleted successfully.');
    }
}
