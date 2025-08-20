<?php

namespace App\Http\Controllers;

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RoleController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('auth'),
            new Middleware('permission:view_roles', only: ['index', 'show']),
            new Middleware('permission:create_roles', only: ['create', 'store']),
            new Middleware('permission:edit_roles', only: ['edit', 'update']),
            new Middleware('permission:delete_roles', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::with('permissions')->withCount('users')->get();

        return Inertia::render('role/index', [
            'roles' => RoleResource::collection($roles),
            'can' => [
                'create' => Auth::user()->can('create_roles'),
                'edit' => Auth::user()->can('edit_roles'),
                'delete' => Auth::user()->can('delete_roles'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get permissions grouped by category with proper structure for frontend
        $permissionsGrouped = [];
        foreach (PermissionEnum::groupedByCategory() as $category => $permissions) {
            $permissionsGrouped[$category] = array_map(function ($permission) {
                return [
                    'name' => $permission->value,
                    'label' => $permission->label(),
                ];
            }, $permissions);
        }

        $availableRoles = collect(RoleEnum::cases())->map(function ($roleEnum) {
            return [
                'value' => $roleEnum->value,
                'label' => $roleEnum->label(),
                'description' => $roleEnum->description(),
            ];
        });

        return Inertia::render('role/create', [
            'permissions' => $permissionsGrouped,
            'availableRoles' => $availableRoles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request)
    {
        $validated = $request->validated();

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (isset($validated['permissions'])) {
            $role->givePermissionTo($validated['permissions']);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $role->load('permissions', 'users');

        return Inertia::render('role/show', [
            'role' => new RoleResource($role),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $role->load('permissions');

        // Get permissions grouped by category with proper structure for frontend
        $permissionsGrouped = [];
        foreach (PermissionEnum::groupedByCategory() as $category => $permissions) {
            $permissionsGrouped[$category] = array_map(function ($permission) {
                return [
                    'name' => $permission->value,
                    'label' => $permission->label(),
                ];
            }, $permissions);
        }

        $roleEnum = collect(RoleEnum::cases())->first(fn ($enum) => $enum->value === $role->name);

        $roleData = [
            'id' => $role->id,
            'name' => $role->name,
            'display_name' => $roleEnum?->label() ?? ucwords(str_replace('_', ' ', $role->name)),
            'description' => $roleEnum?->description() ?? null,
            'permissions' => $role->permissions->pluck('name'),
        ];

        return Inertia::render('role/edit', [
            'role' => $roleData,
            'permissions' => $permissionsGrouped,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, Role $role)
    {
        $validated = $request->validated();

        $role->update([
            'name' => $validated['name'],
        ]);

        // Sync permissions
        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        } else {
            $role->syncPermissions([]);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // Prevent deletion of system roles if they exist in enum
        $systemRoles = collect(RoleEnum::cases())->pluck('value');
        if ($systemRoles->contains($role->name)) {
            return back()->with('error', 'System roles cannot be deleted.');
        }

        // Check if role has users
        if ($role->users()->exists()) {
            return back()->with('error', 'Cannot delete role that has assigned users.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
