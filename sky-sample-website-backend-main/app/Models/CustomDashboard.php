<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomDashboard extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'table_data',
        'special_notes'
    ];

    protected $casts = [
        'table_data' => 'array',
        'date' => 'date'
    ];
}
