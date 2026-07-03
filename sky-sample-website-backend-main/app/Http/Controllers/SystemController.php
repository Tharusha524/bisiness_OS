<?php

namespace App\Http\Controllers;

use App\Models\System;
use App\Models\UserActivity;
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

        UserActivity::create([
            'user_id'     => $request->user()?->id,
            'user_name'   => $request->user()?->name,
            'user_email'  => $request->user()?->email,
            'action'      => 'CREATE',
            'module'      => 'Production System',
            'description' => ($request->user()?->name ?? 'User') . ' created production system "' . $system->name . '"',
            'ip_address'  => $request->ip(),
        ]);

        return response()->json($system, 201);
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

        UserActivity::create([
            'user_id'     => $request->user()?->id,
            'user_name'   => $request->user()?->name,
            'user_email'  => $request->user()?->email,
            'action'      => 'EDIT',
            'module'      => 'Production System',
            'description' => ($request->user()?->name ?? 'User') . ' updated production system "' . $system->name . '"',
            'ip_address'  => $request->ip(),
        ]);

        return response()->json($system);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(System $system)
    {
        $name = $system->name;
        $system->delete();

        UserActivity::create([
            'user_id'     => request()->user()?->id,
            'user_name'   => request()->user()?->name,
            'user_email'  => request()->user()?->email,
            'action'      => 'DELETE',
            'module'      => 'Production System',
            'description' => (request()->user()?->name ?? 'User') . ' deleted production system "' . $name . '"',
            'ip_address'  => request()->ip(),
        ]);

        return response()->json([
            'message' => 'System deleted successfully.'
        ]);
    }
}
