<?php

namespace Database\Factories;

use App\Models\Personnel;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonnelFactory extends Factory
{
    protected $model = Personnel::class;

    public function definition(): array
    {
        return [
            'matricule' => fake()->unique()->numerify('PER####'),
            'id_classe' => null,
            'nom' => fake()->lastName(),
            'postnom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'fonction' => fake()->randomElement([
                'Enseignant',
                'Directeur',
                'Secrétaire',
                'Surveillant',
                'Comptable',
            ]),
            'telephone' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'estEnseignant' => fake()->boolean(70),
            'statut' => 'actif',
            'date_creation' => now(),
        ];
    }
}
