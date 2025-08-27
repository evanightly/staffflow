import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { RoleEnum } from '@/enums/role-enum';
import { NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, Key, LayoutGrid, Shield, Upload, User } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        allowedRoles: [RoleEnum.SUPER_ADMIN, RoleEnum.TEAM], // All roles can access dashboard
    },
    {
        title: 'Permissions',
        href: '/permissions',
        icon: Shield,
        allowedRoles: [RoleEnum.SUPER_ADMIN], // Only super admin
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: Key,
        allowedRoles: [RoleEnum.SUPER_ADMIN], // Only super admin
    },
    {
        title: 'Users',
        href: '/users',
        icon: User,
        allowedRoles: [RoleEnum.SUPER_ADMIN], // Only super admin
    },
    {
        title: 'Data Import',
        href: '/data',
        icon: Upload,
        allowedRoles: [RoleEnum.SUPER_ADMIN], // Only super admin
    },
    // {
    //     title: 'Data Files',
    //     href: '/data/files',
    //     icon: FileText,
    //     allowedRoles: [RoleEnum.SUPER_ADMIN], // Only super admin
    // },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { props } = usePage<SharedData>();
    const user = props.auth?.user;

    // Get user role from the first role (assuming users have one primary role)
    const userRole = user?.roles?.[0]?.name as RoleEnum | undefined;

    // Filter navigation items based on user role
    const filteredNavItems = useMemo(() => {
        if (!userRole) return [];

        return mainNavItems.filter((item) => {
            // If no allowedRoles specified, show to everyone
            if (!item.allowedRoles) return true;

            // Check if user's role is in the allowed roles
            return item.allowedRoles.includes(userRole);
        });
    }, [userRole]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
