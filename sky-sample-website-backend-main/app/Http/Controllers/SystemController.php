<?php

namespace App\Http\Controllers;

use App\Models\System;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(System::with('metrics')->orderBy('id', 'asc')->get());
    }

    /**
     * Display the specified resource.
     */
    public function show(System $system)
    {
        return response()->json($system);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:systems,name',
        ]);

        $system = System::create($validated);

        return response()->json($system, 211); // Custom status code or 201 Created
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, System $system)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:systems,name,' . $system->id,
        ]);

        $system->update($validated);

        return response()->json($system);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(System $system)
    {
        $system->delete();

        return response()->json([
            'message' => 'System deleted successfully.'
        ]);
    }
}
