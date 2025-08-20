<?php

use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('roles', RoleController::class);

    Route::resource('permissions', PermissionController::class);

    Route::resource('users', UserController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
