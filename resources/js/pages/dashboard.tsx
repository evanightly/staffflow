import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Database, Download, FileText, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface ImportExportFile {
    id: number;
    filename: string;
    filepath: string;
    filetype: 'import' | 'export';
    user: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    importFiles?: ImportExportFile[];
    exportFiles?: ImportExportFile[];
    userRole: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ importFiles = [], exportFiles = [], userRole }: Props) {
    const [deletingFile, setDeletingFile] = useState<number | null>(null);

    const handleDownload = (file: ImportExportFile) => {
        window.open(route('data.files.download', { file: file.id }), '_blank');
    };

    const handleDelete = (file: ImportExportFile) => {
        if (confirm(`Are you sure you want to delete "${file.filename}"? This action cannot be undone.`)) {
            setDeletingFile(file.id);
            router.delete(route('data.files.destroy', { file: file.id }), {
                onFinish: () => setDeletingFile(null),
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatFileSize = () => {
        // This is a placeholder - in a real app, you'd get file size from backend
        return 'Unknown size';
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Database className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-muted-foreground">
                                {userRole === 'super_admin' ? 'Manage your import and export files' : 'View your exported files'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Import Files - Super Admin Only */}
                    {userRole === 'super_admin' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Upload className="h-5 w-5" />
                                            All Import Files ({importFiles.length})
                                        </CardTitle>
                                        <CardDescription>All files uploaded for importing data by all users</CardDescription>
                                    </div>
                                    <Button asChild>
                                        <Link href={route('data.index')}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Import Data
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {importFiles.length > 0 ? (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Filename</TableHead>
                                                    <TableHead>Uploaded By</TableHead>
                                                    <TableHead>Upload Date</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {importFiles.map((file) => (
                                                    <TableRow key={file.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                                <div>
                                                                    <p className="font-medium">{file.filename}</p>
                                                                    {/* <p className="text-xs text-muted-foreground">{formatFileSize()}</p> */}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{file.user.name}</p>
                                                                <p className="text-xs text-muted-foreground">{file.user.email}</p>
                                                                {/* <p className="text-xs text-muted-foreground">ID: {file.user.id}</p> */}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{formatDate(file.created_at)}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => handleDownload(file)}>
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleDelete(file)}
                                                                    disabled={deletingFile === file.id}
                                                                >
                                                                    {deletingFile === file.id ? (
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="text-lg font-medium text-muted-foreground">No import files</h3>
                                        <p className="text-sm text-muted-foreground">No files have been uploaded yet</p>
                                        <Button asChild className="mt-4">
                                            <Link href={route('data.index')}>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Import Data
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Export Files - For Team Users */}
                    {userRole === 'team_user' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Download className="h-5 w-5" />
                                            All Export Files ({exportFiles.length})
                                        </CardTitle>
                                        <CardDescription>All files exported by all users</CardDescription>
                                    </div>
                                    {/* {userRole === 'super_admin' && (
                                        <Button asChild>
                                            <Link href={route('data.index')}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Export Data
                                            </Link>
                                        </Button>
                                    )} */}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {exportFiles.length > 0 ? (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Filename</TableHead>
                                                    <TableHead>Exported By</TableHead>
                                                    <TableHead>Export Date</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {exportFiles.map((file) => (
                                                    <TableRow key={file.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                                <div>
                                                                    <p className="font-medium">{file.filename}</p>
                                                                    <p className="text-xs text-muted-foreground">{formatFileSize()}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{file.user.name}</p>
                                                                <p className="text-xs text-muted-foreground">{file.user.email}</p>
                                                                <p className="text-xs text-muted-foreground">ID: {file.user.id}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{formatDate(file.created_at)}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => handleDownload(file)}>
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleDelete(file)}
                                                                    disabled={deletingFile === file.id}
                                                                >
                                                                    {deletingFile === file.id ? (
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Download className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="text-lg font-medium text-muted-foreground">No export files</h3>
                                        <p className="text-sm text-muted-foreground">No files have been exported yet</p>
                                        {/* {userRole === 'super_admin' && (
                                            <Button asChild className="mt-4">
                                                <Link href={route('data.index')}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Export Data
                                                </Link>
                                            </Button>
                                        )} */}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
