<?php

namespace Tests\Unit\Shipping;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Shipping\ShippingMethod;
use App\Models\Shipping\ShippingZone;
use App\Models\Shipping\ShippingRate;
use App\Services\Chatbot\Tools\ShippingTool;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShippingToolTest extends TestCase
{
    use RefreshDatabase;

    private ShippingTool $tool;
    private int $companyId;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::create([
            'name'          => 'Chatbot Shipping Corp',
            'slug'          => 'chatbot-shipping-corp',
            'code'          => 'CS-SHIP',
            'email'         => 'bot@test.com',
            'currency_code' => 'USD',
        ]);
        $this->companyId = $company->id;
        $this->tool = new ShippingTool();
    }

    public function test_get_shipping_methods_returns_active_methods(): void
    {
        ShippingMethod::create([
            'company_id' => $this->companyId,
            'name'       => 'Active Method',
            'code'       => 'ACT_01',
            'provider'   => 'standard',
            'base_price' => 4.50,
            'is_active'  => true,
        ]);

        ShippingMethod::create([
            'company_id' => $this->companyId,
            'name'       => 'Inactive Method',
            'code'       => 'INACT_01',
            'provider'   => 'jnt',
            'base_price' => 3.00,
            'is_active'  => false,
        ]);

        $result = $this->tool->getShippingMethods();

        $this->assertArrayHasKey('methods', $result);
        $this->assertCount(1, $result['methods']);
        $this->assertEquals('Active Method', $result['methods'][0]['name']);
        $this->assertEquals(4.50, $result['methods'][0]['base_price']);
    }

    public function test_calculate_shipping_without_zone_uses_base_calculation(): void
    {
        ShippingMethod::create([
            'company_id' => $this->companyId,
            'name'       => 'Standard Delivery',
            'code'       => 'standard',
            'provider'   => 'standard',
            'base_price' => 5.00,
            'is_active'  => true,
        ]);

        // Weight = 3kg: base 5.00 + (3.0 - 1.0) * 1.5 = 8.00
        $result = $this->tool->calculateShipping([
            'city'   => 'Unknown City',
            'weight' => 3.0,
        ]);

        $this->assertEquals('Unknown City', $result['destination_city']);
        $this->assertEquals(3.0, $result['weight_kg']);
        $this->assertCount(1, $result['available_rates']);
        $this->assertEquals(8.00, $result['available_rates'][0]['cost']);
    }

    public function test_calculate_shipping_with_matching_zone_and_rate(): void
    {
        $method = ShippingMethod::create([
            'company_id' => $this->companyId,
            'name'       => 'Phnom Penh Express',
            'code'       => 'express',
            'provider'   => 'grab_express',
            'base_price' => 5.00,
            'is_active'  => true,
        ]);

        $zone = ShippingZone::create([
            'company_id' => $this->companyId,
            'name'       => 'Phnom Penh Zone',
            'cities'     => ['Phnom Penh', 'Ta Khmau'],
        ]);

        ShippingRate::create([
            'shipping_method_id' => $method->id,
            'shipping_zone_id'   => $zone->id,
            'min_weight'         => 0.0,
            'max_weight'         => 10.0,
            'price'              => 2.50,
            'estimated_days_min' => 1,
            'estimated_days_max' => 1,
            'is_active'          => true,
        ]);

        $result = $this->tool->calculateShipping([
            'city'   => 'Phnom Penh',
            'weight' => 2.0,
        ]);

        $this->assertEquals('Phnom Penh', $result['destination_city']);
        $this->assertEquals(2.50, $result['available_rates'][0]['cost']);
        $this->assertEquals('1-1 Days', $result['available_rates'][0]['estimated_days']);
    }
}
