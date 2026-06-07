<?php
$emails = ['admin@example.com', 'user@example.com'];

foreach ($emails as $email) {
    $user = \App\Models\User::where('email', $email)->first();
    if ($user) {
        echo "=== User: $email ===\n";
        echo "Name: " . $user->name . "\n";
        echo "Role: " . $user->role . "\n";
        echo "UserType ID: " . $user->userType . "\n";
        
        // Let's also check if there is a corresponding ComPermission for this userType
        if ($user->userType) {
            $permission = \App\Models\ComPermission::where('userType', $user->userType)->first();
            if ($permission) {
                echo "Permission Description: " . $permission->description . "\n";
            } else {
                echo "No permission record found for userType.\n";
            }
            
            // Check com_user_types table to get the actual user type name if it exists
            if (class_exists(\App\Models\ComUserType::class)) {
                $userTypeRec = \App\Models\ComUserType::find($user->userType);
                if ($userTypeRec) {
                    echo "UserType Name: " . $userTypeRec->name . "\n";
                }
            }
        }
        echo "\n";
    } else {
        echo "=== User: $email ===\n";
        echo "Not found in database.\n\n";
    }
}
