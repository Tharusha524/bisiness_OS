<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateSqliteToMysql extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:sync-sqlite-to-mysql';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate data from SQLite database to MySQL database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting migration from SQLite to MySQL...');

        try {
            // Ensure sqlite points to the correct file instead of what's in DB_DATABASE
            config(['database.connections.sqlite.database' => database_path('database.sqlite')]);

            // Disable foreign key constraints on MySQL
            Schema::connection('mysql')->disableForeignKeyConstraints();
            $this->info('Disabled foreign key constraints on MySQL.');

            // Get all tables from SQLite
            $tables = DB::connection('sqlite')->select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            
            foreach ($tables as $tableRow) {
                $table = $tableRow->name;

                // Skip migrations table to preserve MySQL's own migration state
                if ($table === 'migrations') {
                    continue;
                }

                $this->info("Processing table: {$table}");

                // Truncate the table in MySQL to prevent duplicate key errors from seeders
                DB::connection('mysql')->table($table)->truncate();

                // Fetch all rows from SQLite
                $rows = DB::connection('sqlite')->table($table)->get();

                if ($rows->isEmpty()) {
                    $this->line(" - Table {$table} is empty. Skipping.");
                    continue;
                }

                $this->line(" - Found {$rows->count()} rows. Inserting into MySQL...");

                // Convert stdClass objects to arrays
                $data = $rows->map(function ($row) {
                    return (array) $row;
                })->toArray();

                // Insert into MySQL in chunks to avoid memory limits or large packet errors
                foreach (array_chunk($data, 500) as $chunk) {
                    DB::connection('mysql')->table($table)->insert($chunk);
                }

                $this->info(" - Successfully migrated {$table}.");
            }

            // Re-enable foreign key constraints
            Schema::connection('mysql')->enableForeignKeyConstraints();
            $this->info('Re-enabled foreign key constraints on MySQL.');

            $this->info('Migration completed successfully!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('An error occurred during migration: ' . $e->getMessage());
            
            // Try to re-enable foreign key constraints if an error occurs
            try {
                Schema::connection('mysql')->enableForeignKeyConstraints();
            } catch (\Exception $ex) {}
            
            return Command::FAILURE;
        }
    }
}
