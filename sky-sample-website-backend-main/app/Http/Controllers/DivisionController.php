<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DivisionController extends Controller
{
    public function index()
    {
        // Map the real DB id and name to the schema expected by the frontend
        $divisions = \App\Models\Division::all()->map(function ($division) {
            return [
                'id' => (string) $division->id,
                'divisionName' => $division->name,
                'name' => $division->name
            ];
        });

        return response()->json($divisions);
    }
}
