<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Users Export - {{ now()->format('Y-m-d H:i:s') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .subtitle {
            color: #666;
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
            word-wrap: break-word;
        }
        th {
            background-color: #4472C4;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .meta-info {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Users Export Report</div>
        <div class="subtitle">Generated on {{ now()->format('F j, Y \a\t g:i A') }}</div>
    </div>

    <div class="meta-info">
        <strong>Export Summary:</strong><br>
        Total Users: {{ $users->count() }}<br>
        Columns Exported: {{ count($columns) }}<br>
        Export Date: {{ now()->format('Y-m-d H:i:s') }}
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
            @foreach($users as $user)
                <tr>
                    @foreach($columns as $column)
                        <td>
                            @switch($column)
                                @case('id')
                                    {{ $user->id }}
                                    @break
                                @case('name')
                                    {{ $user->name }}
                                    @break
                                @case('email')
                                    {{ $user->email }}
                                    @break
                                @case('gender')
                                    {{ $user->gender ?? '-' }}
                                    @break
                                @case('address')
                                    {{ $user->address ?? '-' }}
                                    @break
                                @case('phone_number')
                                    {{ $user->phone_number ?? '-' }}
                                    @break
                                @case('roles')
                                    {{ collect($user->roles)->map(fn($role) => \App\Enums\RoleEnum::tryFrom($role->name)?->label() ?? ucwords(str_replace('_', ' ', $role->name)))->join(', ') ?: '-' }}
                                    @break
                                @case('created_at')
                                    {{ $user->created_at?->format('Y-m-d H:i:s') ?? '-' }}
                                    @break
                                @case('updated_at')
                                    {{ $user->updated_at?->format('Y-m-d H:i:s') ?? '-' }}
                                    @break
                                @default
                                    -
                            @endswitch
                        </td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically by the Employee Management System.</p>
        <p>{{ config('app.name') }} - {{ now()->year }}</p>
    </div>
</body>
</html>
