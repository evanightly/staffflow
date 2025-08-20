import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Role, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowLeft, Download, FileSpreadsheet, Search, Users as UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    users: (User & { roles: Role[] })[];
    availableColumns: Record<string, string>;
}

export default function Export({ users, availableColumns }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const filteredUsers = useMemo(
        () =>
            users.filter(
                (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [users, searchTerm],
    );

    type U = User & { roles: Role[] };

    const columns = useMemo<ColumnDef<U>[]>(
        () => [
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
                id: 'id',
                accessorKey: 'id',
                header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
                enableSorting: true,
            },
            {
                id: 'name',
                accessorKey: 'name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
                enableSorting: true,
            },
            {
                id: 'email',
                accessorKey: 'email',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
                enableSorting: true,
            },
            {
                id: 'gender',
                accessorKey: 'gender',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
                enableSorting: true,
            },
            {
                id: 'address',
                accessorKey: 'address',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
                enableSorting: true,
            },
            {
                id: 'phone_number',
                accessorKey: 'phone_number',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Phone Number" />,
                enableSorting: true,
            },
            {
                id: 'roles',
                accessorKey: 'roles',
                header: 'Roles',
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        {row.original.roles && row.original.roles.length > 0 ? (
                            row.original.roles.map((role) => (
                                <Badge key={role.id} variant="secondary">
                                    {role.display_name}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="outline">No Role</Badge>
                        )}
                    </div>
                ),
                enableSorting: false,
            },
            {
                id: 'created_at',
                accessorKey: 'created_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
                cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
                enableSorting: true,
                sortingFn: (rowA, rowB, columnId) => {
                    const a = new Date(rowA.getValue<string>(columnId)).getTime();
                    const b = new Date(rowB.getValue<string>(columnId)).getTime();
                    return a === b ? 0 : a > b ? 1 : -1;
                },
            },
            {
                id: 'updated_at',
                accessorKey: 'updated_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
                cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString(),
                enableSorting: true,
                sortingFn: (rowA, rowB, columnId) => {
                    const a = new Date(rowA.getValue<string>(columnId)).getTime();
                    const b = new Date(rowB.getValue<string>(columnId)).getTime();
                    return a === b ? 0 : a > b ? 1 : -1;
                },
            },
        ],
        [],
    );

    const table = useReactTable({
        data: filteredUsers as U[],
        columns,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: true,
    });

    const handleExport = (format: 'excel' | 'pdf') => {
        // Collect selected IDs in the current sorted order
        const selected = table
            .getSortedRowModel()
            .rows.filter((r) => r.getIsSelected())
            .map((r) => (r.original as U).id);
        if (selected.length === 0) {
            alert('Please select at least one user to export.');
            return;
        }

        const visibleCols = table
            .getVisibleLeafColumns()
            .map((c) => c.id)
            .filter((id) => id !== 'select' && Object.keys(availableColumns).includes(id));
        if (visibleCols.length === 0) {
            alert('Please show at least one column to export.');
            return;
        }

        setIsExporting(true);

        const routeName = format === 'excel' ? 'users.export.excel' : 'users.export.pdf';
        const actionUrl = route(routeName);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = actionUrl;
        form.target = '_blank';

        const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content;
        if (token) {
            const csrf = document.createElement('input');
            csrf.type = 'hidden';
            csrf.name = '_token';
            csrf.value = token;
            form.appendChild(csrf);
        }

        selected.forEach((id) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'user_ids[]';
            input.value = String(id);
            form.appendChild(input);
        });

        visibleCols.forEach((col) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'columns[]';
            input.value = col;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        setTimeout(() => setIsExporting(false), 800);
    };

    return (
        <AppLayout>
            <Head title="Export Users" />

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
                            <h1 className="text-3xl font-bold tracking-tight">Export Users</h1>
                            <p className="text-muted-foreground">Select users and columns to export to Excel or PDF</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">Export Options</CardTitle>
                                <CardDescription>
                                    {table.getSelectedRowModel().rows.length} user(s) selected •{' '}
                                    {table.getVisibleLeafColumns().filter((c) => c.id !== 'select').length} column(s) visible
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <DataTableViewOptions table={table} />
                                <Button
                                    onClick={() => handleExport('excel')}
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
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleExport('pdf')}
                                    disabled={table.getSelectedRowModel().rows.length === 0 || isExporting}
                                    variant="destructive"
                                >
                                    {isExporting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="relative mt-4 w-64">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
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
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                            </div>
                            <DataTablePagination table={table} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
