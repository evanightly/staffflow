<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions first
        $this->createPermissions();

        // Create roles and assign permissions
        $this->createRoles();

        $this->command->info('Roles and permissions seeded successfully.');
    }

    /**
     * Create all permissions from PermissionEnum
     */
    private function createPermissions(): void
    {
        $this->command->info('Creating permissions...');

        foreach (PermissionEnum::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
                'guard_name' => 'web',
            ]);
        }

        $this->command->info('Created '.count(PermissionEnum::cases()).' permissions.');
    }

    /**
     * Create roles and assign permissions
     */
    private function createRoles(): void
    {
        $this->command->info('Creating roles...');

        foreach (RoleEnum::cases() as $roleEnum) {
            // Create role
            $role = Role::firstOrCreate([
                'name' => $roleEnum->value,
                'guard_name' => 'web',
            ]);

            // Get permissions for this role
            $permissions = PermissionEnum::forRole($roleEnum);

            // Assign permissions to role
            $role->syncPermissions($permissions);

            $this->command->info("Created role: {$roleEnum->label()} with ".count($permissions).' permissions.');
        }
    }
}
