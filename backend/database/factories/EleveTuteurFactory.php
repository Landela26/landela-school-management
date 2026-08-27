<?php

namespace Database\Factories;

use App\Models\Eleve;
use App\Models\EleveTuteur;
use App\Models\TuteurLegal;
use Illuminate\Database\Eloquent\Factories\Factory;

class EleveTuteurFactory extends Factory
{
    protected $model = EleveTuteur::class;

    public function definition(): array
    {
        return [
            'id_tuteur' => TuteurLegal::factory(),
            'id_eleve' => Eleve::factory(),
            'relation' => fake()->randomElement([
                'Père',
                'Mère',
                'Tuteur',
                'Oncle',
                'Tante',
                'Frère',
                'Sœur',
            ]),
            'contact_urgence' => fake()->boolean(30),
        ];
    }
}
