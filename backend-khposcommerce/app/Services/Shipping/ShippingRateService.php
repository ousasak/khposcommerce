<?php

namespace App\Services\Shipping;

use App\Repositories\Eloquent\Shipping\ShippingRateRepository;
use App\Models\Shipping\ShippingRate;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ShippingRateService
{
    public function __construct(private readonly ShippingRateRepository $repository)
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

    public function getById(int|string $id, array $relations = []): ShippingRate
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): ShippingRate
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): ShippingRate
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function findRate(int|string $methodId, int|string $zoneId, float $weight): ?ShippingRate
    {
        return $this->repository->getModel()
            ->where('shipping_method_id', $methodId)
            ->where('shipping_zone_id', $zoneId)
            ->where('is_active', true)
            ->where('min_weight', '<=', $weight)
            ->where(function ($q) use ($weight) {
                $q->whereNull('max_weight')->orWhere('max_weight', '>=', $weight);
            })
            ->first();
    }

    public function getRatesForZone(int|string $zoneId): Collection
    {
        return $this->repository->getModel()->where('shipping_zone_id', $zoneId)->get();
    }

    public function getRatesForMethod(int|string $methodId): Collection
    {
        return $this->repository->getModel()->where('shipping_method_id', $methodId)->get();
    }
}
