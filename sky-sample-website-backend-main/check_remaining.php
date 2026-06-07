<?php
$users = \App\Models\User::all();
foreach($users as $u) {
    echo "Email: {$u->email}, userType: {$u->userType}\n";
}
