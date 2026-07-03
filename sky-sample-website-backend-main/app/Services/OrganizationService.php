<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class OrganizationService
{
    /**
     * Get image URL
     *
     * @param string|null $path
     * @return array|null
     */
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
        $path = $file->store('organization-images', 'public');
        return ['gsutil_uri' => $path];
    }

    public function removeOldDocumentFromStorage($path)
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return true;
        }
        return false;
    }
}