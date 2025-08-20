import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Role, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, Edit, Mail, Users as UsersIcon, XCircle } from 'lucide-react';

interface Props {
    user: User & { roles: Role[]; direct_permissions: string[]; all_permissions: string[] };
}

export default function Show({ user }: Props) {
    return (
        <AppLayout>
            <Head title={`User: ${user.name}`} />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <UsersIcon className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <p className="text-muted-foreground">User profile and access details</p>
                            </div>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={route('users.edit', user.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>Basic user details and account status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {user.email_verified_at ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">Email Verification</p>
                                    <p className="text-sm text-muted-foreground">{user.email_verified_at ? 'Verified' : 'Not verified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Member Since</p>
                                    <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Roles</CardTitle>
                            <CardDescription>Roles currently assigned to this user</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {user.roles.length > 0 ? (
                                    user.roles.map((role) => (
                                        <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <h4 className="font-medium">{role.display_name}</h4>
                                                {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
                                            </div>
                                            <Badge variant="secondary">{role.name}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center">
                                        <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">No roles assigned</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Permissions Summary</CardTitle>
                            <CardDescription>All permissions available to this user through their roles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-medium">Total Permissions: {user.all_permissions.length}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {user.all_permissions.map((permission) => (
                                            <Badge key={permission} variant="outline" className="text-xs">
                                                {permission.replace(/_/g, ' ').toLowerCase()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {user.all_permissions.length === 0 && (
                                    <div className="py-6 text-center">
                                        <p className="text-sm text-muted-foreground">No permissions available. Assign roles to grant permissions.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
