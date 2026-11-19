<?php

namespace App\Services\Shipping;

use App\Repositories\Eloquent\Shipping\ShippingZoneRepository;
use App\Models\Shipping\ShippingZone;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ShippingZoneService
{
    public function __construct(private readonly ShippingZoneRepository $repository)
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

    public function getById(int|string $id, array $relations = []): ShippingZone
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): ShippingZone
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): ShippingZone
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function findZoneForLocation(?string $country = null, ?string $province = null, ?string $city = null): ?ShippingZone
    {
        $zones = $this->repository->all();

        return $zones->first(function (ShippingZone $zone) use ($country, $province, $city) {
            $countries = is_array($zone->countries) ? $zone->countries : [];
            $provinces = is_array($zone->provinces) ? $zone->provinces : [];
            $cities = is_array($zone->cities) ? $zone->cities : [];

            if ($city && in_array($city, $cities, true)) {
                return true;
            }
            if ($province && in_array($province, $provinces, true)) {
                return true;
            }
            if ($country && in_array($country, $countries, true)) {
                return true;
            }
            return false;
        });
    }
}
