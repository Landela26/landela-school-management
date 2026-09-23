<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'class_id' => ['sometimes', 'integer', Rule::exists('classes', 'id_classe')],
            'classe' => ['sometimes', 'string', Rule::exists('classes', 'nom_classe')],
            'statut' => ['sometimes', 'string', Rule::in(['present', 'absent', 'retard'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.date_format' => 'La date doit respecter le format AAAA-MM-JJ.',
            'class_id.integer' => "L'identifiant de la classe doit être un entier.",
            'class_id.exists' => "La classe sélectionnée n'existe pas.",
            'classe.string' => 'Le nom de la classe doit être une chaîne de caractères.',
            'classe.exists' => "La classe sélectionnée n'existe pas.",
            'statut.in' => 'Le statut doit être présent, absent ou retard.',
            'page.integer' => 'Le numéro de page doit être un entier.',
            'page.min' => 'Le numéro de page doit être supérieur ou égal à 1.',
            'per_page.integer' => "Le nombre d'éléments par page doit être un entier.",
            'per_page.min' => "Le nombre d'éléments par page doit être supérieur ou égal à 1.",
            'per_page.max' => "Le nombre d'éléments par page ne peut pas dépasser 100.",
        ];
    }
}
