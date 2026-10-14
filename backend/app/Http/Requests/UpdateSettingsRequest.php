<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'late_after' => ['required_without:student_deletion_delay_days', 'date_format:H:i'],
            'student_deletion_delay_days' => [
                'required_without:late_after',
                'integer',
                'min:1',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'late_after.required_without' => 'Le seuil de retard est obligatoire si le délai de suppression n’est pas renseigné.',
            'late_after.date_format' => 'L’heure du seuil de retard doit être au format HH:MM, par exemple 08:30.',
            'student_deletion_delay_days.required_without' => 'Le délai de suppression est obligatoire si le seuil de retard n’est pas renseigné.',
            'student_deletion_delay_days.integer' => 'Le délai de suppression doit être un nombre entier de jours.',
            'student_deletion_delay_days.min' => 'Le délai de suppression doit être d’au moins un jour.',
        ];
    }

    public function attributes(): array
    {
        return [
            'late_after' => 'seuil de retard',
            'student_deletion_delay_days' => 'délai de suppression',
        ];
    }
}
