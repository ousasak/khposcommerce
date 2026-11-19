<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use App\Models\Order\Order;
use App\Models\Order\Shipment;
use App\Models\Shipping\ShippingMethod;
use App\Models\Shipping\ShippingZone;
use App\Models\Shipping\ShippingRate;
use App\Models\User;
use App\Services\Auth\JwtTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

class ShippingManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Company $company;
    protected string $token;
    protected Store $store;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'          => 'Main Shipping Company',
            'code'          => 'SHIP_CO',
            'slug'          => 'main-shipping-company',
            'email'         => 'shipping@company.com',
            'currency_code' => 'USD',
        ]);

        $branch = Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'HQ Branch',
            'code'       => 'BR-01',
            'is_active'  => true,
        ]);

        $this->store = Store::create([
            'company_id' => $this->company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Main Store',
            'slug'       => 'main-store',
            'is_active'  => true,
        ]);

        $this->order = Order::create([
            'company_id'   => $this->company->id,
            'store_id'     => $this->store->id,
            'order_number' => 'ORD-API-SHIP-01',
            'status'       => 'confirmed',
            'grand_total'  => 120.00,
        ]);

        $this->adminUser = User::create([
            'company_id' => $this->company->id,
            'name'       => 'Admin User',
            'email'      => 'admin_ship@test.com',
            'password'   => bcrypt('password123'),
            'is_active'  => true,
        ]);

        $role = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'api']);
        $this->adminUser->assignRole($role);

        $jwtService = app(JwtTokenService::class);
        $tokenData = $jwtService->generateAccessToken($this->adminUser);
        $this->token = $tokenData['token'];
    }

    public function test_can_crud_shipping_methods(): void
    {
        // 1. Create
        $createRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/shipping-methods', [
                'company_id' => $this->company->id,
                'name'       => 'J&T Express Super',
                'code'       => 'JNT_SUPER',
                'provider'   => 'jnt',
                'base_price' => 3.50,
                'is_active'  => true,
            ]);

        $createRes->assertStatus(201);
        $methodId = $createRes->json('data.id');
        $this->assertNotNull($methodId);

        // 2. Index
        $indexRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/shipping-methods');
        $indexRes->assertStatus(200);

        // 3. Show
        $showRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson("/api/v1/shipping-methods/{$methodId}");
        $showRes->assertStatus(200);
        $this->assertEquals('J&T Express Super', $showRes->json('data.name'));

        // 4. Update
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/shipping-methods/{$methodId}", [
                'name'       => 'J&T Express Ultra',
                'base_price' => 4.00,
            ]);
        $updateRes->assertStatus(200);
        $this->assertEquals('J&T Express Ultra', $updateRes->json('data.name'));

        // 5. Delete
        $deleteRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/shipping-methods/{$methodId}");
        $deleteRes->assertStatus(200);
    }

    public function test_can_crud_shipping_zones(): void
    {
        // 1. Create
        $createRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/shipping-zones', [
                'company_id' => $this->company->id,
                'name'       => 'Cambodia Central',
                'countries'  => '["KH"]',
                'provinces'  => '["Phnom Penh", "Kandal"]',
                'cities'     => '["Phnom Penh"]',
            ]);

        $createRes->assertStatus(201);
        $zoneId = $createRes->json('data.id');

        // 2. Index
        $indexRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/shipping-zones');
        $indexRes->assertStatus(200);

        // 3. Show
        $showRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson("/api/v1/shipping-zones/{$zoneId}");
        $showRes->assertStatus(200);

        // 4. Update
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/shipping-zones/{$zoneId}", [
                'name' => 'Greater Phnom Penh',
            ]);
        $updateRes->assertStatus(200);
        $this->assertEquals('Greater Phnom Penh', $updateRes->json('data.name'));

        // 5. Delete
        $deleteRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/shipping-zones/{$zoneId}");
        $deleteRes->assertStatus(200);
    }

    public function test_can_crud_shipping_rates(): void
    {
        $method = ShippingMethod::create([
            'company_id' => $this->company->id,
            'name'       => 'Standard',
            'code'       => 'STD_TEST',
            'provider'   => 'standard',
            'is_active'  => true,
        ]);

        $zone = ShippingZone::create([
            'company_id' => $this->company->id,
            'name'       => 'Zone Test',
            'countries'  => ['KH'],
        ]);

        // 1. Create
        $createRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/shipping-rates', [
                'shipping_method_id' => $method->id,
                'shipping_zone_id'   => $zone->id,
                'min_weight'         => 0.0,
                'max_weight'         => 5.0,
                'price'              => 2.50,
                'estimated_days_min' => 1,
                'estimated_days_max' => 3,
                'is_active'          => true,
            ]);

        $createRes->assertStatus(201);
        $rateId = $createRes->json('data.id');

        // 2. Index
        $indexRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/shipping-rates');
        $indexRes->assertStatus(200);

        // 3. Show
        $showRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson("/api/v1/shipping-rates/{$rateId}");
        $showRes->assertStatus(200);

        // 4. Update
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/shipping-rates/{$rateId}", [
                'price' => 3.00,
            ]);
        $updateRes->assertStatus(200);

        // 5. Delete
        $deleteRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/shipping-rates/{$rateId}");
        $deleteRes->assertStatus(200);
    }

    public function test_can_crud_shipments(): void
    {
        $method = ShippingMethod::create([
            'company_id' => $this->company->id,
            'name'       => 'Standard',
            'code'       => 'STD_SHIP',
            'provider'   => 'standard',
            'is_active'  => true,
        ]);

        // 1. Create
        $createRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/shipments', [
                'order_id'           => $this->order->id,
                'shipping_method_id' => $method->id,
                'tracking_number'    => 'TRK-API-999',
                'carrier'            => 'Standard',
                'status'             => 'pending',
            ]);

        $createRes->assertStatus(201);
        $shipmentId = $createRes->json('data.id');

        // 2. Index
        $indexRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/shipments');
        $indexRes->assertStatus(200);

        // 3. Show
        $showRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson("/api/v1/shipments/{$shipmentId}");
        $showRes->assertStatus(200);
        $this->assertEquals('TRK-API-999', $showRes->json('data.tracking_number'));

        // 4. Update
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/shipments/{$shipmentId}", [
                'status' => 'in_transit',
            ]);
        $updateRes->assertStatus(200);

        // 5. Delete
        $deleteRes = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/shipments/{$shipmentId}");
        $deleteRes->assertStatus(200);
    }
}
