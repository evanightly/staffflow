<?php

namespace App\Http\Controllers;

use App\Enums\PermissionEnum;
use App\Http\Resources\PermissionResource;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('auth'),
            new Middleware('permission:view_permissions', only: ['index', 'show']),
            new Middleware('permission:assign_permissions', only: ['create', 'store', 'edit', 'update', 'destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permissions = Permission::with('roles')->get();

        return Inertia::render('permission/index', [
            'permissions' => PermissionResource::collection($permissions),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // For system permissions, we typically don't allow creating new ones
        // as they should be defined in the PermissionEnum
        return back()->with('info', 'Permissions are managed through the system configuration.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // For system permissions, we typically don't allow creating new ones
        return back()->with('info', 'Permissions are managed through the system configuration.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        $permission->load('roles.users');

        return Inertia::render('permission/show', [
            'permission' => new PermissionResource($permission),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Permission $permission)
    {
        // For system permissions, we typically don't allow editing
        return back()->with('info', 'System permissions cannot be edited.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission)
    {
        // For system permissions, we typically don't allow editing
        return back()->with('info', 'System permissions cannot be edited.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        // Prevent deletion of system permissions
        $systemPermissions = collect(PermissionEnum::cases())->pluck('value');
        if ($systemPermissions->contains($permission->name)) {
            return back()->with('error', 'System permissions cannot be deleted.');
        }

        $permission->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }
}
