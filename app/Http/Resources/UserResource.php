<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'roles' => $this->when(
                $this->relationLoaded('roles'),
                function () use ($request) {
                    // For edit forms, return just the IDs
                    if ($request->routeIs('users.edit')) {
                        return $this->roles->pluck('id');
                    }

                    // For other views, return full role resources
                    return RoleResource::collection($this->roles);
                }
            ),
            'direct_permissions' => $this->when(
                $this->relationLoaded('permissions'),
                fn () => $this->getDirectPermissions()->pluck('name')
            ),
            'all_permissions' => $this->when(
                $this->relationLoaded('permissions'),
                fn () => $this->getAllPermissions()->pluck('name')
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->when(isset($this->updated_at), $this->updated_at),
        ];
    }
}
