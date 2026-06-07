<?php

namespace App\Services;

class OrganizationService
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
}