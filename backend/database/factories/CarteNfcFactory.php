<?php

namespace Database\Factories;

use App\Models\CarteNfc;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CarteNfcFactory extends Factory
{
    protected $model = CarteNfc::class;

    public function definition(): array
    {
        return [
            'uid' => (string) Str::uuid(),
            'numero_carte' => fake()->unique()->numerify('NFC-######'),
            'statut' => 'actif',
            'date_creation' => now(),
        ];
    }
}
