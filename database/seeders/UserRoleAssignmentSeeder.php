<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserRoleAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles
        $superAdminRole = Role::where('name', RoleEnum::SUPER_ADMIN->value)->first();
        $teamRole = Role::where('name', RoleEnum::TEAM->value)->first();

        if (! $superAdminRole || ! $teamRole) {
            $this->command->error('Roles not found. Please run RolePermissionSeeder first.');

            return;
        }

        // Create or find users and assign roles
        $this->assignSuperAdminRole($superAdminRole);
        $this->assignTeamRoles($teamRole);

        $this->command->info('User roles assigned successfully.');
    }

    /**
     * Assign super admin role to specific users
     */
    private function assignSuperAdminRole(Role $superAdminRole): void
    {
        // Define super admin users (you can modify these)
        $superAdminUsers = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($superAdminUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            if (! $user->hasRole($superAdminRole)) {
                $user->assignRole($superAdminRole);
                $this->command->info("Assigned super_admin role to: {$user->email}");
            }
        }
    }

    /**
     * Assign team role to regular users
     */
    private function assignTeamRoles(Role $teamRole): void
    {
        // Define team users (you can modify these)
        $teamUsers = [
            [
                'name' => 'Team Member 1',
                'email' => 'team1@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Team Member 2',
                'email' => 'team2@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($teamUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            if (! $user->hasRole($teamRole)) {
                $user->assignRole($teamRole);
                $this->command->info("Assigned team role to: {$user->email}");
            }
        }
    }
}
