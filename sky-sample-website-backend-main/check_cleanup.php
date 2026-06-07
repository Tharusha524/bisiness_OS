<?php
// Check users
$users = \App\Models\User::all();
echo "Users:\n";
foreach($users as $u) {
    echo "ID: $u->id, Email: $u->email, Name: $u->name\n";
}

// Check roles / permissions
$permissions = \App\Models\ComPermission::all();
echo "\nRoles (ComPermission):\n";
foreach($permissions as $p) {
    echo "ID: $p->id, userType: $p->userType, Description: $p->description\n";
}
