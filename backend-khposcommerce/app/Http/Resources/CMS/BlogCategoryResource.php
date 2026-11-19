<?php

namespace App\Http\Resources\CMS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $postsCount = isset($this->posts_count)
            ? (int) $this->posts_count
            : (int) ($this->relationLoaded('posts') ? $this->posts->count() : $this->posts()->count());

        return [
            'id'          => $this->id,
            'company_id'  => $this->company_id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'is_active'   => (bool) $this->is_active,
            'posts_count' => $postsCount,
            'blogs_count' => $postsCount,
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
