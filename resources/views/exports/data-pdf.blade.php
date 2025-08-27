<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Data Export</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .export-info {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Data Export</h2>
        <p>Generated on {{ now()->format('Y-m-d H:i:s') }}</p>
    </div>

    <div class="export-info">
        <p><strong>Total Records:</strong> {{ count($data) }}</p>
        <p><strong>Columns:</strong> {{ implode(', ', $columns) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                @foreach($columns as $column)
                    <th>{{ $columnLabels[$column] ?? $column }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
                <tr>
                    @foreach($columns as $column)
                        <td>{{ $row[$column] ?? '-' }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
