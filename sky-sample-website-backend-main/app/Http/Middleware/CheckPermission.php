<?php

namespace App\Http\Middleware;

use App\Models\ComPermission;
use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    /**
     * Grant access if the user holds ANY of the given permission keys.
     * Usage in routes: ->middleware('permission:KEY_ONE,KEY_TWO')
     */
    public function handle(Request $request, Closure $next, string ...$permissionKeys): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $permission = ComPermission::find($user->userType);

        if (!$permission) {
            return response()->json(['message' => 'No role is assigned to your account.'], 403);
        }

        $obj = $permission->permissionObject ?? [];

        foreach ($permissionKeys as $key) {
            if (!empty($obj[$key])) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'You do not have permission to perform this action.',
            'required_permissions' => $permissionKeys,
        ], 403);
    }
}
