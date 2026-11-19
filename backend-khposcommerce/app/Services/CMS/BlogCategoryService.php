<?php

namespace App\Services\CMS;

use App\Repositories\Eloquent\CMS\BlogCategoryRepository;
use App\Models\CMS\BlogCategory;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class BlogCategoryService
{
    public function __construct(private readonly BlogCategoryRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->getModel()->newQuery()
            ->with($relations)
            ->withCount('posts')
            ->orderBy('name', 'asc')
            ->get();
    }

    public function getPaginated(int $perPage = 15, array $filters = [], array $relations = []): LengthAwarePaginator
    {
        $query = $this->repository->getModel()->newQuery()
            ->with($relations)
            ->withCount('posts');

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'active' || $filters['status'] === '1' || $filters['status'] === 1) {
                $query->where('is_active', true);
            } elseif ($filters['status'] === 'inactive' || $filters['status'] === '0' || $filters['status'] === 0) {
                $query->where('is_active', false);
            }
        }

        $sort = $filters['sort'] ?? 'id';
        $order = strtolower($filters['order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if ($sort === 'posts_count') {
            $query->orderBy('posts_count', $order);
        } elseif (in_array($sort, ['id', 'name', 'slug', 'is_active', 'created_at', 'updated_at'])) {
            $query->orderBy($sort, $order);
        } else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($perPage);
    }

    public function getById(int|string $id, array $relations = []): BlogCategory
    {
        return $this->repository->getModel()->newQuery()
            ->with($relations)
            ->withCount('posts')
            ->findOrFail($id);
    }

    public function create(array $data): BlogCategory
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): BlogCategory
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function bulkDelete(array $ids): int
    {
        return $this->repository->bulkDelete($ids);
    }
}
