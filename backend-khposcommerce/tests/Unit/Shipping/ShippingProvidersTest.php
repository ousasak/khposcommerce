<?php

namespace Tests\Unit\Shipping;

use Tests\TestCase;
use App\Services\Shipping\Providers\StandardDeliveryProvider;
use App\Services\Shipping\Providers\JTExpressProvider;
use App\Services\Shipping\Providers\GrabExpressProvider;

class ShippingProvidersTest extends TestCase
{
    public function test_standard_delivery_provider(): void
    {
        $provider = new StandardDeliveryProvider();

        // 1. Calculate rate with default weight (1.0)
        $rateDefault = $provider->calculateRate([]);
        $this->assertEquals('standard', $rateDefault['provider']);
        $this->assertEquals('Standard Delivery', $rateDefault['carrier']);
        $this->assertEquals(5.00, $rateDefault['cost']);
        $this->assertEquals('USD', $rateDefault['currency']);
        $this->assertEquals('2-4 Business Days', $rateDefault['estimated_days']);

        // Calculate rate with 3.5kg (5.00 + 2.5 * 1.5 = 8.75)
        $rateHeavy = $provider->calculateRate(['weight' => 3.5]);
        $this->assertEquals(8.75, $rateHeavy['cost']);

        // 2. Create shipment
        $shipment = $provider->createShipment(['order_id' => 123]);
        $this->assertTrue($shipment['success']);
        $this->assertStringStartsWith('STD-', $shipment['tracking_number']);
        $this->assertStringStartsWith('SHIP-', $shipment['shipment_id']);
        $this->assertEquals('pending', $shipment['status']);

        // 3. Track shipment
        $tracking = $provider->trackShipment('STD-TEST123');
        $this->assertEquals('STD-TEST123', $tracking['tracking_number']);
        $this->assertEquals('in_transit', $tracking['status']);
        $this->assertEquals('Central Distribution Center', $tracking['location']);

        // 4. Cancel shipment
        $this->assertTrue($provider->cancelShipment('SHIP-123'));
    }

    public function test_jt_express_provider(): void
    {
        $provider = new JTExpressProvider();

        // 1. Calculate rate with default weight (1.0)
        $rateDefault = $provider->calculateRate([]);
        $this->assertEquals('jnt', $rateDefault['provider']);
        $this->assertEquals('J&T Express', $rateDefault['carrier']);
        $this->assertEquals(3.50, $rateDefault['cost']);
        $this->assertEquals('USD', $rateDefault['currency']);
        $this->assertEquals('1-2 Days', $rateDefault['estimated_days']);

        // Calculate rate with 2.5kg (3.50 + 1.5 * 1.2 = 5.30)
        $rateHeavy = $provider->calculateRate(['weight' => 2.5]);
        $this->assertEquals(5.30, $rateHeavy['cost']);

        // 2. Create shipment
        $shipment = $provider->createShipment(['order_id' => 456]);
        $this->assertTrue($shipment['success']);
        $this->assertStringStartsWith('JT', $shipment['tracking_number']);
        $this->assertStringStartsWith('JNT-', $shipment['shipment_id']);
        $this->assertEquals('picked_up', $shipment['status']);

        // 3. Track shipment
        $tracking = $provider->trackShipment('JT999999999');
        $this->assertEquals('JT999999999', $tracking['tracking_number']);
        $this->assertEquals('out_for_delivery', $tracking['status']);
        $this->assertEquals('Local Hub', $tracking['location']);

        // 4. Cancel shipment
        $this->assertTrue($provider->cancelShipment('JNT-456'));
    }

    public function test_grab_express_provider(): void
    {
        $provider = new GrabExpressProvider();

        // 1. Calculate rate (flat 6.50 same day)
        $rate = $provider->calculateRate(['weight' => 10.0]);
        $this->assertEquals('grab_express', $rate['provider']);
        $this->assertEquals('GrabExpress Same-Day', $rate['carrier']);
        $this->assertEquals(6.50, $rate['cost']);
        $this->assertEquals('Same Day (2-4 Hours)', $rate['estimated_days']);

        // 2. Create shipment
        $shipment = $provider->createShipment(['order_id' => 789]);
        $this->assertTrue($shipment['success']);
        $this->assertStringStartsWith('GRAB-', $shipment['tracking_number']);
        $this->assertStringStartsWith('GRB-', $shipment['shipment_id']);
        $this->assertEquals('in_transit', $shipment['status']);

        // 3. Track shipment
        $tracking = $provider->trackShipment('GRAB-123');
        $this->assertEquals('GRAB-123', $tracking['tracking_number']);
        $this->assertEquals('in_transit', $tracking['status']);
        $this->assertStringContainsString('Driver assigned', $tracking['location']);

        // 4. Cancel shipment
        $this->assertTrue($provider->cancelShipment('GRB-789'));
    }
}
