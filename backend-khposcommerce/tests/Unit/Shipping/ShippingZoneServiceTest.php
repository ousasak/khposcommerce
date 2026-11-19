<?php

namespace Tests\Unit\Shipping;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Shipping\ShippingZone;
use App\Repositories\Eloquent\Shipping\ShippingZoneRepository;
use App\Services\Shipping\ShippingZoneService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShippingZoneServiceTest extends TestCase
{
    use RefreshDatabase;

    private ShippingZoneService $service;
    private int $companyId;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::create([
            'name'          => 'Zone Corp',
            'slug'          => 'zone-corp',
            'code'          => 'ZC-SHIP',
            'email'         => 'zone@test.com',
            'currency_code' => 'USD',
        ]);
        $this->companyId = $company->id;

        $repository = new ShippingZoneRepository(new ShippingZone());
        $this->service = new ShippingZoneService($repository);
    }

    public function test_can_create_shipping_zone_with_arrays(): void
    {
        $zone = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Phnom Penh Zone',
            'countries'  => ['KH'],
            'provinces'  => ['Phnom Penh'],
            'cities'     => ['Daun Penh', 'Chamkarmon'],
        ]);

        $this->assertNotNull($zone->id);
        $this->assertEquals('Phnom Penh Zone', $zone->name);
        $this->assertEquals(['KH'], $zone->countries);
        $this->assertEquals(['Phnom Penh'], $zone->provinces);
        $this->assertContains('Daun Penh', $zone->cities);
    }

    public function test_can_create_shipping_zone_with_json_strings(): void
    {
        $zone = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'North America',
            'countries'  => '["US", "CA"]',
            'provinces'  => '["Ontario", "California"]',
            'cities'     => '["Toronto", "Los Angeles"]',
        ]);

        $this->assertIsArray($zone->countries);
        $this->assertContains('US', $zone->countries);
        $this->assertContains('CA', $zone->countries);
        $this->assertContains('Ontario', $zone->provinces);
        $this->assertContains('Toronto', $zone->cities);
    }

    public function test_can_retrieve_by_id(): void
    {
        $zone = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'ASEAN Zone',
            'countries'  => ['KH', 'TH', 'VN'],
        ]);

        $found = $this->service->getById($zone->id);
        $this->assertEquals($zone->id, $found->id);
        $this->assertEquals('ASEAN Zone', $found->name);
    }

    public function test_can_get_all_and_paginated(): void
    {
        $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Zone 1',
            'countries'  => ['KH'],
        ]);
        $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Zone 2',
            'countries'  => ['TH'],
        ]);

        $all = $this->service->getAll();
        $this->assertCount(2, $all);

        $paginated = $this->service->getPaginated(1);
        $this->assertCount(1, $paginated->items());
        $this->assertEquals(2, $paginated->total());
    }

    public function test_can_update_shipping_zone(): void
    {
        $zone = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Initial Zone',
            'countries'  => ['KH'],
        ]);

        $updated = $this->service->update($zone->id, [
            'name'      => 'Updated Zone',
            'countries' => ['KH', 'SG'],
        ]);

        $this->assertEquals('Updated Zone', $updated->name);
        $this->assertContains('SG', $updated->countries);
    }

    public function test_can_delete_shipping_zone(): void
    {
        $zone = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Zone To Delete',
            'countries'  => ['KH'],
        ]);

        $deleted = $this->service->delete($zone->id);
        $this->assertTrue($deleted);
        $this->assertSoftDeleted('shipping_zones', ['id' => $zone->id]);
    }

    public function test_find_zone_for_location(): void
    {
        $ppZone = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Phnom Penh Urban',
            'countries'  => ['KH'],
            'provinces'  => ['Phnom Penh'],
            'cities'     => ['Tuol Kork', 'BKK'],
        ]);

        $siemReapZone = $this->service->create([
            'company_id' => $this->companyId,
            'name'       => 'Siem Reap Cultural',
            'countries'  => ['KH'],
            'provinces'  => ['Siem Reap'],
            'cities'     => ['Krong Siem Reap'],
        ]);

        // Match by city
        $foundCity = $this->service->findZoneForLocation(city: 'Tuol Kork');
        $this->assertNotNull($foundCity);
        $this->assertEquals($ppZone->id, $foundCity->id);

        // Match by province
        $foundProvince = $this->service->findZoneForLocation(province: 'Siem Reap');
        $this->assertNotNull($foundProvince);
        $this->assertEquals($siemReapZone->id, $foundProvince->id);

        // Match by country fallback
        $foundCountry = $this->service->findZoneForLocation(country: 'KH');
        $this->assertNotNull($foundCountry);

        // Unknown location returns null
        $notFound = $this->service->findZoneForLocation(country: 'FR', city: 'Paris');
        $this->assertNull($notFound);
    }
}
