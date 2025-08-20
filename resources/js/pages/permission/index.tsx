import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, Search, Shield, Users } from 'lucide-react';
import { useState } from 'react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    category: string;
    roles: string[];
    roles_count: number;
    created_at: string;
}

interface Props {
    permissions: Permission[];
}

export default function PermissionsIndex({ permissions }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    // Use permissions directly as a flat array
    const totalPermissions = permissions.length;

    // Filter permissions based on search term
    const filteredPermissions = permissions?.filter(
        (permission) =>
            permission.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <AppLayout>
            <Head title="Permission Management" />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
                            <p className="text-muted-foreground">View and manage system permissions ({totalPermissions} total)</p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('roles.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    System Permissions
                                </CardTitle>
                                <CardDescription>All permissions available in the system ({filteredPermissions.length} shown)</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search permissions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredPermissions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Permission</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>System Name</TableHead>
                                        <TableHead className="text-center">Roles</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPermissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell className="font-medium">{permission.display_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{permission.category}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">{permission.name}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {permission.roles_count}
                                                    </Badge>
                                                    {permission.roles.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {permission.roles.slice(0, 2).map((role) => (
                                                                <Badge key={role} variant="outline" className="text-xs">
                                                                    {role.replace('_', ' ')}
                                                                </Badge>
                                                            ))}
                                                            {permission.roles.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{permission.roles.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(permission.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('permissions.show', permission.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No permissions found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ? 'Try adjusting your search criteria.' : 'No permissions available in the system.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
