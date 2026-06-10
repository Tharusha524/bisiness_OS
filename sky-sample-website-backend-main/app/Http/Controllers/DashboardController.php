<?php

namespace App\Http\Controllers;

use App\Models\System;
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

    /**
     * Show the dashboard page.
     */
    public function index()
    {
        // Eager load systems with their metrics from the database
        $dbSystems = System::with('metrics.latestDailyValue')->orderBy('id', 'asc')->get();
        $formatted = [];

        foreach ($dbSystems as $system) {
            $nameLower = strtolower($system->name);
            $metrics = $system->metrics;
            
            if (str_contains($nameLower, 'finance')) {
                // Find absenteeism badge metric
                $absenteeism = $metrics->first(fn($m) => str_contains(strtolower($m->name), 'absenteeism'));
                
                // Other standard metrics
                $standardMetrics = $metrics->filter(fn($m) => !str_contains(strtolower($m->name), 'absenteeism'));

                // If standard metrics is empty, use defaults or fallback
                $metricsData = $standardMetrics->map(fn($m) => [
                    'id' => $m->id,
                    'label' => strtoupper($m->name),
                    'value' => $m->latestDailyValue?->value ?? $m->value,
                    'status' => $this->evaluateRule($m->latestDailyValue?->value ?? $m->value, $m->rule),
                    'note' => $m->latestDailyValue ? $m->latestDailyValue->notes : null
                ])->values()->toArray();

                $formatted[] = [
                    'id' => $system->id,
                    'name' => $system->name,
                    'type' => 'finance',
                    'metrics' => $metricsData,
                    'badge' => $absenteeism ? [
                        'metricId' => $absenteeism->id,
                        'label' => strtoupper($absenteeism->name),
                        'value' => $absenteeism->latestDailyValue?->value ?? $absenteeism->value,
                        'type' => 'danger',
                        'note' => $absenteeism->latestDailyValue ? $absenteeism->latestDailyValue->notes : null
                    ] : null
                ];
            } elseif (str_contains($nameLower, 'store')) {
                // Find alert/unavailability metric
                $unavailability = $metrics->first(fn($m) => str_contains(strtolower($m->name), 'unavailability') || str_contains(strtolower($m->name), 'spare'));

                // All other metrics (not the unavailability/spare alert)
                $standardMetrics = $metrics->filter(fn($m) => !str_contains(strtolower($m->name), 'unavailability') && !str_contains(strtolower($m->name), 'spare'));
                $metricsData = $standardMetrics->map(fn($m) => [
                    'id' => $m->id,
                    'label' => strtoupper($m->name),
                    'value' => $m->latestDailyValue?->value ?? $m->value,
                    'status' => $this->evaluateRule($m->latestDailyValue?->value ?? $m->value, $m->rule),
                    'note' => $m->latestDailyValue ? $m->latestDailyValue->notes : null
                ])->values()->toArray();

                $formatted[] = [
                    'id' => $system->id,
                    'name' => $system->name,
                    'type' => 'stores',
                    'metrics' => $metricsData,
                    'alert' => $unavailability ? [
                        'metricId' => $unavailability->id,
                        'label' => strtoupper($unavailability->name),
                        'value' => $unavailability->latestDailyValue?->value ?? $unavailability->value,
                        'note' => $unavailability->latestDailyValue ? $unavailability->latestDailyValue->notes : null
                    ] : null,
                    'status' => 'System Optimal'
                ];
            } elseif (str_contains($nameLower, 'health') || str_contains($nameLower, 'safety')) {
                // Find accidents metric
                $accidents = $metrics->first(fn($m) => str_contains(strtolower($m->name), 'accident'));
                
                // Other standard metrics (e.g. response time)
                $responseTimes = $metrics->filter(fn($m) => !str_contains(strtolower($m->name), 'accident'));
                $metricsData = $responseTimes->map(fn($m) => [
                    'id' => $m->id,
                    'label' => strtoupper($m->name),
                    'value' => $m->latestDailyValue?->value ?? $m->value,
                    'status' => $this->evaluateRule($m->latestDailyValue?->value ?? $m->value, $m->rule),
                    'note' => $m->latestDailyValue ? $m->latestDailyValue->notes : null
                ])->values()->toArray();

                $formatted[] = [
                    'id' => $system->id,
                    'name' => $system->name,
                    'type' => 'healthSafety',
                    'badge' => $accidents ? [
                        'metricId' => $accidents->id,
                        'label' => strtoupper($accidents->name),
                        'value' => $accidents->latestDailyValue?->value ?? $accidents->value,
                        'type' => 'success',
                        'note' => $accidents->latestDailyValue ? $accidents->latestDailyValue->notes : null
                    ] : null,
                    'metrics' => $metricsData
                ];
            } elseif (str_contains($nameLower, 'maintenance')) {
                $metricsData = $metrics->map(fn($m) => [
                    'id' => $m->id,
                    'label' => strtoupper($m->name),
                    'value' => $m->latestDailyValue?->value ?? $m->value,
                    'status' => $this->evaluateRule($m->latestDailyValue?->value ?? $m->value, $m->rule),
                    'note' => $m->latestDailyValue ? $m->latestDailyValue->notes : null
                ])->values()->toArray();

                $formatted[] = [
                    'id' => $system->id,
                    'name' => $system->name,
                    'type' => 'maintenance',
                    'metrics' => $metricsData
                ];
            } else {
                // Fallback default structure for newly added custom systems
                $metricsData = $metrics->map(fn($m) => [
                    'id' => $m->id,
                    'label' => strtoupper($m->name),
                    'value' => $m->latestDailyValue?->value ?? $m->value,
                    'status' => $this->evaluateRule($m->latestDailyValue?->value ?? $m->value, $m->rule),
                    'note' => $m->latestDailyValue ? $m->latestDailyValue->notes : null
                ])->values()->toArray();

                $formatted[] = [
                    'id' => $system->id,
                    'name' => $system->name,
                    'type' => 'default',
                    'metrics' => $metricsData,
                    'status' => 'System Operational'
                ];
            }
        }

        return response()->json([
            'systems' => $formatted
        ]);
    }
}
