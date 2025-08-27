<?php

use App\Http\Controllers\DataController;
use App\Http\Controllers\DataFileController;
use Illuminate\Support\Facades\Route;

Route::prefix('data')->name('data.')->group(function () {
    Route::get('/', [DataController::class, 'index'])->name('index');
    Route::get('/files', [DataController::class, 'filesList'])->name('files');
    Route::get('/view/{sessionKey}', [DataController::class, 'viewDatatable'])->name('view');
    Route::redirect('/process', '/data');
    Route::post('/process', [DataController::class, 'process'])->name('process');
    Route::redirect('/reassign-headers', '/data');
    Route::post('/reassign-headers', [DataController::class, 'reassignHeaders'])->name('reassign-headers');
    Route::post('/export', [DataController::class, 'export'])->name('export');
    Route::post('/clear-session', [DataController::class, 'clearSession'])->name('clear-session');
    Route::get('/template', [DataController::class, 'downloadTemplate'])->name('template');
});

Route::prefix('data/files')->name('data.files.')->group(function () {
    Route::get('/', [DataFileController::class, 'index'])->name('index');
    Route::get('/{file}/download', [DataFileController::class, 'download'])->name('download');
    Route::delete('/{file}', [DataFileController::class, 'destroy'])->name('destroy');
});
