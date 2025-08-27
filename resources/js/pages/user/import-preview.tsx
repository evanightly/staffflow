import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle, Upload, Users as UsersIcon, XCircle } from 'lucide-react';

interface ParsedRow {
    row_number: number;
    data: {
        name?: string;
        email?: string;
        gender?: string;
        address?: string;
        phone_number?: string;
        password?: string;
        role?: string;
    };
    is_valid: boolean;
    errors: string[];
    email_exists: boolean;
}

interface Stats {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    errors: { row: number; errors: string[] }[];
}

interface Props {
    parsedData: ParsedRow[];
    stats: Stats;
    tempFilePath: string;
    originalFilename: string;
}

export default function ImportPreview({ parsedData, stats, tempFilePath, originalFilename }: Props) {
    const { post, processing } = useForm({
        temp_file_path: tempFilePath,
        original_filename: originalFilename,
    });

    const handleConfirmImport = () => {
        post(route('users.import.store'));
    };

    return (
        <AppLayout>
            <Head title="Import Preview" />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('users.import.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Import
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <UsersIcon className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Import Preview</h1>
                            <p className="text-muted-foreground">Review the data before importing</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Import Summary</CardTitle>
                                <CardDescription>File: {originalFilename}</CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.valid_rows}</div>
                                    <div className="text-sm text-muted-foreground">Valid Rows</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.invalid_rows}</div>
                                    <div className="text-sm text-muted-foreground">Invalid Rows</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{stats.total_rows}</div>
                                    <div className="text-sm text-muted-foreground">Total Rows</div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center gap-2">
                            {stats.valid_rows > 0 && (
                                <Button onClick={handleConfirmImport} disabled={processing} className="bg-green-600 hover:bg-green-700">
                                    {processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Confirm Import ({stats.valid_rows} users)
                                        </>
                                    )}
                                </Button>
                            )}
                            <Badge variant={stats.invalid_rows > 0 ? 'destructive' : 'secondary'}>
                                {stats.invalid_rows > 0 ? `${stats.invalid_rows} rows will be skipped` : 'All rows are valid'}
                            </Badge>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">Row</TableHead>
                                        <TableHead className="w-16">Status</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Issues</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((row) => (
                                        <TableRow key={row.row_number} className={!row.is_valid ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                            <TableCell className="font-medium">{row.row_number}</TableCell>
                                            <TableCell>
                                                {row.is_valid ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : row.email_exists ? (
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                            </TableCell>
                                            <TableCell>{row.data.name || '-'}</TableCell>
                                            <TableCell>{row.data.email || '-'}</TableCell>
                                            <TableCell>{row.data.gender || '-'}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{row.data.address || '-'}</TableCell>
                                            <TableCell>{row.data.phone_number || '-'}</TableCell>
                                            <TableCell>{row.data.role || '-'}</TableCell>
                                            <TableCell>
                                                {row.email_exists && (
                                                    <Badge variant="outline" className="mr-1 mb-1">
                                                        Email exists
                                                    </Badge>
                                                )}
                                                {row.errors.map((error, index) => (
                                                    <Badge key={index} variant="destructive" className="mr-1 mb-1">
                                                        {error}
                                                    </Badge>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
