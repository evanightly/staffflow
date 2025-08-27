<?php

use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserExportController;
use App\Http\Controllers\UserImportController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('roles', RoleController::class);

    Route::resource('permissions', PermissionController::class);

    Route::prefix('users/import')->name('users.import.')->group(function () {
        Route::get('/', [UserImportController::class, 'index'])->name('index');
        Route::post('/', [UserImportController::class, 'import'])->name('store');
        Route::get('/template', [UserImportController::class, 'downloadTemplate'])->name('template');
    });

    Route::prefix('users/export')->name('users.export.')->group(function () {
        Route::get('/', [UserExportController::class, 'index'])->name('index');
        Route::post('/excel', [UserExportController::class, 'exportExcel'])->name('excel');
        Route::post('/pdf', [UserExportController::class, 'exportPdf'])->name('pdf');
    });

    Route::resource('users', UserController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
