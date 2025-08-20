<?php

namespace App\Enums;

enum PermissionEnum: string
{
    // User Management
    case VIEW_USERS = 'view_users';
    case CREATE_USERS = 'create_users';
    case EDIT_USERS = 'edit_users';
    case DELETE_USERS = 'delete_users';
    case MANAGE_USER_ROLES = 'manage_user_roles';

    // Role & Permission Management
    case VIEW_ROLES = 'view_roles';
    case CREATE_ROLES = 'create_roles';
    case EDIT_ROLES = 'edit_roles';
    case DELETE_ROLES = 'delete_roles';
    case VIEW_PERMISSIONS = 'view_permissions';
    case ASSIGN_PERMISSIONS = 'assign_permissions';

    // Reports
    case VIEW_REPORTS = 'view_reports';
    case GENERATE_REPORTS = 'generate_reports';
    case EXPORT_REPORTS = 'export_reports';
    case VIEW_ANALYTICS = 'view_analytics';

    /**
     * Get all permission values as an array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all permission names as an array
     */
    public static function names(): array
    {
        return array_column(self::cases(), 'name');
    }

    /**
     * Get permission display name
     */
    public function label(): string
    {
        return str_replace('_', ' ', ucwords($this->value));
    }

    /**
     * Get permission category
     */
    public function category(): string
    {
        return match (true) {
            str_contains($this->value, 'user') => 'User Management',
            str_contains($this->value, 'role') || str_contains($this->value, 'permission') => 'Role & Permission Management',
            str_contains($this->value, 'employee') => 'Employee Management',
            str_contains($this->value, 'department') => 'Department Management',
            str_contains($this->value, 'attendance') => 'Attendance Management',
            str_contains($this->value, 'leave') => 'Leave Management',
            str_contains($this->value, 'payroll') => 'Payroll Management',
            str_contains($this->value, 'performance') => 'Performance Management',
            str_contains($this->value, 'report') || str_contains($this->value, 'analytics') => 'Reports & Analytics',
            str_contains($this->value, 'setting') || str_contains($this->value, 'system') || str_contains($this->value, 'log') => 'System Management',
            default => 'General',
        };
    }

    /**
     * Get permissions grouped by category
     */
    public static function groupedByCategory(): array
    {
        $grouped = [];
        foreach (self::cases() as $permission) {
            $category = $permission->category();
            $grouped[$category][] = $permission;
        }

        return $grouped;
    }

    /**
     * Get permissions for a specific role
     */
    public static function forRole(RoleEnum $role): array
    {
        return match ($role) {
            RoleEnum::SUPER_ADMIN => self::values(), // All permissions
            RoleEnum::TEAM => [
                // Basic dashboard and profile access only
                self::VIEW_REPORTS->value,
            ],
        };
    }
}
