<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('role.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'name'            => 'required|string|max:100|unique:roles,name',
            'display_name'    => 'nullable|string|max:150',
            'display_name_km' => 'nullable|string|max:150',
            'description'     => 'nullable|string|max:1000',
            'description_km'  => 'nullable|string|max:1000',
            'guard_name'      => 'sometimes|string|max:50',
            'permissions'     => 'sometimes|array',
            'permissions.*'   => 'string|exists:permissions,name',
        ];
    }
}
