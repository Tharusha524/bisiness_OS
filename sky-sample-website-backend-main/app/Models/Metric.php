<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Metric extends Model
{
    protected $fillable = ['system_id', 'name', 'value', 'icon', 'type', 'rule', 'description', 'is_active', 'items', 'unit'];

    protected $casts = [
        'is_active' => 'boolean',
        'items' => 'array',
    ];

    public function system()
    {
        return $this->belongsTo(System::class);
    }

    public function metricItems()
    {
        return $this->hasMany(MetricItem::class);
    }

    public function latestDailyValue()
    {
        return $this->hasOne(MetricDailyValue::class)->latestOfMany();
    }
}
