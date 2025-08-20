import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
    name: string;
    label: string;
    category: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    permissions: string[];
}

interface Props {
    role: Role;
    permissions: Record<string, Permission[]>;
}

export default function EditRole({ role, permissions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('roles.update', role.id), {
            onSuccess: () => {
                toast.success('Role updated successfully');
            },
            onError: () => {
                toast.error('Failed to update role');
            },
        });
    };

    const handlePermissionChange = (permission: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permission]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permission),
            );
        }
    };

    const toggleCategoryPermissions = (categoryPermissions: Permission[], allSelected: boolean) => {
        const permissionNames = categoryPermissions.map((p) => p.name);

        if (allSelected) {
            // Remove all category permissions
            setData(
                'permissions',
                data.permissions.filter((p) => !permissionNames.includes(p)),
            );
        } else {
            // Add all category permissions
            const newPermissions = [...data.permissions];
            permissionNames.forEach((permission) => {
                if (!newPermissions.includes(permission)) {
                    newPermissions.push(permission);
                }
            });
            setData('permissions', newPermissions);
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit Role: ${role.display_name}`} />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('roles.show', role.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Role
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
                        <p className="text-muted-foreground">Modify role details and permissions</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Information</CardTitle>
                            <CardDescription>Basic information about the role</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="e.g., custom_role"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                <p className="text-sm text-muted-foreground">Use lowercase letters, numbers, and underscores only</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>Select the permissions this role should have</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {Object.entries(permissions).map(([category, categoryPermissions]) => {
                                    const allSelected = categoryPermissions.every((p) => data.permissions.includes(p.name));

                                    return (
                                        <div key={category} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold">{category}</h3>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleCategoryPermissions(categoryPermissions, allSelected)}
                                                >
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                {categoryPermissions.map((permission) => (
                                                    <div key={permission.name} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={permission.name}
                                                            checked={data.permissions.includes(permission.name)}
                                                            onCheckedChange={(checked) => handlePermissionChange(permission.name, checked as boolean)}
                                                        />
                                                        <Label htmlFor={permission.name} className="cursor-pointer text-sm font-normal">
                                                            {permission.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>

                                            {Object.keys(permissions).indexOf(category) < Object.keys(permissions).length - 1 && <Separator />}
                                        </div>
                                    );
                                })}
                            </div>

                            {errors.permissions && <p className="mt-4 text-sm text-destructive">{errors.permissions}</p>}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href={route('roles.show', role.id)}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
