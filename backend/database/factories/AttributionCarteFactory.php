<?php

namespace Database\Factories;

use App\Models\AttributionCarte;
use App\Models\CarteNfc;
use App\Models\Eleve;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttributionCarteFactory extends Factory
{
    protected $model = AttributionCarte::class;

    public function definition(): array
    {
        return [
            'id_carte' => CarteNfc::factory(),
            'id_eleve' => Eleve::factory(),
            'id_personnel' => null,
            'date_attribution' => now(),
            'statut' => 'actif',
            'date_fin' => null,
            'motif_fin' => null,
        ];
    }
}
