<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Welcome to {{ config('app.name') }}!</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="text-align: center; background-color: #6a8ff3; padding: 20px;">
            <img src="{{ $logoUrl ?? asset('/assets/images/logo-blue.png') }}" alt="{{ $organizationName }} Logo" style="width: 100px; height: auto;">

        </div>
        <div style="padding: 30px;">
            <h1 style="font-size: 22px; color: #333; margin-bottom: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; text-align: center;">
                Welcome to {{ config('app.name') }}!
            </h1>
            <p style="font-size: 16px; color: #333;">Hello <strong>{{ $name }}</strong>,</p>
            <p style="font-size: 16px; color: #333; margin-top: 30px;">We are thrilled to welcome you to {{ config('app.name') }}, your trusted partner in innovative software solutions. By joining our platform, you are stepping into a world of cutting-edge technology and digital excellence.</p>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">Our platform empowers you to access premium software development resources, connect with our expert team, and stay updated on the latest technological advancements to drive your business forward.</p>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">If you have any questions, need technical assistance, or wish to explore our IT solutions, our support team is always ready to help. Let's build the future together!</p>
            <p style="font-size: 16px; color: #333; margin-top: 30px;">Thank you for choosing us.</p>
            <p style="font-size: 16px; color: #333; margin-top: 30px;">Best regards,</p>
            <p style="font-size: 16px; color: #333; font-weight: bold; margin: 5px 0;">The {{ config('app.name') }} Team</p>
        </div>
        <div style="text-align: center; padding: 10px; background-color: #3b82f6;">
            <p style="font-size: 12px; color: #ffffff;">&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
