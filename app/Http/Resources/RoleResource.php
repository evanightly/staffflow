<?php

namespace App\Http\Resources;

use App\Enums\RoleEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $roleEnum = collect(RoleEnum::cases())->first(fn ($enum) => $enum->value === $this->name);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $roleEnum?->label() ?? ucwords(str_replace('_', ' ', $this->name)),
            'description' => $roleEnum?->description() ?? null,
            'guard_name' => $this->when(isset($this->guard_name), $this->guard_name),

            // For index view - count and simple arrays
            'users_count' => $this->when(
                $this->relationLoaded('users') || isset($this->users_count),
                fn () => $this->users_count ?? $this->users->count()
            ),
            'permissions_count' => $this->when(
                $this->relationLoaded('permissions'),
                fn () => $this->permissions->count()
            ),

            // For different views
            'permissions' => $this->when(
                $this->relationLoaded('permissions'),
                function () use ($request) {
                    if ($request->routeIs('roles.show')) {
                        // For show view, return detailed permission objects
                        return PermissionResource::collection($this->permissions);
                    } else {
                        // For index view, return simple array of names
                        return $this->permissions->pluck('name');
                    }
                }
            ),

            'users' => $this->when(
                $request->routeIs('roles.show') && $this->relationLoaded('users'),
                fn () => UserResource::collection($this->users)
            ),

            'created_at' => $this->when(isset($this->created_at), $this->created_at),
            'updated_at' => $this->when(isset($this->updated_at), $this->updated_at),
        ];
    }
}
