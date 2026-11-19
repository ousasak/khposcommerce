<?php

namespace Tests\Unit\Shipping;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Shipping\ShippingMethod;
use App\Models\Shipping\ShippingZone;
use App\Models\Shipping\ShippingRate;
use App\Repositories\Eloquent\Shipping\ShippingRateRepository;
use App\Services\Shipping\ShippingRateService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShippingRateServiceTest extends TestCase
{
    use RefreshDatabase;

    private ShippingRateService $service;
    private int $companyId;
    private int $methodId;
    private int $zoneId;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::create([
            'name'          => 'Rate Corp',
            'slug'          => 'rate-corp',
            'code'          => 'RC-SHIP',
            'email'         => 'rate@test.com',
            'currency_code' => 'USD',
        ]);
        $this->companyId = $company->id;

        $method = ShippingMethod::create([
            'company_id' => $company->id,
            'name'       => 'Standard',
            'code'       => 'STD',
            'provider'   => 'standard',
            'base_price' => 5.0,
            'is_active'  => true,
        ]);
        $this->methodId = $method->id;

        $zone = ShippingZone::create([
            'company_id' => $company->id,
            'name'       => 'Local Zone',
            'countries'  => ['KH'],
        ]);
        $this->zoneId = $zone->id;

        $repository = new ShippingRateRepository(new ShippingRate());
        $this->service = new ShippingRateService($repository);
    }

    public function test_can_create_shipping_rate(): void
    {
        $rate = $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 0.000,
            'max_weight'         => 5.000,
            'price'              => 2.50,
            'estimated_days_min' => 1,
            'estimated_days_max' => 2,
            'is_active'          => true,
        ]);

        $this->assertNotNull($rate->id);
        $this->assertEquals($this->methodId, $rate->shipping_method_id);
        $this->assertEquals($this->zoneId, $rate->shipping_zone_id);
        $this->assertEquals(0.0, (float) $rate->min_weight);
        $this->assertEquals(5.0, (float) $rate->max_weight);
        $this->assertEquals(2.50, (float) $rate->price);
        $this->assertEquals(1, $rate->estimated_days_min);
        $this->assertEquals(2, $rate->estimated_days_max);
        $this->assertTrue($rate->is_active);
    }

    public function test_can_retrieve_by_id(): void
    {
        $rate = $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 0.0,
            'max_weight'         => 10.0,
            'price'              => 4.00,
        ]);

        $found = $this->service->getById($rate->id);
        $this->assertEquals($rate->id, $found->id);
        $this->assertEquals(4.00, (float) $found->price);
    }

    public function test_can_get_all_and_paginated(): void
    {
        $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 0.0,
            'max_weight'         => 5.0,
            'price'              => 3.00,
        ]);

        $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 5.0,
            'max_weight'         => 20.0,
            'price'              => 6.00,
        ]);

        $all = $this->service->getAll();
        $this->assertCount(2, $all);

        $paginated = $this->service->getPaginated(1);
        $this->assertCount(1, $paginated->items());
        $this->assertEquals(2, $paginated->total());
    }

    public function test_can_update_shipping_rate(): void
    {
        $rate = $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 0.0,
            'max_weight'         => 5.0,
            'price'              => 2.00,
        ]);

        $updated = $this->service->update($rate->id, [
            'price'      => 3.50,
            'max_weight' => 7.0,
        ]);

        $this->assertEquals(3.50, (float) $updated->price);
        $this->assertEquals(7.0, (float) $updated->max_weight);
    }

    public function test_can_delete_shipping_rate(): void
    {
        $rate = $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 0.0,
            'max_weight'         => 5.0,
            'price'              => 2.00,
        ]);

        $deleted = $this->service->delete($rate->id);
        $this->assertTrue($deleted);
        $this->assertSoftDeleted('shipping_rates', ['id' => $rate->id]);
    }

    public function test_find_rate_by_weight(): void
    {
        // Light tier (0 - 2kg) -> $2.00
        $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 0.0,
            'max_weight'         => 2.0,
            'price'              => 2.00,
            'is_active'          => true,
        ]);

        // Heavy tier (>2 - 10kg) -> $5.00
        $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 2.001,
            'max_weight'         => 10.0,
            'price'              => 5.00,
            'is_active'          => true,
        ]);

        $rate1 = $this->service->findRate($this->methodId, $this->zoneId, 1.5);
        $this->assertNotNull($rate1);
        $this->assertEquals(2.00, (float) $rate1->price);

        $rate2 = $this->service->findRate($this->methodId, $this->zoneId, 4.0);
        $this->assertNotNull($rate2);
        $this->assertEquals(5.00, (float) $rate2->price);

        // Weight exceeding all tiers
        $rateOutOfRange = $this->service->findRate($this->methodId, $this->zoneId, 50.0);
        $this->assertNull($rateOutOfRange);
    }

    public function test_get_rates_for_zone_and_method(): void
    {
        $this->service->create([
            'shipping_method_id' => $this->methodId,
            'shipping_zone_id'   => $this->zoneId,
            'min_weight'         => 0.0,
            'max_weight'         => 5.0,
            'price'              => 2.00,
        ]);

        $zoneRates = $this->service->getRatesForZone($this->zoneId);
        $this->assertCount(1, $zoneRates);

        $methodRates = $this->service->getRatesForMethod($this->methodId);
        $this->assertCount(1, $methodRates);
    }

    public function test_min_value_max_value_aliases(): void
    {
        $rate = new ShippingRate();
        $rate->min_value = 1.5;
        $rate->max_value = 10.5;

        $this->assertEquals(1.5, (float) $rate->min_weight);
        $this->assertEquals(10.5, (float) $rate->max_weight);
        $this->assertEquals(1.5, (float) $rate->min_value);
        $this->assertEquals(10.5, (float) $rate->max_value);
    }
}
