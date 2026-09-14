<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEleveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'matricule' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('eleves', 'matricule'),
            ],
            'nom' => [
                'required',
                'string',
                'max:255',
            ],

            'postnom' => [
                'required',
                'string',
                'max:255',
            ],

            'prenom' => [
                'required',
                'string',
                'max:50',
            ],

            'sexe' => [
                'required',
                Rule::in(['M', 'F']),
            ],

            'dateNaissance' => [
                'required',
                'date',
                'before:today',
            ],

            'adresse' => [
                'required',
                'string',
                'max:255',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'matricule.string' => 'Le matricule doit être une chaîne de caractères.',
            'matricule.max' => 'Le matricule ne peut pas dépasser 50 caractères.',
            'matricule.unique' => 'Ce matricule est déjà utilisé par un autre élève.',
            'nom.required' => 'Le nom est obligatoire.',
            'nom.string' => 'Le nom doit être une chaîne de caractères.',
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères.',

            'postnom.required' => 'Le postnom est obligatoire.',
            'postnom.string' => 'Le postnom doit être une chaîne de caractères.',
            'postnom.max' => 'Le postnom ne peut pas dépasser 255 caractères.',

            'prenom.required' => 'Le prénom est obligatoire.',
            'prenom.string' => 'Le prénom doit être une chaîne de caractères.',
            'prenom.max' => 'Le prénom ne peut pas dépasser 50 caractères.',

            'sexe.required' => 'Le sexe est obligatoire.',
            'sexe.in' => 'Le sexe doit être M ou F.',

            'dateNaissance.required' => 'La date de naissance est obligatoire.',
            'dateNaissance.date' => 'La date de naissance doit être une date valide.',
            'dateNaissance.before' => 'La date de naissance doit être antérieure à aujourd’hui.',

            'adresse.required' => 'L’adresse est obligatoire.',
            'adresse.string' => 'L’adresse doit être une chaîne de caractères.',
            'adresse.max' => 'L’adresse ne peut pas dépasser 255 caractères.',

            'photo.image' => 'La photo doit être une image.',
            'photo.mimes' => 'La photo doit être au format JPG, JPEG, PNG ou WEBP.',
            'photo.max' => 'La photo ne peut pas dépasser 2 Mo.',
        ];
    }

    public function attributes(): array
    {
        return [
            'matricule' => 'matricule',
            'nom' => 'nom',
            'postnom' => 'postnom',
            'prenom' => 'prénom',
            'sexe' => 'sexe',
            'dateNaissance' => 'date de naissance',
            'adresse' => 'adresse',
            'photo' => 'photo',
        ];
    }
}
