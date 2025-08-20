<?php

namespace App\Http\Middleware;

use App\Enums\PermissionEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login')->with('error', 'Please login to access this page.');
        }

        $user = Auth::user();

        // Convert permission strings to PermissionEnum values for validation
        $validPermissions = collect($permissions)->map(function ($permission) {
            // Try to find matching enum case
            foreach (PermissionEnum::cases() as $permissionEnum) {
                if ($permissionEnum->value === $permission || $permissionEnum->name === strtoupper($permission)) {
                    return $permissionEnum->value;
                }
            }

            return $permission; // Return as-is if no enum match found
        })->toArray();

        // Check if user has any of the required permissions (OR logic)
        if (! $user->hasAnyPermission($validPermissions)) {
            abort(403, 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}
