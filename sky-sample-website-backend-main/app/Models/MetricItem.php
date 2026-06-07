<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetricItem extends Model
{
    protected $fillable = ['metric_id', 'name', 'value'];

    public function metric()
    {
        return $this->belongsTo(Metric::class);
    }
}
