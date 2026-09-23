<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClasseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code_classe' => ['required', 'string', 'max:255'],
            'id_enseignant' => [
                'required',
                'integer',
                Rule::exists('personnels', 'id_personnel')
                    ->where(fn($requete) => $requete->where('estEnseignant', true)),
            ],
            'nom_classe' => ['required', 'string', 'max:255'],
            'niveau' => ['required', 'string', 'max:50'],
            'annee_scolaire' => [
                'required',
                'string',
                'size:9',
                'regex:/^\d{4}-\d{4}$/',
            ],
            'id_classe_parent' => [
                'nullable',
                'integer',
                Rule::exists('classes', 'id_classe'),
            ],
        ];
    }
    public function messages(): array
    {
        return [
            'code_classe.required' => 'Le code de la classe est requis.',
            'code_classe.string' => 'Le code de la classe doit être une chaîne de caractères.',
            'code_classe.max' => 'Le code de la classe ne doit pas dépasser 255 caractères.',
            'id_enseignant.required' => "L'identifiant de l'enseignant est requis.",
            'id_enseignant.integer' => "L'identifiant de l'enseignant doit être un entier.",
            'id_enseignant.exists' => "L'identifiant de l'enseignant n'existe pas dans la table des personnels.",
            'nom_classe.required' => 'Le nom de la classe est requis.',
            'nom_classe.string' => 'Le nom de la classe doit être une chaîne de caractères.',
            'nom_classe.max' => 'Le nom de la classe ne doit pas dépasser 255 caractères.',
            'niveau.required' => 'Le niveau est requis.',
            'niveau.string' => 'Le niveau doit être une chaîne de caractères.',
            'niveau.max' => 'Le niveau ne doit pas dépasser 50 caractères.',
            'annee_scolaire.required' => "L'année scolaire est requise.",
            'annee_scolaire.string' => "L'année scolaire doit être une chaîne de caractères.",
            'annee_scolaire.size' => "L'année scolaire doit avoir exactement 9 caractères (format : AAAA-AAAA).",
            'annee_scolaire.regex' => "L'année scolaire doit respecter le format : AAAA-AAAA.",
            'id_classe_parent.integer' => "L'identifiant de la classe parente doit être un entier.",
            'id_classe_parent.exists' => "L'identifiant de la classe parente n'existe pas dans la table des classes.",
        ];
    }
}
