<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            ['name' => 'Corporate'],
            ['name' => 'Vintage Denim Ltd'],
            ['name' => 'Vintage Denim Apparels Ltd.'],
            ['name' => 'Vintage Denim Studio Ltd.'],
            ['name' => 'All units'],
        ];

        foreach ($divisions as $division) {
            \App\Models\Division::firstOrCreate($division);
        }
    }
}
