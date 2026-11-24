<?php

namespace App\Http\Requests\Shipping;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShippingZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'name'       => ['sometimes', 'string', 'max:255'],
            'code'       => ['nullable', 'string', 'max:50'],
            'countries'  => ['nullable'],
            'provinces'  => ['nullable'],
            'cities'     => ['nullable'],
            'is_active'  => ['nullable', 'boolean'],
        ];
    }
}
