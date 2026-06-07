<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class SendDailyDigest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-daily-digest';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily digest emails to users who opted in';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::where('emailDailyDigest', true)->get();

        if ($users->isEmpty()) {
            $this->info('No users opted in for the daily digest.');
            return;
        }

        foreach ($users as $user) {
            // Mocking the email dispatch.
            // In a real scenario, this would dispatch a Mailable or Job.
            // e.g. Mail::to($user->email)->send(new DailyDigestMail($user));
            
            Log::info("Daily digest dispatched to: {$user->email}");
            $this->info("Dispatched to {$user->email}");
        }

        $this->info('Daily digest process completed.');
    }
}
