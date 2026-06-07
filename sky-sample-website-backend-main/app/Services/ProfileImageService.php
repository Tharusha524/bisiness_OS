<?php

namespace App\Services;

class ProfileImageService
{
    /**
     * Get image URL (dummy implementation to satisfy missing dependency)
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
            'signedUrl' => url('storage/' . $path)
        ];
    }
    
    public function uploadImageToGCS($file)
    {
        return ['gsutil_uri' => 'dummy_uri'];
    }
    
    public function deleteImageFromGCS($uri)
    {
        return true;
    }
}