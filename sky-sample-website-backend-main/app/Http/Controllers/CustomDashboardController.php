<?php

namespace App\Http\Controllers;

use App\Models\CustomDashboard;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CustomDashboardController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date', Carbon::today()->toDateString());
        
        $dashboard = CustomDashboard::whereDate('date', $date)->first();

        if (!$dashboard) {
            return response()->json([
                'date' => $date,
                'table_data' => null,
                'special_notes' => ''
            ]);
        }

        return response()->json($dashboard);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'table_data' => 'nullable|array',
            'special_notes' => 'nullable|string'
        ]);

        $dashboard = CustomDashboard::updateOrCreate(
            ['date' => $request->date],
            [
                'table_data' => $request->table_data,
                'special_notes' => $request->special_notes
            ]
        );

        return response()->json($dashboard);
    }

    public function history()
    {
        $dates = CustomDashboard::orderBy('date', 'desc')->pluck('date');
        return response()->json($dates);
    }
}
