<?php

namespace Database\Factories;

use App\Models\TuteurLegal;
use Illuminate\Database\Eloquent\Factories\Factory;

class TuteurLegalFactory extends Factory
{
    protected $model = TuteurLegal::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'telephone_principal' => fake()->phoneNumber(),
            'telephone_secondaire' => fake()->optional()->phoneNumber(),
            'profession' => fake()->jobTitle(),
            'adresse' => fake()->address(),
            'sexe' => fake()->randomElement(['M', 'F']),
            'created_at' => now(),
        ];
    }
}
