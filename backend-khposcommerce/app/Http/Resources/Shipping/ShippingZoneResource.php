<?php

namespace App\Http\Resources\Shipping;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShippingZoneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'company_id' => $this->company_id,
            'name'       => $this->name,
            'code'       => $this->code,
            'countries'  => $this->countries,
            'provinces'  => $this->provinces,
            'cities'     => $this->cities,
            'is_active'  => (bool) ($this->is_active ?? true),
            'rates'      => $this->whenLoaded('rates', fn () => ShippingRateResource::collection($this->rates)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
