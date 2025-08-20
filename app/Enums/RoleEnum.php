<?php

namespace App\Enums;

enum RoleEnum: string
{
    case SUPER_ADMIN = 'super_admin';
    case TEAM = 'team';

    /**
     * Get all role values as an array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all role names as an array
     */
    public static function names(): array
    {
        return array_column(self::cases(), 'name');
    }

    /**
     * Get role display name
     */
    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Administrator',
            self::TEAM => 'Team Member',
        };
    }

    /**
     * Get role description
     */
    public function description(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Full system access with all permissions including user management, data import/export, and system configuration',
            self::TEAM => 'Basic team member access with login capability and limited dashboard access',
        };
    }

    /**
     * Check if role is administrative
     */
    public function isAdmin(): bool
    {
        return $this === self::SUPER_ADMIN;
    }

    /**
     * Check if role can manage employees
     */
    public function canManageEmployees(): bool
    {
        return $this === self::SUPER_ADMIN;
    }

    /**
     * Check if role can manage system
     */
    public function canManageSystem(): bool
    {
        return $this === self::SUPER_ADMIN;
    }
}
