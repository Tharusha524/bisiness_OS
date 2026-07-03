<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserActivity;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        $user = $request->user();

        UserActivity::create([
            'user_id'     => $user?->id,
            'user_name'   => $user?->name,
            'user_email'  => $user?->email,
            'action'      => 'LOGOUT',
            'module'      => 'Auth',
            'description' => ($user?->name ?? 'User') . ' logged out',
            'ip_address'  => $request->ip(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }
}
