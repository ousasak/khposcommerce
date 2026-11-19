<?php

namespace Tests\Unit\Shipping;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use App\Models\Order\Order;
use App\Models\Order\Shipment;
use App\Models\Shipping\ShippingMethod;
use App\Repositories\Eloquent\Order\ShipmentRepository;
use App\Services\Order\ShipmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShipmentServiceTest extends TestCase
{
    use RefreshDatabase;

    private ShipmentService $service;
    private int $companyId;
    private int $orderId;
    private int $shippingMethodId;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::create([
            'name'          => 'Shipment Corp',
            'slug'          => 'shipment-corp',
            'code'          => 'SC-SHIP',
            'email'         => 'shipment@test.com',
            'currency_code' => 'USD',
        ]);
        $this->companyId = $company->id;

        $branch = Branch::create([
            'company_id' => $company->id,
            'name'       => 'HQ Branch',
            'code'       => 'BR-HQ',
            'is_active'  => true,
        ]);

        $store = Store::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Main Store',
            'slug'       => 'main-store',
            'is_active'  => true,
        ]);

        $method = ShippingMethod::create([
            'company_id' => $company->id,
            'name'       => 'J&T Express',
            'code'       => 'JNT',
            'provider'   => 'jnt',
            'base_price' => 3.50,
            'is_active'  => true,
        ]);
        $this->shippingMethodId = $method->id;

        $order = Order::create([
            'company_id'   => $company->id,
            'store_id'     => $store->id,
            'order_number' => 'ORD-TEST-001',
            'status'       => 'confirmed',
            'grand_total'  => 50.00,
        ]);
        $this->orderId = $order->id;

        $repository = new ShipmentRepository(new Shipment());
        $this->service = new ShipmentService($repository);
    }

    public function test_can_create_shipment(): void
    {
        $shipment = $this->service->create([
            'order_id'           => $this->orderId,
            'shipping_method_id' => $this->shippingMethodId,
            'tracking_number'    => 'JT123456789KH',
            'carrier'            => 'J&T Express',
            'status'             => 'pending',
        ]);

        $this->assertNotNull($shipment->id);
        $this->assertEquals($this->orderId, $shipment->order_id);
        $this->assertEquals($this->shippingMethodId, $shipment->shipping_method_id);
        $this->assertEquals('JT123456789KH', $shipment->tracking_number);
        $this->assertEquals('J&T Express', $shipment->carrier);
        $this->assertEquals('pending', $shipment->status);
    }

    public function test_can_retrieve_by_id(): void
    {
        $shipment = $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'STD-555',
            'carrier'         => 'Standard',
            'status'          => 'pending',
        ]);

        $found = $this->service->getById($shipment->id);
        $this->assertEquals($shipment->id, $found->id);
        $this->assertEquals('STD-555', $found->tracking_number);
    }

    public function test_can_get_all_and_paginated(): void
    {
        $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'TRACK-1',
            'status'          => 'pending',
        ]);
        $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'TRACK-2',
            'status'          => 'in_transit',
        ]);

        $all = $this->service->getAll();
        $this->assertCount(2, $all);

        $paginated = $this->service->getPaginated(1);
        $this->assertCount(1, $paginated->items());
        $this->assertEquals(2, $paginated->total());
    }

    public function test_can_update_shipment(): void
    {
        $shipment = $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'TRACK-UPDATE',
            'status'          => 'pending',
        ]);

        $updated = $this->service->update($shipment->id, [
            'status'  => 'in_transit',
            'carrier' => 'GrabExpress',
        ]);

        $this->assertEquals('in_transit', $updated->status);
        $this->assertEquals('GrabExpress', $updated->carrier);
    }

    public function test_can_delete_shipment(): void
    {
        $shipment = $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'TRACK-DELETE',
            'status'          => 'failed',
        ]);

        $deleted = $this->service->delete($shipment->id);
        $this->assertTrue($deleted);
        $this->assertDatabaseMissing('shipments', ['id' => $shipment->id]);
    }

    public function test_mark_as_shipped(): void
    {
        $shipment = $this->service->create([
            'order_id' => $this->orderId,
            'status'   => 'pending',
        ]);

        $shipped = $this->service->markAsShipped($shipment->id, 'NEW-TRACK-001', 'DHL Express');

        $this->assertEquals('in_transit', $shipped->status);
        $this->assertEquals('NEW-TRACK-001', $shipped->tracking_number);
        $this->assertEquals('DHL Express', $shipped->carrier);
        $this->assertNotNull($shipped->shipped_at);
    }

    public function test_mark_as_delivered(): void
    {
        $shipment = $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'DELIVER-ME',
            'status'          => 'in_transit',
            'shipped_at'      => now()->subDay(),
        ]);

        $delivered = $this->service->markAsDelivered($shipment->id);

        $this->assertEquals('delivered', $delivered->status);
        $this->assertNotNull($delivered->delivered_at);
    }

    public function test_update_status(): void
    {
        $shipment = $this->service->create([
            'order_id' => $this->orderId,
            'status'   => 'pending',
        ]);

        // Transition to picked_up (should set shipped_at)
        $inTransit = $this->service->updateStatus($shipment->id, 'picked_up');
        $this->assertEquals('picked_up', $inTransit->status);
        $this->assertNotNull($inTransit->shipped_at);

        // Transition to delivered (should set delivered_at)
        $delivered = $this->service->updateStatus($shipment->id, 'delivered');
        $this->assertEquals('delivered', $delivered->status);
        $this->assertNotNull($delivered->delivered_at);
    }

    public function test_get_by_tracking_number(): void
    {
        $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'FIND-TRACK-999',
            'carrier'         => 'J&T',
            'status'          => 'in_transit',
        ]);

        $found = $this->service->getByTrackingNumber('FIND-TRACK-999');
        $this->assertNotNull($found);
        $this->assertEquals('FIND-TRACK-999', $found->tracking_number);

        $notFound = $this->service->getByTrackingNumber('NON_EXISTENT');
        $this->assertNull($notFound);
    }

    public function test_get_by_order_id(): void
    {
        $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'PART-1',
            'status'          => 'in_transit',
        ]);
        $this->service->create([
            'order_id'        => $this->orderId,
            'tracking_number' => 'PART-2',
            'status'          => 'delivered',
        ]);

        $orderShipments = $this->service->getByOrderId($this->orderId);
        $this->assertCount(2, $orderShipments);

        $emptyShipments = $this->service->getByOrderId(99999);
        $this->assertCount(0, $emptyShipments);
    }
}
