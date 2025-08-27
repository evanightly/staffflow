<?php

namespace App\Http\Controllers;

use App\Models\ImportExportFile;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the dashboard
     */
    public function index()
    {
        $userRole = Auth::user()->roles->first()?->name ?? 'team';

        $importFiles = [];
        $exportFiles = [];

        if ($userRole === 'super_admin') {
            // Super admin sees ALL import files from all users
            $importFiles = ImportExportFile::where('filetype', 'import')
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Team members see ALL export files from all users
            $exportFiles = ImportExportFile::where('filetype', 'export')
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('dashboard', [
            'importFiles' => $importFiles,
            'exportFiles' => $exportFiles,
            'userRole' => $userRole,
        ]);
    }
}
