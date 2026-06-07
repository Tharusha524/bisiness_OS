<?php
// Delete other users
$keepEmails = ['admin@example.com', 'user@example.com'];
$deletedUsers = \App\Models\User::whereNotIn('email', $keepEmails)->delete();
echo "Deleted $deletedUsers users.\n";

// Delete other roles (com_permissions)
// Keep '1' and '2' (if it exists)
$keepUserTypes = ['1', '2'];
$deletedPermissions = \App\Models\ComPermission::whereNotIn('userType', $keepUserTypes)->delete();
echo "Deleted $deletedPermissions roles from com_permissions.\n";

// If there's a com_user_types table, clean it up as well
if (class_exists(\App\Models\ComUserType::class)) {
    $deletedTypes = \App\Models\ComUserType::whereNotIn('id', [1, 2])->delete();
    echo "Deleted $deletedTypes user types from com_user_types.\n";
}
