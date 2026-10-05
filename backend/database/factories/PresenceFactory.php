<?php

namespace Database\Factories;

use App\Models\AttributionCarte;
use App\Models\Presence;
use Illuminate\Database\Eloquent\Factories\Factory;

class PresenceFactory extends Factory
{
    protected $model = Presence::class;

    public function definition(): array
    {
        return [
            'id_attribution' => AttributionCarte::factory(),
            'id_eleve' => null,
            'date_heure' => now(),
            'statut_presence' => fake()->randomElement([
                'present',
                'absent',
                'retard',
            ]),
            'nom_eleve_snapshot' => fake()->name(),
            'classe_snapshot' => fake()->words(2, true),
            'source_pointage' => fake()->randomElement([
                'manuel',
                'nfc',
            ]),
            'snapshot' => null,
            'remarque' => fake()->optional()->sentence(),
        ];
    }
}
