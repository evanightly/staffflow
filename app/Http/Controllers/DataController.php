<?php

namespace App\Http\Controllers;

use App\Exports\UserImportTemplateExport;
use App\Models\ImportExportFile;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Facades\Excel;

class DataController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('role:super_admin'),
        ];
    }

    /**
     * Show the data import page
     */
    public function index()
    {
        return Inertia::render('data/import', [
            'templateDownloadUrl' => route('data.template'),
        ]);
    }

    /**
     * Show the list of import/export files
     */
    public function filesList()
    {
        $userRole = Auth::user()->roles->first()?->name ?? 'team';

        $importFiles = [];
        $exportFiles = [];

        if ($userRole === 'super_admin') {
            // Super admin sees import files and their export files
            $importFiles = ImportExportFile::where('user_id', Auth::id())
                ->where('filetype', 'import')
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get();

            $exportFiles = ImportExportFile::where('user_id', Auth::id())
                ->where('filetype', 'export')
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Team members only see their export files
            $exportFiles = ImportExportFile::where('user_id', Auth::id())
                ->where('filetype', 'export')
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('data/files', [
            'importFiles' => $importFiles,
            'exportFiles' => $exportFiles,
            'userRole' => $userRole,
        ]);
    }

    /**
     * Download the data template
     */
    public function downloadTemplate()
    {
        return Excel::download(
            new UserImportTemplateExport,
            'data_import_template.xlsx'
        );
    }

    /**
     * Process uploaded file and show datatable
     */
    public function process(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
            'header_row' => 'nullable|integer|min:1', // Optional header row number
        ]);

        $file = $request->file('file');
        $headerRow = $request->input('header_row', null);

        try {
            // Save the uploaded file to storage and database
            $originalFileName = $file->getClientOriginalName();
            $storedFilePath = $file->store('imports', 'public');

            // Save import file record to database
            $importFile = ImportExportFile::create([
                'filename' => $originalFileName,
                'filepath' => $storedFilePath,
                'filetype' => 'import',
                'user_id' => Auth::id(),
            ]);
            // First pass: get all data without headers to allow header selection
            $dataImport = new class implements ToCollection
            {
                private $data = [];

                public function collection(Collection $rows)
                {
                    foreach ($rows as $index => $row) {
                        $this->data[] = [
                            'row_index' => $index + 1,
                            'data' => $row->toArray(),
                            'selected' => false,
                        ];
                    }
                }

                public function getData()
                {
                    return $this->data;
                }
            };

            Excel::import($dataImport, $file);
            $originalData = $dataImport->getData();

            // Process headers if header row is specified
            $columnHeaders = [];
            $processedData = $originalData;

            if ($headerRow && $headerRow <= count($originalData)) {
                // Use specified row as headers
                $headerRowData = $originalData[$headerRow - 1]['data'];
                $columnHeaders = array_values($headerRowData);

                // Remove header row from processed data
                $processedData = array_filter($originalData, function ($row) use ($headerRow) {
                    return $row['row_index'] !== $headerRow;
                });

                // Re-index the processed data and remap with new headers
                $processedData = array_values($processedData);
                foreach ($processedData as $index => &$row) {
                    $row['row_index'] = $index + 1;

                    // Remap data using new column headers
                    $oldData = $row['data'];
                    $newData = [];

                    // Map old column indices to new header names
                    foreach ($columnHeaders as $newIndex => $newHeader) {
                        $oldValue = isset($oldData[$newIndex]) ? $oldData[$newIndex] : null;
                        $newData[$newHeader] = $oldValue;
                    }

                    $row['data'] = $newData;
                }
            } else {
                // Automatically use first row as headers
                if (! empty($originalData)) {
                    $headerRowData = $originalData[0]['data'];
                    $columnHeaders = array_values($headerRowData);

                    // Remove first row and re-index
                    $processedData = array_slice($originalData, 1);
                    foreach ($processedData as $index => &$row) {
                        $row['row_index'] = $index + 1;

                        // Remap data using new column headers
                        $oldData = $row['data'];
                        $newData = [];

                        // Map old column indices to new header names
                        foreach ($columnHeaders as $newIndex => $newHeader) {
                            $oldValue = isset($oldData[$newIndex]) ? $oldData[$newIndex] : null;
                            $newData[$newHeader] = $oldValue;
                        }

                        $row['data'] = $newData;
                    }

                    // Set header row to 1 since we used the first row
                    $headerRow = 1;
                }
            }

            // Store data efficiently to avoid session size limits
            $sessionKey = 'imported_data_'.time();

            // Store all data in temporary files to avoid session size issues
            $tempDir = storage_path('app/temp');
            if (! file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $originalDataFile = $tempDir.'/original_'.$sessionKey.'.json';
            $processedDataFile = $tempDir.'/processed_'.$sessionKey.'.json';

            file_put_contents($originalDataFile, json_encode($originalData));
            file_put_contents($processedDataFile, json_encode($processedData));

            // Store only minimal metadata in session to avoid size limits
            $sessionDataToStore = [
                'import_file_id' => $importFile->id,
                'original_data_file' => $originalDataFile,
                'processed_data_file' => $processedDataFile,
                'filename' => $file->getClientOriginalName(),
                'header_row' => $headerRow,
                'total_rows' => count($processedData),
                'total_columns' => count($columnHeaders),
            ];

            Session::put($sessionKey, $sessionDataToStore);

            return redirect()->route('data.view', ['sessionKey' => $sessionKey]);

        } catch (\Exception $e) {
            return redirect()->route('data.index')
                ->with('error', 'Failed to process file: '.$e->getMessage());
        }
    }

    /**
     * View datatable with session data
     */
    public function viewDatatable($sessionKey)
    {
        $sessionData = Session::get($sessionKey);

        if (! $sessionData) {
            return redirect()->route('data.index')->with('error', 'Session data not found.');
        }

        // Load processed data from file
        $processedData = [];
        $columnHeaders = [];

        if (isset($sessionData['processed_data_file']) && file_exists($sessionData['processed_data_file'])) {
            $processedData = json_decode(file_get_contents($sessionData['processed_data_file']), true);

            // Extract column headers from the first row of processed data
            if (! empty($processedData) && isset($processedData[0]['data'])) {
                $columnHeaders = array_keys($processedData[0]['data']);
            }
        }

        return Inertia::render('data/datatable', [
            'parsedData' => $processedData,
            'sessionKey' => $sessionKey,
            'filename' => $sessionData['filename'],
            'stats' => [
                'total_rows' => count($processedData),
                'columns' => $columnHeaders,
                'header_row' => $sessionData['header_row'] ?? null,
            ],
        ]);
    }

    /**
     * Reassign header row for existing session data
     */
    public function reassignHeaders(Request $request)
    {
        $request->validate([
            'session_key' => 'required|string',
            'header_row' => 'required|integer|min:1',
        ]);

        $sessionKey = $request->input('session_key');
        $headerRow = $request->input('header_row');

        $sessionData = Session::get($sessionKey);
        if (! $sessionData) {
            return redirect()->route('data.index')->with('error', 'Session data not found.');
        }

        // Load data from files
        $originalData = null;
        $currentData = null;

        if (isset($sessionData['original_data_file']) && file_exists($sessionData['original_data_file'])) {
            $originalData = json_decode(file_get_contents($sessionData['original_data_file']), true);
        }

        if (isset($sessionData['processed_data_file']) && file_exists($sessionData['processed_data_file'])) {
            $currentData = json_decode(file_get_contents($sessionData['processed_data_file']), true);
        }

        if (! $originalData || ! $currentData) {
            return redirect()->route('data.index')->with('error', 'Data files not found.');
        }

        $columnHeaders = [];
        $processedData = [];

        // Find the selected row in current data first
        if ($headerRow <= count($currentData)) {
            $selectedRow = $currentData[$headerRow - 1];
            $headerRowData = $selectedRow['data'];
            $columnHeaders = array_values($headerRowData);

            // Now get all original data except rows that would become the new header
            // We need to find which original row corresponds to our selected row
            $processedData = [];
            $headerRowFound = false;

            foreach ($originalData as $originalRow) {
                // Check if this original row matches our selected header row data
                $originalRowValues = array_values($originalRow['data']);
                $selectedRowValues = array_values($headerRowData);

                // If this is the header row, skip it and mark as found
                if ($originalRowValues === $selectedRowValues && ! $headerRowFound) {
                    $headerRowFound = true;

                    continue;
                }

                // Add this row to processed data with new column mapping
                $newData = [];
                foreach ($columnHeaders as $newIndex => $newHeader) {
                    $oldValue = isset($originalRow['data'][$newIndex]) ? $originalRow['data'][$newIndex] : null;
                    $newData[$newHeader] = $oldValue;
                }

                $processedData[] = [
                    'row_index' => count($processedData) + 1,
                    'data' => $newData,
                ];
            }
        } else {
            return redirect()->route('data.index')->with('error', 'Invalid header row.');
        }

        // Update processed data file and session metadata
        if (isset($sessionData['processed_data_file'])) {
            file_put_contents($sessionData['processed_data_file'], json_encode($processedData));
        }

        // Update only essential session metadata (keep it very small)
        $updatedSessionData = [
            'import_file_id' => $sessionData['import_file_id'] ?? null,
            'original_data_file' => $sessionData['original_data_file'] ?? null,
            'processed_data_file' => $sessionData['processed_data_file'] ?? null,
            'filename' => $sessionData['filename'] ?? null,
            'header_row' => $headerRow,
            'total_rows' => count($processedData),
            'total_columns' => count($columnHeaders),
        ];

        Session::put($sessionKey, $updatedSessionData);

        return redirect()->route('data.view', ['sessionKey' => $sessionKey]);
    }

    /**
     * Export selected data
     */
    public function export(Request $request)
    {
        $validated = $request->validate([
            'session_key' => 'required|string',
            'selected_indices' => 'required|array|min:1',
            'columns' => 'required|array|min:1',
            'format' => 'required|string|in:excel,csv,pdf',
            'remove_duplicates' => 'boolean',
        ]);

        $sessionData = Session::get($validated['session_key']);

        if (! $sessionData) {
            return redirect()->route('data.index')
                ->with('error', 'Session data not found. Please upload the file again.');
        }

        // Load processed data from file
        $allData = [];
        if (isset($sessionData['processed_data_file']) && file_exists($sessionData['processed_data_file'])) {
            $allData = json_decode(file_get_contents($sessionData['processed_data_file']), true);
        }

        if (empty($allData)) {
            return redirect()->route('data.index')
                ->with('error', 'Data not found. Please upload the file again.');
        }
        $selectedData = collect($allData)
            ->whereIn('row_index', $validated['selected_indices'])
            ->map(function ($item) {
                return $item['data'];
            })
            ->toArray();

        // Filter columns
        $filteredData = array_map(function ($row) use ($validated) {
            return array_intersect_key($row, array_flip($validated['columns']));
        }, $selectedData);

        // Remove duplicates if requested
        if ($validated['remove_duplicates'] ?? false) {
            $filteredData = $this->removeDuplicates($filteredData);
        }

        $filename = 'data_export_'.now()->format('Y_m_d_H_i_s');

        if ($validated['format'] === 'excel') {
            return $this->exportToExcel($filteredData, $filename.'.xlsx', $validated['session_key']);
        } elseif ($validated['format'] === 'csv') {
            return $this->exportToCsv($filteredData, $filename.'.csv', $validated['session_key']);
        } else {
            return $this->exportToPdf($filteredData, $filename.'.pdf', $validated['columns'], $validated['session_key']);
        }
    }

    /**
     * Remove duplicate rows
     */
    private function removeDuplicates(array $data): array
    {
        $unique = [];
        $seen = [];

        foreach ($data as $row) {
            $hash = md5(serialize($row));
            if (! in_array($hash, $seen)) {
                $seen[] = $hash;
                $unique[] = $row;
            }
        }

        return $unique;
    }

    /**
     * Export to Excel
     */
    private function exportToExcel(array $data, string $filename, string $sessionKey)
    {
        $export = new class($data) implements \Maatwebsite\Excel\Concerns\FromArray
        {
            private $data;

            public function __construct($data)
            {
                $this->data = $data;
            }

            public function array(): array
            {
                if (empty($this->data)) {
                    return [];
                }

                // Add header row
                $headers = array_keys($this->data[0]);

                return array_merge([$headers], $this->data);
            }
        };

        // Create temporary file for storage
        $tempPath = storage_path('app/temp/'.$filename);
        if (! file_exists(dirname($tempPath))) {
            mkdir(dirname($tempPath), 0755, true);
        }

        Excel::store($export, 'temp/'.$filename);

        // Move to public storage
        $storedPath = 'exports/'.$filename;
        Storage::disk('public')->put($storedPath, Storage::get('temp/'.$filename));

        // Save export file record to database
        ImportExportFile::create([
            'filename' => $filename,
            'filepath' => $storedPath,
            'filetype' => 'export',
            'user_id' => Auth::id(),
        ]);

        // Clean up temp file
        Storage::delete('temp/'.$filename);

        return Excel::download($export, $filename);
    }

    /**
     * Export to CSV
     */
    private function exportToCsv(array $data, string $filename, string $sessionKey)
    {
        $export = new class($data) implements \Maatwebsite\Excel\Concerns\FromArray
        {
            private $data;

            public function __construct($data)
            {
                $this->data = $data;
            }

            public function array(): array
            {
                if (empty($this->data)) {
                    return [];
                }

                // Add header row
                $headers = array_keys($this->data[0]);

                return array_merge([$headers], $this->data);
            }
        };

        // Create temporary file for storage
        Excel::store($export, 'temp/'.$filename, null, \Maatwebsite\Excel\Excel::CSV);

        // Move to public storage
        $storedPath = 'exports/'.$filename;
        Storage::disk('public')->put($storedPath, Storage::get('temp/'.$filename));

        // Save export file record to database
        ImportExportFile::create([
            'filename' => $filename,
            'filepath' => $storedPath,
            'filetype' => 'export',
            'user_id' => Auth::id(),
        ]);

        // Clean up temp file
        Storage::delete('temp/'.$filename);

        return Excel::download($export, $filename, \Maatwebsite\Excel\Excel::CSV);
    }

    /**
     * Export to PDF
     */
    private function exportToPdf(array $data, string $filename, array $columns, string $sessionKey)
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.data-pdf', [
            'data' => $data,
            'columns' => $columns,
            'columnLabels' => array_combine($columns, $columns),
        ]);

        // Save PDF to storage first
        $pdfContent = $pdf->output();
        $storedPath = 'exports/'.$filename;
        Storage::disk('public')->put($storedPath, $pdfContent);

        // Save export file record to database
        ImportExportFile::create([
            'filename' => $filename,
            'filepath' => $storedPath,
            'filetype' => 'export',
            'user_id' => Auth::id(),
        ]);

        return $pdf->download($filename);
    }

    /**
     * Clear session data
     */
    public function clearSession(Request $request)
    {
        $validated = $request->validate([
            'session_key' => 'required|string',
        ]);

        Session::forget($validated['session_key']);

        return redirect()->route('data.index')
            ->with('success', 'Session data cleared successfully.');
    }
}
