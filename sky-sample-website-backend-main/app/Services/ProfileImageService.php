<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class ProfileImageService
{
    public function getImageUrl($path)
    {
        if (empty($path)) {
            return null;
        }

        return [
            'signedUrl' => url('storage/' . $path),
            'fileName'  => basename($path),
        ];
    }

    public function uploadImageToGCS($file)
    {
        $path = $file->store('profile-images', 'public');

        return ['gsutil_uri' => $path];
    }

    public function deleteImageFromGCS($uri)
    {
        Storage::disk('public')->delete($uri);
        return true;
    }
}
