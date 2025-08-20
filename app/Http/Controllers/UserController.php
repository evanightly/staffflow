<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('auth'),
            new Middleware('permission:view_users', only: ['index', 'show']),
            new Middleware('permission:create_users', only: ['create', 'store']),
            new Middleware('permission:edit_users', only: ['edit', 'update']),
            new Middleware('permission:delete_users', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('roles')->get();

        return Inertia::render('user/index', [
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all();

        return Inertia::render('user/create', [
            'roles' => RoleResource::collection($roles),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        $user = User::create($validated);

        if (isset($validated['roles'])) {
            $roles = Role::whereIn('id', $validated['roles'])->get();
            $user->syncRoles($roles);
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load('roles', 'permissions');

        return Inertia::render('user/show', [
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::all();

        return Inertia::render('user/edit', [
            'user' => new UserResource($user),
            'roles' => RoleResource::collection($roles),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => isset($validated['password']) ? bcrypt($validated['password']) : $user->password,
        ]);

        if (isset($validated['roles'])) {
            $roles = Role::whereIn('id', $validated['roles'])->get();
            $user->syncRoles($roles);
        } else {
            $user->syncRoles([]);
        }

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
