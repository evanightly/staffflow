import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Role } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Users as UsersIcon } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    roles: Role[];
}

export default function Create({ roles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const handleRoleChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData(
                'roles',
                data.roles.filter((id) => id !== roleId),
            );
        }
    };

    return (
        <AppLayout>
            <Head title="Create User" />

            <div className="space-y-6 p-6 py-6">
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
                            <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
                            <p className="text-muted-foreground">Add a new user to the system</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>Basic user details and account information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter full name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                    <p className="text-sm text-muted-foreground">Minimum 8 characters required</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Confirm password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Role Assignment</CardTitle>
                            <CardDescription>Select the roles this user should have access to</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {roles.map((role) => (
                                        <div key={role.id} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role.id}`}
                                                    checked={data.roles.includes(role.id)}
                                                    onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                                                />
                                                <div className="space-y-1">
                                                    <Label htmlFor={`role-${role.id}`} className="cursor-pointer font-medium">
                                                        {role.display_name}
                                                    </Label>
                                                    {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <h4 className="mb-2 text-sm font-medium">Selected Roles:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {data.roles.length > 0 ? (
                                            data.roles.map((roleId) => {
                                                const role = roles.find((r) => r.id === roleId);
                                                return role ? (
                                                    <Badge key={role.id} variant="secondary">
                                                        {role.display_name}
                                                    </Badge>
                                                ) : null;
                                            })
                                        ) : (
                                            <Badge variant="outline">No roles assigned</Badge>
                                        )}
                                    </div>
                                </div>

                                {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href={route('users.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
