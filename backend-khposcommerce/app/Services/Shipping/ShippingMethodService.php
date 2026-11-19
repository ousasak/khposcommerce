<?php

namespace App\Services\Shipping;

use App\Repositories\Eloquent\Shipping\ShippingMethodRepository;
use App\Models\Shipping\ShippingMethod;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ShippingMethodService
{
    public function __construct(private readonly ShippingMethodRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $relations = []): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, relations: $relations);
    }

    public function getById(int|string $id, array $relations = []): ShippingMethod
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): ShippingMethod
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): ShippingMethod
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function getActiveMethods(): Collection
    {
        return $this->repository->getModel()->where('is_active', true)->get();
    }

    public function toggleActive(int|string $id): ShippingMethod
    {
        $method = $this->getById($id);
        return $this->update($id, ['is_active' => !$method->is_active]);
    }
}
