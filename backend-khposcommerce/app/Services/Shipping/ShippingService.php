<?php

namespace App\Services\Shipping;

use App\Services\Shipping\Contracts\ShippingProvider;
use App\Services\Shipping\Providers\StandardDeliveryProvider;
use App\Services\Shipping\Providers\JTExpressProvider;
use App\Services\Shipping\Providers\GrabExpressProvider;

class ShippingService
{
    private array $providers = [];

    public function __construct()
    {
        $this->providers = [
            'standard'     => new StandardDeliveryProvider(),
            'jnt'          => new JTExpressProvider(),
            'grab_express' => new GrabExpressProvider(),
        ];
    }

    public function getProvider(string $code = 'standard'): ShippingProvider
    {
        return $this->providers[$code] ?? $this->providers['standard'];
    }

    public function hasProvider(string $code): bool
    {
        return isset($this->providers[$code]);
    }

    public function registerProvider(string $code, ShippingProvider $provider): void
    {
        $this->providers[$code] = $provider;
    }

    /**
     * @return array<string, ShippingProvider>
     */
    public function getProviders(): array
    {
        return $this->providers;
    }

    public function calculateRate(string $providerCode, array $data): array
    {
        return $this->getProvider($providerCode)->calculateRate($data);
    }

    /**
     * Calculate rates across all available shipping providers.
     */
    public function calculateAllRates(array $data): array
    {
        $rates = [];
        foreach ($this->providers as $code => $provider) {
            $rates[$code] = $provider->calculateRate($data);
        }
        return $rates;
    }

    public function createShipment(string $providerCode, array $data): array
    {
        return $this->getProvider($providerCode)->createShipment($data);
    }

    public function trackShipment(string $providerCode, string $trackingNumber): array
    {
        return $this->getProvider($providerCode)->trackShipment($trackingNumber);
    }

    public function cancelShipment(string $providerCode, string $shipmentId): bool
    {
        return $this->getProvider($providerCode)->cancelShipment($shipmentId);
    }
}
