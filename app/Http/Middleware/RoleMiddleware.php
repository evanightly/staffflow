<?php

namespace App\Http\Middleware;

use App\Enums\RoleEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login')->with('error', 'Please login to access this page.');
        }

        $user = Auth::user();

        // Convert role strings to RoleEnum values for validation
        $validRoles = collect($roles)->map(function ($role) {
            // Try to find matching enum case
            foreach (RoleEnum::cases() as $roleEnum) {
                if ($roleEnum->value === $role || $roleEnum->name === strtoupper($role)) {
                    return $roleEnum->value;
                }
            }

            return $role; // Return as-is if no enum match found
        })->toArray();

        // Check if user has any of the required roles
        if (! $user->hasAnyRole($validRoles)) {
            abort(403, 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}
