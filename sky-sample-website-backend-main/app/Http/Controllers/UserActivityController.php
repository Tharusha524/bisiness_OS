<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use Illuminate\Http\Request;

class UserActivityController extends Controller
{
    public function index(Request $request)
    {
        $activities = UserActivity::orderBy('created_at', 'desc')
            ->limit(200)
            ->get();

        return response()->json($activities);
    }

    public static function log($request, string $action, string $module, string $description)
    {
        $user = $request->user();
        UserActivity::create([
            'user_id'    => $user?->id,
            'user_name'  => $user?->name,
            'user_email' => $user?->email,
            'action'     => $action,
            'module'     => $module,
            'description'=> $description,
            'ip_address' => $request->ip(),
        ]);
    }
}
