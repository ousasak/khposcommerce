<?php

namespace App\Models\Shipping;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingRate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shipping_zone_id',
        'shipping_method_id',
        'min_weight',
        'max_weight',
        'price',
        'estimated_days_min',
        'estimated_days_max',
        'is_active',
        'name',
        'rate_type',
        'min_value',
        'max_value',
    ];

    protected $casts = [
        'min_weight'         => 'decimal:3',
        'max_weight'         => 'decimal:3',
        'price'              => 'decimal:2',
        'estimated_days_min' => 'integer',
        'estimated_days_max' => 'integer',
        'is_active'          => 'boolean',
        'min_value'          => 'decimal:4',
        'max_value'          => 'decimal:4',
    ];

    public function getMinValueAttribute(): ?float
    {
        return isset($this->attributes['min_weight']) ? (float) $this->attributes['min_weight'] : ($this->attributes['min_value'] ?? null);
    }

    public function setMinValueAttribute($value): void
    {
        $this->attributes['min_weight'] = $value;
    }

    public function getMaxValueAttribute(): ?float
    {
        return isset($this->attributes['max_weight']) ? (float) $this->attributes['max_weight'] : ($this->attributes['max_value'] ?? null);
    }

    public function setMaxValueAttribute($value): void
    {
        $this->attributes['max_weight'] = $value;
    }

    public function zone(): BelongsTo           { return $this->belongsTo(ShippingZone::class, 'shipping_zone_id'); }
    public function shippingMethod(): BelongsTo { return $this->belongsTo(ShippingMethod::class); }
}
