<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class System extends Model
{
    protected $fillable = ['name'];

    public function metrics()
    {
        return $this->hasMany(Metric::class);
    }
}
