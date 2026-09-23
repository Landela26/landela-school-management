<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNfcScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $uid = $this->input('uid', $this->input('badge_uid'));

        $this->merge([
            'uid' => $uid,
            'status' => $this->input('status', $this->input('statut', $this->input('statut_presence'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'uid' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in(['present', 'absent', 'retard'])],
            'remarque' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'uid.required' => 'Le UID du badge est obligatoire.',
            'uid.string' => 'Le UID du badge doit être une chaîne de caractères.',
            'uid.max' => 'Le UID du badge ne peut pas dépasser 255 caractères.',
            'status.required' => 'Le statut de présence est obligatoire.',
            'status.in' => 'Le statut doit être présent, absent ou retard.',
            'remarque.string' => 'La remarque doit être une chaîne de caractères.',
            'remarque.max' => 'La remarque ne peut pas dépasser 255 caractères.',
        ];
    }
}
