<?php

namespace App\Http\Controllers;

use App\Models\Metric;
use App\Models\MetricItem;
use Illuminate\Http\Request;

class MetricItemController extends Controller
{
    public function index($metricId)
    {
        $metric = Metric::findOrFail($metricId);
        return response()->json($metric->metricItems()->orderBy('id', 'asc')->get());
    }

    public function store(Request $request, $metricId)
    {
        $metric = Metric::findOrFail($metricId);

        $validated = $request->request->all();
        // Since we are validating directly, let's use the validator
        $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'required|numeric',
        ]);

        $item = $metric->metricItems()->create([
            'name' => $request->name,
            'value' => $request->value
        ]);
        
        // Also add the name to the metric's items JSON array so the KPI form sees it
        $itemsArray = $metric->items ?? [];
        if (!in_array($item->name, $itemsArray)) {
            $itemsArray[] = $item->name;
            $metric->update(['items' => $itemsArray]);
        }

        $this->updateMetricTotal($metric);

        return response()->json($item, 201);
    }

    public function update(Request $request, $metricId, $itemId)
    {
        $metric = Metric::findOrFail($metricId);
        $item = $metric->metricItems()->findOrFail($itemId);

        $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'required|numeric',
        ]);

        $oldName = $item->name;
        $item->update([
            'name' => $request->name,
            'value' => $request->value
        ]);

        if ($oldName !== $item->name) {
            $itemsArray = $metric->items ?? [];
            if (($key = array_search($oldName, $itemsArray)) !== false) {
                $itemsArray[$key] = $item->name;
                $metric->update(['items' => array_values($itemsArray)]);
            }
        }

        $this->updateMetricTotal($metric);

        return response()->json($item);
    }

    public function destroy($metricId, $itemId)
    {
        $metric = Metric::findOrFail($metricId);
        $item = $metric->metricItems()->findOrFail($itemId);
        
        $name = $item->name;
        $item->delete();

        $itemsArray = $metric->items ?? [];
        if (($key = array_search($name, $itemsArray)) !== false) {
            unset($itemsArray[$key]);
            $metric->update(['items' => array_values($itemsArray)]);
        }

        $this->updateMetricTotal($metric);

        return response()->json(['message' => 'Item deleted successfully.']);
    }

    protected function updateMetricTotal(Metric $metric)
    {
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

        $metric->update(['value' => (string) $formattedValue]);
    }
}
