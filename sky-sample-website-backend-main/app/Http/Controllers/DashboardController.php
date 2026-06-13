<?php

namespace App\Http\Controllers;

use App\Models\System;
use App\Models\MetricDailyValue;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private function evaluateRule($value, $ruleStr): string
    {
        if (!$ruleStr) return 'grey';
        $rule = json_decode($ruleStr, true);
        if (!$rule || empty($rule['type']) || $rule['type'] === 'None' || empty($rule['config'])) return 'grey';

        $rawVal = floatval(preg_replace('/[^0-9.-]/', '', (string) $value));
        $config = $rule['config'];

        switch ($rule['type']) {
            case 'Min':
                $min = floatval($config['value'] ?? 0);
                $warn = isset($config['warning']) && $config['warning'] !== '' ? floatval($config['warning']) : null;
                if ($rawVal < $min) return 'red';
                if ($warn !== null && $rawVal <= $warn) return 'orange';
                return 'green';
            case 'Max':
                $max = floatval($config['value'] ?? 0);
                $warn = isset($config['warning']) && $config['warning'] !== '' ? floatval($config['warning']) : null;
                if ($rawVal > $max) return 'red';
                if ($warn !== null && $rawVal >= $warn) return 'orange';
                return 'green';
            case 'Range':
                if ($rawVal < floatval($config['min'] ?? 0) || $rawVal > floatval($config['max'] ?? 0)) return 'red';
                return 'green';
            case 'Target':
                $goal = floatval($config['value'] ?? 0);
                if ($goal == 0) return 'grey';
                $pct = ($rawVal / $goal) * 100;
                if ($pct < 80) return 'red';
                if ($pct < 100) return 'orange';
                return 'green';
        }
        return 'grey';
    }

    public function index()
    {
        $dbSystems = System::with('metrics')->orderBy('id', 'asc')->get();
        $formatted = [];

        foreach ($dbSystems as $system) {
            $metricsData = $system->metrics->map(function ($m) {
                $latestEntry = MetricDailyValue::where('metric_id', $m->id)
                    ->whereNotNull('value')
                    ->orderBy('data_date', 'desc')
                    ->first();

                $displayValue = $latestEntry ? $latestEntry->value : $m->value;
                $displayNote  = $latestEntry ? $latestEntry->notes : null;

                return [
                    'id'     => $m->id,
                    'label'  => strtoupper($m->name),
                    'value'  => $displayValue,
                    'status' => $this->evaluateRule($displayValue, $m->rule),
                    'note'   => $displayNote,
                ];
            })->values()->toArray();

            $formatted[] = [
                'id'      => $system->id,
                'name'    => $system->name,
                'metrics' => $metricsData,
            ];
        }

        return response()->json([
            'systems' => $formatted,
        ]);
    }
}
