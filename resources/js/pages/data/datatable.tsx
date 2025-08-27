import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowLeft, Database, Download, FileSpreadsheet, MoreHorizontal, Search, Settings, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface DataRow {
    row_index: number;
    data: Record<string, string | number | boolean | null>;
    selected: boolean;
}

interface Stats {
    total_rows: number;
    columns: string[];
    header_row?: number;
}

interface Props {
    parsedData: DataRow[];
    sessionKey: string;
    filename: string;
    stats: Stats;
}

export default function DataDatatable({ parsedData, sessionKey, filename, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [removeDuplicates, setRemoveDuplicates] = useState(false);
    const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
    const [headerRow, setHeaderRow] = useState<string>(stats.header_row?.toString() || '');

    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return parsedData;

        return parsedData.filter((item) => {
            return Object.values(item.data).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }, [parsedData, searchTerm]);

    const handleSetHeaderRow = useCallback(
        (rowNumber: number) => {
            if (confirm(`Set row ${rowNumber} as the header row? This will update column names and remove this row from the data.`)) {
                router.post(route('data.reassign-headers'), {
                    session_key: sessionKey,
                    header_row: rowNumber,
                });
            }
        },
        [sessionKey],
    );

    // Create dynamic columns based on the data
    const columns = useMemo<ColumnDef<DataRow>[]>(() => {
        if (stats.columns.length === 0) return [];

        const dynamicColumns: ColumnDef<DataRow>[] = [
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        {...(table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected() ? { 'data-state': 'indeterminate' } : {})}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 40,
            },
            {
                id: 'actions',
                header: () => <div className="text-center">Actions</div>,
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSetHeaderRow(row.original.row_index)} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Set as header row
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 80,
            },
            {
                id: 'row_index',
                accessorFn: (row) => row.row_index,
                header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
                cell: ({ row }) => <div className="font-medium">{row.original.row_index}</div>,
                enableSorting: true,
                enableHiding: true,
                size: 60,
            },
        ];

        // Add dynamic columns from data
        stats.columns.forEach((columnKey, index) => {
            // Ensure we have a valid ID for TanStack Table
            const columnId = `column_${index}`;

            dynamicColumns.push({
                id: columnId,
                accessorFn: (row) => row.data[columnKey],
                header: ({ column }) => <DataTableColumnHeader column={column} title={String(columnKey)} />,
                cell: ({ row }) => {
                    const value = row.original.data[columnKey];
                    return <div className="max-w-[200px] truncate">{String(value || '-')}</div>;
                },
                enableSorting: true,
                enableHiding: true,
            });
        });

        return dynamicColumns;
    }, [stats.columns, handleSetHeaderRow]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
    });

    const handleExport = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) {
            alert('Please select at least one row to export.');
            return;
        }

        const visibleColumns = table
            .getVisibleLeafColumns()
            .filter((column) => column.id !== 'select' && column.id !== 'row_index' && column.id !== 'actions')
            .map((column) => {
                // Map column_0, column_1, etc. back to the original keys from stats.columns
                if (column.id.startsWith('column_')) {
                    const index = parseInt(column.id.replace('column_', ''));
                    return stats.columns[index];
                }
                return column.id;
            });
        console.log('Visible columns:', visibleColumns);
        console.log('Stats columns:', stats.columns);

        if (visibleColumns.length === 0) {
            alert('Please show at least one data column to export.');
            return;
        }

        setIsExporting(true);

        const selectedIndices = selectedRows.map((row) => row.original.row_index);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('data.export');

        const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content;
        if (token) {
            const csrf = document.createElement('input');
            csrf.type = 'hidden';
            csrf.name = '_token';
            csrf.value = token;
            form.appendChild(csrf);
        }

        // Add form data
        const inputs = [
            { name: 'session_key', value: sessionKey },
            { name: 'format', value: exportFormat },
            { name: 'remove_duplicates', value: removeDuplicates ? '1' : '0' },
        ];

        inputs.forEach((input) => {
            const inputElement = document.createElement('input');
            inputElement.type = 'hidden';
            inputElement.name = input.name;
            inputElement.value = input.value;
            form.appendChild(inputElement);
        });

        selectedIndices.forEach((index) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'selected_indices[]';
            input.value = String(index);
            form.appendChild(input);
        });

        visibleColumns.forEach((col) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'columns[]';
            input.value = col;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        setTimeout(() => setIsExporting(false), 1000);
    };

    const handleClearSession = () => {
        if (confirm('Are you sure you want to clear the session data? This will remove all imported data.')) {
            router.post(route('data.clear-session'), {
                session_key: sessionKey,
            });
        }
    };

    const handleReassignHeaders = () => {
        const rowNumber = parseInt(headerRow);
        if (!rowNumber || rowNumber < 1) {
            alert('Please enter a valid row number (1 or greater).');
            return;
        }

        if (rowNumber > stats.total_rows) {
            alert(`Row number cannot be greater than total rows (${stats.total_rows}).`);
            return;
        }

        router.post(route('data.reassign-headers'), {
            session_key: sessionKey,
            header_row: rowNumber,
        });
    };

    return (
        <AppLayout>
            <Head title="Data Table" />

            <div className="space-y-6 p-6 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('data.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Import
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <Database className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Data Table</h1>
                            <p className="text-muted-foreground">Working with: {filename}</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5" />
                                    Data Overview
                                </CardTitle>
                                <CardDescription>
                                    {table.getSelectedRowModel().rows.length} row(s) selected • {stats.total_rows} total rows • {stats.columns.length}{' '}
                                    columns
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearSession}
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear Session
                                </Button>
                                <DataTableViewOptions table={table} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search data..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    max={stats.total_rows}
                                    placeholder="Header row"
                                    value={headerRow}
                                    onChange={(e) => setHeaderRow(e.target.value)}
                                    className="w-24"
                                />
                                <Button variant="outline" size="sm" onClick={handleReassignHeaders} disabled={!headerRow}>
                                    Set Headers
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remove-duplicates"
                                        checked={removeDuplicates}
                                        onCheckedChange={(checked) => setRemoveDuplicates(!!checked)}
                                    />
                                    <label
                                        htmlFor="remove-duplicates"
                                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Remove duplicates
                                    </label>
                                </div>

                                <Select value={exportFormat} onValueChange={(value: 'excel' | 'csv' | 'pdf') => setExportFormat(value)}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="excel">Excel</SelectItem>
                                        <SelectItem value="csv">CSV</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={handleExport}
                                    disabled={table.getSelectedRowModel().rows.length === 0 || isExporting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isExporting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export {exportFormat.toUpperCase()}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No data found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    Session: {sessionKey.split('_').pop()}
                                </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">Showing all {table.getFilteredRowModel().rows.length} rows</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
