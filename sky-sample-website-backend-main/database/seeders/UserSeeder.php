<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'mobile' => '0712345678',
                'availability' => true,
                'isCompanyEmployee' => true,
                'emailVerifiedAt' => true,
                'userType' => 1,
                'assigneeLevel' => 1,
            ]
        );

        // Create regular user
        User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('user123'),
                'role' => 'user',
                'mobile' => '0787654321',
                'availability' => true,
                'isCompanyEmployee' => false,
                'emailVerifiedAt' => true,
                'userType' => 2,
                'assigneeLevel' => 2,
            ]
        );
    }
}

