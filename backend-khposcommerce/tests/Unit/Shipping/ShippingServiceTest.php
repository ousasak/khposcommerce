<?php

namespace Tests\Unit\Shipping;

use Tests\TestCase;
use App\Services\Shipping\ShippingService;
use App\Services\Shipping\Contracts\ShippingProvider;
use App\Services\Shipping\Providers\StandardDeliveryProvider;
use App\Services\Shipping\Providers\JTExpressProvider;
use App\Services\Shipping\Providers\GrabExpressProvider;

class ShippingServiceTest extends TestCase
{
    private ShippingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ShippingService();
    }

    public function test_default_providers_registered(): void
    {
        $providers = $this->service->getProviders();

        $this->assertArrayHasKey('standard', $providers);
        $this->assertArrayHasKey('jnt', $providers);
        $this->assertArrayHasKey('grab_express', $providers);

        $this->assertInstanceOf(StandardDeliveryProvider::class, $providers['standard']);
        $this->assertInstanceOf(JTExpressProvider::class, $providers['jnt']);
        $this->assertInstanceOf(GrabExpressProvider::class, $providers['grab_express']);
    }

    public function test_has_provider(): void
    {
        $this->assertTrue($this->service->hasProvider('standard'));
        $this->assertTrue($this->service->hasProvider('jnt'));
        $this->assertTrue($this->service->hasProvider('grab_express'));
        $this->assertFalse($this->service->hasProvider('unknown_provider'));
    }

    public function test_get_provider_fallback_to_standard(): void
    {
        $provider = $this->service->getProvider('non_existent');
        $this->assertInstanceOf(StandardDeliveryProvider::class, $provider);
    }

    public function test_register_custom_provider(): void
    {
        $customMock = new class implements ShippingProvider {
            public function calculateRate(array $data): array { return ['cost' => 10.0]; }
            public function createShipment(array $data): array { return ['success' => true]; }
            public function trackShipment(string $trackingNumber): array { return ['status' => 'custom']; }
            public function cancelShipment(string $shipmentId): bool { return true; }
        };

        $this->service->registerProvider('custom_carrier', $customMock);

        $this->assertTrue($this->service->hasProvider('custom_carrier'));
        $this->assertSame($customMock, $this->service->getProvider('custom_carrier'));
    }

    public function test_calculate_rate_delegates_to_provider(): void
    {
        $result = $this->service->calculateRate('standard', ['weight' => 2.0]);

        $this->assertIsArray($result);
        $this->assertEquals('standard', $result['provider']);
        $this->assertEquals(6.50, $result['cost']); // 5.00 + (2.0 - 1.0) * 1.5
    }

    public function test_calculate_all_rates(): void
    {
        $allRates = $this->service->calculateAllRates(['weight' => 2.0]);

        $this->assertArrayHasKey('standard', $allRates);
        $this->assertArrayHasKey('jnt', $allRates);
        $this->assertArrayHasKey('grab_express', $allRates);

        $this->assertEquals(6.50, $allRates['standard']['cost']);
        $this->assertEquals(4.70, $allRates['jnt']['cost']); // 3.50 + 1.2
        $this->assertEquals(6.50, $allRates['grab_express']['cost']);
    }

    public function test_create_shipment_delegates_to_provider(): void
    {
        $shipment = $this->service->createShipment('standard', ['recipient' => 'Sokha']);

        $this->assertTrue($shipment['success']);
        $this->assertStringStartsWith('STD-', $shipment['tracking_number']);
        $this->assertEquals('pending', $shipment['status']);
    }

    public function test_track_shipment_delegates_to_provider(): void
    {
        $tracking = $this->service->trackShipment('jnt', 'JT123456789');

        $this->assertEquals('JT123456789', $tracking['tracking_number']);
        $this->assertEquals('J&T Express', $tracking['carrier']);
        $this->assertEquals('out_for_delivery', $tracking['status']);
    }

    public function test_cancel_shipment_delegates_to_provider(): void
    {
        $cancelled = $this->service->cancelShipment('grab_express', 'GRB-999');
        $this->assertTrue($cancelled);
    }
}
