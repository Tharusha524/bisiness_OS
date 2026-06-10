<?php

namespace App\Http\Controllers;

use App\Models\System;
use App\Models\Metric;
use App\Models\Bank;
use Illuminate\Http\Request;

class MetricController extends Controller
{
    /**
     * Display a listing of the resource for a specific system.
     */
    public function index($systemId)
    {
        $system = System::findOrFail($systemId);
        return response()->json($system->metrics()->with('latestDailyValue')->orderBy('id', 'asc')->get());
    }

    /**
     * Store a newly created resource under a specific system.
     */
    public function store(Request $request, $systemId)
    {
        $system = System::findOrFail($systemId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'rule' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'items' => 'nullable|array',
            'unit' => 'nullable|string|max:255',
        ]);

        $metric = $system->metrics()->create($validated);

        $this->syncMetricItems($metric);

        return response()->json($metric, 201);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, $metricId)
    {
        $metric = Metric::findOrFail($metricId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'rule' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'items' => 'nullable|array',
            'unit' => 'nullable|string|max:255',
        ]);

        $metric->update($validated);

        $this->syncMetricItems($metric);

        return response()->json($metric);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy($metricId)
    {
        $metric = Metric::findOrFail($metricId);
        $metric->delete();

        return response()->json([
            'message' => 'Metric deleted successfully.'
        ]);
    }

    /**
     * Synchronize items for the metric with the metric_items table.
     */
    protected function syncMetricItems(Metric $metric)
    {
        $items = $metric->items ?? [];
        
        // Delete items that are not in the items list
        if (empty($items)) {
            $metric->metricItems()->delete();
        } else {
            $metric->metricItems()->whereNotIn('name', $items)->delete();
        }

        // Create new items for any that don't exist yet
        $existingItems = $metric->metricItems()->pluck('name')->toArray();
        foreach ($items as $item) {
            if (!in_array($item, $existingItems)) {
                $metric->metricItems()->create([
                    'name' => $item,
                    'value' => 0
                ]);
            }
        }
        
        // Only auto-calculate value from sub-items when the metric actually has sub-items.
        // For simple metrics (no sub-items), leave the value untouched so data-entry saves are preserved.
        $itemCount = $metric->metricItems()->count();
        if ($itemCount > 0) {
            $sum = $metric->metricItems()->sum('value');
            $formattedValue = number_format($sum);
            $type = strtolower($metric->type);
            $unit = $metric->unit;

            if ($type === 'currency') {
                $formattedValue = ($unit ? $unit . ' ' : 'Rs. ') . $formattedValue;
            } elseif ($type === 'percentage') {
                $formattedValue = $sum . '%';
            } elseif ($unit) {
                $formattedValue = $formattedValue . ' ' . $unit;
            }

            $metric->updateQuietly(['value' => (string) $formattedValue]);
        }
    }
}
