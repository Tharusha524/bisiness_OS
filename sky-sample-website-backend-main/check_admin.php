<?php
$user = \App\Models\User::where('email', 'admin@example.com')->first();
if (!$user) {
    echo "User not found.\n";
    exit;
}

$userType = $user->userType;
if (!$userType) {
    echo "User does not have a userType set.\n";
    exit;
}

$permission = \App\Models\ComPermission::where('userType', $userType)->first();
if ($permission) {
    $obj = $permission->permissionObject;
    if (is_string($obj)) {
        $obj = json_decode($obj, true);
    }
} else {
    $permission = new \App\Models\ComPermission();
    $permission->userType = $userType;
    $permission->description = "Admin Permissions";
    $obj = [];
}

// Set the specific permissions
$obj['admin_access_mng_view'] = true;
$obj['admin_users_view'] = true;
$obj['admin_users_create'] = true;
$obj['admin_users_edit'] = true;
$obj['admin_users_delete'] = true;
$obj['dashboard_view'] = true;
$obj['insight_view'] = true;

$permission->permissionObject = $obj;
$permission->save();
echo "Permissions created/updated successfully for userType $userType.\n";
