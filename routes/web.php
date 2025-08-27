<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', 'login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('roles', RoleController::class);

    Route::resource('permissions', PermissionController::class);

    require __DIR__.'/data.php';

    require __DIR__.'/users.php';
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
