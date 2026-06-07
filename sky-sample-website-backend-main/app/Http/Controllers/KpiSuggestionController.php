<?php

namespace App\Http\Controllers;

use App\Models\Metric;
use Illuminate\Support\Facades\Http;

class KpiSuggestionController extends Controller
{
    public function generate($metricId)
    {
        $metric = Metric::with('metricItems')->findOrFail($metricId);

        $apiKey = config('services.gemini.api_key');
        if (!$apiKey) {
            return response()->json(['error' => 'Gemini API key not configured'], 500);
        }

        $cacheKey = "kpi_suggestions_{$metricId}_" . md5($metric->value . $metric->updated_at);

        $suggestions = \Illuminate\Support\Facades\Cache::remember($cacheKey, now()->addHours(24), function () use ($metric, $apiKey) {
            $siblingMetrics = Metric::where('system_id', $metric->system_id)
                ->where('id', '!=', $metric->id)
                ->get(['name', 'value', 'type']);

            $ruleText = $this->formatRule($metric->rule);
            $itemsText = $this->formatItems($metric->metricItems);
            $siblingsText = $this->formatSiblings($siblingMetrics);

            $prompt = $this->buildPrompt($metric, $ruleText, $itemsText, $siblingsText);

            $response = Http::post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                [
                    'contents' => [['parts' => [['text' => $prompt]]]]
                ]
            );

            if (!$response->successful()) {
                if ($response->status() === 429) {
                    return [
                        [
                            "title" => "Rate Limit Reached",
                            "desc" => "AI suggestions are currently unavailable due to API rate limits. Please try again later.",
                            "impact" => "INFO",
                            "impactType" => "medium"
                        ]
                    ];
                }
                return [
                    [
                        "title" => "AI Unavailable",
                        "desc" => "Unable to generate suggestions at this time. Please ensure the API is configured correctly.",
                        "impact" => "INFO",
                        "impactType" => "medium"
                    ]
                ];
            }

            $data = $response->json();
            $text = trim(data_get($data, 'candidates.0.content.parts.0.text', ''));

            // Try decoding the full response first, then fall back to extracting a JSON array
            $parsed = json_decode($text, true);
            if (!is_array($parsed)) {
                preg_match('/\[.*\]/s', $text, $matches);
                if (empty($matches)) {
                    return [
                        [
                            "title" => "Format Error",
                            "desc" => "AI returned an invalid format. Please try again.",
                            "impact" => "INFO",
                            "impactType" => "medium"
                        ]
                    ];
                }
                $parsed = json_decode($matches[0], true);
            }

            if (!is_array($parsed) || empty($parsed)) {
                return [
                    [
                        "title" => "Format Error",
                        "desc" => "AI returned an empty or invalid format. Please try again.",
                        "impact" => "INFO",
                        "impactType" => "medium"
                    ]
                ];
            }

            return $parsed;
        });

        return response()->json($suggestions);
    }

    private function formatRule(?string $ruleJson): string
    {
        if (!$ruleJson) return '';
        $rule = json_decode($ruleJson, true);
        if (!$rule) return '';

        $type = strtolower($rule['type'] ?? $rule['rule'] ?? '');
        $val  = $rule['value'] ?? $rule['min'] ?? null;
        if ($type === 'min') return $val !== null ? "Minimum target: {$val}" : '';
        if ($type === 'max') return $val !== null ? "Maximum limit: {$val}" : '';
        if ($type === 'range') return isset($rule['min'], $rule['max']) ? "Target range: {$rule['min']} to {$rule['max']}" : '';
        if ($type === 'target') return $val !== null ? "Target value: {$val}" : '';
        return '';
    }

    private function formatItems($items): string
    {
        if (!$items || $items->isEmpty()) return '';
        $lines = $items->map(fn($i) => "  - {$i->name}: {$i->value}")->join("\n");
        return "Current items:\n{$lines}";
    }

    private function formatSiblings($siblings): string
    {
        if ($siblings->isEmpty()) return '';
        $lines = $siblings->map(fn($m) => "  - {$m->name}: {$m->value}")->join("\n");
        return "Other KPIs in this system:\n{$lines}";
    }

    private function buildPrompt($metric, string $ruleText, string $itemsText, string $siblingsText): string
    {
        $parts = array_filter([
            "KPI Name: {$metric->name}",
            "Type: {$metric->type}",
            "Current Value: {$metric->value}",
            $ruleText ? "Rule: {$ruleText}" : null,
            $metric->description ? "Context: {$metric->description}" : null,
            $itemsText ?: null,
            $siblingsText ?: null,
        ]);

        $context = implode("\n", $parts);

        return <<<PROMPT
You are a business performance advisor. Analyze this KPI data and give exactly 2 short, practical improvement suggestions.

{$context}

Requirements:
- Exactly 2 suggestions
- title: max 5 words
- desc: max 20 words, plain English, actionable
- impact: first suggestion "HIGH IMPACT", second "MEDIUM IMPACT"
- impactType: "high" or "medium"
- Base suggestions on the context description and metrics provided

Reply ONLY with valid JSON, no extra text:
[
  {"title": "...", "desc": "...", "impact": "HIGH IMPACT", "impactType": "high"},
  {"title": "...", "desc": "...", "impact": "MEDIUM IMPACT", "impactType": "medium"}
]
PROMPT;
    }
}
