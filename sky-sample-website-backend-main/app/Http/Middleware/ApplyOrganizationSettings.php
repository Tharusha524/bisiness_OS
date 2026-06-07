<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ComOrganization;
use Illuminate\Support\Facades\Config;

class ApplyOrganizationSettings
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $org = ComOrganization::first();
            if ($org) {
                if (!empty($org->timezone)) {
                    date_default_timezone_set($org->timezone);
                    Config::set('app.timezone', $org->timezone);
                }
                if (!empty($org->systemEmailSender)) {
                    Config::set('mail.from.address', $org->systemEmailSender);
                    $name = $org->organizationName ?? 'Company';
                    Config::set('mail.from.name', $name);
                }
            }
        } catch (\Exception $e) {
            // Ignore if DB is not setup or table is missing
        }

        return $next($request);
    }
}
