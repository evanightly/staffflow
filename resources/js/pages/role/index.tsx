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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Shield, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    users_count: number;
    permissions_count: number;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: Role[];
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
}

export default function RolesIndex({ roles, can }: Props) {
    const handleDelete = (role: Role) => {
        router.delete(route('roles.destroy', role.id), {
            onSuccess: () => {
                toast.success('Role deleted successfully');
            },
            onError: (errors) => {
                toast.error(errors.message || 'Failed to delete role');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Role Management" />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground">Manage user roles and their permissions</p>
                    </div>
                    {can.create && (
                        <Button asChild>
                            <Link href={route('roles.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            System Roles
                        </CardTitle>
                        <CardDescription>Overview of all roles in the system and their configurations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-center">Users</TableHead>
                                    <TableHead className="text-center">Permissions</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-semibold">{role.display_name}</div>
                                                <div className="text-sm text-muted-foreground">{role.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {role.description || 'No description provided'}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="mx-auto flex w-fit items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {role.users_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="mx-auto flex w-fit items-center gap-1">
                                                <Shield className="h-3 w-3" />
                                                {role.permissions_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(role.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('roles.show', role.id)}>View</Link>
                                                </Button>
                                                {can.edit && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('roles.edit', role.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {can.delete && role.users_count === 0 && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the role "{role.display_name}". This action cannot be
                                                                    undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(role)}
                                                                    className={buttonVariants({ variant: 'destructive' })}
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
