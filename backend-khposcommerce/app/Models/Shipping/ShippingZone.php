<?php

namespace App\Models\Shipping;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;

use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\BelongsToCompany;

class ShippingZone extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = ['company_id', 'name', 'code', 'countries', 'provinces', 'cities', 'is_active'];

    protected $casts = [
        'countries' => 'array',
        'provinces' => 'array',
        'cities'    => 'array',
        'is_active' => 'boolean',
    ];

    public function getCodeAttribute($value): ?string
    {
        if (!empty($value)) {
            return $value;
        }
        return 'ZONE_' . str_pad((string)($this->id ?? 1), 3, '0', STR_PAD_LEFT);
    }

    public function setCountriesAttribute($value): void
    {
        $val = is_string($value) && str_starts_with(trim($value), '[')
            ? (json_decode($value, true) ?? $value)
            : $value;

        $this->attributes['countries'] = is_array($val) ? json_encode($val) : $val;
    }

    public function getCountriesAttribute($value): ?array
    {
        if (is_array($value)) {
            return $value;
        }
        return $value ? json_decode($value, true) : null;
    }

    public function setProvincesAttribute($value): void
    {
        $val = is_string($value) && str_starts_with(trim($value), '[')
            ? (json_decode($value, true) ?? $value)
            : $value;

        $this->attributes['provinces'] = is_array($val) ? json_encode($val) : $val;
    }

    public function getProvincesAttribute($value): ?array
    {
        if (is_array($value)) {
            return $value;
        }
        return $value ? json_decode($value, true) : null;
    }

    public function setCitiesAttribute($value): void
    {
        $val = is_string($value) && str_starts_with(trim($value), '[')
            ? (json_decode($value, true) ?? $value)
            : $value;

        $this->attributes['cities'] = is_array($val) ? json_encode($val) : $val;
    }

    public function getCitiesAttribute($value): ?array
    {
        if (is_array($value)) {
            return $value;
        }
        return $value ? json_decode($value, true) : null;
    }

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function rates(): HasMany     { return $this->hasMany(ShippingRate::class); }
}
