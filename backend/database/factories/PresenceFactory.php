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
            'date_heure' => now(),
            'statut_presence' => fake()->randomElement([
                'present',
                'absent',
                'retard',
            ]),
            'source_pointage' => fake()->randomElement([
                'manuel',
                'nfc',
            ]),
            'snapshot' => null,
            'remarque' => fake()->optional()->sentence(),
        ];
    }
}
