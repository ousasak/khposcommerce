<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\CMS\Testimonial;
use App\Models\Company\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends BaseApiController
{
    /**
     * GET /api/v1/testimonials
     */
    public function index(Request $request): JsonResponse
    {
        $hasSearch   = $request->filled('search');
        $hasActive   = $request->filled('is_active');
        $hasFeatured = $request->filled('is_featured');
        $hasRating   = $request->filled('rating');
        $sortBy      = $request->input('sort', 'id');
        $sortOrder   = $request->input('order', 'desc');
        $perPage     = (int) $request->input('per_page', 20);

        $query = Testimonial::query();

        if ($hasSearch) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('author_name', 'like', "%{$s}%")
                  ->orWhere('role', 'like', "%{$s}%")
                  ->orWhere('company', 'like', "%{$s}%")
                  ->orWhere('comment', 'like', "%{$s}%");
            });
        }

        if ($hasActive) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($hasFeatured) {
            $query->where('is_featured', filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($hasRating) {
            $query->where('rating', (int) $request->input('rating'));
        }

        $allowedSorts = ['id', 'author_name', 'rating', 'is_featured', 'is_active', 'sort_order', 'created_at'];
        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'id';
        }
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        $records = $query->orderBy($sortBy, $sortOrder)->paginate($perPage);

        return $this->paginatedResponse($records, 'Testimonials retrieved successfully.');
    }

    /**
     * POST /api/v1/testimonials
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'author_name' => 'required|string|max:255',
            'role'        => 'nullable|string|max:150',
            'company'     => 'nullable|string|max:150',
            'avatar'      => 'nullable|string|max:500',
            'rating'      => 'nullable|integer|min:1|max:5',
            'comment'     => 'required|string',
            'is_featured' => 'nullable|boolean',
            'is_active'   => 'nullable|boolean',
            'sort_order'  => 'nullable|integer',
        ]);

        $companyId = Company::value('id') ?? 1;
        $validated['company_id'] = $companyId;
        $validated['rating'] = $validated['rating'] ?? 5;
        $validated['is_featured'] = $validated['is_featured'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        $record = Testimonial::create($validated);

        return $this->successResponse($record, 'Testimonial created successfully.', 201);
    }

    /**
     * GET /api/v1/testimonials/{id}
     */
    public function show(int $id): JsonResponse
    {
        $record = Testimonial::findOrFail($id);
        return $this->successResponse($record, 'Testimonial details retrieved successfully.');
    }

    /**
     * PUT /api/v1/testimonials/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $record = Testimonial::findOrFail($id);

        $validated = $request->validate([
            'author_name' => 'sometimes|required|string|max:255',
            'role'        => 'nullable|string|max:150',
            'company'     => 'nullable|string|max:150',
            'avatar'      => 'nullable|string|max:500',
            'rating'      => 'nullable|integer|min:1|max:5',
            'comment'     => 'sometimes|required|string',
            'is_featured' => 'nullable|boolean',
            'is_active'   => 'nullable|boolean',
            'sort_order'  => 'nullable|integer',
        ]);

        $record->update($validated);

        return $this->successResponse($record, 'Testimonial updated successfully.');
    }

    /**
     * DELETE /api/v1/testimonials/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $record = Testimonial::findOrFail($id);
        $record->delete();

        return $this->successResponse(null, 'Testimonial deleted successfully.');
    }

    /**
     * POST /api/v1/testimonials/{id}/toggle-active
     */
    public function toggleActive(int $id): JsonResponse
    {
        $record = Testimonial::findOrFail($id);
        $record->update(['is_active' => !$record->is_active]);

        return $this->successResponse($record, 'Testimonial status updated.');
    }

    /**
     * POST /api/v1/testimonials/{id}/toggle-featured
     */
    public function toggleFeatured(int $id): JsonResponse
    {
        $record = Testimonial::findOrFail($id);
        $record->update(['is_featured' => !$record->is_featured]);

        return $this->successResponse($record, 'Testimonial featured status updated.');
    }

    /**
     * POST /api/v1/testimonials/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return $this->errorResponse('No IDs provided', 422);
        }

        $count = Testimonial::whereIn('id', $ids)->delete();

        return $this->successResponse(['deleted_count' => $count], "Successfully deleted {$count} testimonials.");
    }
}

