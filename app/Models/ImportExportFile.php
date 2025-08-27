<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportExportFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'filepath',
        'filetype',
        'user_id',
    ];

    protected $casts = [
        'filetype' => 'string',
    ];

    /**
     * Get the user that uploaded/exported the file.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if this is an import file.
     */
    public function isImport(): bool
    {
        return $this->filetype === 'import';
    }

    /**
     * Check if this is an export file.
     */
    public function isExport(): bool
    {
        return $this->filetype === 'export';
    }
}
