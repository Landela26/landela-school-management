<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'student_id' => $this->input('student_id', $this->input('eleve_id', $this->input('id_eleve'))),
            'status' => $this->input('status', $this->input('statut', $this->input('statut_presence'))),
            'heure' => $this->input('heure', $this->input('time', $this->input('heure_pointage'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', Rule::exists('eleves', 'id_eleve')],
            'status' => ['required', 'string', Rule::in(['present', 'absent', 'retard'])],
            'heure' => ['nullable', 'string'],
            'remarque' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required' => 'L’identifiant de l’élève est obligatoire.',
            'student_id.exists' => 'L’élève sélectionné n’existe pas.',
            'student_id.integer' => 'L’identifiant de l’élève doit être un nombre entier.',
            'status.required' => 'Le statut de présence est obligatoire.',
            'status.in' => 'Le statut doit être présent, absent ou retard.',
            'heure.string' => 'L’heure doit être une chaîne de caractères valide.',
            'remarque.string' => 'La remarque doit être une chaîne de caractères.',
            'remarque.max' => 'La remarque ne peut pas dépasser 255 caractères.',
        ];
    }
}
