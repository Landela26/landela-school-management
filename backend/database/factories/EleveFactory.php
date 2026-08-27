<?php

namespace Database\Factories;

use App\Models\Eleve;
use Illuminate\Database\Eloquent\Factories\Factory;

class EleveFactory extends Factory
{
    protected $model = Eleve::class;

    public function definition(): array
    {
        return [
            'matricule' => fake()->unique()->numerify('ELV#####'),
            'nom' => fake()->lastName(),
            'postnom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'sexe' => fake()->randomElement(['M', 'F']),
            'date_naissance' => fake()->date(),
            'adresse' => fake()->address(),
            'photo' => null,
            'statut' => 'actif',
            'date_creation' => now(),
        ];
    }
}
