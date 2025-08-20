import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Shield, Users } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    users_count: number;
}

interface Permission {
    id: number;
    name: string;
    display_name: string;
    category: string;
    roles: Role[];
    created_at: string;
}

interface Props {
    permission: Permission;
}

export default function ShowPermission({ permission }: Props) {
    return (
        <AppLayout>
            <Head title={`Permission: ${permission.display_name}`} />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('permissions.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Permissions
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{permission.display_name}</h1>
                        <p className="text-muted-foreground">Permission details and role assignments</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assigned Roles</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{permission.roles.length}</div>
                            <p className="text-xs text-muted-foreground">roles have this permission</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{permission.roles.reduce((total, role) => total + role.users_count, 0)}</div>
                            <p className="text-xs text-muted-foreground">users have this permission</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Created</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Date(permission.created_at).toLocaleDateString()}</div>
                            <p className="text-xs text-muted-foreground">permission creation date</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Details</CardTitle>
                            <CardDescription>Basic information about this permission</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Permission Name</label>
                                <p className="mt-1 rounded bg-muted px-2 py-1 font-mono text-sm">{permission.name}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                                <p className="mt-1 text-sm">{permission.display_name}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                <p className="mt-1 text-sm">
                                    <Badge variant="outline">{permission.category}</Badge>
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                                <p className="mt-1 text-sm">{new Date(permission.created_at).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Roles</CardTitle>
                            <CardDescription>Roles that have been granted this permission</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {permission.roles.length === 0 ? (
                                <p className="py-4 text-center text-muted-foreground">This permission is not assigned to any roles</p>
                            ) : (
                                <div className="space-y-3">
                                    {permission.roles.map((role) => (
                                        <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <div className="font-medium">
                                                    {role.name
                                                        .split('_')
                                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(' ')}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {role.users_count} user{role.users_count !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('roles.show', role.id)}>View Role</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
