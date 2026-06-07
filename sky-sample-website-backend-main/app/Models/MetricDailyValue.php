<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetricDailyValue extends Model
{
    protected $fillable = ['metric_id', 'data_date', 'value', 'item_values', 'notes'];

    protected $casts = [
        'item_values' => 'array',
        'data_date'   => 'date:Y-m-d',
    ];

    public function metric()
    {
        return $this->belongsTo(Metric::class);
    }
}
