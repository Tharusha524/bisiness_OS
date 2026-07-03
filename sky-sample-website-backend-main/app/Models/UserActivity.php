<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserActivity extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'action',
        'module',
        'description',
        'ip_address',
    ];
}
