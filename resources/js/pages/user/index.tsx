import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Role, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Edit, Eye, FileSpreadsheet, Plus, Search, Trash2, Users as UsersIcon, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    users: (User & { roles: Role[] })[];
}

export default function Index({ users }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(
        (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleDelete = (userId: number) => {
        router.delete(route('users.destroy', userId), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="User Management" />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UsersIcon className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                            <p className="text-muted-foreground">Manage system users and their access</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('users.import.index')}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Import Users
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('users.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                                <CardDescription>System users and their assigned roles</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredUsers.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {user.email_verified_at ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                            <span className="text-sm text-green-600">Verified</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4 text-red-600" />
                                                            <span className="text-sm text-red-600">Unverified</span>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.length > 0 ? (
                                                        user.roles.map((role) => (
                                                            <Badge key={role.id} variant="outline" className="text-xs">
                                                                {role.display_name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            No roles
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('users.show', user.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('users.edit', user.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{user.name}"? This action cannot be undone and
                                                                    will permanently remove the user from the system.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className={buttonVariants({ variant: 'destructive' })}
                                                                    onClick={() => handleDelete(user.id)}
                                                                >
                                                                    Delete User
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new user.'}
                                </p>
                                {!searchTerm && (
                                    <div className="mt-6">
                                        <Button asChild>
                                            <Link href={route('users.create')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add User
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
