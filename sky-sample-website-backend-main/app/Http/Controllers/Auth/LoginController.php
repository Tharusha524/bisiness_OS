<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ComOrganization;
use App\Models\UserActivity;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use App\Notifications\EmailChangeOTPsend\SendOtpEmailChange;

class LoginController extends Controller
{
    public function login(LoginRequest $request)
    {
        $org = ComOrganization::first();
        if ($org && $org->maintenanceMode) {
            return response()->json(['message' => 'System is currently under maintenance. Please try again later.'], 503);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->availability != 1) {
            return response()->json(['message' => 'User is not available'], 403);
        }

        if (($user->personal2faEnabled) || ($org && $org->enforce2fa)) {
            $otp = rand(100000, 999999);
            $user->otp = $otp;
            $user->otp_expires_at = now()->addMinutes(5);
            $user->save();

            $organizationName = $org ? $org->organizationName : 'Company';
            $organizationFactoryName = $org ? $org->organizationFactoryName : '';
            $logoData = null;

            Notification::route('mail', $user->email)->notify(
                new SendOtpEmailChange($otp, $user->email, $user->name, $organizationName, $logoData, $organizationFactoryName)
            );

            return response()->json([
                'requires_2fa' => true,
                'message' => '2FA Code sent to email.',
                'user_id' => $user->id
            ], 200);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        UserActivity::create([
            'user_id'     => $user->id,
            'user_name'   => $user->name,
            'user_email'  => $user->email,
            'action'      => 'LOGIN',
            'module'      => 'Auth',
            'description' => $user->name . ' logged into the system',
            'ip_address'  => $request->ip(),
        ]);

        \App\Models\LoginHistory::create([
            'user_id'    => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device'     => $this->getDeviceFromUserAgent($request->userAgent()),
            'login_at'   => now(),
        ]);

        $permObj = $user->comPermission?->permissionObject ?? [];

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => array_merge(
                $user->only(['id', 'name', 'email', 'role', 'mobile', 'isCompanyEmployee', 'jobPosition', 'department']),
                ['permissionObject' => $permObj]
            )
        ], 201);
    }

    public function verify2fa(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'otp'     => 'required|digits:6',
        ]);

        $user = User::find($request->user_id);

        if (!$user || (string) $user->otp !== (string) $request->otp) {
            return response()->json(['message' => 'Invalid OTP code.'], 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired.'], 400);
        }

        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        UserActivity::create([
            'user_id'     => $user->id,
            'user_name'   => $user->name,
            'user_email'  => $user->email,
            'action'      => 'LOGIN',
            'module'      => 'Auth',
            'description' => $user->name . ' logged in via 2FA',
            'ip_address'  => $request->ip(),
        ]);

        \App\Models\LoginHistory::create([
            'user_id'    => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device'     => $this->getDeviceFromUserAgent($request->userAgent()),
            'login_at'   => now(),
        ]);

        $permObj = $user->comPermission?->permissionObject ?? [];

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => array_merge(
                $user->only(['id', 'name', 'email', 'role', 'mobile', 'isCompanyEmployee', 'jobPosition', 'department']),
                ['permissionObject' => $permObj]
            )
        ], 201);
    }

    private function getDeviceFromUserAgent($userAgent)
    {
        if (!$userAgent) return 'Unknown';
        $userAgent = strtolower($userAgent);
        if (strpos($userAgent, 'windows') !== false) return 'Windows PC';
        if (strpos($userAgent, 'mac') !== false) return 'Mac';
        if (strpos($userAgent, 'linux') !== false) return 'Linux PC';
        if (strpos($userAgent, 'iphone') !== false) return 'iPhone';
        if (strpos($userAgent, 'ipad') !== false) return 'iPad';
        if (strpos($userAgent, 'android') !== false) return 'Android Device';
        return 'Other Device';
    }
}
