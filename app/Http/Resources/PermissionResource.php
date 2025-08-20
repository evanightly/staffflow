<?php

namespace App\Http\Resources;

use App\Enums\PermissionEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $permissionEnum = collect(PermissionEnum::cases())->first(fn ($enum) => $enum->value === $this->name);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $permissionEnum?->label() ?? ucwords(str_replace('_', ' ', $this->name)),
            'category' => $permissionEnum?->category() ?? 'System',
            'guard_name' => $this->when(isset($this->guard_name), $this->guard_name),
            'roles' => $this->when(
                $request->routeIs('permissions.index'),
                fn () => $this->roles->pluck('name'),
                fn () => RoleResource::collection($this->whenLoaded('roles'))
            ),
            'roles_count' => $this->when(
                $this->relationLoaded('roles'),
                fn () => $this->roles->count()
            ),
            'created_at' => $this->when(isset($this->created_at), $this->created_at),
            'updated_at' => $this->when(isset($this->updated_at), $this->updated_at),
        ];
    }
}
