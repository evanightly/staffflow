import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, FileSpreadsheet, Upload, Users as UsersIcon } from 'lucide-react';
import { ChangeEvent, FormEventHandler, useRef } from 'react';

interface Props {
    templateDownloadUrl: string;
}

export default function Import({ templateDownloadUrl }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.import.store'), {
            onSuccess: () => {
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('file', file);
    };

    return (
        <AppLayout>
            <Head title="Import Users" />

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
                            <h1 className="text-3xl font-bold tracking-tight">Import Users</h1>
                            <p className="text-muted-foreground">Upload Excel or CSV file to import multiple users</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Download Template Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Download Template
                            </CardTitle>
                            <CardDescription>Download the Excel template to see the required format for importing users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="rounded-lg border border-dashed p-6 text-center">
                                    <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">Download the template to see the required columns and format</p>
                                </div>
                                <Button asChild className="w-full">
                                    <a href={templateDownloadUrl} download>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Template
                                    </a>
                                </Button>
                                <div className="text-xs text-muted-foreground">
                                    <p>
                                        <strong>Required columns:</strong>
                                    </p>
                                    <ul className="mt-1 list-inside list-disc space-y-1">
                                        <li>name (required)</li>
                                        <li>email (required, unique)</li>
                                        <li>gender (optional: male, female, other)</li>
                                        <li>address (optional)</li>
                                        <li>phone_number (optional)</li>
                                        <li>password (optional, defaults to: password123)</li>
                                        <li>role (optional: super_admin, team)</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload File Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload File
                            </CardTitle>
                            <CardDescription>Upload your Excel (.xlsx, .xls) or CSV file to import users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="file">Import File</Label>
                                    <Input ref={fileInputRef} id="file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                                    {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
                                </div>

                                <div className="rounded-lg border border-dashed p-6 text-center">
                                    {data.file ? (
                                        <div className="space-y-2">
                                            <FileSpreadsheet className="mx-auto h-8 w-8 text-green-600" />
                                            <p className="text-sm font-medium">{data.file.name}</p>
                                            <p className="text-xs text-muted-foreground">{(data.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">Select a file to upload</p>
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={!data.file || processing}>
                                    {processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Import Users
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-4 text-xs text-muted-foreground">
                                <p>
                                    <strong>Supported formats:</strong> .xlsx, .xls, .csv
                                </p>
                                <p>
                                    <strong>Maximum file size:</strong> 10MB
                                </p>
                                <p>
                                    <strong>Note:</strong> Duplicate emails will be skipped
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
