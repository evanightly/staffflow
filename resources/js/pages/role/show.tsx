import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Shield, Users } from 'lucide-react';

interface Permission {
    name: string;
    display_name: string;
    category: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    permissions: Permission[];
    users: User[];
    created_at: string;
    updated_at: string;
}

interface Props {
    role: Role;
}

export default function ShowRole({ role }: Props) {
    const groupedPermissions = role.permissions.reduce(
        (acc, permission) => {
            if (!acc[permission.category]) {
                acc[permission.category] = [];
            }
            acc[permission.category].push(permission);
            return acc;
        },
        {} as Record<string, Permission[]>,
    );

    return (
        <AppLayout>
            <Head title={`Role: ${role.display_name}`} />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('roles.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{role.display_name}</h1>
                        <p className="text-muted-foreground">{role.description || 'No description provided'}</p>
                    </div>
                    <Button asChild>
                        <Link href={route('roles.edit', role.id)}>Edit Role</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{role.users.length}</div>
                            <p className="text-xs text-muted-foreground">users have this role</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{role.permissions.length}</div>
                            <p className="text-xs text-muted-foreground">permissions assigned</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Created</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Date(role.created_at).toLocaleDateString()}</div>
                            <p className="text-xs text-muted-foreground">role creation date</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Users</CardTitle>
                            <CardDescription>Users who have been assigned this role</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {role.users.length === 0 ? (
                                <p className="py-4 text-center text-muted-foreground">No users assigned to this role</p>
                            ) : (
                                <div className="space-y-3">
                                    {role.users.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('roles.show', user.id)}>Manage</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                            <CardDescription>Basic information about this role</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Role Name</label>
                                <p className="mt-1 rounded bg-muted px-2 py-1 font-mono text-sm">{role.name}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                                <p className="mt-1 text-sm">{role.display_name}</p>
                            </div>

                            {role.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="mt-1 text-sm">{role.description}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="mt-1 text-sm">{new Date(role.updated_at).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>All permissions assigned to this role, organized by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(groupedPermissions).length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No permissions assigned to this role</p>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(groupedPermissions).map(([category, permissions], index) => (
                                    <div key={category}>
                                        <h3 className="mb-3 text-lg font-semibold">{category}</h3>
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                            {permissions.map((permission) => (
                                                <Badge key={permission.name} variant="secondary" className="justify-start">
                                                    {permission.display_name}
                                                </Badge>
                                            ))}
                                        </div>
                                        {index < Object.keys(groupedPermissions).length - 1 && <Separator className="mt-6" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
