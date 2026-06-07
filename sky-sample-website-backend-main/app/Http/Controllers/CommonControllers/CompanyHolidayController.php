<?php

namespace App\Http\Controllers\CommonControllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CompanyHolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\CompanyHoliday::orderBy('date', 'asc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'name' => 'required|string',
        ]);
        $holiday = \App\Models\CompanyHoliday::create($request->all());
        return response()->json($holiday, 201);
    }

    public function show(string $id)
    {
        return \App\Models\CompanyHoliday::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'date' => 'required|date',
            'name' => 'required|string',
        ]);
        $holiday = \App\Models\CompanyHoliday::findOrFail($id);
        $holiday->update($request->all());
        return response()->json($holiday);
    }

    public function destroy(string $id)
    {
        \App\Models\CompanyHoliday::destroy($id);
        return response()->json(null, 204);
    }
}
