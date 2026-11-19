<?php

namespace App\Services\Order;

use App\Repositories\Eloquent\Order\ShipmentRepository;
use App\Models\Order\Shipment;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ShipmentService
{
    public function __construct(private readonly ShipmentRepository $repository)
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

    public function getById(int|string $id, array $relations = []): Shipment
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Shipment
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Shipment
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function markAsShipped(int|string $id, ?string $trackingNumber = null, ?string $carrier = null): Shipment
    {
        $data = [
            'status'     => 'in_transit',
            'shipped_at' => now(),
        ];
        if ($trackingNumber !== null) {
            $data['tracking_number'] = $trackingNumber;
        }
        if ($carrier !== null) {
            $data['carrier'] = $carrier;
        }
        return $this->update($id, $data);
    }

    public function markAsDelivered(int|string $id): Shipment
    {
        return $this->update($id, [
            'status'       => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function updateStatus(int|string $id, string $status): Shipment
    {
        $data = ['status' => $status];
        if ($status === 'in_transit' || $status === 'picked_up') {
            $data['shipped_at'] = now();
        } elseif ($status === 'delivered') {
            $data['delivered_at'] = now();
        }
        return $this->update($id, $data);
    }

    public function getByTrackingNumber(string $trackingNumber): ?Shipment
    {
        return $this->repository->findByField('tracking_number', $trackingNumber);
    }

    public function getByOrderId(int|string $orderId): Collection
    {
        return $this->repository->getModel()->where('order_id', $orderId)->get();
    }
}
