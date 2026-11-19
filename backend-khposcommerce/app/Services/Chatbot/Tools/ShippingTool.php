<?php

namespace App\Services\Chatbot\Tools;

use App\Models\Shipping\ShippingMethod;
use App\Models\Shipping\ShippingRate;
use App\Models\Shipping\ShippingZone;

class ShippingTool
{
    /**
     * Get available shipping methods and estimated fees.
     */
    public function getShippingMethods(array $params = []): array
    {
        $methods = ShippingMethod::where('is_active', true)->get();

        return [
            'methods' => $methods->map(fn ($m) => [
                'id'         => $m->id,
                'name'       => $m->name,
                'code'       => $m->code,
                'carrier'    => $m->carrier,
                'base_price' => (float) ($m->base_price ?? 0),
                'currency'   => 'USD',
            ])->toArray(),
        ];
    }

    /**
     * Calculate shipping rate for a destination.
     */
    public function calculateShipping(array $params): array
    {
        $city = $params['city'] ?? null;
        $weight = (float) ($params['weight'] ?? 1.0);

        $methods = ShippingMethod::where('is_active', true)->get();

        $matchingZone = null;
        if ($city) {
            $matchingZone = ShippingZone::all()->first(function ($zone) use ($city) {
                $cities = is_array($zone->cities) ? $zone->cities : [];
                return in_array($city, $cities, true);
            });
        }

        $rates = $methods->map(function ($method) use ($weight, $matchingZone) {
            $rate = null;
            if ($matchingZone) {
                $rate = ShippingRate::where('shipping_method_id', $method->id)
                    ->where('shipping_zone_id', $matchingZone->id)
                    ->where('is_active', true)
                    ->where('min_weight', '<=', $weight)
                    ->where(function ($q) use ($weight) {
                        $q->whereNull('max_weight')->orWhere('max_weight', '>=', $weight);
                    })
                    ->first();
            }

            if ($rate) {
                $totalCost = (float) $rate->price;
                $estDays = ($rate->estimated_days_min && $rate->estimated_days_max)
                    ? "{$rate->estimated_days_min}-{$rate->estimated_days_max} Days"
                    : ($method->code === 'express' ? '1-2 Days' : '3-5 Days');
            } else {
                $baseCost = (float) ($method->base_price ?? 5.0);
                $weightCost = max(0, ($weight - 1.0) * 1.5);
                $totalCost = $baseCost + $weightCost;
                $estDays = $method->code === 'express' ? '1-2 Days' : '3-5 Days';
            }

            return [
                'method_id'        => $method->id,
                'method_name'      => $method->name,
                'carrier'          => $method->carrier ?? $method->provider ?? 'Standard',
                'cost'             => round($totalCost, 2),
                'currency'         => 'USD',
                'estimated_days'   => $estDays,
            ];
        });

        return [
            'destination_city' => $city ?? 'Standard Destination',
            'weight_kg'        => $weight,
            'available_rates'  => $rates->toArray(),
        ];
    }
}
