<?php

namespace Tests\Unit\Shipping;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Shipping\ShippingMethod;
use App\Repositories\Eloquent\Shipping\ShippingMethodRepository;
use App\Services\Shipping\ShippingMethodService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShippingMethodServiceTest extends TestCase
{
    use RefreshDatabase;

    private ShippingMethodService $service;
    private int $companyId;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::create([
            'name'          => 'Test Company',
            'slug'          => 'test-company',
            'code'          => 'TC-SHIP',
            'email'         => 'ship@test.com',
            'currency_code' => 'USD',
        ]);
        $this->companyId = $company->id;

        $repository = new ShippingMethodRepository(new ShippingMethod());
        $this->service = new ShippingMethodService($repository);
    }

    public function test_can_create_shipping_method(): void
    {
        $method = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'J&T Express Fast',
            'code'       => 'JNT_FAST',
            'provider'   => 'jnt',
            'base_price' => 2.50,
            'is_active'  => true,
        ]);

        $this->assertNotNull($method->id);
        $this->assertEquals('J&T Express Fast', $method->name);
        $this->assertEquals('JNT_FAST', $method->code);
        $this->assertEquals('jnt', $method->provider);
        $this->assertEquals('jnt', $method->carrier); // carrier accessor
        $this->assertEquals(2.50, (float) $method->base_price);
        $this->assertTrue($method->is_active);
    }

    public function test_can_retrieve_by_id(): void
    {
        $created = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Standard Ground',
            'code'       => 'STD_GROUND',
            'provider'   => 'standard',
            'base_price' => 5.00,
            'is_active'  => true,
        ]);

        $found = $this->service->getById($created->id);
        $this->assertEquals($created->id, $found->id);
        $this->assertEquals('Standard Ground', $found->name);
    }

    public function test_can_get_all_and_paginated(): void
    {
        $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Method 1',
            'code'       => 'M1',
            'provider'   => 'standard',
            'base_price' => 3.00,
            'is_active'  => true,
        ]);

        $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Method 2',
            'code'       => 'M2',
            'provider'   => 'grab_express',
            'base_price' => 6.00,
            'is_active'  => false,
        ]);

        $all = $this->service->getAll();
        $this->assertCount(2, $all);

        $paginated = $this->service->getPaginated(1);
        $this->assertCount(1, $paginated->items());
        $this->assertEquals(2, $paginated->total());
    }

    public function test_can_update_shipping_method(): void
    {
        $method = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Old Name',
            'code'       => 'OLD_CODE',
            'provider'   => 'standard',
            'base_price' => 4.00,
            'is_active'  => true,
        ]);

        $updated = $this->service->update($method->id, [
            'name'       => 'Updated Name',
            'base_price' => 7.50,
            'is_active'  => false,
        ]);

        $this->assertEquals('Updated Name', $updated->name);
        $this->assertEquals(7.50, (float) $updated->base_price);
        $this->assertFalse($updated->is_active);
    }

    public function test_can_delete_shipping_method(): void
    {
        $method = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'To Delete',
            'code'       => 'DEL_CODE',
            'provider'   => 'standard',
            'base_price' => 4.00,
            'is_active'  => true,
        ]);

        $deleted = $this->service->delete($method->id);
        $this->assertTrue($deleted);

        // Soft deleted
        $this->assertSoftDeleted('shipping_methods', ['id' => $method->id]);
    }

    public function test_get_active_methods_and_toggle_active(): void
    {
        $m1 = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Active 1',
            'code'       => 'ACT_1',
            'provider'   => 'standard',
            'is_active'  => true,
        ]);

        $m2 = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Inactive 2',
            'code'       => 'INACT_2',
            'provider'   => 'jnt',
            'is_active'  => false,
        ]);

        $active = $this->service->getActiveMethods();
        $this->assertCount(1, $active);
        $this->assertEquals($m1->id, $active->first()->id);

        // Toggle inactive -> active
        $toggled = $this->service->toggleActive($m2->id);
        $this->assertTrue($toggled->is_active);
        $this->assertCount(2, $this->service->getActiveMethods());
    }

    public function test_carrier_mutator_sets_provider(): void
    {
        $method = new ShippingMethod();
        $method->carrier = 'Kerry Express';
        $this->assertEquals('Kerry Express', $method->provider);
        $this->assertEquals('Kerry Express', $method->carrier);
    }
}
