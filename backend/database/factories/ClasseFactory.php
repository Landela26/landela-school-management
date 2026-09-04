<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\Personnel;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseFactory extends Factory
{
    protected $model = Classe::class;

    public function definition(): array
    {
        return [
            'code_classe' => fake()->unique()->bothify('CLS-###'),
            'id_enseignant' => Personnel::factory(),
            'nom_classe' => fake()->randomElement([
                '1ère Primaire',
                '2ème Primaire',
                '3ème Primaire',
                '4ème Primaire',
                '5ème Primaire',
                '6ème Primaire',
            ]),
            'niveau' => fake()->randomElement([
                'Primaire',
                'Secondaire',
            ]),
            'annee_scolaire' => '2025-2026',
            'id_classe_parent' => null,
            'statut' => 'active',
            'date_creation' => now(),
            'deleted_at' => null,
        ];
    }
}
