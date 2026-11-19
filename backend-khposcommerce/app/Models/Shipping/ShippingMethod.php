<?php

namespace App\Models\Shipping;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;
use App\Models\Order\Shipment;

use App\Traits\BelongsToCompany;

class ShippingMethod extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'name', 'code', 'provider', 'carrier',
        'base_price', 'is_active', 'sort_order', 'logo',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_active'  => 'boolean',
    ];

    public function getCarrierAttribute(): ?string
    {
        return $this->attributes['carrier'] ?? $this->attributes['provider'] ?? null;
    }

    public function setCarrierAttribute($value): void
    {
        $this->attributes['provider'] = $value;
    }

    public function company(): BelongsTo   { return $this->belongsTo(Company::class); }
    public function rates(): HasMany       { return $this->hasMany(ShippingRate::class); }
    public function shipments(): HasMany   { return $this->hasMany(Shipment::class); }
}
