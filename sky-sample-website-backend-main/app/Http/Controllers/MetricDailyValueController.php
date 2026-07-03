<?php

namespace App\Http\Controllers;

use App\Models\Metric;
use App\Models\MetricDailyValue;
use App\Models\UserActivity;
use Illuminate\Http\Request;

class MetricDailyValueController extends Controller
{
    /**
     * List all daily values for a metric (most recent first).
     */
    public function index($metricId)
    {
        Metric::findOrFail($metricId);

        $history = MetricDailyValue::where('metric_id', $metricId)
            ->orderBy('data_date', 'desc')
            ->get();

        return response()->json($history);
    }

    /**
     * Get the daily value for a specific date.
     */
    public function show($metricId, $date)
    {
        Metric::findOrFail($metricId);

        $dailyValue = MetricDailyValue::where('metric_id', $metricId)
            ->whereDate('data_date', $date)
            ->first();

        return response()->json($dailyValue);
    }

    /**
     * Create or update the daily value for a specific date.
     */
    public function store(Request $request, $metricId)
    {
        $metric = Metric::findOrFail($metricId);

        $request->validate([
            'data_date'   => 'required|date',
            'value'       => 'nullable|string|max:255',
            'item_values' => 'nullable|array',
            'notes'       => 'nullable|string',
        ]);

        $user = $request->user();
        $permission = \App\Models\ComPermission::find($user->userType);
        $permObj = $permission ? ((array) $permission->permissionObject) : [];
        $canNote = !empty($permObj["KPI_{$metricId}_NOTE"]);

        $existingNotes = MetricDailyValue::where('metric_id', $metricId)
            ->whereDate('data_date', $request->data_date)
            ->value('notes');

        $dailyValue = MetricDailyValue::updateOrCreate(
            ['metric_id' => $metricId, 'data_date' => $request->data_date],
            [
                'value'       => $request->value,
                'item_values' => $request->item_values,
                'notes'       => $canNote ? $request->notes : $existingNotes,
            ]
        );

        // Always keep the main metric value in sync with the most recent daily entry
        $latest = MetricDailyValue::where('metric_id', $metricId)
            ->whereNotNull('value')
            ->orderBy('data_date', 'desc')
            ->first();
        if ($latest) {
            $metric->updateQuietly(['value' => $latest->value]);
        }

        UserActivity::create([
            'user_id'     => $user->id,
            'user_name'   => $user->name,
            'user_email'  => $user->email,
            'action'      => 'DATA_SAVE',
            'module'      => 'KPI Data',
            'description' => $user->name . ' saved KPI value for "' . $metric->name . '" on ' . $request->data_date,
            'ip_address'  => $request->ip(),
        ]);

        return response()->json($dailyValue, 201);
    }
}
